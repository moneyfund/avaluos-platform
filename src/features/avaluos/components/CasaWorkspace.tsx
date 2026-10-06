import { useMemo, useState } from 'react';
import { Activity, Building2, Database, Home, Ruler, RotateCcw, ShieldCheck } from 'lucide-react';
import CasaForm from '../forms/CasaForm';
import { calcularAvaluo } from '../../../core/avaluos/engine/avaluo.engine';
import DownloadAvaluoPdfButton from './DownloadAvaluoPdfButton';
import SaveAvaluoButton from './SaveAvaluoButton';
import { buildAvaluoRecord } from '../../../pdf/buildAvaluoRecord';
import { useTenant } from '../../../tenants/TenantContext';

const initialForm = () => ({
  titulo: '', agenteEvaluador: '', telefonoAgente: '', ciudad: 'Matagalpa', zona: '', zonaData: null, direccion: '',
  unidad: 'm2', unidadArea: 'm2', areaOriginal: 0, areaConvertida: 0, areaM2Convertida: 0, areaTerreno: 0,
  areaConstruccion: 0, topografia: '', formaTerreno: '', tipoSuelo: '', accesoGeneral: '', nivelComercial: 'Medio',
  seguridadZona: '', desarrolloUrbano: '', tipoEntorno: '', serviciosBasicos: { agua: false, energia: false, drenaje: false, internet: false },
  niveles: '', antiguedad: '', estadoConstruccion: '', nivelMantenimiento: '', calidadConstructiva: '', acabados: '',
  habitaciones: 0, banos: 0, mediosBanos: 0, estadoGeneral: '', usoInmueble: '',
});

const usd = (value) => Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export default function CasaWorkspace() {
  const { reportConfig, tenant } = useTenant();
  const [form, setForm] = useState<any>(initialForm);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formVersion, setFormVersion] = useState(0);

  const completed = useMemo(() => Object.values(form).filter((value) => value !== '' && value !== null && value !== false && value !== 0 && (!Array.isArray(value) || value.length)).length, [form]);
  const pdfAvaluo = useMemo(() => result ? buildAvaluoRecord('casa', form, result, reportConfig) : null, [form, result, reportConfig]);
  const change = (key, value) => { setForm((previous) => ({ ...previous, [key]: value })); setResult(null); setError(''); };

  const calculate = async () => {
    setError('');
    if (!form.agenteEvaluador?.trim()) return setError('Indica el agente evaluador.');
    if (!form.zonaData || !form.zona) return setError('Selecciona una zona válida de Matagalpa o Estelí.');
    if (!Number(form.areaOriginal || form.areaTerreno)) return setError('Ingresa un área de terreno mayor que cero.');
    if (!Number(form.areaConstruccion)) return setError('Ingresa un área de construcción mayor que cero.');
    if (!form.topografia || !form.formaTerreno || !form.tipoSuelo || !form.accesoGeneral) return setError('Completa topografía, forma, tipo de suelo y acceso.');
    if (!form.estadoConstruccion || !form.calidadConstructiva || !form.antiguedad || !form.niveles) return setError('Completa los datos principales de la construcción.');
    setLoading(true);
    try {
      const calculated = calcularAvaluo('casa', form, form.zonaData);
      setResult(calculated);
      requestAnimationFrame(() => document.getElementById('resultado-casa')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible calcular el avalúo.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setForm(initialForm()); setResult(null); setError(''); setFormVersion((value) => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const landArea = Number(form.areaOriginal)
    ? Number(form.areaOriginal).toLocaleString('es-NI', { maximumFractionDigits: 2 }) + (form.unidad === 'vara2' ? ' v²' : ' m²')
    : 'Pendiente';
  const builtArea = Number(form.areaConstruccion)
    ? Number(form.areaConstruccion).toLocaleString('es-NI', { maximumFractionDigits: 2 }) + ' m²'
    : 'Pendiente';

  return <main className='terrain-page valuation-workbench-page'>
    <header className='valuation-command-hero'>
      <div className='valuation-command-main'>
        <div className='valuation-command-brand'>
          <span className='valuation-brand-emblem'><img src='/avaluos-platform-mark.svg' alt='' /></span>
          <span><strong>AVALNIC CORE</strong><small>{tenant?.name || 'Workspace profesional'} · Motor de valoración</small></span>
        </div>
        <div className='valuation-command-copy'>
          <span className='terrain-kicker'>VALORACIÓN INMOBILIARIA · VIVIENDA</span>
          <h1>Integra terreno, construcción y condición física en un solo expediente técnico.</h1>
          <p>Registra la inspección por bloques claros, conserva la trazabilidad del análisis y genera un resultado listo para documentar y respaldar.</p>
        </div>
        <div className='valuation-command-meta'>
          <span><ShieldCheck /> Motor protegido</span>
          <span><Activity /> Sesión activa</span>
          <span><Database /> Datos por organización</span>
        </div>
      </div>

      <div className='valuation-command-side'>
        <div className='valuation-engine-card'>
          <span className='valuation-engine-icon'><Building2 /></span>
          <div><small>ESTADO DEL MOTOR</small><strong>Listo para valorar</strong><p>Terreno y construcción conectados al expediente.</p></div>
          <i />
        </div>
        <button type='button' className='terrain-reset' onClick={reset}><RotateCcw /> Nuevo expediente</button>
      </div>
    </header>

    <section className='terrain-status-grid valuation-overview-grid'>
      <StatusCard icon={<Home />} label='Ciudad base' value={form.ciudad} />
      <StatusCard icon={<Database />} label='Zona de mercado' value={form.zona || 'Por seleccionar'} />
      <StatusCard icon={<Ruler />} label='Terreno' value={landArea} />
      <StatusCard icon={<Building2 />} label='Construcción' value={builtArea} tone='teal' />
    </section>

    <section className='terrain-form-shell valuation-console'>
      <div className='valuation-form-chrome'>
        <span className='valuation-form-chrome-icon'><Building2 /></span>
        <div><span>EXPEDIENTE TÉCNICO</span><h2>Inspección y valoración de vivienda</h2><p>Registra ubicación, lote, construcción, materiales, distribución y documentación sin perder el contexto.</p></div>
        <div className='valuation-form-secure'><ShieldCheck /><span><strong>Núcleo conectado</strong><small>{completed} campos · Firebase · PDF</small></span></div>
      </div>
      <CasaForm key={formVersion} value={form} onChange={change} onSubmit={calculate} loading={loading} />
      {error && <div className='terrain-error' role='alert'>{error}</div>}
    </section>

    {result && <section id='resultado-casa' className='terrain-result valuation-result'>
      <div className='terrain-result-heading'><div><p>RESULTADO DE VALORACIÓN</p><h2>{form.titulo || 'Avalúo de casa'}</h2><span>{form.ciudad} · {form.zona}</span></div><div className='terrain-result-main'><small>Valor final estimado</small><strong>{usd(result.valorFinalEstimado)}</strong><span>Confianza: {result.nivelConfianza}</span></div></div>
      <div className='terrain-metrics'>
        <Metric label='Valor del terreno' value={usd(result.valorTerreno)} />
        <Metric label='Valor construcción' value={usd(result.valorConstruccion)} />
        <Metric label='Rango mínimo' value={usd(result.rangoMercado?.minimo)} />
        <Metric label='Rango máximo' value={usd(result.rangoMercado?.maximo)} />
        <Metric label='Valor por m²' value={usd(result.valorM2)} />
        <Metric label='Valor base' value={usd(result.valorBase)} />
        <Metric label='Factor ponderado' value={Number(result.factorGlobal ?? 1).toFixed(3)} />
        <Metric label='Clasificación de zona' value={result.clasificacionZona || '—'} />
      </div>
      <div className='avaluo-result-actions'>{pdfAvaluo && <DownloadAvaluoPdfButton avaluo={pdfAvaluo} />}<SaveAvaluoButton tipo='casa' form={form} result={result} /></div>
      <details className='terrain-coefficients' open><summary>Coeficientes aplicados <span>{Array.isArray(result.coeficientesAplicados) ? result.coeficientesAplicados.length : 0}</span></summary>
        <div className='terrain-table-wrap'><table><thead><tr><th>Factor</th><th>Valor aplicado</th><th>Impacto</th></tr></thead><tbody>{(Array.isArray(result.coeficientesAplicados) ? result.coeficientesAplicados : []).map((item, index) => <tr key={item.factor + '-' + index}><td>{item.factor}</td><td>{item.valorAplicado}</td><td>{item.impacto}</td></tr>)}</tbody></table></div>
      </details>
    </section>}
  </main>;
}

function StatusCard({ icon, label, value, tone = 'gold' }) {
  return <article className={'valuation-status-card is-' + tone}><span className='valuation-status-icon'>{icon}</span><div><small>{label}</small><strong>{value}</strong></div><i /></article>;
}
function Metric({ label, value }) { return <article><small>{label}</small><strong>{value}</strong></article>; }
