import { BarChart3, Building2, FileText, Home, ShieldCheck, Sparkles } from 'lucide-react';
import { generateAvaluoAnalysis } from './generateAvaluoAnalysis';
import { resolveReportConfig } from './reportConfig';
import './avaluoPdf.css';

const money = (value) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));
const num = (value) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 }).format(Number(value || 0));
const clean = (value) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && !value.length);
const boolText = (value) => value === true ? 'Sí' : value === false ? 'No' : value;
const text = (value) => Array.isArray(value)
  ? value.map(boolText).join(', ')
  : typeof value === 'object' && value
    ? Object.entries(value).filter(([, item]) => clean(item)).map(([key, item]) => `${key}: ${boolText(item)}`).join(' · ')
    : String(boolText(value ?? ''));
const date = (value) => {
  const parsed = value ? new Date(value) : new Date();
  return (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Footer({ config, page, total }) {
  return <footer className='avaluo-pdf-footer'><strong>{config.organizationName}</strong><span>{config.website}</span><span>Informe residencial</span><span>PÁG. {page}/{total}</span></footer>;
}
function Page({ children, config, page, total, cover = false }) {
  return <section className={`avaluo-pdf-page ${cover ? 'pdf-cover' : ''}`}><div className='avaluo-pdf-accent' /><div className='avaluo-pdf-content'>{children}</div><Footer config={config} page={page} total={total} /></section>;
}
function Photo({ src }) { return src ? <img src={src} alt='Fotografía de la vivienda' /> : <div className='pdf-img-placeholder'>Imagen no disponible</div>; }
function Fact({ label, value }) { return <div className='pdf-cover-fact'><span>{label}</span><strong>{clean(value) ? value : '—'}</strong></div>; }
function Metric({ label, value, note }) { return <div className='pdf-metric'><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</div>; }
function InfoBlock({ title, items }) {
  const visible = items.filter(([, value]) => clean(value));
  if (!visible.length) return null;
  return <section className='pdf-info-block'><h3>{title}</h3>{visible.map(([label, value]) => <div className='pdf-info-row' key={label}><span>{label}</span><strong>{text(value)}</strong></div>)}</section>;
}
function Feature({ label, value }) { if (!clean(value)) return null; return <div className='house-feature'><span>{label}</span><strong>{text(value)}</strong></div>; }
function Check({ label, value }) { return <div className='house-check'><b>{value ? '✓' : '—'}</b> {label}</div>; }

export default function HouseReportPDF({ avaluo }) {
  const config = resolveReportConfig(avaluo);
  const c = avaluo?.caracteristicas || {};
  const coefs = Array.isArray(avaluo?.coeficientesAplicados) ? avaluo.coeficientesAplicados : [];
  const gallery = (avaluo?.imagenesAdicionalesBase64 || []).filter(Boolean).slice(0, 4);
  const total = 6;
  const finalValue = avaluo?.valorFinal ?? avaluo?.valorFinalEstimado;
  const analysis = generateAvaluoAnalysis(avaluo);
  const areaM2 = avaluo?.areaM2Convertida ?? c.areaM2Convertida ?? c.areaTerreno;
  const amenities = [
    ['Sala', c.sala], ['Comedor', c.comedor], ['Cocina', c.cocina], ['Cocina moderna', c.cocinaModerna], ['Cuarto de servicio', c.cuartoServicio],
    ['Área de lavado', c.areaLavado], ['Bodega', c.bodega], ['Vestidor', c.vestidor], ['Terraza', c.terraza], ['Balcón', c.balcon], ['Patio', c.patio],
    ['Jardín', c.jardin], ['Garaje', c.garaje], ['Piscina', c.piscina], ['Rancho', c.rancho], ['Oficina', c.oficina], ['Sala familiar', c.salaFamiliar],
    ['Estudio', c.estudio], ['Bar', c.bar], ['Área BBQ', c.areaBBQ], ['Portón eléctrico', c.portonElectrico], ['CCTV', c.sistemaCCTV], ['Alarma', c.alarma],
    ['Paneles solares', c.panelesSolares], ['Pozo propio', c.pozoPropio], ['Tanque de agua', c.tanqueAgua], ['Internet fibra', c.internetFibra], ['Aire acondicionado', c.aireAcondicionado], ['Sistema inteligente', c.sistemaInteligente],
  ];

  return <div className='avaluo-pdf-template' style={{ '--pdf-primary': config.primaryColor, '--pdf-secondary': config.secondaryColor }}>
    <Page config={config} page={1} total={total} cover>
      <div className='pdf-cover-brand'><div className='pdf-brandmark'>{config.shortName}</div><div className='pdf-cover-brand-text'><strong>{config.organizationName}</strong><span>Informe técnico residencial</span></div><div className='pdf-cover-date'>{date(avaluo?.createdAt)}</div></div>
      <div className='pdf-cover-heading'><p className='pdf-kicker'>Valoración inmobiliaria profesional</p><h1>INFORME TÉCNICO DE AVALÚO RESIDENCIAL</h1><p>{avaluo?.titulo || 'Avalúo técnico de casa'}</p></div>
      <div className='house-cover-band'>Análisis de terreno · construcción · estado · funcionalidad · mercado</div>
      <div className='pdf-cover-photo'><Photo src={avaluo?.imagenPrincipalBase64} /></div>
      <div className='pdf-cover-facts'><Fact label='Ciudad' value={avaluo?.ciudad} /><Fact label='Zona' value={avaluo?.zona} /><Fact label='Área construida' value={`${num(c.areaConstruccion)} m²`} /><Fact label='Evaluador' value={avaluo?.agenteEvaluador} /></div>
    </Page>

    <Page config={config} page={2} total={total}>
      <h2 className='pdf-section-title'><Home /> Resumen ejecutivo</h2>
      <div className='pdf-value-hero'><div className='pdf-value-main'><span>Valor comercial final</span><strong>{money(finalValue)}</strong><p>Rango estimado: {money(avaluo?.rangoMercado?.minimo)} – {money(avaluo?.rangoMercado?.maximo)}</p></div><div className='pdf-confidence'><span>Nivel de confianza</span><strong>{avaluo?.nivelConfianza || '—'}</strong></div></div>
      <div className='pdf-metric-grid'>
        <Metric label='Valor del terreno' value={money(avaluo?.valorTerreno)} />
        <Metric label='Valor de construcción' value={money(avaluo?.valorConstruccion)} />
        <Metric label='Valor por m²' value={money(avaluo?.valorM2)} />
        <Metric label='Valor base' value={money(avaluo?.valorBase)} />
        <Metric label='Factor ponderado' value={Number(avaluo?.factorGlobal || 1).toFixed(3)} />
        <Metric label='Clasificación de zona' value={avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion || '—'} />
      </div>
      <div className='pdf-analysis'><h3>Análisis técnico y comercial</h3><p>{analysis}</p></div>
      <div className='pdf-disclaimer'>La estimación residencial debe complementarse con inspección física, revisión estructural cuando corresponda, validación documental y contraste con comparables vigentes antes de una decisión financiera o jurídica definitiva.</div>
    </Page>

    <Page config={config} page={3} total={total}>
      <h2 className='pdf-section-title'><Building2 /> Ficha técnica y constructiva</h2>
      <div className='pdf-two-col'>
        <InfoBlock title='Ubicación y terreno' items={[[ 'Ciudad', avaluo?.ciudad ], [ 'Zona', avaluo?.zona ], [ 'Dirección', c.direccion ], [ 'Entorno', c.tipoEntorno ], [ 'Área del terreno', `${num(areaM2)} m²` ], [ 'Unidad original', c.unidadArea || c.unidad ], [ 'Topografía', c.topografia ], [ 'Forma', c.formaTerreno ], [ 'Tipo de suelo', c.tipoSuelo ], [ 'Acceso', c.accesoGeneral ], [ 'Seguridad', c.seguridadZona ], [ 'Desarrollo urbano', c.desarrolloUrbano ]]} />
        <InfoBlock title='Construcción' items={[[ 'Área construida', `${num(c.areaConstruccion)} m²` ], [ 'Número de plantas', c.niveles ], [ 'Antigüedad', c.antiguedad ], [ 'Estado estructural', c.estadoConstruccion ], [ 'Mantenimiento', c.nivelMantenimiento ], [ 'Calidad constructiva', c.calidadConstructiva || c.acabados ], [ 'Estado general', c.estadoGeneral ], [ 'Uso', c.usoInmueble ]]} />
      </div>
      <div className='house-construction-grid' style={{marginTop:14}}>
        <Feature label='Cimentación' value={c.tipoCimentacion} /><Feature label='Paredes' value={c.tipoParedes} /><Feature label='Techo' value={c.tipoTecho} /><Feature label='Cielo raso' value={c.tipoCieloRaso} /><Feature label='Piso' value={c.tipoPiso} /><Feature label='Ventanas' value={c.tipoVentanas} /><Feature label='Puertas' value={c.tipoPuertas} /><Feature label='Sistema eléctrico' value={c.sistemaElectrico} /><Feature label='Sistema hidráulico' value={c.sistemaHidraulico} /><Feature label='Sistema sanitario' value={c.sistemaSanitario} /><Feature label='Sistema pluvial' value={c.sistemaPluvial} /><Feature label='Servicios básicos' value={c.serviciosBasicos} />
      </div>
    </Page>

    <Page config={config} page={4} total={total}>
      <h2 className='pdf-section-title'><Sparkles /> Distribución, amenidades y documentos</h2>
      <div className='pdf-metric-grid'><Metric label='Habitaciones' value={num(c.habitaciones)} /><Metric label='Baños completos' value={num(c.banos)} /><Metric label='Medios baños' value={num(c.mediosBanos)} /></div>
      <h3 style={{margin:'20px 0 10px',fontSize:14}}>Amenidades y equipamiento</h3>
      <div className='house-check-grid'>{amenities.slice(0, 30).map(([label, value]) => <Check key={label} label={label} value={value} />)}</div>
      <div className='pdf-two-col' style={{marginTop:16}}>
        <InfoBlock title='Documentación' items={[[ 'Escritura', c.escritura ], [ 'Catastro', c.catastro ], [ 'Plano aprobado', c.planoAprobado ], [ 'Impuestos al día', c.impuestosAlDia ], [ 'Libre de gravamen', c.libreGravamen ]]} />
        <InfoBlock title='Lectura funcional' items={[[ 'Nivel comercial', c.nivelComercial ], [ 'Servicios', c.serviciosBasicos ], [ 'Calidad', c.calidadConstructiva || c.acabados ], [ 'Estado', c.estadoGeneral || c.estadoConstruccion ], [ 'Mantenimiento', c.nivelMantenimiento ]]} />
      </div>
    </Page>

    <Page config={config} page={5} total={total}>
      <h2 className='pdf-section-title'><BarChart3 /> Matriz de coeficientes</h2>
      <div className='pdf-coef-summary'><div><span>Terreno</span><strong>{money(avaluo?.valorTerreno)}</strong></div><div><span>Construcción</span><strong>{money(avaluo?.valorConstruccion)}</strong></div><div><span>Factor final</span><strong>{Number(avaluo?.factorGlobal || 1).toFixed(3)}</strong></div></div>
      <table className='pdf-table'><thead><tr><th style={{width:'25%'}}>Factor</th><th style={{width:'43%'}}>Valor aplicado</th><th style={{width:'16%'}}>Coeficiente</th><th style={{width:'16%'}}>Impacto</th></tr></thead><tbody>{coefs.slice(0, 24).map((coef, index) => <tr key={`${coef.factor}-${index}`}><td>{coef.factor || coef.nombre}</td><td>{coef.valorAplicado || '—'}</td><td>{Number(coef.coeficiente || 1).toFixed(3)}</td><td>{coef.impacto || '—'}</td></tr>)}</tbody></table>
      <div className='pdf-analysis'><h3>Interpretación</h3><p>La matriz residencial pondera ubicación, características del terreno, construcción, estado técnico y amenidades. El factor global sintetiza estas variables sin sustituir una inspección profesional de patologías constructivas o una revisión legal especializada.</p></div>
    </Page>

    <Page config={config} page={6} total={total}>
      <h2 className='pdf-section-title'><ShieldCheck /> Conclusión y evidencia fotográfica</h2>
      <div className='pdf-commercial-grid'><div className='pdf-commercial-card'><h3>Conclusión técnica</h3><p>El valor recomendado de {money(finalValue)} representa la referencia central del modelo con la información suministrada. El rango de mercado permite absorber variaciones por negociación, estado físico real y comparables disponibles.</p></div><div className='pdf-commercial-card'><h3>Recomendaciones</h3><p>Confirmar medidas, títulos, gravámenes, instalaciones, mantenimiento y estado estructural. Para crédito, litigio o garantía real, complementar con inspección y documentación formal exigida por la institución correspondiente.</p></div></div>
      <div className='pdf-gallery'>{gallery.length ? gallery.map((src, index) => <figure key={index}><Photo src={src} /></figure>) : [0,1,2,3].map(index => <figure key={index}><Photo /></figure>)}</div>
      <div className='pdf-signature'><div><strong>{avaluo?.agenteEvaluador || 'Agente evaluador'}</strong><span>{avaluo?.telefonoAgente || 'Responsable del informe'}</span></div><div><strong>{config.organizationName}</strong><span>{config.footerText}</span></div></div>
    </Page>
  </div>;
}
