import { useMemo, useState } from 'react';
import { Calculator, CheckCircle2, MapPinned, RotateCcw } from 'lucide-react';
import TerrenoForm from '../forms/TerrenoForm';
import { calcularAvaluo } from '../../../core/avaluos/engine/avaluo.engine';
import DownloadAvaluoPdfButton from './DownloadAvaluoPdfButton';
import SaveAvaluoButton from './SaveAvaluoButton';
import { buildAvaluoRecord } from '../../../pdf/buildAvaluoRecord';

const initialForm = () => ({
  titulo: '', agenteEvaluador: '', telefonoAgente: '', ciudad: 'Matagalpa', zona: '', zonaData: null,
  unidadArea: 'm2', areaOriginal: 0, areaM2Convertida: 0, areaTerreno: 0,
  tipoTerritorio: '', tipoSuelo: '', topografia: '', accesoGeneral: '', tipoVia: '', nivelTrafico: '', seguridadZona: '',
  formaTerreno: '', entorno: '', usoPotencial: '', desarrolloUrbano: '', proximity: '', nivelDeforestacion: '',
  serviciosBasicos: { agua: false, energia: false, drenaje: false, senalTelefonica: false, internet: false, alumbradoPublico: false, recoleccionBasura: false },
  recursosNaturales: [], riesgos: [], nivelComercial: 'Medio', esquina: false, cercaniaPrincipal: false,
});

const usd = (value) => Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

export default function TerrenoWorkspace() {
  const [form, setForm] = useState<any>(initialForm);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const completed = useMemo(() => Object.values(form).filter((value) => value !== '' && value !== null && value !== false && value !== 0 && (!Array.isArray(value) || value.length)).length, [form]);
  const pdfAvaluo = useMemo(() => result ? buildAvaluoRecord('terreno', form, result) : null, [form, result]);
  const change = (key, value) => { setForm((previous) => ({ ...previous, [key]: value })); setResult(null); setError(''); };

  const calculate = async () => {
    setError('');
    if (!form.agenteEvaluador?.trim()) return setError('Indica el agente evaluador.');
    if (!form.zonaData || !form.zona) return setError('Selecciona una zona válida de Matagalpa o Estelí.');
    if (!Number(form.areaOriginal || form.areaTerreno)) return setError('Ingresa un área mayor que cero.');
    if (!form.tipoTerritorio || !form.topografia || !form.formaTerreno || !form.usoPotencial) return setError('Completa categoría territorial, topografía, forma y uso potencial.');
    setLoading(true);
    try {
      const calculated = calcularAvaluo('terreno', form, form.zonaData);
      setResult(calculated);
      requestAnimationFrame(() => document.getElementById('resultado-terreno')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
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
      <div><p className='terrain-kicker'>Avalúos Platform · núcleo independiente</p><h1>Avalúo técnico de terreno</h1><p>Formulario profesional conectado al motor vigente. Calcula, genera el informe PDF y guarda el expediente dentro de tu organización.</p></div>
      <button type='button' className='terrain-reset' onClick={reset}><RotateCcw /> Nuevo avalúo</button>
    </header>

    <section className='terrain-status-grid'>
      <div><MapPinned /><span><small>Ciudad</small><strong>{form.ciudad}</strong></span></div>
      <div><CheckCircle2 /><span><small>Zona</small><strong>{form.zona || 'Pendiente'}</strong></span></div>
      <div><Calculator /><span><small>Campos con información</small><strong>{completed}</strong></span></div>
    </section>

    <section className='terrain-form-shell'>
      <TerrenoForm value={form} onChange={change} onSubmit={calculate} loading={loading} />
      {error && <div className='terrain-error' role='alert'>{error}</div>}
    </section>

    {result && <section id='resultado-terreno' className='terrain-result'>
      <div className='terrain-result-heading'><div><p>Resultado del motor vigente</p><h2>{form.titulo || 'Avalúo de terreno'}</h2><span>{form.ciudad} · {form.zona}</span></div><div className='terrain-result-main'><small>Valor final estimado</small><strong>{usd(result.valorFinalEstimado)}</strong><span>Confianza: {result.nivelConfianza}</span></div></div>
      <div className='terrain-metrics'>
        <Metric label='Rango mínimo' value={usd(result.rangoMercado?.minimo)} />
        <Metric label='Rango máximo' value={usd(result.rangoMercado?.maximo)} />
        <Metric label='Precio final por m²' value={usd(result.adjustedPriceM2 ?? result.valorM2)} />
        <Metric label='Precio final por manzana' value={usd(result.pricePerManzana)} />
        <Metric label='Valor base' value={usd(result.baseValueTotal ?? result.valorBase)} />
        <Metric label='Factor técnico' value={Number(result.technicalAdjustmentFactor ?? result.factorGlobal ?? 1).toFixed(3)} />
        <Metric label='Liquidez' value={result.indiceLiquidez ? `${result.indiceLiquidez}/100` : '—'} />
        <Metric label='Venta estimada' value={result.tiempoEstimadoVenta || '—'} />
      </div>
      <div className='avaluo-result-actions'>{pdfAvaluo && <DownloadAvaluoPdfButton avaluo={pdfAvaluo} />}<SaveAvaluoButton tipo='terreno' form={form} result={result} /></div>
      <details className='terrain-coefficients' open><summary>Coeficientes aplicados <span>{Array.isArray(result.coeficientesAplicados) ? result.coeficientesAplicados.length : 0}</span></summary>
        <div className='terrain-table-wrap'><table><thead><tr><th>Factor</th><th>Valor aplicado</th><th>Impacto</th><th>Justificación</th></tr></thead><tbody>{(Array.isArray(result.coeficientesAplicados) ? result.coeficientesAplicados : []).map((item, index) => <tr key={`${item.factor}-${index}`}><td>{item.factor}</td><td>{item.valorAplicado}</td><td>{item.impacto}</td><td>{item.justificacion || '—'}</td></tr>)}</tbody></table></div>
      </details>
    </section>}
  </main>;
}

function Metric({ label, value }) { return <article><small>{label}</small><strong>{value}</strong></article>; }
