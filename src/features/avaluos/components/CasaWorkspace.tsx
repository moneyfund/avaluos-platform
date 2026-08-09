import { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, Home, RotateCcw } from 'lucide-react';
import CasaForm from '../forms/CasaForm';
import { calcularAvaluo } from '../../../core/avaluos/engine/avaluo.engine';
import DownloadAvaluoPdfButton from './DownloadAvaluoPdfButton';
import { buildAvaluoRecord } from '../../../pdf/buildAvaluoRecord';

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
  const [form, setForm] = useState<any>(initialForm);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const completed = useMemo(() => Object.values(form).filter((value) => value !== '' && value !== null && value !== false && value !== 0 && (!Array.isArray(value) || value.length)).length, [form]);
  const pdfAvaluo = useMemo(() => result ? buildAvaluoRecord('casa', form, result) : null, [form, result]);
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

  const reset = () => { setForm(initialForm()); setResult(null); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return <main className='terrain-page'>
    <header className='terrain-hero'>
      <div><p className='terrain-kicker'>Avalúos Platform · núcleo independiente</p><h1>Avalúo técnico de casa</h1><p>Formulario profesional conectado al motor vigente de casas. En esta fase el cálculo y el informe PDF funcionan sin guardar datos en Firebase.</p></div>
      <button type='button' className='terrain-reset' onClick={reset}><RotateCcw /> Nuevo avalúo</button>
    </header>

    <section className='terrain-status-grid'>
      <div><Home /><span><small>Ciudad</small><strong>{form.ciudad}</strong></span></div>
      <div><CheckCircle2 /><span><small>Zona</small><strong>{form.zona || 'Pendiente'}</strong></span></div>
      <div><Calculator /><span><small>Campos con información</small><strong>{completed}</strong></span></div>
    </section>

    <section className='terrain-form-shell'>
      <CasaForm value={form} onChange={change} onSubmit={calculate} loading={loading} />
      {error && <div className='terrain-error' role='alert'>{error}</div>}
    </section>

    {result && <section id='resultado-casa' className='terrain-result'>
      <div className='terrain-result-heading'><div><p>Resultado del motor vigente</p><h2>{form.titulo || 'Avalúo de casa'}</h2><span>{form.ciudad} · {form.zona}</span></div><div className='terrain-result-main'><small>Valor final estimado</small><strong>{usd(result.valorFinalEstimado)}</strong><span>Confianza: {result.nivelConfianza}</span></div></div>
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
      {pdfAvaluo && <DownloadAvaluoPdfButton avaluo={pdfAvaluo} />}
      <details className='terrain-coefficients' open><summary>Coeficientes aplicados <span>{Array.isArray(result.coeficientesAplicados) ? result.coeficientesAplicados.length : 0}</span></summary>
        <div className='terrain-table-wrap'><table><thead><tr><th>Factor</th><th>Valor aplicado</th><th>Impacto</th></tr></thead><tbody>{(Array.isArray(result.coeficientesAplicados) ? result.coeficientesAplicados : []).map((item, index) => <tr key={`${item.factor}-${index}`}><td>{item.factor}</td><td>{item.valorAplicado}</td><td>{item.impacto}</td></tr>)}</tbody></table></div>
      </details>
    </section>}
  </main>;
}

function Metric({ label, value }) { return <article><small>{label}</small><strong>{value}</strong></article>; }
