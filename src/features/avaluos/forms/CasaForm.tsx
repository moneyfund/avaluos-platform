import { CIUDADES_AVALUO, getZonasByCiudad } from '../../../core/avaluos/constants/locations';
import { VARA2_A_M2 } from '../../../core/avaluos/constants/coeficientesCasas';
import InformeGeneralSection from './InformeGeneralSection';

const base = 'rounded-xl border border-slate-700 bg-slate-900 p-3';
const topografias = ['Plano','Semi plano','Ondulado','Inclinado','Muy inclinado','Quebrado'];
const formas = ['Regular','Irregular leve','Irregular compleja','Esquinero','Fondo amplio','Frente amplio'];
const suelos = ['Suelo firme','Suelo arcilloso','Suelo rocoso','Suelo arenoso','Suelo húmedo','Suelo mixto'];
const accesos = ['Excelente','Bueno','Regular','Difícil','Muy difícil'];
const nivel = ['Alto','Medio','Bajo'];
const seguridad = ['Alta','Media alta','Media','Baja'];
const desarrollo = ['Consolidado','En crecimiento','Emergente','Bajo desarrollo','Sin desarrollo urbano'];
const estados = ['Excelente','Muy bueno','Bueno','Regular','Malo'];
const calidad = ['Premium','Alta','Media alta','Media','Básica','Económica'];
const antig = ['0-5','6-10','11-20','20+'];
const plantas = ['1','2','3','4+'];
const doc = ['Completa','Parcial','Pendiente'];
const uso = ['Residencial','Residencial premium','Comercial','Mixto','Institucional'];
const mat = {
  tipoCimentacion:['Concreto reforzado','Mixta','Mampostería','Pilotes'], tipoParedes:['Concreto','Bloque','Ladrillo','Gypsum','Madera'], tipoTecho:['Losa','Teja','Zinc','Lámina troquelada','Fibrocemento'], tipoCieloRaso:['Gypsum','PVC','Madera','Sin cielo raso'], tipoPiso:['Porcelanato','Cerámica','Granito','Concreto','Tierra'], tipoVentanas:['Aluminio','PVC','Madera','Hierro'], tipoPuertas:['Madera','Metálicas','MDF','Puertas premium'], sistemaElectrico:['Excelente','Bueno','Regular','Deficiente'], sistemaHidraulico:['Excelente','Bueno','Regular','Deficiente'], sistemaSanitario:['Excelente','Bueno','Regular','Deficiente'], sistemaPluvial:['Excelente','Bueno','Regular','Deficiente']
};
const checksDist = ['sala','comedor','cocina','cocinaDesayunador','cocinaModerna','cocinaTradicional','cuartoServicio','areaLavado','bodega','despensa','vestidor','terraza','balcon','patio','jardin','garaje','piscina','rancho','oficina','salaFamiliar','estudio','bar','areaBBQ'];
const checksExtras = ['portonElectrico','cercaPerimetral','muroFrontal','sistemaCCTV','alarma','panelesSolares','calentadorSolar','pozoPropio','tanqueAgua','bombaHidroneumatica','internetFibra','aireAcondicionado','sistemaInteligente'];
const labels = { cocinaDesayunador:'Cocina desayunador', cocinaModerna:'Cocina moderna', cocinaTradicional:'Cocina tradicional', cuartoServicio:'Cuarto de servicio', areaLavado:'Área de lavado', salaFamiliar:'Sala familiar', areaBBQ:'Área BBQ', portonElectrico:'Portón eléctrico', cercaPerimetral:'Cerca perimetral', muroFrontal:'Muro frontal', sistemaCCTV:'Sistema CCTV', panelesSolares:'Paneles solares', calentadorSolar:'Calentador solar', pozoPropio:'Pozo propio', tanqueAgua:'Tanque de agua', bombaHidroneumatica:'Bomba hidroneumática', internetFibra:'Internet fibra', aireAcondicionado:'Aire acondicionado', sistemaInteligente:'Sistema inteligente' };

export default function CasaForm({value,onChange,onSubmit,loading}){
  const ciudad = value.ciudad || 'Matagalpa'; const zonas = getZonasByCiudad(ciudad);
  const unidad = value.unidad || value.unidadArea || 'm2'; const areaOrig = Number(value.areaOriginal || value.areaTerreno || 0); const conv = unidad === 'vara2' ? areaOrig * VARA2_A_M2 : areaOrig;
  const setArea=(a,u=unidad)=>{ const n=Number(a); const c=u==='vara2'?n*VARA2_A_M2:n; onChange('areaOriginal',n); onChange('unidad',u); onChange('unidadArea',u); onChange('areaConvertida',c); onChange('areaM2Convertida',c); onChange('areaTerreno',c); };
  return <div className='text-slate-200'>
    <InformeGeneralSection value={value} onChange={onChange} />
    <div className='mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4'><h2 className='text-lg font-semibold text-amber-100'>Formulario técnico profesional de casa</h2><p className='text-sm text-amber-50/80'>Matriz ponderada por ubicación, terreno, construcción, estado y extras.</p></div>
    <Section title='Ubicación'>{field('Título del avalúo','titulo',value,onChange)}{select('Ciudad',ciudad,CIUDADES_AVALUO,(v)=>{onChange('ciudad',v);onChange('zona','');onChange('zonaData',null)})}{select('Zona',value.zona||'',zonas.map(z=>z.zona),(z)=>{onChange('zona',z);onChange('zonaData',zonas.find(x=>x.zona===z)||null)})}{field('Dirección','direccion',value,onChange)}{select('Tipo de entorno',value.tipoEntorno||'',['Residencial premium','Residencial alta','Residencial media','Comercial','Mixto','Popular','Rural productivo'],v=>onChange('tipoEntorno',v))}</Section>
    <Section title='Terreno'>{num(unidad==='vara2'?'Área terreno original (varas²)':'Área terreno original (m²)','areaOriginal',{...value,areaOriginal:areaOrig},(_,v)=>setArea(v))}{select('Unidad',unidad,[{value:'m2',label:'m²'},{value:'vara2',label:'varas²'}],v=>setArea(areaOrig,v))}<div className={base}>Área convertida<p className='mt-2 rounded bg-slate-800 p-2 text-emerald-200'>{conv.toLocaleString('es-NI',{maximumFractionDigits:2})} m²</p></div>{select('Topografía',value.topografia||'',topografias,v=>onChange('topografia',v))}{select('Forma terreno',value.formaTerreno||'',formas,v=>onChange('formaTerreno',v))}{select('Tipo suelo',value.tipoSuelo||'',suelos,v=>onChange('tipoSuelo',v))}{select('Accesos',value.accesoGeneral||'',accesos,v=>onChange('accesoGeneral',v))}{select('Nivel comercial',value.nivelComercial||'',nivel,v=>onChange('nivelComercial',v))}{select('Seguridad',value.seguridadZona||'',seguridad,v=>onChange('seguridadZona',v))}<Servicios value={value.serviciosBasicos||{}} onChange={v=>onChange('serviciosBasicos',v)}/>{select('Desarrollo urbano',value.desarrolloUrbano||'',desarrollo,v=>onChange('desarrolloUrbano',v))}</Section>
    <Section title='Construcción'>{num('Área construcción m²','areaConstruccion',value,onChange)}{select('Número de plantas',value.niveles||'',plantas,v=>onChange('niveles',v))}{select('Antigüedad',value.antiguedad||'',antig,v=>onChange('antiguedad',v))}{select('Estado estructural',value.estadoConstruccion||'',estados,v=>onChange('estadoConstruccion',v))}{select('Nivel de mantenimiento',value.nivelMantenimiento||'',estados,v=>onChange('nivelMantenimiento',v))}{select('Calidad constructiva',value.calidadConstructiva||value.acabados||'',calidad,v=>{onChange('calidadConstructiva',v);onChange('acabados',v)})}{Object.entries(mat).map(([k,o])=>select(k.replace(/([A-Z])/g,' $1'),value[k]||'',o as string[],v=>onChange(k,v)))}</Section>
    <Section title='Distribución'>{num('Habitaciones','habitaciones',value,onChange)}{num('Baños completos','banos',value,onChange)}{num('Medios baños','mediosBanos',value,onChange)}{checksDist.map(k=>tog(labels[k]||cap(k),k,value,onChange))}</Section>
    <Section title='Extras'>{checksExtras.map(k=>tog(labels[k]||cap(k),k,value,onChange))}</Section>
    <Section title='Documentación'>{select('Escritura',value.escritura||'',doc,v=>onChange('escritura',v))}{select('Catastro',value.catastro||'',doc,v=>onChange('catastro',v))}{select('Plano aprobado',value.planoAprobado||'',doc,v=>onChange('planoAprobado',v))}{select('Impuestos al día',value.impuestosAlDia||'',doc,v=>onChange('impuestosAlDia',v))}{select('Libre gravamen',value.libreGravamen||'',doc,v=>onChange('libreGravamen',v))}</Section>
    <Section title='Estado general y uso'>{select('Estado general',value.estadoGeneral||'',estados,v=>onChange('estadoGeneral',v))}{select('Uso',value.usoInmueble||'',uso,v=>onChange('usoInmueble',v))}</Section>
    <button onClick={onSubmit} disabled={loading} className='mt-5 w-full rounded-xl bg-amber-500 px-4 py-3 font-semibold text-slate-900'>{loading?'Calculando...':'Calcular avalúo técnico'}</button>
  </div>;
}
function Section({title,children}){return <section className='mt-4'><h3 className='mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400'>{title}</h3><div className='grid gap-4 md:grid-cols-2'>{children}</div></section>}
function field(l,k,v,c){return <label className={base}>{l}<input className='mt-2 w-full rounded bg-slate-800 p-2' value={v[k]||''} onChange={e=>c(k,e.target.value)}/></label>}
function num(l,k,v,c){return <label className={base}>{l}<input type='number' min='0' step='0.01' className='mt-2 w-full rounded bg-slate-800 p-2' value={v[k]||''} onChange={e=>c(k,Number(e.target.value))}/></label>}
function select(l,val,opts,c){return <label className={base}>{l}<select className='mt-2 w-full rounded bg-slate-800 p-2' value={val} onChange={e=>c(e.target.value)}><option value=''>Seleccionar</option>{opts.map(o=>typeof o==='string'?<option key={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}</select></label>}
function tog(l,k,v,c){return <label className={base}>{l}<input type='checkbox' className='ml-3' checked={!!v[k]} onChange={e=>c(k,e.target.checked)}/></label>}
function Servicios({value,onChange}){return <div className={base}><p>Servicios básicos</p>{[['agua','Agua'],['energia','Energía'],['drenaje','Drenaje'],['internet','Internet']].map(([k,l])=><label key={k} className='mr-3 block text-sm'><input type='checkbox' checked={!!value[k]} onChange={e=>onChange({...value,[k]:e.target.checked})}/> {l}</label>)}</div>}
const cap=(s)=>s.replace(/([A-Z])/g,' $1').replace(/^./,m=>m.toUpperCase());
