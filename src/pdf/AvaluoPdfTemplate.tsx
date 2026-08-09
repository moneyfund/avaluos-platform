import { BarChart3, FileText, MapPin, ShieldCheck, TrendingUp } from 'lucide-react';
import { generateAvaluoAnalysis } from './generateAvaluoAnalysis';
import { resolveReportConfig } from './reportConfig';
import './avaluoPdf.css';

const money = (value: any) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));
const num = (value: any) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 }).format(Number(value || 0));
const boolText = (value: any) => value === true ? 'Sí' : value === false ? 'No' : value;
const clean = (value: any) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && !value.length);
const text = (value: any): string => Array.isArray(value)
  ? value.map(boolText).join(', ')
  : typeof value === 'object' && value
    ? Object.entries(value).filter(([, item]) => clean(item)).map(([key, item]) => `${key}: ${boolText(item)}`).join(' · ')
    : String(boolText(value ?? ''));
const date = (value: any) => {
  const parsed = value ? new Date(value) : new Date();
  return (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Footer({ config, page, total }: any) {
  return <footer className='avaluo-pdf-footer'>
    <strong>{config.organizationName}</strong><span>{config.website}</span><span>{config.reportTitle}</span><span>PÁG. {page}/{total}</span>
  </footer>;
}
function Page({ children, config, page, total, cover = false }: any) {
  return <section className={`avaluo-pdf-page ${cover ? 'pdf-cover' : ''}`}>
    <div className='avaluo-pdf-accent' />
    <div className='avaluo-pdf-content'>{children}</div>
    <Footer config={config} page={page} total={total} />
  </section>;
}
function Photo({ src }: { src?: string }) {
  return src ? <img src={src} alt='Fotografía del inmueble' /> : <div className='pdf-img-placeholder'>Imagen no disponible</div>;
}
function Fact({ label, value }: any) { return <div className='pdf-cover-fact'><span>{label}</span><strong>{clean(value) ? value : '—'}</strong></div>; }
function Metric({ label, value, note }: any) { return <div className='pdf-metric'><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>; }
function InfoBlock({ title, items }: any) {
  const visible = items.filter(([, value]: any) => clean(value));
  if (!visible.length) return null;
  return <section className='pdf-info-block'><h3>{title}</h3>{visible.map(([label, value]: any) => <div className='pdf-info-row' key={label}><span>{label}</span><strong>{text(value)}</strong></div>)}</section>;
}

export default function AvaluoPdfTemplate({ avaluo }: any) {
  const config = resolveReportConfig(avaluo);
  const c = avaluo?.caracteristicas || {};
  const coefs = Array.isArray(avaluo?.coeficientesAplicados) ? avaluo.coeficientesAplicados : [];
  const gallery = (avaluo?.imagenesAdicionalesBase64 || []).filter(Boolean).slice(0, 4);
  const total = 5;
  const finalValue = avaluo?.valorFinal ?? avaluo?.valorFinalEstimado;
  const adjustedM2 = avaluo?.adjustedPriceM2 ?? avaluo?.valorM2;
  const baseValue = avaluo?.baseValueTotal ?? avaluo?.valorBase;
  const factor = avaluo?.technicalAdjustmentFactor ?? avaluo?.factorGlobal;
  const areaM2 = avaluo?.areaM2Convertida ?? c.areaM2Convertida ?? c.areaTerreno;
  const areaManzanas = avaluo?.areaManzanas ?? (Number(areaM2 || 0) / 7042.25);
  const analysis = generateAvaluoAnalysis(avaluo);

  return <div className='avaluo-pdf-template' style={{ '--pdf-primary': config.primaryColor, '--pdf-secondary': config.secondaryColor } as any}>
    <Page config={config} page={1} total={total} cover>
      <div className='pdf-cover-brand'><div className='pdf-brandmark'>{config.shortName}</div><div className='pdf-cover-brand-text'><strong>{config.organizationName}</strong><span>{config.reportTitle}</span></div><div className='pdf-cover-date'>{date(avaluo?.createdAt)}</div></div>
      <div className='pdf-cover-heading'><p className='pdf-kicker'>Valoración inmobiliaria profesional</p><h1>INFORME TÉCNICO DE AVALÚO DE TERRENO</h1><p>{avaluo?.titulo || 'Avalúo técnico de terreno'}</p></div>
      <div className='pdf-cover-photo'><Photo src={avaluo?.imagenPrincipalBase64} /></div>
      <div className='pdf-cover-facts'><Fact label='Ciudad' value={avaluo?.ciudad} /><Fact label='Zona' value={avaluo?.zona} /><Fact label='Área' value={`${num(areaM2)} m²`} /><Fact label='Evaluador' value={avaluo?.agenteEvaluador} /></div>
    </Page>

    <Page config={config} page={2} total={total}>
      <h2 className='pdf-section-title'><TrendingUp /> Resumen ejecutivo</h2>
      <div className='pdf-value-hero'><div className='pdf-value-main'><span>Valor final estimado</span><strong>{money(finalValue)}</strong><p>Rango de mercado: {money(avaluo?.rangoMercado?.minimo)} – {money(avaluo?.rangoMercado?.maximo)}</p></div><div className='pdf-confidence'><span>Nivel de confianza</span><strong>{avaluo?.nivelConfianza || '—'}</strong></div></div>
      <div className='pdf-metric-grid'>
        <Metric label='Precio final por m²' value={money(adjustedM2)} />
        <Metric label='Precio final por manzana' value={money(avaluo?.pricePerManzana)} />
        <Metric label='Valor base' value={money(baseValue)} />
        <Metric label='Factor técnico' value={Number(factor || 1).toFixed(3)} />
        <Metric label='Liquidez' value={avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez}/100` : (c.liquidez || '—')} />
        <Metric label='Tiempo estimado de venta' value={avaluo?.tiempoEstimadoVenta || '—'} />
      </div>
      <div className='pdf-analysis'><h3>Análisis técnico y comercial</h3><p>{analysis}</p></div>
      <div className='pdf-disclaimer'>El valor presentado constituye una referencia técnica basada en los datos ingresados, parámetros territoriales y ponderaciones del modelo. Para una operación jurídica o financiera definitiva deben validarse documentos, linderos, condiciones físicas y comparables de mercado.</div>
    </Page>

    <Page config={config} page={3} total={total}>
      <h2 className='pdf-section-title'><FileText /> Ficha técnica del inmueble</h2>
      <div className='pdf-two-col'>
        <InfoBlock title='Ubicación y área' items={[[ 'Ciudad', avaluo?.ciudad ], [ 'Zona', avaluo?.zona ], [ 'Clasificación', avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion ], [ 'Área original', `${num(avaluo?.areaOriginal ?? c.areaOriginal)} ${c.unidadArea === 'manzana' ? 'manzanas' : 'm²'}` ], [ 'Área convertida', `${num(areaM2)} m²` ], [ 'Área equivalente', `${num(areaManzanas)} manzanas` ]]} />
        <InfoBlock title='Condiciones físicas' items={[[ 'Categoría territorial', c.tipoTerritorio ], [ 'Tipo de suelo', c.tipoSuelo ], [ 'Topografía', c.topografia ], [ 'Forma', c.formaTerreno ], [ 'Orientación', c.orientacion ], [ 'Frente', c.frenteTerreno ? `${num(c.frenteTerreno)} m` : '' ], [ 'Fondo', c.fondoTerreno ? `${num(c.fondoTerreno)} m` : '' ]]} />
        <InfoBlock title='Acceso y entorno' items={[[ 'Acceso general', c.accesoGeneral ], [ 'Tipo de vía', c.tipoVia ], [ 'Tráfico', c.nivelTrafico ], [ 'Seguridad', c.seguridadZona ], [ 'Entorno', c.entorno || c.tipoEntorno ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Cercanía', c.proximity ]]} />
        <InfoBlock title='Uso, recursos y mercado' items={[[ 'Uso potencial', c.usoPotencial ], [ 'Servicios básicos', c.serviciosBasicos ], [ 'Hidrología', c.hidrologia ], [ 'Vegetación', c.vegetacion ], [ 'Recursos naturales', c.recursosNaturales ], [ 'Riesgos', c.riesgos ], [ 'Demanda', c.demanda ], [ 'Oferta', c.oferta ]]} />
        <InfoBlock title='Información legal' items={[[ 'Estatus legal', c.legalStatus || c.tipoDocumentacion ], [ 'Escritura pública', c.escrituraPublica ], [ 'Inscripción registral', c.inscripcionRegistral ], [ 'Plano catastral', c.planoCatastral ], [ 'Libre de gravamen', c.libreGravamen ], [ 'Restricciones', c.restriccionesLegales ]]} />
        <InfoBlock title='Referencia de precio' items={[[ 'Precio base sugerido', c.precioBaseSugerido ? money(c.precioBaseSugerido) : '' ], [ 'Precio base aplicado', c.precioBaseAplicado ? money(c.precioBaseAplicado) : '' ], [ 'Unidad de referencia', c.unidadPrecioBase ], [ 'Ajuste manual', c.precioBaseFueEditado ? 'Sí' : 'No' ], [ 'Motivo del ajuste', c.motivoAjustePrecioBase ], [ 'Detalle técnico', c.detalleAjustePrecioBase ]]} />
      </div>
    </Page>

    <Page config={config} page={4} total={total}>
      <h2 className='pdf-section-title'><BarChart3 /> Coeficientes y trazabilidad del cálculo</h2>
      <div className='pdf-coef-summary'><div><span>Valor base</span><strong>{money(baseValue)}</strong></div><div><span>Factor técnico total</span><strong>{Number(factor || 1).toFixed(3)}</strong></div><div><span>Valor estimado</span><strong>{money(finalValue)}</strong></div></div>
      <table className='pdf-table'><thead><tr><th style={{width:'24%'}}>Factor</th><th style={{width:'34%'}}>Valor aplicado</th><th style={{width:'14%'}}>Coeficiente</th><th style={{width:'14%'}}>Impacto</th><th style={{width:'14%'}}>Justificación</th></tr></thead><tbody>{coefs.slice(0, 24).map((coef: any, index: number) => <tr key={`${coef.factor}-${index}`}><td>{coef.factor || coef.nombre}</td><td>{coef.valorAplicado || '—'}</td><td>{Number(coef.coeficiente || 1).toFixed(3)}</td><td>{coef.impacto || '—'}</td><td>{coef.justificacion || 'Modelo técnico'}</td></tr>)}</tbody></table>
    </Page>

    <Page config={config} page={5} total={total}>
      <h2 className='pdf-section-title'><ShieldCheck /> Estrategia comercial y evidencia</h2>
      <div className='pdf-commercial-grid'><div className='pdf-commercial-card'><h3>Lectura de mercado</h3><p>Demanda: {c.demanda || 'por validar'}. Oferta comparable: {c.oferta || 'por validar'}. Liquidez estimada: {avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez}/100` : (c.liquidez || 'media')}.</p></div><div className='pdf-commercial-card'><h3>Potencial de crecimiento</h3><p>{avaluo?.potencialCrecimiento || c.desarrolloUrbano || 'La evolución del valor dependerá del desarrollo de la zona, acceso, servicios y absorción inmobiliaria.'}</p></div></div>
      <div className='pdf-price-strategy'><div><span>Publicación recomendada</span><strong>{money(avaluo?.precioRecomendadoPublicacion || finalValue)}</strong></div><div><span>Objetivo de cierre</span><strong>{money(avaluo?.precioObjetivoCierre || finalValue)}</strong></div><div><span>Mínimo de negociación</span><strong>{money(avaluo?.precioMinimoNegociacion || avaluo?.rangoMercado?.minimo)}</strong></div></div>
      <div className='pdf-gallery'>{gallery.length ? gallery.map((src: string, index: number) => <figure key={index}><Photo src={src} /></figure>) : [0,1,2,3].map(index => <figure key={index}><Photo /></figure>)}</div>
      <div className='pdf-signature'><div><strong>{avaluo?.agenteEvaluador || 'Agente evaluador'}</strong><span>{avaluo?.telefonoAgente || 'Responsable del informe'}</span></div><div><strong>{config.organizationName}</strong><span>{config.footerText}</span></div></div>
    </Page>
  </div>;
}
