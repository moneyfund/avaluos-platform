import { BASE_PRICE_ADJUSTMENT_REASONS, getReasonLabel, isOutOfRecommendedRange, unitLabel, unitShort } from '../../../core/avaluos/basePrice/basePriceReference';

const money = (v: unknown) => Number(v || 0).toLocaleString('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const pct = (suggested: number, applied: number) => suggested > 0 ? ((applied / suggested) - 1) * 100 : 0;

export default function BasePriceReferenceEditor({ suggestedValue, appliedValue, unit, edited, reason, detail, extraordinary, onChange, onReset }: any) {
  const variation = pct(Number(suggestedValue || 0), Number(appliedValue || 0));
  const outOfRange = isOutOfRecommendedRange(suggestedValue, appliedValue);

  return <section className='market-reference-panel'>
    <div className='market-reference-heading'>
      <div><span>REFERENCIA DE MERCADO</span><h3>Base territorial del avalúo</h3><p>Referencia usada por el expediente actual. Un ajuste manual no modifica la tabla maestra de precios.</p></div>
      <em className={edited ? 'is-edited' : ''}>{edited ? 'Ajuste manual activo' : 'Referencia automática'}</em>
    </div>

    <div className='market-reference-grid'>
      <Info label='Precio sugerido por zona' value={money(suggestedValue) + ' / ' + (unit === 'USD_MNZ' ? 'manzana' : 'm²')} />
      <label className='market-reference-edit'><span>Precio aplicado al avalúo</span><input type='number' min='0.01' step='0.01' value={appliedValue || ''} onChange={(e) => onChange({ precioBaseAplicado: Number(e.target.value), precioBaseFueEditado: Number(e.target.value) !== Number(suggestedValue) })} /><small>Editable solo para este expediente.</small></label>
      <Info label='Unidad de referencia' value={unitLabel(unit)} />
      <Info label='Variación vs. sugerencia' value={(variation >= 0 ? '+' : '') + variation.toFixed(2) + '%'} tone={Math.abs(variation) > 15 ? 'warning' : 'neutral'} />
      <Info label='Equivalente técnico' value={unit === 'USD_MNZ' ? money(Number(appliedValue || 0) / 7042.25) + ' / m²' : money(Number(appliedValue || 0) * 7042.25) + ' / manzana'} />
      <Info label='Estado de referencia' value={edited ? 'Fuente: ' + (getReasonLabel(reason) || 'pendiente de justificar') : 'Usando referencia territorial'} />
    </div>

    <div className='market-reference-actions'>
      <button type='button' onClick={onReset}>Restaurar sugerencia territorial</button>
      <small>Unidad activa: {unitShort(unit)}</small>
    </div>

    {edited && <div className='market-reference-adjustment'>
      <label><span>Motivo del ajuste</span><select value={reason || ''} onChange={(e) => onChange({ motivoAjustePrecioBase: e.target.value })}><option value=''>Seleccionar</option>{BASE_PRICE_ADJUSTMENT_REASONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label><span>{reason === 'otro_ajuste_tecnico' || outOfRange ? 'Detalle técnico obligatorio' : 'Observación técnica opcional'}</span><input value={detail || ''} onChange={(e) => onChange({ detalleAjustePrecioBase: e.target.value })} placeholder='Microzona, comparables o condición particular' /></label>
    </div>}

    {outOfRange && <div className='market-reference-warning'><strong>Valor fuera del rango técnico recomendado.</strong><p>Revise el dato o confirme que corresponde a una condición extraordinaria de la microzona o del inmueble.</p><label><input type='checkbox' checked={!!extraordinary} onChange={(e) => onChange({ confirmacionValorExtraordinario: e.target.checked })} /><span>Confirmo la condición extraordinaria para este expediente.</span></label></div>}
  </section>;
}

function Info({ label, value, tone = 'neutral' }: any) {
  return <div className={'market-reference-info is-' + tone}><span>{label}</span><strong>{value}</strong></div>;
}
