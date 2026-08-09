import { BASE_PRICE_ADJUSTMENT_REASONS, getReasonLabel, isOutOfRecommendedRange, unitLabel, unitShort } from '../../../core/avaluos/basePrice/basePriceReference';

const money = (v: unknown) => Number(v || 0).toLocaleString('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const pct = (suggested: number, applied: number) => suggested > 0 ? ((applied / suggested) - 1) * 100 : 0;

export default function BasePriceReferenceEditor({ suggestedValue, appliedValue, unit, edited, reason, detail, extraordinary, onChange, onReset }: any) {
  const variation = pct(Number(suggestedValue || 0), Number(appliedValue || 0));
  const outOfRange = isOutOfRecommendedRange(suggestedValue, appliedValue);
  return <section className='mt-5 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-slate-100 md:col-span-2'>
    <div className='flex flex-wrap items-center justify-between gap-3'><h3 className='text-sm font-semibold uppercase tracking-wide text-emerald-100'>Referencia base de mercado</h3><span className={edited ? 'rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100' : 'rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100'}>{edited ? 'Referencia ajustada manualmente' : 'Referencia territorial automática'}</span></div>
    <div className='mt-4 grid gap-4 md:grid-cols-3'>
      <Info label='Precio sugerido por la zona' value={`${money(suggestedValue)} / ${unit === 'USD_MNZ' ? 'manzana' : 'm²'}`} />
      <label className='rounded-xl border border-slate-700 bg-slate-900 p-3'><span className='text-xs text-slate-400'>Precio aplicado al avalúo</span><input type='number' min='0.01' step='0.01' className='mt-2 w-full rounded bg-slate-800 p-2 text-lg font-semibold' value={appliedValue || ''} onChange={(e) => onChange({ precioBaseAplicado: Number(e.target.value), precioBaseFueEditado: Number(e.target.value) !== Number(suggestedValue) })} /></label>
      <Info label='Unidad' value={unitLabel(unit)} />
      <Info label='Variación' value={`${variation >= 0 ? '+' : ''}${variation.toFixed(2)}%`} />
      <Info label='Equivalente' value={unit === 'USD_MNZ' ? `${money(Number(appliedValue || 0) / 7042.25)} / m²` : `${money(Number(appliedValue || 0) * 7042.25)} / manzana`} />
      <div className='rounded-xl border border-slate-700 bg-slate-900 p-3'><p className='text-xs text-slate-400'>Estado</p><p className='font-semibold'>{edited ? `Fuente: ${getReasonLabel(reason) || 'pendiente de justificar'}` : 'Usando referencia territorial'}</p></div>
    </div>
    <button type='button' onClick={onReset} className='mt-4 rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-100 hover:bg-emerald-400/10'>Restaurar sugerencia</button>
    {edited && <div className='mt-4 grid gap-4 md:grid-cols-2'>
      <label className='rounded-xl border border-slate-700 bg-slate-900 p-3'><span>Motivo del ajuste</span><select className='mt-2 w-full rounded bg-slate-800 p-2' value={reason || ''} onChange={(e) => onChange({ motivoAjustePrecioBase: e.target.value })}><option value=''>Seleccionar</option>{BASE_PRICE_ADJUSTMENT_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className='rounded-xl border border-slate-700 bg-slate-900 p-3'><span>{reason === 'otro_ajuste_tecnico' || outOfRange ? 'Detalle técnico obligatorio' : 'Observación técnica opcional'}</span><input className='mt-2 w-full rounded bg-slate-800 p-2' value={detail || ''} onChange={(e) => onChange({ detalleAjustePrecioBase: e.target.value })} placeholder='Microzona, comparables o condición particular' /></label>
    </div>}
    {outOfRange && <div className='mt-4 rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 text-amber-50'><p className='font-semibold'>El precio ingresado se encuentra fuera del rango técnico recomendado para esta zona. Revise el dato o confirme que se trata de una condición extraordinaria.</p><label className='mt-2 block text-sm'><input type='checkbox' checked={!!extraordinary} onChange={(e) => onChange({ confirmacionValorExtraordinario: e.target.checked })} /> Confirmo que este valor corresponde a una condición extraordinaria de la microzona o del inmueble.</label></div>}
    <p className='mt-3 text-xs text-slate-300'>El ajuste usa {unitShort(unit)} solo en este avalúo y no modifica precios maestros.</p>
  </section>;
}
function Info({ label, value }: any) { return <div className='rounded-xl border border-slate-700 bg-slate-900 p-3'><p className='text-xs text-slate-400'>{label}</p><p className='text-lg font-semibold'>{value}</p></div>; }
