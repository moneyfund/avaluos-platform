import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AvaluoPdfTemplate from './AvaluoPdfTemplate';
import HouseReportPDF from './HouseReportPDF';
import AmyLuxuryReport from './templates/amy/AmyLuxuryReport';
import AmyLuxuryReportV2 from './templates/amy/AmyLuxuryReportV2';

const IMAGE_TIMEOUT_MS = 8000;
const HTML2CANVAS_TIMEOUT_MS = 30000;
const PDF_IMAGE_QUALITY = 0.78;
const PDF_IMAGE_MAX_WIDTH = 1600;
const PDF_IMAGE_MAX_HEIGHT = 1200;

const slug = (value: string) => String(value || 'sin-titulo').replace(/[^a-z0-9áéíóúñ]+/gi, '-').replace(/^-|-$/g, '');
const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const withTimeout = async <T,>(promise: Promise<T>, ms: number, message: string): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => { timeoutId = setTimeout(() => reject(new Error(message)), ms); });
  try { return await Promise.race([promise, timeout]); }
  finally { if (timeoutId) clearTimeout(timeoutId); }
};

const fileToDataUrl = (file?: File | null) => new Promise<string>((resolve, reject) => {
  if (!file) return resolve('');
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}.`));
  reader.readAsDataURL(file);
});

const remoteToDataUrl = async (url?: string) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;
  try {
    const response = await withTimeout(fetch(url, { mode: 'cors' }), IMAGE_TIMEOUT_MS, 'Tiempo agotado cargando imagen remota.');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await fileToDataUrl(new File([await response.blob()], 'remote-image'));
  } catch {
    return url;
  }
};

const compressImage = async (source?: string) => {
  if (!source) return '';
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await withTimeout(new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('No se pudo cargar una imagen para el PDF.'));
      img.src = source;
    }), IMAGE_TIMEOUT_MS, 'Tiempo agotado preparando imagen.');
    const ratio = Math.min(1, PDF_IMAGE_MAX_WIDTH / Math.max(img.naturalWidth, 1), PDF_IMAGE_MAX_HEIGHT / Math.max(img.naturalHeight, 1));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
    const context = canvas.getContext('2d');
    if (!context) return source;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', PDF_IMAGE_QUALITY);
  } catch {
    return source.startsWith('data:') ? source : '';
  }
};

const prepareImage = async (file?: File | null, url?: string) => {
  const raw = file ? await fileToDataUrl(file) : await remoteToDataUrl(url);
  return compressImage(raw);
};

const prepareAvaluoImages = async (avaluo: any) => {
  const localGallery = Array.isArray(avaluo?.imagenesAdicionalesFiles) ? avaluo.imagenesAdicionalesFiles : [];
  const remoteGallery = Array.isArray(avaluo?.imagenesAdicionales) ? avaluo.imagenesAdicionales : [];
  const logoUrl = avaluo?.reportConfig?.logoUrl || '';
  const preparedLogo = logoUrl ? await prepareImage(null, logoUrl) : '';
  return {
    ...avaluo,
    reportConfig: avaluo?.reportConfig ? {
      ...avaluo.reportConfig,
      logoUrl: preparedLogo || logoUrl,
    } : avaluo?.reportConfig,
    imagenPrincipalBase64: await prepareImage(avaluo?.imagenPrincipalFile, avaluo?.imagenPrincipalUrl || avaluo?.imagenPrincipal),
    imagenesAdicionalesBase64: await Promise.all(
      (localGallery.length ? localGallery.slice(0, 8).map((file: File) => prepareImage(file)) : remoteGallery.slice(0, 8).map((url: string) => prepareImage(null, url))),
    ),
  };
};

const waitForImages = async (host: HTMLElement) => {
  const images = Array.from(host.querySelectorAll('img'));
  await Promise.all(images.map((image) => image.complete
    ? Promise.resolve()
    : withTimeout(new Promise<void>((resolve) => {
        image.onload = () => resolve();
        image.onerror = () => resolve();
      }), IMAGE_TIMEOUT_MS, 'Tiempo agotado esperando imágenes.').catch(() => undefined)));
};

const resolvePdfTemplateId = (avaluo: any) => {
  const explicit = String(avaluo?.reportConfig?.pdfTemplateId || avaluo?.pdfTemplateId || '').trim();
  if (explicit) return explicit;
  const tenantId = String(avaluo?.tenantId || avaluo?.reportConfig?.tenantId || '').trim().toLowerCase();
  return tenantId === 'amyblandon' ? 'amy-luxury-v2' : 'default-v1';
};

export async function exportAvaluoToPdf(avaluo: any) {
  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-10000px';
  host.style.top = '0';
  host.style.width = '794px';
  host.style.zIndex = '-1';
  host.style.background = '#ffffff';
  document.body.appendChild(host);
  const root = createRoot(host);

  try {
    const prepared = await prepareAvaluoImages(avaluo);
    const templateId = resolvePdfTemplateId(prepared);
    if (templateId === 'amy-luxury-v2') {
      root.render(<AmyLuxuryReportV2 avaluo={prepared} />);
    } else if (templateId === 'amy-luxury-v1') {
      root.render(<AmyLuxuryReport avaluo={prepared} />);
    } else {
      root.render(prepared?.tipoPropiedad === 'casa' ? <HouseReportPDF avaluo={prepared} /> : <AvaluoPdfTemplate avaluo={prepared} />);
    }
    await nextFrame();
    await nextFrame();
    if (document.fonts?.ready) {
      await withTimeout(document.fonts.ready, 5000, 'Tiempo agotado cargando tipografías.').catch(() => undefined);
    }
    await waitForImages(host);

    const pages = Array.from(host.querySelectorAll('.avaluo-pdf-page')) as HTMLElement[];
    if (!pages.length) throw new Error('No se encontraron páginas para generar el PDF.');

    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
    for (const [index, page] of pages.entries()) {
      const canvas = await withTimeout(html2canvas(page, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123,
        logging: false,
      }), HTML2CANVAS_TIMEOUT_MS, `Tiempo agotado generando la página ${index + 1}.`);
      const image = canvas.toDataURL('image/jpeg', PDF_IMAGE_QUALITY);
      if (index > 0) pdf.addPage();
      pdf.addImage(image, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }
    const company = templateId.startsWith('amy-luxury') ? 'Amy-Blandon' : 'Avaluo';
    pdf.save(`Informe-${company}-${slug(prepared?.titulo || prepared?.id)}.pdf`);
  } finally {
    root.unmount();
    host.remove();
  }
}
