import {
  BarChart3,
  Building2,
  FileCheck2,
  FileText,
  Gauge,
  Home,
  Landmark,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Waves,
} from 'lucide-react';
import { generateAvaluoAnalysis } from '../../generateAvaluoAnalysis';
import { resolveReportConfig } from '../../reportConfig';
import './amyLuxuryPdf.css';
import './amyLuxuryPdfV2.css';

const money = (value: any) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));
const num = (value: any) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 }).format(Number(value || 0));
const clean = (value: any) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && !value.length);
const boolText = (value: any) => value === true ? 'Sí' : value === false ? 'No' : value;
const humanize = (value: any) => String(value || '').replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase());
const text = (value: any): string => Array.isArray(value)
  ? value.map(boolText).join(', ')
  : typeof value === 'object' && value
    ? Object.entries(value).filter(([, item]) => clean(item)).map(([key, item]) => `${humanize(key)}: ${boolText(item)}`).join(' · ')
    : String(boolText(value ?? ''));
const date = (value: any) => {
  const parsed = value ? new Date(value) : new Date();
  return (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
};
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const fitClass = (value: any) => {
  const length = text(value).length;
  return length > 110 ? 'is-micro' : length > 62 ? 'is-compact' : '';
};

const qualitativeScore = (value: any, fallback = 58) => {
  if (typeof value === 'number' && Number.isFinite(value)) return clamp(value);
  if (value === true) return 92;
  if (value === false) return 28;
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return fallback;
  if (/(excelente|premium|muy alta|muy alto|óptim|optimo|completa|consolidado|paviment|asfalto|adoquin)/.test(normalized)) return 92;
  if (/(alta|alto|buena|bueno|favorable|estable|moderno|moderna)/.test(normalized)) return 80;
  if (/(media|medio|regular|parcial|emergente|normal)/.test(normalized)) return 60;
  if (/(baja|bajo|deficiente|malo|mala|pendiente|limitado|limitada|precario)/.test(normalized)) return 36;
  return fallback;
};

const booleanObjectScore = (value: any, fallback = 54) => {
  if (!value || typeof value !== 'object') return fallback;
  const values = Object.values(value).filter((item) => typeof item === 'boolean');
  if (!values.length) return fallback;
  return Math.round((values.filter(Boolean).length / values.length) * 100);
};

const booleanListScore = (items: any[], fallback = 50) => {
  const values = items.filter((item) => typeof item === 'boolean');
  if (!values.length) return fallback;
  return Math.round((values.filter(Boolean).length / values.length) * 100);
};

function Brand({ config }: any) {
  const initials = String(config.shortName || config.organizationName || 'AB').slice(0, 3).toUpperCase();
  return <div className='amy-pdf-brand'>
    <div className='amy-pdf-brandmark'>{config.logoUrl ? <img src={config.logoUrl} alt='' /> : <span>{initials}</span>}</div>
    <div className='amy-pdf-brandcopy'>
      <strong>{config.organizationName || 'Amy Blandon'}</strong>
      <span>Bienes raíces · valoración inmobiliaria</span>
    </div>
  </div>;
}

function Footer({ config, page, total }: any) {
  return <footer className='amy-pdf-footer amy-v2-footer'>
    <div><strong>{config.organizationName || 'Amy Blandon'}</strong><span>{config.website || 'Informe técnico de avalúo'}</span></div>
    <div className='amy-pdf-footer-line' />
    <span className='amy-pdf-page-number'>{String(page).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
  </footer>;
}

function Page({ children, config, page, total, className = '' }: any) {
  return <section className={`avaluo-pdf-page amy-pdf-page amy-v2-page ${className}`}>
    <div className='amy-pdf-page-glow' />
    <div className='amy-v2-grid-mark' />
    <div className='amy-pdf-page-content amy-v2-page-content'>{children}</div>
    <Footer config={config} page={page} total={total} />
  </section>;
}

function Eyebrow({ children }: any) { return <p className='amy-pdf-eyebrow'>{children}</p>; }

function SectionTitle({ eyebrow, title, text: description, icon: Icon }: any) {
  return <header className='amy-pdf-section-heading amy-v2-section-heading'>
    <div>{Icon && <Icon />}<span><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></span></div>
    {description && <p>{description}</p>}
  </header>;
}

function Photo({ src, className = '' }: any) {
  return src
    ? <img className={className} src={src} alt='Fotografía del inmueble' />
    : <div className={`amy-pdf-photo-placeholder ${className}`}>Fotografía no disponible</div>;
}

function Detail({ label, value, strong = false }: any) {
  if (!clean(value)) return null;
  const display = text(value);
  return <div className={`amy-pdf-detail amy-v2-detail ${strong ? 'is-strong' : ''}`}>
    <span>{label}</span><strong className={fitClass(display)}>{display}</strong>
  </div>;
}

function Metric({ label, value, note, tone = '' }: any) {
  return <article className={`amy-pdf-metric amy-v2-metric ${tone ? `tone-${tone}` : ''}`}>
    <span>{label}</span><strong className={fitClass(value)}>{value}</strong>{note && <small>{note}</small>}
  </article>;
}

function InfoPanel({ title, items, className = '' }: any) {
  const visible = items.filter(([, value]: any) => clean(value));
  if (!visible.length) return null;
  return <section className={`amy-pdf-info-panel amy-v2-info-panel ${className}`}>
    <h3>{title}</h3><div>{visible.map(([label, value]: any) => <Detail key={label} label={label} value={value} />)}</div>
  </section>;
}

function EditorialCard({ number, title, children }: any) {
  return <article className='amy-pdf-editorial-card amy-v2-editorial-card'>
    <span>{number}</span><h3>{title}</h3><p>{children}</p>
  </article>;
}

function MarketBand({ minimum, value, maximum, label = 'Posición dentro del rango estimado' }: any) {
  const min = Number(minimum || 0);
  const max = Number(maximum || 0);
  const current = Number(value || 0);
  const span = Math.max(max - min, Math.abs(current) * .1, 1);
  const position = clamp(((current - min) / span) * 100, 0, 100);
  return <div className='amy-v2-chart-card amy-v2-market-band'>
    <div className='amy-v2-chart-head'><span>{label}</span><strong>{money(current)}</strong></div>
    <div className='amy-v2-band-track'>
      <div className='amy-v2-band-gradient' />
      <i className='amy-v2-band-marker' style={{ left: `${position}%` }} />
    </div>
    <div className='amy-v2-band-labels'><span>{money(min)}</span><span>Valor central</span><span>{money(max)}</span></div>
  </div>;
}

function ValueBars({ items, title }: any) {
  const normalized = items.filter((item: any) => Number(item.value || 0) > 0);
  const max = Math.max(...normalized.map((item: any) => Number(item.value || 0)), 1);
  return <div className='amy-v2-chart-card'>
    <div className='amy-v2-chart-head'><span>{title}</span><strong>USD</strong></div>
    <div className='amy-v2-value-bars'>
      {normalized.map((item: any) => {
        const width = clamp((Number(item.value || 0) / max) * 100, 3, 100);
        return <div className='amy-v2-value-bar' key={item.label}>
          <div><span>{item.label}</span><strong>{money(item.value)}</strong></div>
          <div className='amy-v2-value-bar-track'><i style={{ width: `${width}%` }} /></div>
        </div>;
      })}
    </div>
  </div>;
}

function DonutChart({ land, construction }: any) {
  const a = Math.max(0, Number(land || 0));
  const b = Math.max(0, Number(construction || 0));
  const total = Math.max(a + b, 1);
  const pct = clamp((a / total) * 100);
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const dash = (pct / 100) * circumference;
  return <div className='amy-v2-chart-card amy-v2-donut-card'>
    <div className='amy-v2-chart-head'><span>Composición del valor</span><strong>{money(total)}</strong></div>
    <div className='amy-v2-donut-layout'>
      <svg viewBox='0 0 120 120' className='amy-v2-donut' aria-hidden='true'>
        <circle cx='60' cy='60' r={r} className='amy-v2-donut-base' />
        <circle cx='60' cy='60' r={r} className='amy-v2-donut-land' strokeDasharray={`${dash} ${circumference - dash}`} transform='rotate(-90 60 60)' />
        <circle cx='60' cy='60' r='28' className='amy-v2-donut-center' />
        <text x='60' y='57' textAnchor='middle'>{Math.round(pct)}%</text>
        <text x='60' y='70' textAnchor='middle' className='sub'>terreno</text>
      </svg>
      <div className='amy-v2-donut-legend'>
        <div><i className='land' /><span>Terreno</span><strong>{money(a)}</strong></div>
        <div><i className='construction' /><span>Construcción</span><strong>{money(b)}</strong></div>
      </div>
    </div>
  </div>;
}

function ProfileBars({ title, items, note = 'Indicador visual derivado de los datos declarados; no modifica la fórmula de avalúo.' }: any) {
  return <div className='amy-v2-chart-card amy-v2-profile'>
    <div className='amy-v2-chart-head'><span>{title}</span><strong>0 - 100</strong></div>
    <div className='amy-v2-profile-bars'>
      {items.map((item: any) => {
        const score = clamp(Number(item.score || 0));
        return <div className='amy-v2-profile-row' key={item.label}>
          <span>{item.label}</span>
          <div><i style={{ width: `${score}%` }} /></div>
          <strong>{Math.round(score)}</strong>
        </div>;
      })}
    </div>
    <small className='amy-v2-chart-note'>{note}</small>
  </div>;
}

function CoefficientImpactChart({ rows, title = 'Impacto relativo de los factores' }: any) {
  const normalized = rows.slice(0, 10).map((row: any) => ({
    label: row.factor || row.nombre || 'Factor',
    delta: Number(row.coeficiente || 1) - 1,
  }));
  const maxDelta = Math.max(...normalized.map((row: any) => Math.abs(row.delta)), .01);
  return <div className='amy-v2-chart-card amy-v2-impact-card'>
    <div className='amy-v2-chart-head'><span>{title}</span><strong>vs. 1.000</strong></div>
    <div className='amy-v2-impact-list'>
      {normalized.map((row: any, index: number) => {
        const width = clamp((Math.abs(row.delta) / maxDelta) * 46, 2, 46);
        const positive = row.delta >= 0;
        return <div className='amy-v2-impact-row' key={`${row.label}-${index}`}>
          <span>{row.label}</span>
          <div className='amy-v2-impact-axis'>
            <i className={positive ? 'positive' : 'negative'} style={positive ? { left: '50%', width: `${width}%` } : { right: '50%', width: `${width}%` }} />
            <b />
          </div>
          <strong>{row.delta >= 0 ? '+' : ''}{(row.delta * 100).toFixed(1)}%</strong>
        </div>;
      })}
    </div>
  </div>;
}

function ScoreRing({ value, label, caption }: any) {
  const score = clamp(Number(value || 0));
  const r = 38;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  return <div className='amy-v2-score-ring-card'>
    <svg viewBox='0 0 110 110'>
      <circle cx='55' cy='55' r={r} className='base' />
      <circle cx='55' cy='55' r={r} className='value' strokeDasharray={`${dash} ${circumference - dash}`} transform='rotate(-90 55 55)' />
      <text x='55' y='58' textAnchor='middle'>{Math.round(score)}</text>
    </svg>
    <div><span>{label}</span><strong>{caption}</strong></div>
  </div>;
}

function CoefficientsTable({ rows, limit = 24 }: any) {
  const visible = rows.slice(0, limit);
  return <table className='amy-pdf-table amy-v2-table'>
    <thead><tr><th>Factor técnico</th><th>Condición observada</th><th>Coef.</th><th>Impacto</th></tr></thead>
    <tbody>{visible.map((coef: any, index: number) => <tr key={`${coef.factor || coef.nombre}-${index}`}>
      <td>{coef.factor || coef.nombre || 'Factor'}</td>
      <td>{coef.valorAplicado || 'No declarado'}</td>
      <td>{Number(coef.coeficiente || 1).toFixed(3)}</td>
      <td>{coef.impacto || 'Neutro'}</td>
    </tr>)}</tbody>
  </table>;
}

function Gallery({ images, slots = 6 }: any) {
  const visible = images.filter(Boolean).slice(0, slots);
  return <div className={`amy-pdf-gallery amy-v2-gallery slots-${slots}`}>
    {Array.from({ length: slots }).map((_, index) => <figure key={index}>
      <Photo src={visible[index]} /><figcaption>Registro fotográfico {String(index + 1).padStart(2, '0')}</figcaption>
    </figure>)}
  </div>;
}

function Signature({ avaluo, config }: any) {
  return <div className='amy-pdf-signatures amy-v2-signatures'>
    <div><span>Elaborado por</span><strong>{avaluo?.agenteEvaluador || 'Agente evaluador'}</strong><small>{avaluo?.telefonoAgente || 'Responsable del informe'}</small></div>
    <div><span>Firma / validación</span><strong>{config.organizationName || 'Amy Blandon'}</strong><small>{config.website || 'Valoración inmobiliaria'}</small></div>
  </div>;
}

function Cover({ avaluo, config, total, kind }: any) {
  const c = avaluo?.caracteristicas || {};
  const isHouse = kind === 'casa';
  const area = isHouse ? c.areaConstruccion : (avaluo?.areaM2Convertida ?? c.areaM2Convertida ?? c.areaTerreno);
  return <Page config={config} page={1} total={total} className='amy-pdf-cover amy-v2-cover'>
    <div className='amy-pdf-cover-top'><Brand config={config} /><div className='amy-pdf-cover-date'>{date(avaluo?.createdAt)}</div></div>
    <div className='amy-pdf-cover-title amy-v2-cover-title'>
      <Eyebrow>INFORME PROFESIONAL · AMY BLANDON</Eyebrow>
      <h1>{isHouse ? 'AVALÚO RESIDENCIAL' : 'AVALÚO DE TERRENO'}</h1>
      <p>{avaluo?.titulo || (isHouse ? 'Valoración de propiedad residencial' : 'Valoración de terreno')}</p>
    </div>
    <div className='amy-pdf-cover-visual amy-v2-cover-visual'>
      <div className='amy-pdf-cover-frame' />
      <div className='amy-pdf-cover-photo'><Photo src={avaluo?.imagenPrincipalBase64} /></div>
      <div className='amy-pdf-cover-stamp'><span>VALORACIÓN</span><strong>INMOBILIARIA</strong><small>Edición luxury v2</small></div>
    </div>
    <div className='amy-pdf-cover-meta amy-v2-cover-meta'>
      <Detail label='Ubicación' value={[avaluo?.zona, avaluo?.ciudad].filter(Boolean).join(', ')} strong />
      <Detail label={isHouse ? 'Área construida' : 'Área del terreno'} value={area ? `${num(area)} m²` : ''} />
      <Detail label='Valor estimado' value={money(avaluo?.valorFinal ?? avaluo?.valorFinalEstimado)} strong />
      <Detail label='Evaluador' value={avaluo?.agenteEvaluador} />
    </div>
  </Page>;
}

function TerrainReport({ avaluo, config }: any) {
  const total = 10;
  const c = avaluo?.caracteristicas || {};
  const coefs = Array.isArray(avaluo?.coeficientesAplicados) ? avaluo.coeficientesAplicados : [];
  const gallery = [avaluo?.imagenPrincipalBase64, ...(avaluo?.imagenesAdicionalesBase64 || [])].filter(Boolean);
  const finalValue = avaluo?.valorFinal ?? avaluo?.valorFinalEstimado;
  const minValue = avaluo?.rangoMercado?.minimo;
  const maxValue = avaluo?.rangoMercado?.maximo;
  const adjustedM2 = avaluo?.adjustedPriceM2 ?? avaluo?.valorM2;
  const areaM2 = avaluo?.areaM2Convertida ?? c.areaM2Convertida ?? c.areaTerreno;
  const areaManzanas = avaluo?.areaManzanas ?? (Number(areaM2 || 0) / 7042.25);
  const factor = avaluo?.technicalAdjustmentFactor ?? avaluo?.factorGlobal ?? 1;
  const baseValue = avaluo?.baseValueTotal ?? avaluo?.valorBase;
  const analysis = generateAvaluoAnalysis(avaluo);
  const serviceScore = booleanObjectScore(c.serviciosBasicos);
  const legalScore = booleanListScore([c.escrituraPublica, c.inscripcionRegistral, c.planoCatastral, c.libreGravamen], qualitativeScore(c.legalStatus || c.tipoDocumentacion));
  const terrainProfile = [
    { label: 'Acceso', score: qualitativeScore(c.accesoGeneral || c.tipoVia) },
    { label: 'Seguridad', score: qualitativeScore(c.seguridadZona) },
    { label: 'Servicios', score: serviceScore },
    { label: 'Demanda', score: qualitativeScore(c.demanda) },
    { label: 'Desarrollo', score: qualitativeScore(c.desarrolloUrbano) },
    { label: 'Documentación', score: legalScore },
  ];

  return <div className='amy-pdf-template amy-v2-template'>
    <Cover avaluo={avaluo} config={config} total={total} kind='terreno' />

    <Page config={config} page={2} total={total}>
      <SectionTitle eyebrow='RESUMEN EJECUTIVO' title='Valor, rango y lectura comercial' text='Una síntesis compacta del resultado central y de las variables que condicionan su posición de mercado.' icon={TrendingUp} />
      <div className='amy-pdf-value-layout amy-v2-value-layout'>
        <div className='amy-pdf-value-card'><span>VALOR COMERCIAL ESTIMADO</span><strong>{money(finalValue)}</strong><p>Referencia central del modelo con la información suministrada.</p></div>
        <div className='amy-pdf-confidence-card'><span>Nivel de confianza</span><strong>{avaluo?.nivelConfianza || 'No declarado'}</strong><small>Validar físicamente linderos, documentos y condiciones reales.</small></div>
      </div>
      <MarketBand minimum={minValue} value={finalValue} maximum={maxValue} />
      <div className='amy-pdf-metrics-grid amy-v2-metrics-grid'>
        <Metric label='Precio final por m²' value={money(adjustedM2)} />
        <Metric label='Precio por manzana' value={money(avaluo?.pricePerManzana)} />
        <Metric label='Valor base' value={money(baseValue)} />
        <Metric label='Factor técnico' value={Number(factor).toFixed(3)} />
        <Metric label='Liquidez' value={avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez}/100` : (c.liquidez || 'No declarado')} />
        <Metric label='Venta estimada' value={avaluo?.tiempoEstimadoVenta || 'No declarado'} />
      </div>
      <div className='amy-pdf-quote amy-v2-quote'><span>LECTURA EJECUTIVA</span><p>{analysis}</p></div>
    </Page>

    <Page config={config} page={3} total={total}>
      <SectionTitle eyebrow='IDENTIFICACIÓN DEL ACTIVO' title='Expediente, propósito y alcance' text='La información clave del inmueble se organiza en una ficha legible, acompañada del marco de uso del informe.' icon={FileText} />
      <div className='amy-pdf-identity-grid amy-v2-identity-grid'>
        <InfoPanel title='Expediente' items={[[ 'Título', avaluo?.titulo ], [ 'Fecha', date(avaluo?.createdAt) ], [ 'Tipo de activo', 'Terreno' ], [ 'Evaluador', avaluo?.agenteEvaluador ], [ 'Teléfono', avaluo?.telefonoAgente ]]} />
        <InfoPanel title='Identificación territorial' items={[[ 'Ciudad', avaluo?.ciudad ], [ 'Zona', avaluo?.zona ], [ 'Clasificación', avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion ], [ 'Entorno', c.entorno || c.tipoEntorno ], [ 'Categoría', c.tipoTerritorio ], [ 'Uso potencial', c.usoPotencial ]]} />
      </div>
      <div className='amy-pdf-editorial-grid amy-v2-editorial-grid'>
        <EditorialCard number='01' title='Objeto'>Estimar una referencia comercial técnicamente sustentada para el terreno descrito, a partir de los parámetros territoriales y datos declarados.</EditorialCard>
        <EditorialCard number='02' title='Alcance'>La lectura incorpora área, condiciones físicas, acceso, servicios, entorno, mercado, documentación y ajustes técnicos del modelo.</EditorialCard>
        <EditorialCard number='03' title='Uso recomendado'>Apoyo para negociación, compra, venta, planificación patrimonial y análisis inmobiliario. No sustituye un peritaje legal especializado.</EditorialCard>
      </div>
      <div className='amy-v2-inline-photo'><Photo src={gallery[1] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={4} total={total}>
      <SectionTitle eyebrow='LOCALIZACIÓN Y DIMENSIÓN' title='Escala física y contexto territorial' text='La ubicación se combina con las medidas del activo para facilitar una lectura rápida de su escala y entorno.' icon={MapPin} />
      <div className='amy-pdf-location-hero amy-v2-location-hero'>
        <div><Eyebrow>UBICACIÓN DEL ACTIVO</Eyebrow><h3>{avaluo?.zona || 'Zona no declarada'}</h3><p>{avaluo?.ciudad || 'Ciudad no declarada'}</p></div>
        <div className='amy-pdf-location-area'><span>Área convertida</span><strong>{num(areaM2)} m²</strong><small>{num(areaManzanas)} manzanas equivalentes</small></div>
      </div>
      <div className='amy-v2-split-grid'>
        <div>
          <InfoPanel title='Dimensiones y referencia' items={[[ 'Área original', `${num(avaluo?.areaOriginal ?? c.areaOriginal)} ${c.unidadArea === 'manzana' ? 'manzanas' : 'm²'}` ], [ 'Área en m²', `${num(areaM2)} m²` ], [ 'Área en manzanas', `${num(areaManzanas)} mz` ], [ 'Frente', c.frenteTerreno ? `${num(c.frenteTerreno)} m` : '' ], [ 'Fondo', c.fondoTerreno ? `${num(c.fondoTerreno)} m` : '' ], [ 'Orientación', c.orientacion ]]} />
          <InfoPanel title='Lectura territorial' items={[[ 'Clasificación', avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion ], [ 'Entorno', c.entorno || c.tipoEntorno ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Cercanía', c.proximity ], [ 'Nivel comercial', c.nivelComercial ], [ 'Seguridad', c.seguridadZona ]]} />
        </div>
        <div className='amy-v2-tall-photo'><Photo src={gallery[2] || gallery[0]} /></div>
      </div>
    </Page>

    <Page config={config} page={5} total={total}>
      <SectionTitle eyebrow='PERFIL FÍSICO' title='Configuración y aprovechamiento del terreno' text='Los principales atributos físicos se presentan junto con un perfil cualitativo para identificar fortalezas y limitaciones.' icon={Sparkles} />
      <div className='amy-pdf-feature-mosaic amy-v2-feature-mosaic'>
        <Metric label='Topografía' value={c.topografia || 'No declarado'} />
        <Metric label='Tipo de suelo' value={c.tipoSuelo || 'No declarado'} />
        <Metric label='Forma' value={c.formaTerreno || 'No declarado'} />
        <Metric label='Orientación' value={c.orientacion || 'No declarado'} />
        <Metric label='Uso potencial' value={c.usoPotencial || 'No declarado'} />
        <Metric label='Deforestación' value={c.nivelDeforestacion || 'No declarado'} />
      </div>
      <ProfileBars title='Perfil cualitativo declarado' items={terrainProfile} />
      <div className='amy-pdf-two-col amy-v2-two-col'>
        <InfoPanel title='Recursos y cobertura' items={[[ 'Hidrología', c.hidrologia ], [ 'Vegetación', c.vegetacion ], [ 'Recursos naturales', c.recursosNaturales ], [ 'Riesgos', c.riesgos ], [ 'Pendiente', c.pendiente ], [ 'Vista', c.vista ]]} />
        <InfoPanel title='Condiciones de desarrollo' items={[[ 'Uso potencial', c.usoPotencial ], [ 'Entorno', c.entorno || c.tipoEntorno ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Forma', c.formaTerreno ], [ 'Topografía', c.topografia ], [ 'Tipo de suelo', c.tipoSuelo ]]} />
      </div>
    </Page>

    <Page config={config} page={6} total={total}>
      <SectionTitle eyebrow='INFRAESTRUCTURA' title='Acceso, servicios y condiciones de conectividad' text='La operatividad del terreno se explica mediante accesibilidad, servicios disponibles y características del entorno inmediato.' icon={Waves} />
      <div className='amy-v2-score-grid'>
        <ScoreRing value={qualitativeScore(c.accesoGeneral || c.tipoVia)} label='Accesibilidad' caption={c.accesoGeneral || c.tipoVia || 'No declarado'} />
        <ScoreRing value={serviceScore} label='Servicios' caption={`${Math.round(serviceScore)}% disponibilidad relativa`} />
        <ScoreRing value={qualitativeScore(c.seguridadZona)} label='Seguridad' caption={c.seguridadZona || 'No declarado'} />
      </div>
      <div className='amy-pdf-two-col amy-v2-two-col'>
        <InfoPanel title='Acceso y movilidad' items={[[ 'Acceso general', c.accesoGeneral ], [ 'Tipo de vía', c.tipoVia ], [ 'Estado de calle', c.estadoVia || c.estadoCalle ], [ 'Tráfico', c.nivelTrafico ], [ 'Distancia a vía principal', c.distanciaViaPrincipal ], [ 'Cercanía', c.proximity ]]} />
        <InfoPanel title='Servicios básicos' items={[[ 'Servicios', c.serviciosBasicos ], [ 'Agua', c.serviciosBasicos?.agua ], [ 'Energía', c.serviciosBasicos?.energia ], [ 'Internet', c.serviciosBasicos?.internet ], [ 'Señal telefónica', c.serviciosBasicos?.senalTelefonica ], [ 'Drenaje', c.serviciosBasicos?.drenaje ]]} />
      </div>
      <div className='amy-pdf-wide-photo short amy-v2-wide-photo'><Photo src={gallery[3] || gallery[1] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={7} total={total}>
      <SectionTitle eyebrow='MERCADO Y ESTRATEGIA' title='Posicionamiento comercial del activo' text='El valor calculado se contrasta con el rango de mercado y con una estrategia de salida coherente con la información registrada.' icon={BarChart3} />
      <MarketBand minimum={minValue} value={finalValue} maximum={maxValue} label='Banda estimada de negociación' />
      <ValueBars title='Comparación de valores' items={[{ label: 'Valor base', value: baseValue }, { label: 'Valor final estimado', value: finalValue }, { label: 'Publicación recomendada', value: avaluo?.precioRecomendadoPublicacion || finalValue }]} />
      <div className='amy-pdf-price-strategy amy-v2-price-strategy'>
        <div><span>Publicación recomendada</span><strong>{money(avaluo?.precioRecomendadoPublicacion || finalValue)}</strong></div>
        <div><span>Objetivo de cierre</span><strong>{money(avaluo?.precioObjetivoCierre || finalValue)}</strong></div>
        <div><span>Mínimo de negociación</span><strong>{money(avaluo?.precioMinimoNegociacion || minValue)}</strong></div>
      </div>
      <div className='amy-v2-mini-grid'>
        <Metric label='Demanda' value={c.demanda || 'No declarado'} />
        <Metric label='Oferta' value={c.oferta || 'No declarado'} />
        <Metric label='Liquidez' value={c.liquidez || (avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez}/100` : 'No declarado')} />
        <Metric label='Venta estimada' value={avaluo?.tiempoEstimadoVenta || 'No declarado'} />
      </div>
    </Page>

    <Page config={config} page={8} total={total}>
      <SectionTitle eyebrow='METODOLOGÍA' title='Trazabilidad del cálculo y ajustes' text='La página concentra la lógica económica del informe sin alterar las fórmulas del motor: base, factor técnico y resultado.' icon={Gauge} />
      <div className='amy-v2-method-strip'>
        <div><span>01</span><strong>Valor base</strong><em>{money(baseValue)}</em></div>
        <b>×</b>
        <div><span>02</span><strong>Factor técnico</strong><em>{Number(factor).toFixed(3)}</em></div>
        <b>=</b>
        <div><span>03</span><strong>Valor final</strong><em>{money(finalValue)}</em></div>
      </div>
      <CoefficientImpactChart rows={coefs} />
      <div className='amy-pdf-two-col amy-v2-two-col compact'>
        <InfoPanel title='Referencia de precio' items={[[ 'Precio base sugerido', c.precioBaseSugerido ? money(c.precioBaseSugerido) : '' ], [ 'Precio base aplicado', c.precioBaseAplicado ? money(c.precioBaseAplicado) : '' ], [ 'Unidad de referencia', c.unidadPrecioBase ], [ 'Ajuste manual', c.precioBaseFueEditado ], [ 'Motivo', c.motivoAjustePrecioBase ]]} />
        <InfoPanel title='Resultado del modelo' items={[[ 'Precio final por m²', money(adjustedM2) ], [ 'Precio por manzana', money(avaluo?.pricePerManzana) ], [ 'Factor técnico', Number(factor).toFixed(3) ], [ 'Valor final', money(finalValue) ], [ 'Confianza', avaluo?.nivelConfianza ]]} />
      </div>
      <div className='amy-pdf-note amy-v2-note'>Los gráficos de esta página son representaciones visuales de los resultados existentes. No añaden ponderaciones, coeficientes ni fórmulas nuevas al motor.</div>
    </Page>

    <Page config={config} page={9} total={total}>
      <SectionTitle eyebrow='CONTROL TÉCNICO' title='Coeficientes, documentación y riesgos' text='Los factores de cálculo se acompañan del estado documental para ofrecer una trazabilidad más completa.' icon={FileCheck2} />
      <div className='amy-v2-doc-grid'>
        <ScoreRing value={legalScore} label='Preparación documental' caption={`${Math.round(legalScore)} / 100`} />
        <InfoPanel title='Información legal' items={[[ 'Estatus legal', c.legalStatus || c.tipoDocumentacion ], [ 'Escritura pública', c.escrituraPublica ], [ 'Inscripción registral', c.inscripcionRegistral ], [ 'Plano catastral', c.planoCatastral ], [ 'Libre de gravamen', c.libreGravamen ], [ 'Restricciones', c.restriccionesLegales ]]} />
        <InfoPanel title='Riesgos declarados' items={[[ 'Riesgos', c.riesgos ], [ 'Hidrología', c.hidrologia ], [ 'Pendiente', c.pendiente ], [ 'Deforestación', c.nivelDeforestacion ], [ 'Restricciones', c.restriccionesLegales ]]} />
      </div>
      <CoefficientsTable rows={coefs} limit={24} />
    </Page>

    <Page config={config} page={10} total={total}>
      <SectionTitle eyebrow='CIERRE DEL INFORME' title='Evidencia, conclusión y validación' text='La evidencia fotográfica y la conclusión final cierran el expediente con una presentación preparada para compartir con el cliente.' icon={ShieldCheck} />
      <div className='amy-v2-conclusion-strip'>
        <div><span>VALOR ESTIMADO</span><strong>{money(finalValue)}</strong></div>
        <p>El resultado representa una referencia central basada en los datos proporcionados, condiciones territoriales y factores técnicos incorporados al modelo.</p>
      </div>
      <Gallery images={gallery} slots={6} />
      <div className='amy-pdf-quote amy-v2-quote is-navy'><span>CONCLUSIÓN</span><p>{analysis} Antes de formalizar una operación se recomienda validar títulos, linderos, medidas y condiciones físicas directamente en campo.</p></div>
      <Signature avaluo={avaluo} config={config} />
    </Page>
  </div>;
}

function HouseReport({ avaluo, config }: any) {
  const total = 12;
  const c = avaluo?.caracteristicas || {};
  const coefs = Array.isArray(avaluo?.coeficientesAplicados) ? avaluo.coeficientesAplicados : [];
  const gallery = [avaluo?.imagenPrincipalBase64, ...(avaluo?.imagenesAdicionalesBase64 || [])].filter(Boolean);
  const finalValue = avaluo?.valorFinal ?? avaluo?.valorFinalEstimado;
  const minValue = avaluo?.rangoMercado?.minimo;
  const maxValue = avaluo?.rangoMercado?.maximo;
  const analysis = generateAvaluoAnalysis(avaluo);
  const areaM2 = avaluo?.areaM2Convertida ?? c.areaM2Convertida ?? c.areaTerreno;
  const valueLand = Number(avaluo?.valorTerreno || 0);
  const valueConstruction = Number(avaluo?.valorConstruccion || 0);
  const houseAmenities = [
    c.sala, c.comedor, c.cocina, c.cocinaModerna, c.cuartoServicio, c.areaLavado, c.bodega, c.despensa,
    c.vestidor, c.terraza, c.balcon, c.patio, c.jardin, c.garaje, c.piscina, c.rancho, c.oficina,
    c.salaFamiliar, c.estudio, c.bar, c.areaBBQ, c.portonElectrico, c.sistemaCCTV, c.alarma, c.panelesSolares,
    c.pozoPropio, c.tanqueAgua, c.internetFibra, c.aireAcondicionado, c.sistemaInteligente,
  ];
  const amenityScore = booleanListScore(houseAmenities, 45);
  const documentScore = booleanListScore([c.escritura, c.catastro, c.planoAprobado, c.impuestosAlDia, c.libreGravamen], 50);
  const servicesScore = booleanObjectScore(c.serviciosBasicos, 60);
  const houseProfile = [
    { label: 'Construcción', score: qualitativeScore(c.calidadConstructiva || c.acabados) },
    { label: 'Estado', score: qualitativeScore(c.estadoGeneral || c.estadoConstruccion) },
    { label: 'Mantenimiento', score: qualitativeScore(c.nivelMantenimiento) },
    { label: 'Servicios', score: servicesScore },
    { label: 'Amenidades', score: amenityScore },
    { label: 'Documentación', score: documentScore },
  ];
  const amenities = [
    ['Sala', c.sala], ['Comedor', c.comedor], ['Cocina', c.cocina], ['Cocina moderna', c.cocinaModerna],
    ['Cuarto de servicio', c.cuartoServicio], ['Área de lavado', c.areaLavado], ['Bodega', c.bodega], ['Despensa', c.despensa],
    ['Vestidor', c.vestidor], ['Terraza', c.terraza], ['Balcón', c.balcon], ['Patio', c.patio], ['Jardín', c.jardin],
    ['Garaje', c.garaje], ['Piscina', c.piscina], ['Rancho', c.rancho], ['Oficina', c.oficina], ['Sala familiar', c.salaFamiliar],
    ['Estudio', c.estudio], ['Bar', c.bar], ['Área BBQ', c.areaBBQ], ['Portón eléctrico', c.portonElectrico], ['CCTV', c.sistemaCCTV],
    ['Alarma', c.alarma], ['Paneles solares', c.panelesSolares], ['Pozo propio', c.pozoPropio], ['Tanque de agua', c.tanqueAgua],
    ['Internet fibra', c.internetFibra], ['Aire acondicionado', c.aireAcondicionado], ['Sistema inteligente', c.sistemaInteligente],
  ];

  return <div className='amy-pdf-template amy-v2-template'>
    <Cover avaluo={avaluo} config={config} total={total} kind='casa' />

    <Page config={config} page={2} total={total}>
      <SectionTitle eyebrow='RESUMEN EJECUTIVO' title='Valor residencial y composición del activo' text='Síntesis del resultado comercial, rango estimado y distribución entre terreno y construcción.' icon={Home} />
      <div className='amy-v2-house-exec'>
        <div>
          <div className='amy-pdf-value-card'><span>VALOR COMERCIAL ESTIMADO</span><strong>{money(finalValue)}</strong><p>Rango: {money(minValue)} - {money(maxValue)}</p></div>
          <MarketBand minimum={minValue} value={finalValue} maximum={maxValue} />
        </div>
        <DonutChart land={valueLand} construction={valueConstruction} />
      </div>
      <div className='amy-pdf-metrics-grid amy-v2-metrics-grid'>
        <Metric label='Valor del terreno' value={money(valueLand)} />
        <Metric label='Valor construcción' value={money(valueConstruction)} />
        <Metric label='Valor por m²' value={money(avaluo?.valorM2)} />
        <Metric label='Factor ponderado' value={Number(avaluo?.factorGlobal || 1).toFixed(3)} />
        <Metric label='Clasificación de zona' value={avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion || 'No declarado'} />
        <Metric label='Nivel de confianza' value={avaluo?.nivelConfianza || 'No declarado'} />
      </div>
      <div className='amy-pdf-quote amy-v2-quote'><span>LECTURA EJECUTIVA</span><p>{analysis}</p></div>
    </Page>

    <Page config={config} page={3} total={total}>
      <SectionTitle eyebrow='IDENTIFICACIÓN DEL ACTIVO' title='Expediente, propósito y alcance' text='La ficha central concentra la identificación de la propiedad y el marco de uso del informe.' icon={FileText} />
      <div className='amy-pdf-identity-grid amy-v2-identity-grid'>
        <InfoPanel title='Expediente' items={[[ 'Título', avaluo?.titulo ], [ 'Fecha', date(avaluo?.createdAt) ], [ 'Tipo de activo', 'Vivienda' ], [ 'Evaluador', avaluo?.agenteEvaluador ], [ 'Teléfono', avaluo?.telefonoAgente ]]} />
        <InfoPanel title='Identificación de la propiedad' items={[[ 'Ciudad', avaluo?.ciudad ], [ 'Zona', avaluo?.zona ], [ 'Dirección', c.direccion ], [ 'Clasificación', avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion ], [ 'Entorno', c.tipoEntorno ], [ 'Uso', c.usoInmueble ]]} />
      </div>
      <div className='amy-pdf-editorial-grid amy-v2-editorial-grid'>
        <EditorialCard number='01' title='Objeto'>Estimar una referencia comercial para la vivienda integrando terreno, construcción, condición, funcionalidad y contexto de mercado.</EditorialCard>
        <EditorialCard number='02' title='Alcance'>El informe se sustenta en la información capturada, parámetros de zona y ponderaciones del motor residencial vigente.</EditorialCard>
        <EditorialCard number='03' title='Uso recomendado'>Apoyo para compra, venta, negociación y análisis patrimonial. Para crédito o garantía real debe complementarse con los requisitos de la institución.</EditorialCard>
      </div>
      <div className='amy-v2-inline-photo'><Photo src={gallery[1] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={4} total={total}>
      <SectionTitle eyebrow='UBICACIÓN Y TERRENO' title='Contexto territorial de la vivienda' text='El suelo que soporta la propiedad se presenta junto con su entorno y condiciones de acceso.' icon={MapPin} />
      <div className='amy-pdf-location-hero amy-v2-location-hero'>
        <div><Eyebrow>UBICACIÓN DEL ACTIVO</Eyebrow><h3>{avaluo?.zona || 'Zona no declarada'}</h3><p>{avaluo?.ciudad || 'Ciudad no declarada'} · {c.direccion || 'Dirección no declarada'}</p></div>
        <div className='amy-pdf-location-area'><span>Área del terreno</span><strong>{num(areaM2)} m²</strong><small>Base física de la propiedad</small></div>
      </div>
      <div className='amy-v2-split-grid'>
        <div>
          <InfoPanel title='Terreno' items={[[ 'Área', `${num(areaM2)} m²` ], [ 'Unidad original', c.unidadArea || c.unidad ], [ 'Topografía', c.topografia ], [ 'Forma', c.formaTerreno ], [ 'Tipo de suelo', c.tipoSuelo ], [ 'Orientación', c.orientacion ]]} />
          <InfoPanel title='Entorno y acceso' items={[[ 'Entorno', c.tipoEntorno ], [ 'Acceso', c.accesoGeneral ], [ 'Seguridad', c.seguridadZona ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Nivel comercial', c.nivelComercial ], [ 'Servicios', c.serviciosBasicos ]]} />
        </div>
        <div className='amy-v2-tall-photo'><Photo src={gallery[2] || gallery[0]} /></div>
      </div>
    </Page>

    <Page config={config} page={5} total={total}>
      <SectionTitle eyebrow='PERFIL CONSTRUCTIVO' title='Escala, antigüedad y condición' text='La construcción se resume mediante sus dimensiones, edad, calidad y estado general.' icon={Building2} />
      <div className='amy-v2-score-grid'>
        <ScoreRing value={qualitativeScore(c.calidadConstructiva || c.acabados)} label='Calidad constructiva' caption={c.calidadConstructiva || c.acabados || 'No declarado'} />
        <ScoreRing value={qualitativeScore(c.estadoGeneral || c.estadoConstruccion)} label='Estado general' caption={c.estadoGeneral || c.estadoConstruccion || 'No declarado'} />
        <ScoreRing value={qualitativeScore(c.nivelMantenimiento)} label='Mantenimiento' caption={c.nivelMantenimiento || 'No declarado'} />
      </div>
      <div className='amy-pdf-metrics-grid amy-v2-metrics-grid'>
        <Metric label='Área construida' value={`${num(c.areaConstruccion)} m²`} />
        <Metric label='Plantas' value={c.niveles || 'No declarado'} />
        <Metric label='Antigüedad' value={c.antiguedad || 'No declarado'} />
        <Metric label='Habitaciones' value={num(c.habitaciones)} />
        <Metric label='Baños' value={num(c.banos)} />
        <Metric label='Medios baños' value={num(c.mediosBanos)} />
      </div>
      <ProfileBars title='Perfil técnico residencial' items={houseProfile} />
      <div className='amy-pdf-wide-photo short amy-v2-wide-photo'><Photo src={gallery[3] || gallery[1] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={6} total={total}>
      <SectionTitle eyebrow='MATERIALES Y ACABADOS' title='Lectura material de la vivienda' text='Los principales componentes se presentan en una matriz compacta para comparar calidad, permanencia y nivel de acabado.' icon={Sparkles} />
      <div className='amy-v2-material-grid'>
        <Metric label='Cimentación' value={c.tipoCimentacion || 'No declarado'} />
        <Metric label='Paredes' value={c.tipoParedes || 'No declarado'} />
        <Metric label='Techo' value={c.tipoTecho || 'No declarado'} />
        <Metric label='Cielo raso' value={c.tipoCieloRaso || 'No declarado'} />
        <Metric label='Piso' value={c.tipoPiso || 'No declarado'} />
        <Metric label='Ventanas' value={c.tipoVentanas || 'No declarado'} />
        <Metric label='Puertas' value={c.tipoPuertas || 'No declarado'} />
        <Metric label='Acabados' value={c.acabados || c.calidadConstructiva || 'No declarado'} />
        <Metric label='Estado construcción' value={c.estadoConstruccion || 'No declarado'} />
      </div>
      <div className='amy-v2-material-note'>
        <div><span>LECTURA DE CALIDAD</span><strong>{c.calidadConstructiva || c.acabados || 'No declarado'}</strong></div>
        <p>Los materiales y acabados influyen en competitividad, reposición y percepción del comprador. Su lectura se mantiene separada del diagnóstico estructural especializado.</p>
      </div>
      <div className='amy-v2-inline-photo large'><Photo src={gallery[4] || gallery[2] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={7} total={total}>
      <SectionTitle eyebrow='SISTEMAS E INSTALACIONES' title='Infraestructura operativa de la propiedad' text='Los sistemas de servicio se presentan junto con una lectura visual de disponibilidad y condición declarada.' icon={Waves} />
      <div className='amy-v2-score-grid'>
        <ScoreRing value={qualitativeScore(c.sistemaElectrico)} label='Sistema eléctrico' caption={c.sistemaElectrico || 'No declarado'} />
        <ScoreRing value={qualitativeScore(c.sistemaHidraulico)} label='Sistema hidráulico' caption={c.sistemaHidraulico || 'No declarado'} />
        <ScoreRing value={servicesScore} label='Servicios básicos' caption={`${Math.round(servicesScore)} / 100`} />
      </div>
      <div className='amy-pdf-two-col amy-v2-two-col'>
        <InfoPanel title='Sistemas principales' items={[[ 'Eléctrico', c.sistemaElectrico ], [ 'Hidráulico', c.sistemaHidraulico ], [ 'Sanitario', c.sistemaSanitario ], [ 'Pluvial', c.sistemaPluvial ], [ 'Servicios básicos', c.serviciosBasicos ]]} />
        <InfoPanel title='Equipamiento técnico' items={[[ 'Paneles solares', c.panelesSolares ], [ 'Pozo propio', c.pozoPropio ], [ 'Tanque de agua', c.tanqueAgua ], [ 'Internet fibra', c.internetFibra ], [ 'Aire acondicionado', c.aireAcondicionado ], [ 'Sistema inteligente', c.sistemaInteligente ]]} />
      </div>
      <ProfileBars title='Condición relativa de instalaciones' items={[
        { label: 'Eléctrico', score: qualitativeScore(c.sistemaElectrico) },
        { label: 'Hidráulico', score: qualitativeScore(c.sistemaHidraulico) },
        { label: 'Sanitario', score: qualitativeScore(c.sistemaSanitario) },
        { label: 'Pluvial', score: qualitativeScore(c.sistemaPluvial) },
        { label: 'Servicios', score: servicesScore },
      ]} />
    </Page>

    <Page config={config} page={8} total={total}>
      <SectionTitle eyebrow='DISTRIBUCIÓN Y AMENIDADES' title='Funcionalidad y atributos comerciales' text='La distribución interior y las amenidades se presentan como una matriz de lectura rápida.' icon={Landmark} />
      <div className='amy-v2-amenity-summary'>
        <div><span>Habitaciones</span><strong>{num(c.habitaciones)}</strong></div>
        <div><span>Baños</span><strong>{num(c.banos)}</strong></div>
        <div><span>Amenidades activas</span><strong>{houseAmenities.filter(Boolean).length}</strong></div>
        <div><span>Índice relativo</span><strong>{Math.round(amenityScore)}/100</strong></div>
      </div>
      <div className='amy-v2-amenities-grid'>
        {amenities.map(([label, value]: any) => <div className={`amy-v2-amenity ${value ? 'is-active' : ''}`} key={label}><i>{value ? '✓' : '—'}</i><span>{label}</span></div>)}
      </div>
      <div className='amy-pdf-note amy-v2-note'>La presencia de amenidades incrementa atractivo y diferenciación comercial, pero su aporte económico final continúa determinado exclusivamente por las ponderaciones existentes del motor residencial.</div>
    </Page>

    <Page config={config} page={9} total={total}>
      <SectionTitle eyebrow='CONDICIÓN Y FACTORES DE VALOR' title='Fortalezas, mantenimiento y competitividad' text='La propiedad se resume en un perfil técnico que facilita identificar los elementos que sostienen o limitan su valor.' icon={Gauge} />
      <ProfileBars title='Perfil técnico residencial' items={houseProfile} />
      <div className='amy-v2-house-factor-grid'>
        <InfoPanel title='Condición' items={[[ 'Estado estructural', c.estadoConstruccion ], [ 'Estado general', c.estadoGeneral ], [ 'Mantenimiento', c.nivelMantenimiento ], [ 'Calidad constructiva', c.calidadConstructiva ], [ 'Acabados', c.acabados ], [ 'Antigüedad', c.antiguedad ]]} />
        <InfoPanel title='Competitividad' items={[[ 'Nivel comercial', c.nivelComercial ], [ 'Uso', c.usoInmueble ], [ 'Seguridad', c.seguridadZona ], [ 'Entorno', c.tipoEntorno ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Servicios', c.serviciosBasicos ]]} />
      </div>
      <ValueBars title='Componentes económicos del activo' items={[{ label: 'Terreno', value: valueLand }, { label: 'Construcción', value: valueConstruction }, { label: 'Valor final', value: finalValue }]} />
      <div className='amy-v2-inline-photo'><Photo src={gallery[5] || gallery[2] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={10} total={total}>
      <SectionTitle eyebrow='MERCADO Y METODOLOGÍA' title='Rango comercial y lógica de valoración' text='El resultado se posiciona dentro del rango estimado y se explica mediante los componentes económicos existentes.' icon={BarChart3} />
      <MarketBand minimum={minValue} value={finalValue} maximum={maxValue} label='Banda estimada de mercado' />
      <DonutChart land={valueLand} construction={valueConstruction} />
      <div className='amy-v2-method-strip'>
        <div><span>01</span><strong>Terreno</strong><em>{money(valueLand)}</em></div>
        <b>+</b>
        <div><span>02</span><strong>Construcción</strong><em>{money(valueConstruction)}</em></div>
        <b>→</b>
        <div><span>03</span><strong>Valor final</strong><em>{money(finalValue)}</em></div>
      </div>
      <CoefficientImpactChart rows={coefs} title='Factores de ajuste más representativos' />
      <div className='amy-pdf-note amy-v2-note'>La visualización presenta los componentes y coeficientes ya calculados. No incorpora ninguna fórmula adicional ni modifica el resultado del motor.</div>
    </Page>

    <Page config={config} page={11} total={total}>
      <SectionTitle eyebrow='CONTROL TÉCNICO Y DOCUMENTAL' title='Coeficientes y estado de documentación' text='La trazabilidad del cálculo se acompaña del estado documental declarado para facilitar revisión y archivo.' icon={FileCheck2} />
      <div className='amy-v2-doc-grid house'>
        <ScoreRing value={documentScore} label='Preparación documental' caption={`${Math.round(documentScore)} / 100`} />
        <InfoPanel title='Documentación' items={[[ 'Escritura', c.escritura ], [ 'Catastro', c.catastro ], [ 'Plano aprobado', c.planoAprobado ], [ 'Impuestos al día', c.impuestosAlDia ], [ 'Libre de gravamen', c.libreGravamen ]]} />
        <InfoPanel title='Resumen técnico' items={[[ 'Factor global', Number(avaluo?.factorGlobal || 1).toFixed(3) ], [ 'Valor base', money(avaluo?.valorBase) ], [ 'Valor terreno', money(valueLand) ], [ 'Valor construcción', money(valueConstruction) ], [ 'Valor final', money(finalValue) ]]} />
      </div>
      <CoefficientsTable rows={coefs} limit={24} />
    </Page>

    <Page config={config} page={12} total={total}>
      <SectionTitle eyebrow='CIERRE DEL INFORME' title='Evidencia, conclusión y validación' text='El expediente finaliza con evidencia fotográfica, conclusión técnica y espacios de validación.' icon={ShieldCheck} />
      <div className='amy-v2-conclusion-strip'>
        <div><span>VALOR COMERCIAL</span><strong>{money(finalValue)}</strong></div>
        <p>Referencia central para negociación y análisis patrimonial, sujeta a inspección física, validación documental y comparables vigentes.</p>
      </div>
      <Gallery images={gallery} slots={6} />
      <div className='amy-pdf-quote amy-v2-quote is-navy'><span>CONCLUSIÓN</span><p>{analysis} Para decisiones financieras o jurídicas definitivas debe verificarse la condición real de la construcción, sus instalaciones y la documentación correspondiente.</p></div>
      <Signature avaluo={avaluo} config={config} />
    </Page>
  </div>;
}

export default function AmyLuxuryReportV2({ avaluo }: any) {
  const config = resolveReportConfig(avaluo);
  return avaluo?.tipoPropiedad === 'casa'
    ? <HouseReport avaluo={avaluo} config={config} />
    : <TerrainReport avaluo={avaluo} config={config} />;
}
