import { useEffect, useState } from 'react';
import InformeGeneralSection from './InformeGeneralSection';
import ProgressiveFormShell from './ProgressiveFormShell';
import { CIUDADES_AVALUO, getZonasByCiudad } from '../../../core/avaluos/constants/locations';
import { M2_POR_MANZANA } from '../../../core/avaluos/engine/terreno.engine';
import BasePriceReferenceEditor from '../basePrice/BasePriceReferenceEditor';
import { buildSuggestedBaseReference } from '../../../core/avaluos/basePrice/basePriceReference';

const unidadesArea = [
  { value: 'm2', label: 'Metros cuadrados' },
  { value: 'manzana', label: 'Manzanas' },
];
const tipoTerritorio = ['Urbano', 'Semiurbano', 'Semirural', 'Rural cercano', 'Rural productivo', 'Rural aislado'];
const tipoSuelo = ['Arcilloso', 'Franco', 'Franco arcilloso', 'Franco arenoso', 'Arenoso', 'Pedregoso', 'Volcánico', 'Muy fértil', 'Rocoso'];
const topografias = ['Plano', 'Ondulado leve', 'Ondulado medio', 'Quebrado', 'Escarpado', 'Con terrazas naturales'];
const accesosGenerales = ['Excelente', 'Bueno', 'Regular', 'Difícil', 'Muy difícil'];
const tiposVia = ['Asfalto', 'Concreto', 'Adoquín', 'Macadán', 'Tierra buena', 'Tierra regular', 'Camino temporal'];
const nivelesTrafico = ['Alto', 'Medio', 'Bajo', 'Muy bajo'];
const seguridad = ['Alta', 'Media alta', 'Media', 'Baja'];
const formas = ['Regular', 'Rectangular', 'Cuadrado', 'Irregular leve', 'Irregular compleja', 'Esquinero', 'Fondo amplio', 'Frente amplio'];
const entornos = ['Residencial premium', 'Residencial medio', 'Comercial', 'Mixto', 'Popular', 'Rural productivo', 'Natural/turístico'];
const usos = ['Residencial', 'Comercial', 'Industrial', 'Turístico', 'Agrícola', 'Ganadero', 'Forestal', 'Mixto', 'Lotificación'];
const desarrollo = ['Consolidado', 'En crecimiento', 'Emergente', 'Bajo desarrollo', 'Sin desarrollo urbano'];
const deforestacion = ['Sin deforestación', 'Baja', 'Media', 'Alta', 'Muy alta'];
const proximidades = ['Cerca de ciudad principal', 'Cerca de comunidad', 'Remoto'];
const estadosLegales = ['Documentación completa', 'Documentación revisable', 'Problemas legales'];
const recursos = ['Fuente de agua', 'Río o quebrada', 'Pozo', 'Árboles maderables', 'Vista panorámica', 'Área cultivable', 'Ninguno'];
const hidrologias = ['Pozo', 'Río permanente', 'Río estacional', 'Quebrada', 'Nacimiento', 'Lago', 'Laguna', 'Sin agua'];
const vegetaciones = ['Bosque', 'Pasto', 'Cultivo', 'Matorral', 'Sin cobertura', 'Bosque secundario', 'Bosque primario'];
const orientaciones = ['Norte', 'Sur', 'Este', 'Oeste', 'Esquina', 'Doble frente'];
const liquidez = ['Muy alta', 'Alta', 'Media', 'Baja', 'Muy baja'];
const demanda = ['Muy alta', 'Alta', 'Media', 'Baja', 'Muy baja'];
const oferta = ['Escasa', 'Normal', 'Alta', 'Excesiva'];
const serviciosBasicos = [
  ['agua', 'Agua potable'], ['energia', 'Energía eléctrica / luz'], ['drenaje', 'Sistema de drenaje'],
  ['senalTelefonica', 'Acceso a señal telefónica'], ['internet', 'Acceso a internet'],
  ['alumbradoPublico', 'Alumbrado público'], ['recoleccionBasura', 'Recolección de basura'],
];
const riesgos = ['Inundación', 'Deslizamientos', 'Sequía', 'Incendios', 'Ninguno'];
const legacyTopografias = ['Plano', 'Semi plano', 'Inclinado', 'Quebrado'];
const legacyAccesos = ['Pavimentado', 'Adoquinado', 'Macadán', 'Tierra'];
const legacyUsos = ['Residencial', 'Comercial', 'Mixto', 'Turístico'];
const legacyFormas = ['Regular', 'Irregular', 'Esquinero', 'Fondo amplio'];
const legacyNiveles = ['Alto', 'Medio', 'Bajo'];
const legacyExposiciones = ['Alta', 'Media', 'Baja'];
const legacyEntornos = ['Residencial premium', 'Residencial media', 'Comercial', 'Mixto', 'Popular'];
const legacyDesarrollo = ['Consolidado', 'Crecimiento', 'Emergente', 'Bajo desarrollo'];

const terrainSteps = [
  { title: 'Informe', description: 'Responsable del avalúo y evidencia fotográfica.' },
  { title: 'Ubicación y área', description: 'Define ciudad, zona, extensión y referencia territorial.' },
  { title: 'Terreno', description: 'Clasificación física, suelo, forma y dimensiones.' },
  { title: 'Acceso', description: 'Vía, tráfico, seguridad y condiciones de llegada.' },
  { title: 'Mercado', description: 'Entorno, uso potencial, demanda, oferta y liquidez.' },
  { title: 'Legal', description: 'Documentación, gravámenes y restricciones declaradas.' },
  { title: 'Recursos', description: 'Servicios, hidrología, vegetación, recursos y riesgos.' },
];

export default function TerrenoForm({ value, onChange, onSubmit, loading, showSubmit = true }) {
  const [currentStep, setCurrentStep] = useState(0);
  const ciudadSeleccionada = value.ciudad || 'Matagalpa';
  const zonasDisponibles = getZonasByCiudad(ciudadSeleccionada);
  const unidadArea = value.unidadArea || 'm2';
  const areaOriginal = Number(value.areaOriginal || value.areaTerreno || 0);
  const areaM2Convertida = unidadArea === 'manzana' ? areaOriginal * M2_POR_MANZANA : areaOriginal;
  const referenciaSugerida = buildSuggestedBaseReference({ ...value, unidadArea, areaOriginal, areaM2Convertida }, value.zonaData);

  useEffect(() => {
    if (!showSubmit || !referenciaSugerida) return;
    if (!value.precioBaseFueEditado) {
      onChange('precioBaseSugerido', referenciaSugerida.precioBaseSugerido);
      onChange('precioBaseAplicado', referenciaSugerida.precioBaseSugerido);
      onChange('unidadPrecioBase', referenciaSugerida.unidad);
    }
  }, [showSubmit, referenciaSugerida?.precioBaseSugerido, referenciaSugerida?.unidad]);

  if (!showSubmit) {
    return <div className='text-slate-200'><InformeGeneralSection value={value} onChange={onChange} /><div className='grid gap-4 md:grid-cols-2'>
      {field('Título del avalúo', 'titulo', value, onChange)}
      {selectField({ label: 'Ciudad', val: ciudadSeleccionada, opts: CIUDADES_AVALUO, onChange: (ciudad) => { onChange('ciudad', ciudad); onChange('zona', ''); onChange('zonaData', null); } })}
      {selectField({ label: 'Zona', val: value.zona || '', opts: zonasDisponibles.map((z) => z.zona), onChange: (zonaNombre) => { const zonaCompleta = zonasDisponibles.find((z) => z.zona === zonaNombre) || null; onChange('zona', zonaNombre); onChange('zonaData', zonaCompleta); } })}
      {num('Área terreno m²', 'areaTerreno', value, onChange)}
      {num('Frente terreno (m)', 'frenteTerreno', value, onChange)}
      {num('Fondo terreno (m)', 'fondoTerreno', value, onChange)}
      {selectField({ label: 'Topografía', val: value.topografia || '', opts: legacyTopografias, onChange: (v) => onChange('topografia', v) })}
      {selectField({ label: 'Acceso', val: value.acceso || '', opts: legacyAccesos, onChange: (v) => onChange('acceso', v) })}
      {selectField({ label: 'Uso potencial', val: value.usoPotencial || '', opts: legacyUsos, onChange: (v) => onChange('usoPotencial', v) })}
      {selectField({ label: 'Forma terreno', val: value.formaTerreno || '', opts: legacyFormas, onChange: (v) => onChange('formaTerreno', v) })}
      {selectField({ label: 'Nivel comercial', val: value.nivelComercial || '', opts: legacyNiveles, onChange: (v) => onChange('nivelComercial', v) })}
      {selectField({ label: 'Exposición comercial', val: value.exposicionComercial || '', opts: legacyExposiciones, onChange: (v) => onChange('exposicionComercial', v) })}
      {selectField({ label: 'Tipo entorno', val: value.tipoEntorno || '', opts: legacyEntornos, onChange: (v) => onChange('tipoEntorno', v) })}
      {selectField({ label: 'Desarrollo urbano', val: value.desarrolloUrbano || '', opts: legacyDesarrollo, onChange: (v) => onChange('desarrolloUrbano', v) })}
      {selectField({ label: 'Densidad urbana', val: value.densidadUrbana || '', opts: legacyNiveles, onChange: (v) => onChange('densidadUrbana', v) })}
      <ServiciosBasicosChecks value={value.serviciosBasicos || {}} onChange={(s) => onChange('serviciosBasicos', s)} />
      <tog label='Esquina' val={!!value.esquina} onChange={(v) => onChange('esquina', v)} />
      <tog label='Cercanía principal' val={!!value.cercaniaPrincipal} onChange={(v) => onChange('cercaniaPrincipal', v)} />
      <tog label='Cercanía comercial' val={!!value.cercaniaComercial} onChange={(v) => onChange('cercaniaComercial', v)} />
      <tog label='Pendiente fuerte' val={!!value.pendiente} onChange={(v) => onChange('pendiente', v)} />
      <tog label='Riesgo inundación' val={!!value.riesgoInundacion} onChange={(v) => onChange('riesgoInundacion', v)} />
      <tog label='Potencial subdivisión' val={!!value.potencialSubdivision} onChange={(v) => onChange('potencialSubdivision', v)} />
      {selectField({ label: 'Seguridad zona', val: value.seguridadZona || '', opts: legacyNiveles, onChange: (v) => onChange('seguridadZona', v) })}
      {selectField({ label: 'Nivel tráfico', val: value.nivelTrafico || '', opts: legacyNiveles, onChange: (v) => onChange('nivelTrafico', v) })}
    </div></div>;
  }

  const resetManualBasePrice = () => {
    if (!referenciaSugerida) return;
    onChange('precioBaseSugerido', referenciaSugerida.precioBaseSugerido);
    onChange('precioBaseAplicado', referenciaSugerida.precioBaseSugerido);
    onChange('unidadPrecioBase', referenciaSugerida.unidad);
    onChange('precioBaseFueEditado', false);
    onChange('motivoAjustePrecioBase', '');
    onChange('detalleAjustePrecioBase', '');
    onChange('confirmacionValorExtraordinario', false);
  };

  const confirmReferenceReset = () => !value.precioBaseFueEditado || window.confirm('El cambio de zona, unidad o área recalculará la referencia territorial y eliminará el ajuste manual actual.');
  const setArea = (nextArea, nextUnit = unidadArea) => {
    if (!confirmReferenceReset()) return;
    const area = Number(nextArea);
    const converted = nextUnit === 'manzana' ? area * M2_POR_MANZANA : area;
    onChange('areaOriginal', area);
    onChange('unidadArea', nextUnit);
    onChange('areaM2Convertida', converted);
    onChange('areaTerreno', converted);
    onChange('precioBaseFueEditado', false);
  };

  return <div className='text-slate-200'>
    <ProgressiveFormShell
      steps={terrainSteps}
      currentStep={currentStep}
      onStepChange={setCurrentStep}
      onFinal={onSubmit}
      loading={loading}
      finalLabel='Calcular avalúo técnico'
      formId='terrain-progressive-form'
    >
      {currentStep === 0 && <>
        <StepIntro eyebrow='EXPEDIENTE' title='Datos del informe' copy='Comienza identificando al responsable y adjuntando la evidencia que acompañará el informe técnico.' />
        <InformeGeneralSection value={value} onChange={onChange} />
      </>}

      {currentStep === 1 && <>
        <StepIntro eyebrow='LOCALIZACIÓN' title='Ubicación, extensión y referencia base' copy='Estos datos determinan la zona de mercado y la escala territorial utilizada por el motor.' />
        <div className='grid gap-4 md:grid-cols-2'>
          {field('Título del avalúo', 'titulo', value, onChange)}
          {selectField({ label: 'Ciudad', val: ciudadSeleccionada, opts: CIUDADES_AVALUO, onChange: (ciudad) => { if (!confirmReferenceReset()) return; onChange('ciudad', ciudad); onChange('zona', ''); onChange('zonaData', null); onChange('precioBaseFueEditado', false); } })}
          {selectField({ label: `Zona / ubicación en ${ciudadSeleccionada}`, val: value.zona || '', opts: zonasDisponibles.map((z) => z.zona), onChange: (zonaNombre) => { if (!confirmReferenceReset()) return; const zonaCompleta = zonasDisponibles.find((z) => z.zona === zonaNombre) || null; onChange('zona', zonaNombre); onChange('zonaData', zonaCompleta); onChange('precioBaseFueEditado', false); } })}
          {selectField({ label: 'Unidad de área', val: unidadArea, opts: unidadesArea, onChange: (v) => setArea(areaOriginal, v) })}
          {num(unidadArea === 'manzana' ? 'Área original (manzanas)' : 'Área original (m²)', 'areaOriginal', { ...value, areaOriginal }, (_k, v) => setArea(v))}
          <div className={base}><span>Área convertida a m²</span><p className='mt-2 rounded bg-slate-800 p-2 font-semibold text-emerald-200'>{areaM2Convertida ? areaM2Convertida.toLocaleString('es-NI', { maximumFractionDigits: 2 }) : '0'} m²</p>{unidadArea === 'manzana' && <p className='mt-2 text-xs text-amber-100'>Para terrenos grandes, el precio por m² disminuye según la extensión de la propiedad.</p>}</div>
        </div>
        {referenciaSugerida && <BasePriceReferenceEditor suggestedValue={value.precioBaseSugerido ?? referenciaSugerida.precioBaseSugerido} appliedValue={value.precioBaseAplicado ?? referenciaSugerida.precioBaseSugerido} unit={value.unidadPrecioBase || referenciaSugerida.unidad} edited={!!value.precioBaseFueEditado} reason={value.motivoAjustePrecioBase} detail={value.detalleAjustePrecioBase} extraordinary={value.confirmacionValorExtraordinario} onChange={(patch) => Object.entries(patch).forEach(([k, v]) => onChange(k, v))} onReset={resetManualBasePrice} />}
      </>}

      {currentStep === 2 && <>
        <StepIntro eyebrow='CARACTERÍSTICAS' title='Clasificación territorial y física' copy='Describe el comportamiento físico del terreno sin mezclarlo todavía con factores comerciales.' />
        <Section title='Clasificación territorial y suelo'>
          {selectField({ label: 'Categoría territorial', val: value.tipoTerritorio || '', opts: tipoTerritorio, onChange: (v) => onChange('tipoTerritorio', v) })}
          {selectField({ label: 'Tipo de suelo', val: value.tipoSuelo || '', opts: tipoSuelo, onChange: (v) => onChange('tipoSuelo', v) })}
          {selectField({ label: 'Topografía', val: value.topografia || '', opts: topografias, onChange: (v) => onChange('topografia', v) })}
          {selectField({ label: 'Forma del terreno', val: value.formaTerreno || '', opts: formas, onChange: (v) => onChange('formaTerreno', v) })}
          {selectField({ label: 'Orientación / frente comercial', val: value.orientacion || '', opts: orientaciones, onChange: (v) => onChange('orientacion', v) })}
          {num('Frente (m)', 'frenteTerreno', value, onChange)}
          {num('Fondo (m)', 'fondoTerreno', value, onChange)}
        </Section>
      </>}

      {currentStep === 3 && <>
        <StepIntro eyebrow='ACCESIBILIDAD' title='Acceso, vía y seguridad' copy='Evalúa qué tan fácil es llegar al inmueble y cómo se comporta su entorno inmediato.' />
        <Section title='Acceso, vía y dinámica de circulación'>
          {selectField({ label: 'Acceso general', val: value.accesoGeneral || '', opts: accesosGenerales, onChange: (v) => onChange('accesoGeneral', v) })}
          {selectField({ label: 'Tipo de calle / vía', val: value.tipoVia || '', opts: tiposVia, onChange: (v) => onChange('tipoVia', v) })}
          {selectField({ label: 'Nivel de tráfico', val: value.nivelTrafico || '', opts: nivelesTrafico, onChange: (v) => onChange('nivelTrafico', v) })}
          {selectField({ label: 'Seguridad de la zona', val: value.seguridadZona || '', opts: seguridad, onChange: (v) => onChange('seguridadZona', v) })}
        </Section>
      </>}

      {currentStep === 4 && <>
        <StepIntro eyebrow='MERCADO' title='Entorno, uso y dinámica comercial' copy='Concentra en una sola etapa los factores de demanda, desarrollo y potencial de aprovechamiento.' />
        <Section title='Entorno y comportamiento de mercado'>
          {selectField({ label: 'Entorno', val: value.entorno || '', opts: entornos, onChange: (v) => onChange('entorno', v) })}
          {selectField({ label: 'Uso potencial', val: value.usoPotencial || '', opts: usos, onChange: (v) => onChange('usoPotencial', v) })}
          {selectField({ label: 'Desarrollo urbano', val: value.desarrolloUrbano || '', opts: desarrollo, onChange: (v) => onChange('desarrolloUrbano', v) })}
          {selectField({ label: 'Cercanía', val: value.proximity || '', opts: proximidades, onChange: (v) => onChange('proximity', v) })}
          {selectField({ label: 'Nivel de deforestación', val: value.nivelDeforestacion || '', opts: deforestacion, onChange: (v) => onChange('nivelDeforestacion', v) })}
          {selectField({ label: 'Liquidez del mercado', val: value.liquidez || '', opts: liquidez, onChange: (v) => onChange('liquidez', v) })}
          {selectField({ label: 'Demanda local', val: value.demanda || '', opts: demanda, onChange: (v) => onChange('demanda', v) })}
          {selectField({ label: 'Oferta comparable', val: value.oferta || '', opts: oferta, onChange: (v) => onChange('oferta', v) })}
        </Section>
      </>}

      {currentStep === 5 && <>
        <StepIntro eyebrow='SITUACIÓN JURÍDICA' title='Documentación y restricciones' copy='Registra la situación declarada del inmueble para que el expediente técnico quede completo.' />
        <Section title='Documentación legal'>
          {selectField({ label: 'Tipo de documentación', val: value.tipoDocumentacion || value.legalStatus || 'Documentación completa', opts: estadosLegales, onChange: (v) => { onChange('tipoDocumentacion', v); onChange('legalStatus', v); } })}
          {selectField({ label: 'Documentación completa', val: value.documentacionCompleta || 'Sí / por confirmar físicamente', opts: ['Sí / por confirmar físicamente', 'No confirmada', 'En proceso'], onChange: (v) => onChange('documentacionCompleta', v) })}
          {selectField({ label: 'Escritura pública', val: value.escrituraPublica || 'Declarada / requerida', opts: ['Declarada / requerida', 'No declarada', 'En trámite'], onChange: (v) => onChange('escrituraPublica', v) })}
          {selectField({ label: 'Inscripción registral', val: value.inscripcionRegistral || 'Declarada / requerida', opts: ['Declarada / requerida', 'No declarada', 'En trámite'], onChange: (v) => onChange('inscripcionRegistral', v) })}
          {selectField({ label: 'Plano catastral', val: value.planoCatastral || 'Declarado / requerido', opts: ['Declarado / requerido', 'No declarado', 'En trámite'], onChange: (v) => onChange('planoCatastral', v) })}
          {selectField({ label: 'Libre de gravamen', val: value.libreGravamen || 'Sin gravamen declarado', opts: ['Sin gravamen declarado', 'No confirmado', 'Con gravamen declarado'], onChange: (v) => onChange('libreGravamen', v) })}
          {field('Restricciones legales', 'restriccionesLegales', value, onChange)}
          {field('Uso permitido', 'usoPermitido', value, onChange)}
          {field('Observaciones legales', 'observacionesLegales', value, onChange)}
        </Section>
      </>}

      {currentStep === 6 && <>
        <StepIntro eyebrow='CIERRE TÉCNICO' title='Recursos, servicios y riesgos' copy='Completa los elementos naturales y de infraestructura antes de ejecutar la valoración.' />
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          <div className={base}>{selectField({ label: 'Hidrología', val: value.hidrologia || '', opts: hidrologias, onChange: (v) => onChange('hidrologia', v) })}{selectField({ label: 'Vegetación', val: value.vegetacion || '', opts: vegetaciones, onChange: (v) => onChange('vegetacion', v) })}</div>
          <checks title='Recursos naturales' items={recursos} value={value.recursosNaturales || []} onChange={(s) => onChange('recursosNaturales', s)} />
          <ServiciosBasicosChecks value={value.serviciosBasicos || {}} onChange={(s) => onChange('serviciosBasicos', s)} />
          <checks title='Riesgos' items={riesgos} value={value.riesgos || []} onChange={(s) => onChange('riesgos', s)} />
        </div>
      </>}
    </ProgressiveFormShell>
  </div>;
}

const base = 'rounded-xl border border-slate-700 bg-slate-900 p-3';
function StepIntro({ eyebrow, title, copy }) { return <div className='progressive-step-intro'><span>{eyebrow}</span><h3>{title}</h3><p>{copy}</p></div>; }
function Section({ title, children }) { return <section className='mt-4'><h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400'>{title}</h3><div className='grid gap-4 md:grid-cols-2'>{children}</div></section>; }
function field(label, key, v, onChange) { return <label className={base}><span>{label}</span><input className='mt-2 w-full rounded bg-slate-800 p-2' value={v[key] || ''} onChange={e => onChange(key, e.target.value)} /></label>; }
function num(label, key, v, onChange) { return <label className={base}><span>{label}</span><input type='number' min='0' step='0.01' className='mt-2 w-full rounded bg-slate-800 p-2' value={v[key] || ''} onChange={e => onChange(key, Number(e.target.value))} /></label>; }
function selectField({ label, val, opts, onChange, disabled = false }) { return <label className={base}><span>{label}</span><select disabled={disabled} className='mt-2 w-full rounded bg-slate-800 p-2' value={val} onChange={e => onChange(e.target.value)}><option value=''>Seleccionar</option>{opts.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>; }
function checks({ title, items, value, onChange }) { const selected = Array.isArray(value) ? value : []; const toggle = (item, checked) => { if (item === 'Ninguno') return onChange(checked ? ['Ninguno'] : []); const withoutNone = selected.filter((x) => x !== 'Ninguno'); return onChange(checked ? [...withoutNone, item] : withoutNone.filter((x) => x !== item)); }; return <div className={base}><p className='font-medium'>{title}</p><div className='mt-2 grid gap-2'>{items.map((item) => <label key={item} className='text-sm'><input type='checkbox' checked={selected.includes(item)} onChange={(e) => toggle(item, e.target.checked)} /> {item}</label>)}</div></div>; }
function ServiciosBasicosChecks({ value, onChange }) { return <div className={base}><p className='font-medium'>Servicios básicos</p><div className='mt-2 grid gap-2'>{serviciosBasicos.map(([k, l]) => <label key={k} className='text-sm'><input type='checkbox' checked={!!value[k]} onChange={(e) => onChange({ ...value, [k]: e.target.checked })} /> {l}</label>)}</div></div>; }
function tog({ label, val, onChange }) { return <label className={base}><span>{label}</span><input type='checkbox' className='ml-3' checked={val} onChange={(e) => onChange(e.target.checked)} /></label>; }
