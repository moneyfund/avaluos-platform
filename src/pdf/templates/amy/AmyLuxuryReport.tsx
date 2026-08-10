import { BarChart3, Building2, FileText, Home, MapPin, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { generateAvaluoAnalysis } from '../../generateAvaluoAnalysis';
import { resolveReportConfig } from '../../reportConfig';
import './amyLuxuryPdf.css';

const money = (value: any) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(value || 0));
const num = (value: any) => new Intl.NumberFormat('es-NI', { maximumFractionDigits: 2 }).format(Number(value || 0));
const clean = (value: any) => value !== undefined && value !== null && value !== '' && !(Array.isArray(value) && !value.length);
const boolText = (value: any) => value === true ? 'Sí' : value === false ? 'No' : value;
const text = (value: any): string => Array.isArray(value)
  ? value.map(boolText).join(', ')
  : typeof value === 'object' && value
    ? Object.entries(value).filter(([, item]) => clean(item)).map(([key, item]) => `${humanize(key)}: ${boolText(item)}`).join(' · ')
    : String(boolText(value ?? ''));
const humanize = (value: any) => String(value || '').replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ').replace(/^./, (c) => c.toUpperCase());
const date = (value: any) => {
  const parsed = value ? new Date(value) : new Date();
  return (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toLocaleDateString('es-NI', { year: 'numeric', month: 'long', day: 'numeric' });
};

function Brand({ config, inverse = false }: any) {
  const initials = String(config.shortName || config.organizationName || 'AB').slice(0, 3).toUpperCase();
  return <div className={`amy-pdf-brand ${inverse ? 'is-inverse' : ''}`}>
    <div className='amy-pdf-brandmark'>{config.logoUrl ? <img src={config.logoUrl} alt='' /> : <span>{initials}</span>}</div>
    <div className='amy-pdf-brandcopy'><strong>{config.organizationName || 'Amy Blandon'}</strong><span>Bienes raíces · valoración inmobiliaria</span></div>
  </div>;
}

function Footer({ config, page, total }: any) {
  return <footer className='amy-pdf-footer'>
    <div><strong>{config.organizationName || 'Amy Blandon'}</strong><span>{config.website || 'Informe técnico de avalúo'}</span></div>
    <div className='amy-pdf-footer-line' />
    <span className='amy-pdf-page-number'>{String(page).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
  </footer>;
}

function Page({ children, config, page, total, className = '' }: any) {
  return <section className={`avaluo-pdf-page amy-pdf-page ${className}`}>
    <div className='amy-pdf-page-glow' />
    <div className='amy-pdf-page-content'>{children}</div>
    <Footer config={config} page={page} total={total} />
  </section>;
}

function Eyebrow({ children }: any) { return <p className='amy-pdf-eyebrow'>{children}</p>; }
function SectionTitle({ eyebrow, title, text: description, icon: Icon }: any) {
  return <header className='amy-pdf-section-heading'>
    <div>{Icon && <Icon />}<span><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2></span></div>
    {description && <p>{description}</p>}
  </header>;
}
function Photo({ src, className = '' }: any) { return src ? <img className={className} src={src} alt='Fotografía del inmueble' /> : <div className={`amy-pdf-photo-placeholder ${className}`}>Fotografía no disponible</div>; }
function Detail({ label, value, strong = false }: any) {
  return <div className={`amy-pdf-detail ${strong ? 'is-strong' : ''}`}><span>{label}</span><strong>{clean(value) ? text(value) : 'No declarado'}</strong></div>;
}
function Metric({ label, value, note }: any) {
  return <article className='amy-pdf-metric'><span>{label}</span><strong>{value}</strong>{note && <small>{note}</small>}</article>;
}
function EditorialCard({ number, title, children }: any) {
  return <article className='amy-pdf-editorial-card'><span>{number}</span><h3>{title}</h3><p>{children}</p></article>;
}
function InfoPanel({ title, items }: any) {
  return <section className='amy-pdf-info-panel'><h3>{title}</h3><div>{items.map(([label, value]: any) => <Detail key={label} label={label} value={value} />)}</div></section>;
}
function CoefficientsTable({ rows }: any) {
  return <table className='amy-pdf-table'><thead><tr><th>Factor técnico</th><th>Condición observada</th><th>Coef.</th><th>Impacto</th></tr></thead><tbody>{rows.map((coef: any, index: number) => <tr key={`${coef.factor || coef.nombre}-${index}`}><td>{coef.factor || coef.nombre || 'Factor'}</td><td>{coef.valorAplicado || 'No declarado'}</td><td>{Number(coef.coeficiente || 1).toFixed(3)}</td><td>{coef.impacto || 'Neutro'}</td></tr>)}</tbody></table>;
}
function Gallery({ images, large = false }: any) {
  const visible = images.filter(Boolean).slice(0, large ? 5 : 4);
  const slots = large ? 5 : 4;
  return <div className={`amy-pdf-gallery ${large ? 'is-large' : ''}`}>{Array.from({ length: slots }).map((_, index) => <figure key={index}><Photo src={visible[index]} /><figcaption>Registro fotográfico {String(index + 1).padStart(2, '0')}</figcaption></figure>)}</div>;
}
function Signature({ avaluo, config }: any) {
  return <div className='amy-pdf-signatures'>
    <div><span>Elaborado por</span><strong>{avaluo?.agenteEvaluador || 'Agente evaluador'}</strong><small>{avaluo?.telefonoAgente || 'Responsable del informe'}</small></div>
    <div><span>Firma / validación</span><strong>{config.organizationName || 'Amy Blandon'}</strong><small>{config.website || 'Valoración inmobiliaria'}</small></div>
  </div>;
}
function Cover({ avaluo, config, total, kind }: any) {
  const c = avaluo?.caracteristicas || {};
  const isHouse = kind === 'casa';
  const area = isHouse ? c.areaConstruccion : (avaluo?.areaM2Convertida ?? c.areaM2Convertida ?? c.areaTerreno);
  return <Page config={config} page={1} total={total} className='amy-pdf-cover'>
    <div className='amy-pdf-cover-top'><Brand config={config} /><div className='amy-pdf-cover-date'>{date(avaluo?.createdAt)}</div></div>
    <div className='amy-pdf-cover-title'><Eyebrow>INFORME PROFESIONAL · 2026</Eyebrow><h1>{isHouse ? 'AVALÚO RESIDENCIAL' : 'AVALÚO DE TERRENO'}</h1><p>{avaluo?.titulo || (isHouse ? 'Valoración de propiedad residencial' : 'Valoración de terreno')}</p></div>
    <div className='amy-pdf-cover-visual'>
      <div className='amy-pdf-cover-frame' />
      <div className='amy-pdf-cover-photo'><Photo src={avaluo?.imagenPrincipalBase64} /></div>
      <div className='amy-pdf-cover-stamp'><span>VALORACIÓN</span><strong>INMOBILIARIA</strong></div>
    </div>
    <div className='amy-pdf-cover-meta'>
      <Detail label='Ubicación' value={[avaluo?.zona, avaluo?.ciudad].filter(Boolean).join(', ')} strong />
      <Detail label={isHouse ? 'Área construida' : 'Área del terreno'} value={area ? `${num(area)} m²` : ''} />
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
  const areaM2 = avaluo?.areaM2Convertida ?? c.areaM2Convertida ?? c.areaTerreno;
  const areaManzanas = avaluo?.areaManzanas ?? (Number(areaM2 || 0) / 7042.25);
  const factor = avaluo?.technicalAdjustmentFactor ?? avaluo?.factorGlobal ?? 1;
  const baseValue = avaluo?.baseValueTotal ?? avaluo?.valorBase;
  const analysis = generateAvaluoAnalysis(avaluo);

  return <div className='amy-pdf-template'>
    <Cover avaluo={avaluo} config={config} total={total} kind='terreno' />

    <Page config={config} page={2} total={total}>
      <SectionTitle eyebrow='RESUMEN EJECUTIVO' title='Una lectura clara del valor del activo' text='Síntesis de la estimación comercial, su rango y las variables principales que sostienen la conclusión.' icon={TrendingUp} />
      <div className='amy-pdf-value-layout'><div className='amy-pdf-value-card'><span>VALOR COMERCIAL ESTIMADO</span><strong>{money(finalValue)}</strong><p>Rango de mercado: {money(avaluo?.rangoMercado?.minimo)} - {money(avaluo?.rangoMercado?.maximo)}</p></div><div className='amy-pdf-confidence-card'><span>Nivel de confianza</span><strong>{avaluo?.nivelConfianza || 'No declarado'}</strong><small>Resultado sujeto a validación física y documental.</small></div></div>
      <div className='amy-pdf-metrics-grid'><Metric label='Precio final por m²' value={money(avaluo?.adjustedPriceM2 ?? avaluo?.valorM2)} /><Metric label='Precio por manzana' value={money(avaluo?.pricePerManzana)} /><Metric label='Valor base' value={money(baseValue)} /><Metric label='Factor técnico' value={Number(factor).toFixed(3)} /><Metric label='Liquidez' value={avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez}/100` : (c.liquidez || 'No declarado')} /><Metric label='Venta estimada' value={avaluo?.tiempoEstimadoVenta || 'No declarado'} /></div>
      <div className='amy-pdf-quote'><span>ANÁLISIS</span><p>{analysis}</p></div>
    </Page>

    <Page config={config} page={3} total={total}>
      <SectionTitle eyebrow='IDENTIFICACIÓN' title='Objeto y alcance del informe' text='Datos esenciales del expediente y contexto de uso de la valoración.' icon={FileText} />
      <div className='amy-pdf-editorial-grid'><EditorialCard number='01' title='Objeto'>Estimar una referencia comercial técnicamente sustentada para el terreno descrito, utilizando la información registrada en el sistema de avalúos.</EditorialCard><EditorialCard number='02' title='Alcance'>La valoración integra ubicación, área, atributos físicos, acceso, servicios, entorno, mercado y factores legales declarados.</EditorialCard><EditorialCard number='03' title='Uso recomendado'>Apoyo para negociación, análisis patrimonial, compra, venta y toma de decisiones inmobiliarias. No sustituye peritajes legales o estructurales especializados.</EditorialCard></div>
      <div className='amy-pdf-identity-grid'><InfoPanel title='Expediente' items={[[ 'Título', avaluo?.titulo ], [ 'Fecha', date(avaluo?.createdAt) ], [ 'Tipo de activo', 'Terreno' ], [ 'Evaluador', avaluo?.agenteEvaluador ], [ 'Teléfono', avaluo?.telefonoAgente ]]} /><InfoPanel title='Ubicación declarada' items={[[ 'Ciudad', avaluo?.ciudad ], [ 'Zona', avaluo?.zona ], [ 'Clasificación', avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion ], [ 'Entorno', c.entorno || c.tipoEntorno ], [ 'Categoría territorial', c.tipoTerritorio ]]} /></div>
      <div className='amy-pdf-note'>La información de este documento refleja los datos ingresados al momento de su generación. Cualquier cambio sustancial en medidas, documentos, accesos, condiciones de mercado o características físicas puede modificar la estimación.</div>
    </Page>

    <Page config={config} page={4} total={total}>
      <SectionTitle eyebrow='LOCALIZACIÓN' title='Contexto territorial y dimensión' text='Lectura del emplazamiento y de la escala física del terreno.' icon={MapPin} />
      <div className='amy-pdf-location-hero'><div><Eyebrow>UBICACIÓN DEL ACTIVO</Eyebrow><h3>{avaluo?.zona || 'Zona no declarada'}</h3><p>{avaluo?.ciudad || 'Ciudad no declarada'}</p></div><div className='amy-pdf-location-area'><span>Área convertida</span><strong>{num(areaM2)} m²</strong><small>{num(areaManzanas)} manzanas equivalentes</small></div></div>
      <div className='amy-pdf-two-col'><InfoPanel title='Dimensiones y referencia' items={[[ 'Área original', `${num(avaluo?.areaOriginal ?? c.areaOriginal)} ${c.unidadArea === 'manzana' ? 'manzanas' : 'm²'}` ], [ 'Área en m²', `${num(areaM2)} m²` ], [ 'Área en manzanas', `${num(areaManzanas)} mz` ], [ 'Frente', c.frenteTerreno ? `${num(c.frenteTerreno)} m` : '' ], [ 'Fondo', c.fondoTerreno ? `${num(c.fondoTerreno)} m` : '' ], [ 'Orientación', c.orientacion ]]} /><InfoPanel title='Lectura territorial' items={[[ 'Clasificación de zona', avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion ], [ 'Tipo de entorno', c.entorno || c.tipoEntorno ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Cercanía', c.proximity ], [ 'Nivel comercial', c.nivelComercial ], [ 'Seguridad', c.seguridadZona ]]} /></div>
      <div className='amy-pdf-wide-photo'><Photo src={gallery[1] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={5} total={total}>
      <SectionTitle eyebrow='CARACTERÍSTICAS FÍSICAS' title='Configuración del terreno' text='Atributos que condicionan aprovechamiento, desarrollo y comportamiento comercial.' icon={Sparkles} />
      <div className='amy-pdf-feature-mosaic'><Metric label='Topografía' value={c.topografia || 'No declarado'} /><Metric label='Tipo de suelo' value={c.tipoSuelo || 'No declarado'} /><Metric label='Forma' value={c.formaTerreno || 'No declarado'} /><Metric label='Orientación' value={c.orientacion || 'No declarado'} /><Metric label='Uso potencial' value={c.usoPotencial || 'No declarado'} /><Metric label='Deforestación' value={c.nivelDeforestacion || 'No declarado'} /></div>
      <div className='amy-pdf-two-col'><InfoPanel title='Recursos y cobertura' items={[[ 'Hidrología', c.hidrologia ], [ 'Vegetación', c.vegetacion ], [ 'Recursos naturales', c.recursosNaturales ], [ 'Riesgos declarados', c.riesgos ]]} /><InfoPanel title='Aprovechamiento' items={[[ 'Uso potencial', c.usoPotencial ], [ 'Uso permitido', c.usoPermitido ], [ 'Entorno', c.entorno ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Demanda local', c.demanda ], [ 'Oferta comparable', c.oferta ]]} /></div>
      <div className='amy-pdf-editorial-strip'><span>LECTURA TÉCNICA</span><p>La configuración física del terreno se analiza en conjunto con su escala, ubicación y accesibilidad. Ningún atributo aislado determina el valor final; el resultado proviene de la ponderación integral del expediente.</p></div>
    </Page>

    <Page config={config} page={6} total={total}>
      <SectionTitle eyebrow='INFRAESTRUCTURA Y ENTORNO' title='Acceso, servicios y funcionalidad' text='Condiciones operativas que influyen en uso, absorción comercial y facilidad de desarrollo.' icon={ShieldCheck} />
      <div className='amy-pdf-two-col'><InfoPanel title='Acceso y movilidad' items={[[ 'Acceso general', c.accesoGeneral ], [ 'Tipo de vía', c.tipoVia ], [ 'Nivel de tráfico', c.nivelTrafico ], [ 'Cercanía principal', c.cercaniaPrincipal ], [ 'Cercanía comercial', c.cercaniaComercial ], [ 'Seguridad de zona', c.seguridadZona ]]} /><InfoPanel title='Servicios básicos' items={[[ 'Servicios disponibles', c.serviciosBasicos ], [ 'Señal / conectividad', c.serviciosBasicos?.senalTelefonica || c.serviciosBasicos?.internet ], [ 'Agua', c.serviciosBasicos?.agua ], [ 'Energía', c.serviciosBasicos?.energia ], [ 'Drenaje', c.serviciosBasicos?.drenaje ], [ 'Alumbrado público', c.serviciosBasicos?.alumbradoPublico ]]} /></div>
      <div className='amy-pdf-editorial-grid is-two'><EditorialCard number='A' title='Accesibilidad'>Una accesibilidad consistente durante todo el año puede ampliar el universo de compradores y facilitar el uso efectivo del terreno.</EditorialCard><EditorialCard number='B' title='Servicios'>La disponibilidad real de infraestructura debe verificarse en campo, especialmente cuando el valor proyectado depende de un desarrollo residencial, comercial o productivo.</EditorialCard></div>
      <div className='amy-pdf-wide-photo short'><Photo src={gallery[2] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={7} total={total}>
      <SectionTitle eyebrow='MERCADO' title='Posicionamiento y estrategia de valor' text='Indicadores comerciales y referencias utilizadas para interpretar la capacidad de negociación del activo.' icon={TrendingUp} />
      <div className='amy-pdf-market-band'><div><span>Publicación recomendada</span><strong>{money(avaluo?.precioRecomendadoPublicacion || finalValue)}</strong></div><div><span>Objetivo de cierre</span><strong>{money(avaluo?.precioObjetivoCierre || finalValue)}</strong></div><div><span>Mínimo de negociación</span><strong>{money(avaluo?.precioMinimoNegociacion || avaluo?.rangoMercado?.minimo)}</strong></div></div>
      <div className='amy-pdf-metrics-grid'><Metric label='Demanda' value={c.demanda || 'No declarado'} /><Metric label='Oferta' value={c.oferta || 'No declarado'} /><Metric label='Liquidez' value={c.liquidez || (avaluo?.indiceLiquidez ? `${avaluo.indiceLiquidez}/100` : 'No declarado')} /><Metric label='Desarrollo' value={c.desarrolloUrbano || 'No declarado'} /><Metric label='Uso potencial' value={c.usoPotencial || 'No declarado'} /><Metric label='Confianza' value={avaluo?.nivelConfianza || 'No declarado'} /></div>
      <div className='amy-pdf-quote is-navy'><span>CRITERIO COMERCIAL</span><p>La estrategia de precio debe considerar el rango técnico estimado, la velocidad esperada de absorción y la flexibilidad de negociación. La cifra central representa una referencia de mercado, no una garantía de cierre.</p></div>
    </Page>

    <Page config={config} page={8} total={total}>
      <SectionTitle eyebrow='METODOLOGÍA' title='Trazabilidad de la estimación' text='Cómo se conectan la referencia territorial, los ajustes técnicos y la conclusión final.' icon={BarChart3} />
      <div className='amy-pdf-method-flow'><div><span>01</span><strong>Referencia territorial</strong><p>Precio base asociado a ciudad, zona, categoría y escala del terreno.</p></div><i /><div><span>02</span><strong>Ajustes técnicos</strong><p>Ponderación de atributos físicos, accesos, servicios, entorno, riesgos y mercado.</p></div><i /><div><span>03</span><strong>Conclusión</strong><p>Valor final y rango comercial derivados del modelo vigente.</p></div></div>
      <div className='amy-pdf-value-breakdown'><Metric label='Precio base sugerido' value={c.precioBaseSugerido ? money(c.precioBaseSugerido) : 'No declarado'} /><Metric label='Precio base aplicado' value={c.precioBaseAplicado ? money(c.precioBaseAplicado) : 'No declarado'} /><Metric label='Valor base total' value={money(baseValue)} /><Metric label='Factor técnico total' value={Number(factor).toFixed(3)} /></div>
      <div className='amy-pdf-two-col'><InfoPanel title='Ajuste de referencia' items={[[ 'Unidad de precio', c.unidadPrecioBase ], [ 'Referencia editada', c.precioBaseFueEditado ], [ 'Motivo', c.motivoAjustePrecioBase ], [ 'Detalle técnico', c.detalleAjustePrecioBase ]]} /><InfoPanel title='Resultado del modelo' items={[[ 'Valor estimado', money(finalValue) ], [ 'Rango mínimo', money(avaluo?.rangoMercado?.minimo) ], [ 'Rango máximo', money(avaluo?.rangoMercado?.maximo) ], [ 'Nivel de confianza', avaluo?.nivelConfianza ]]} /></div>
    </Page>

    <Page config={config} page={9} total={total}>
      <SectionTitle eyebrow='TRAZABILIDAD' title='Coeficientes, documentación y riesgos' text='Detalle de los principales factores registrados y de la información documental declarada.' icon={ShieldCheck} />
      <CoefficientsTable rows={coefs.slice(0, 18)} />
      <div className='amy-pdf-legal-grid'><InfoPanel title='Documentación' items={[[ 'Tipo de documentación', c.tipoDocumentacion || c.legalStatus ], [ 'Escritura pública', c.escrituraPublica ], [ 'Inscripción registral', c.inscripcionRegistral ], [ 'Plano catastral', c.planoCatastral ], [ 'Libre de gravamen', c.libreGravamen ]]} /><InfoPanel title='Observaciones legales / riesgo' items={[[ 'Restricciones legales', c.restriccionesLegales ], [ 'Observaciones legales', c.observacionesLegales ], [ 'Riesgos físicos', c.riesgos ], [ 'Documentación completa', c.documentacionCompleta ]]} /></div>
    </Page>

    <Page config={config} page={10} total={total} className='amy-pdf-closing'>
      <SectionTitle eyebrow='CIERRE DEL INFORME' title='Evidencia y conclusión profesional' text='Registro fotográfico disponible y síntesis final de la valoración.' icon={FileText} />
      <Gallery images={gallery.slice(1)} large />
      <div className='amy-pdf-closing-conclusion'><span>CONCLUSIÓN</span><h3>{money(finalValue)}</h3><p>Con la información suministrada y los parámetros técnicos vigentes, este importe constituye la referencia central de valor comercial del terreno. Se recomienda validar medidas, linderos, documentación, condiciones físicas y comparables antes de formalizar operaciones jurídicas o financieras.</p></div>
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
  const areaM2 = avaluo?.areaM2Convertida ?? c.areaM2Convertida ?? c.areaTerreno;
  const analysis = generateAvaluoAnalysis(avaluo);
  const amenities = [
    ['Sala', c.sala], ['Comedor', c.comedor], ['Cocina', c.cocina], ['Cocina moderna', c.cocinaModerna], ['Cuarto de servicio', c.cuartoServicio], ['Área de lavado', c.areaLavado], ['Bodega', c.bodega], ['Despensa', c.despensa], ['Vestidor', c.vestidor], ['Terraza', c.terraza], ['Balcón', c.balcon], ['Patio', c.patio], ['Jardín', c.jardin], ['Garaje', c.garaje], ['Piscina', c.piscina], ['Rancho', c.rancho], ['Oficina', c.oficina], ['Sala familiar', c.salaFamiliar], ['Estudio', c.estudio], ['Bar', c.bar], ['Área BBQ', c.areaBBQ], ['Portón eléctrico', c.portonElectrico], ['CCTV', c.sistemaCCTV], ['Alarma', c.alarma], ['Paneles solares', c.panelesSolares], ['Pozo propio', c.pozoPropio], ['Tanque de agua', c.tanqueAgua], ['Internet fibra', c.internetFibra], ['Aire acondicionado', c.aireAcondicionado], ['Sistema inteligente', c.sistemaInteligente],
  ];

  return <div className='amy-pdf-template'>
    <Cover avaluo={avaluo} config={config} total={total} kind='casa' />

    <Page config={config} page={2} total={total}>
      <SectionTitle eyebrow='RESUMEN EJECUTIVO' title='Valor comercial de la propiedad' text='Resultado central y composición general del valor residencial.' icon={Home} />
      <div className='amy-pdf-value-layout'><div className='amy-pdf-value-card'><span>VALOR COMERCIAL ESTIMADO</span><strong>{money(finalValue)}</strong><p>Rango de mercado: {money(avaluo?.rangoMercado?.minimo)} - {money(avaluo?.rangoMercado?.maximo)}</p></div><div className='amy-pdf-confidence-card'><span>Nivel de confianza</span><strong>{avaluo?.nivelConfianza || 'No declarado'}</strong><small>Estimación basada en la información registrada.</small></div></div>
      <div className='amy-pdf-metrics-grid'><Metric label='Valor del terreno' value={money(avaluo?.valorTerreno)} /><Metric label='Valor construcción' value={money(avaluo?.valorConstruccion)} /><Metric label='Valor por m²' value={money(avaluo?.valorM2)} /><Metric label='Valor base' value={money(avaluo?.valorBase)} /><Metric label='Factor ponderado' value={Number(avaluo?.factorGlobal || 1).toFixed(3)} /><Metric label='Clasificación de zona' value={avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion || 'No declarado'} /></div>
      <div className='amy-pdf-quote'><span>ANÁLISIS</span><p>{analysis}</p></div>
    </Page>

    <Page config={config} page={3} total={total}>
      <SectionTitle eyebrow='IDENTIFICACIÓN' title='Objeto, alcance y expediente' text='Marco técnico del informe y datos generales de la vivienda.' icon={FileText} />
      <div className='amy-pdf-editorial-grid'><EditorialCard number='01' title='Objeto'>Estimar el valor comercial de la propiedad considerando terreno, construcción, estado, funcionalidad, ubicación y comportamiento inmobiliario de la zona.</EditorialCard><EditorialCard number='02' title='Alcance'>El informe utiliza los datos ingresados y la metodología vigente de Avalúos Platform. No sustituye inspecciones estructurales especializadas.</EditorialCard><EditorialCard number='03' title='Uso recomendado'>Referencia para compra, venta, negociación, análisis patrimonial y toma de decisiones inmobiliarias.</EditorialCard></div>
      <div className='amy-pdf-identity-grid'><InfoPanel title='Expediente' items={[[ 'Título', avaluo?.titulo ], [ 'Fecha', date(avaluo?.createdAt) ], [ 'Tipo de activo', 'Casa / vivienda' ], [ 'Evaluador', avaluo?.agenteEvaluador ], [ 'Teléfono', avaluo?.telefonoAgente ]]} /><InfoPanel title='Identificación del inmueble' items={[[ 'Ciudad', avaluo?.ciudad ], [ 'Zona', avaluo?.zona ], [ 'Dirección', c.direccion ], [ 'Entorno', c.tipoEntorno ], [ 'Uso', c.usoInmueble ]]} /></div>
      <div className='amy-pdf-note'>La conclusión está vinculada a las condiciones declaradas en este expediente. Cambios en áreas, estado constructivo, documentación, entorno o mercado pueden producir una valoración distinta.</div>
    </Page>

    <Page config={config} page={4} total={total}>
      <SectionTitle eyebrow='UBICACIÓN Y TERRENO' title='Emplazamiento de la vivienda' text='Características del suelo y del entorno donde se desarrolla la propiedad.' icon={MapPin} />
      <div className='amy-pdf-location-hero'><div><Eyebrow>UBICACIÓN DEL ACTIVO</Eyebrow><h3>{avaluo?.zona || 'Zona no declarada'}</h3><p>{avaluo?.ciudad || 'Ciudad no declarada'}</p></div><div className='amy-pdf-location-area'><span>Área del terreno</span><strong>{num(areaM2)} m²</strong><small>{c.unidadArea || c.unidad || 'm²'} como unidad registrada</small></div></div>
      <div className='amy-pdf-two-col'><InfoPanel title='Terreno' items={[[ 'Área original', `${num(c.areaOriginal)} ${c.unidadArea === 'vara2' ? 'varas²' : 'm²'}` ], [ 'Área convertida', `${num(areaM2)} m²` ], [ 'Topografía', c.topografia ], [ 'Forma', c.formaTerreno ], [ 'Tipo de suelo', c.tipoSuelo ], [ 'Acceso', c.accesoGeneral ]]} /><InfoPanel title='Entorno' items={[[ 'Tipo de entorno', c.tipoEntorno ], [ 'Nivel comercial', c.nivelComercial ], [ 'Seguridad', c.seguridadZona ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Servicios', c.serviciosBasicos ], [ 'Clasificación', avaluo?.clasificacionZona || avaluo?.zonaSnapshot?.clasificacion ]]} /></div>
      <div className='amy-pdf-wide-photo'><Photo src={gallery[1] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={5} total={total}>
      <SectionTitle eyebrow='CONSTRUCCIÓN' title='Perfil constructivo y estado' text='Lectura general de la edificación, escala y condición registrada.' icon={Building2} />
      <div className='amy-pdf-feature-mosaic'><Metric label='Área construida' value={`${num(c.areaConstruccion)} m²`} /><Metric label='Plantas' value={c.niveles || 'No declarado'} /><Metric label='Antigüedad' value={c.antiguedad || 'No declarado'} /><Metric label='Estado estructural' value={c.estadoConstruccion || 'No declarado'} /><Metric label='Mantenimiento' value={c.nivelMantenimiento || 'No declarado'} /><Metric label='Calidad' value={c.calidadConstructiva || c.acabados || 'No declarado'} /></div>
      <div className='amy-pdf-two-col'><InfoPanel title='Estado y uso' items={[[ 'Estado general', c.estadoGeneral ], [ 'Estado construcción', c.estadoConstruccion ], [ 'Nivel de mantenimiento', c.nivelMantenimiento ], [ 'Uso del inmueble', c.usoInmueble ], [ 'Calidad constructiva', c.calidadConstructiva || c.acabados ]]} /><InfoPanel title='Composición de valor' items={[[ 'Valor del terreno', money(avaluo?.valorTerreno) ], [ 'Valor de construcción', money(avaluo?.valorConstruccion) ], [ 'Valor base', money(avaluo?.valorBase) ], [ 'Valor comercial', money(finalValue) ]]} /></div>
      <div className='amy-pdf-editorial-strip'><span>LECTURA RESIDENCIAL</span><p>La vivienda se valora como un activo integrado: ubicación, terreno y construcción interactúan con estado, mantenimiento, calidad de materiales, funcionalidad y amenidades.</p></div>
    </Page>

    <Page config={config} page={6} total={total}>
      <SectionTitle eyebrow='MATERIALES' title='Materialidad y acabados' text='Componentes constructivos declarados para la edificación.' icon={Sparkles} />
      <div className='amy-pdf-material-grid'>{[[ 'Cimentación', c.tipoCimentacion ], [ 'Paredes', c.tipoParedes ], [ 'Techo', c.tipoTecho ], [ 'Cielo raso', c.tipoCieloRaso ], [ 'Piso', c.tipoPiso ], [ 'Ventanas', c.tipoVentanas ], [ 'Puertas', c.tipoPuertas ], [ 'Acabados / calidad', c.calidadConstructiva || c.acabados ]].map(([label, value]) => <Metric key={label} label={label} value={value || 'No declarado'} />)}</div>
      <div className='amy-pdf-wide-photo short'><Photo src={gallery[2] || gallery[0]} /></div>
      <div className='amy-pdf-note'>La descripción de materiales corresponde a la información registrada. Una inspección física puede identificar condiciones, patologías, reparaciones o sustituciones que no estén reflejadas en el formulario.</div>
    </Page>

    <Page config={config} page={7} total={total}>
      <SectionTitle eyebrow='SISTEMAS' title='Instalaciones y servicios' text='Condiciones operativas que influyen en habitabilidad, mantenimiento y competitividad.' icon={ShieldCheck} />
      <div className='amy-pdf-material-grid'>{[[ 'Sistema eléctrico', c.sistemaElectrico ], [ 'Sistema hidráulico', c.sistemaHidraulico ], [ 'Sistema sanitario', c.sistemaSanitario ], [ 'Sistema pluvial', c.sistemaPluvial ], [ 'Agua potable', c.serviciosBasicos?.agua ], [ 'Energía', c.serviciosBasicos?.energia ], [ 'Drenaje', c.serviciosBasicos?.drenaje ], [ 'Internet', c.serviciosBasicos?.internet ]].map(([label, value]) => <Metric key={label} label={label} value={clean(value) ? text(value) : 'No declarado'} />)}</div>
      <div className='amy-pdf-editorial-grid is-two'><EditorialCard number='A' title='Operación'>El estado de instalaciones y redes afecta costos futuros, percepción del comprador y nivel de mantenimiento requerido.</EditorialCard><EditorialCard number='B' title='Validación'>Para operaciones de crédito o garantía real se recomienda revisar físicamente instalaciones, capacidad, funcionamiento y cumplimiento aplicable.</EditorialCard></div>
    </Page>

    <Page config={config} page={8} total={total}>
      <SectionTitle eyebrow='DISTRIBUCIÓN' title='Funcionalidad y amenidades' text='Organización espacial, equipamiento y atributos de uso residencial.' icon={Home} />
      <div className='amy-pdf-room-band'><Metric label='Habitaciones' value={num(c.habitaciones)} /><Metric label='Baños completos' value={num(c.banos)} /><Metric label='Medios baños' value={num(c.mediosBanos)} /></div>
      <div className='amy-pdf-amenities'>{amenities.map(([label, value]) => <div key={String(label)} className={value ? 'is-present' : ''}><span>{value ? 'Sí' : '—'}</span><strong>{label}</strong></div>)}</div>
    </Page>

    <Page config={config} page={9} total={total}>
      <SectionTitle eyebrow='CONDICIÓN DEL ACTIVO' title='Estado, mantenimiento y factores de valor' text='Variables cualitativas que pueden fortalecer o limitar la competitividad de la vivienda.' icon={Sparkles} />
      <div className='amy-pdf-two-col'><InfoPanel title='Condición general' items={[[ 'Estado general', c.estadoGeneral ], [ 'Estado estructural', c.estadoConstruccion ], [ 'Mantenimiento', c.nivelMantenimiento ], [ 'Antigüedad', c.antiguedad ], [ 'Calidad', c.calidadConstructiva || c.acabados ]]} /><InfoPanel title='Entorno y mercado' items={[[ 'Entorno', c.tipoEntorno ], [ 'Nivel comercial', c.nivelComercial ], [ 'Seguridad', c.seguridadZona ], [ 'Desarrollo urbano', c.desarrolloUrbano ], [ 'Uso', c.usoInmueble ]]} /></div>
      <div className='amy-pdf-driver-grid'><EditorialCard number='+' title='Fortalezas'>Los atributos positivos registrados - ubicación, calidad, estado, distribución, equipamiento y servicios - sostienen la competitividad cuando se confirman en campo.</EditorialCard><EditorialCard number='!' title='Sensibilidades'>Mantenimiento pendiente, antigüedad, deficiencias de sistemas, documentación incompleta o condiciones físicas no registradas pueden afectar el valor final.</EditorialCard></div>
      <div className='amy-pdf-wide-photo short'><Photo src={gallery[3] || gallery[0]} /></div>
    </Page>

    <Page config={config} page={10} total={total}>
      <SectionTitle eyebrow='MERCADO Y METODOLOGÍA' title='Cómo se construye la conclusión de valor' text='Integración de terreno, construcción y factores ponderados.' icon={BarChart3} />
      <div className='amy-pdf-method-flow'><div><span>01</span><strong>Terreno</strong><p>Zona, área, suelo, accesibilidad y entorno.</p></div><i /><div><span>02</span><strong>Construcción</strong><p>Área, calidad, antigüedad, estado y materiales.</p></div><i /><div><span>03</span><strong>Mercado</strong><p>Factores técnicos y rango comercial del activo.</p></div></div>
      <div className='amy-pdf-market-band'><div><span>Valor terreno</span><strong>{money(avaluo?.valorTerreno)}</strong></div><div><span>Valor construcción</span><strong>{money(avaluo?.valorConstruccion)}</strong></div><div><span>Valor comercial</span><strong>{money(finalValue)}</strong></div></div>
      <div className='amy-pdf-quote is-navy'><span>CRITERIO DE VALORACIÓN</span><p>{analysis}</p></div>
    </Page>

    <Page config={config} page={11} total={total}>
      <SectionTitle eyebrow='TRAZABILIDAD Y DOCUMENTOS' title='Coeficientes y respaldo declarado' text='Factores del modelo y condición documental informada para la propiedad.' icon={ShieldCheck} />
      <CoefficientsTable rows={coefs.slice(0, 18)} />
      <div className='amy-pdf-legal-grid'><InfoPanel title='Documentación' items={[[ 'Escritura', c.escritura ], [ 'Catastro', c.catastro ], [ 'Plano aprobado', c.planoAprobado ], [ 'Impuestos al día', c.impuestosAlDia ], [ 'Libre de gravamen', c.libreGravamen ]]} /><InfoPanel title='Resultado técnico' items={[[ 'Factor global', Number(avaluo?.factorGlobal || 1).toFixed(3) ], [ 'Rango mínimo', money(avaluo?.rangoMercado?.minimo) ], [ 'Rango máximo', money(avaluo?.rangoMercado?.maximo) ], [ 'Confianza', avaluo?.nivelConfianza ]]} /></div>
    </Page>

    <Page config={config} page={12} total={total} className='amy-pdf-closing'>
      <SectionTitle eyebrow='CIERRE DEL INFORME' title='Evidencia y conclusión profesional' text='Registro fotográfico disponible, valor central y recomendaciones finales.' icon={FileText} />
      <Gallery images={gallery.slice(1)} large />
      <div className='amy-pdf-closing-conclusion'><span>VALOR COMERCIAL CONCLUIDO</span><h3>{money(finalValue)}</h3><p>La cifra representa la referencia central del modelo con la información suministrada. Para decisiones financieras, jurídicas o de garantía real, se recomienda complementar con inspección física, revisión de títulos, gravámenes, medidas, instalaciones y documentación exigida por la institución correspondiente.</p></div>
      <Signature avaluo={avaluo} config={config} />
    </Page>
  </div>;
}

export default function AmyLuxuryReport({ avaluo }: any) {
  const config = resolveReportConfig(avaluo);
  return avaluo?.tipoPropiedad === 'casa'
    ? <HouseReport avaluo={avaluo} config={config} />
    : <TerrainReport avaluo={avaluo} config={config} />;
}
