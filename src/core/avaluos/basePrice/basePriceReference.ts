import { M2_POR_MANZANA, getRuralSurPricePerManzana, isZonaRuralSurMatagalpa } from '../engine/terreno.engine';
import type { TerrenoInput, ZonaData } from '../types/avaluo.types';

export const BASE_PRICE_ADJUSTMENT_REASONS = [
  ['microzona_superior', 'Microzona con mayor valor'], ['microzona_inferior', 'Microzona con menor valor'], ['carretera_principal', 'Frente a carretera principal'], ['acceso_limitado', 'Acceso secundario o limitado'], ['cercania_centro', 'Cercanía a centro urbano'], ['lejania_centro', 'Lejanía del centro urbano'], ['sector_comercial', 'Sector comercial'], ['sector_residencial', 'Sector residencial consolidado'], ['rural_productiva', 'Condición rural productiva'], ['comparables_recientes', 'Comparables recientes disponibles'], ['negociacion_sector', 'Negociación conocida en el sector'], ['condicion_especial', 'Condición especial del inmueble'], ['otro_ajuste_tecnico', 'Otro ajuste técnico justificado'],
] as const;

export type BasePriceUnit = 'USD_M2' | 'USD_MNZ';
export type BasePriceSource = 'territorial' | 'curva_extension' | 'ajuste_manual';

export const toFinitePositive = (value: unknown) => { const n = Number(value); return Number.isFinite(n) && n > 0 ? n : null; };
export const getReasonLabel = (value?: string) => BASE_PRICE_ADJUSTMENT_REASONS.find(([key]) => key === value)?.[1] || value || '';
export const unitForArea = (unidadArea?: string): BasePriceUnit => unidadArea === 'manzana' ? 'USD_MNZ' : 'USD_M2';
export const unitLabel = (unit?: string) => unit === 'USD_MNZ' ? 'USD por manzana' : 'USD por m²';
export const unitShort = (unit?: string) => unit === 'USD_MNZ' ? 'USD / manzana' : 'USD / m²';
const inferZoneType = (data: TerrenoInput) => String(data.tipoTerritorio || '').toLowerCase().includes('rural') ? 'rural' : String(data.tipoTerritorio || '').toLowerCase().includes('semi') ? 'semiurbana' : 'urbana';
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function buildSuggestedBaseReference(data: TerrenoInput, zona?: ZonaData | null) {
  const areaOriginal = Number(data.areaOriginal ?? data.areaTerreno ?? 0);
  const unidadArea = data.unidadArea || 'm2';
  const areaM2 = unidadArea === 'manzana' ? areaOriginal * M2_POR_MANZANA : Number(data.areaM2Convertida ?? data.areaTerreno ?? areaOriginal);
  const areaManzanas = areaM2 / M2_POR_MANZANA;
  const unit = unitForArea(unidadArea);
  if (!zona || !Number.isFinite(areaM2) || areaM2 <= 0) return null;
  const ruralSur = isZonaRuralSurMatagalpa(zona, data);
  let suggestedM2 = Number(zona.valorTerrenoM2 || 0);
  let suggestedUnit = unit === 'USD_MNZ' ? suggestedM2 * M2_POR_MANZANA : suggestedM2;
  let fuente: BasePriceSource = 'territorial';
  let curvaAplicada: any = null;
  if (ruralSur) {
    suggestedUnit = getRuralSurPricePerManzana(areaManzanas);
    suggestedM2 = suggestedUnit / M2_POR_MANZANA;
    fuente = 'curva_extension';
    curvaAplicada = { nombre: 'Zona Rural Sur por extensión', areaManzanas, precioPorManzana: suggestedUnit };
  } else if (unit === 'USD_M2') {
    const zoneType = inferZoneType(data);
    suggestedUnit = zoneType === 'rural' ? suggestedM2 : zoneType === 'semiurbana' ? clamp(suggestedM2, 9, 22) : areaManzanas > 1 ? clamp(suggestedM2, 12, 34) : clamp(suggestedM2, 20, 45);
  }
  return { fuente, unidad: unit, precioBaseSugerido: suggestedUnit, precioM2Equivalente: unit === 'USD_MNZ' ? suggestedUnit / M2_POR_MANZANA : suggestedUnit, curvaAplicada };
}

export function buildReferenciaBase(data: any, zona?: ZonaData | null) {
  const suggested = buildSuggestedBaseReference(data, zona);
  const suggestedValue = toFinitePositive(data.precioBaseSugerido) ?? suggested?.precioBaseSugerido ?? null;
  const appliedValue = toFinitePositive(data.precioBaseAplicado) ?? suggestedValue;
  const variation = suggestedValue && appliedValue ? ((appliedValue / suggestedValue) - 1) * 100 : 0;
  const edited = Boolean(data.precioBaseFueEditado) && suggestedValue !== null && appliedValue !== null && Math.abs(appliedValue - suggestedValue) > 0.0001;
  return { fuente: edited ? 'ajuste_manual' : (suggested?.fuente || 'territorial'), ciudad: data.ciudad || zona?.ciudad || '', zona: data.zona || zona?.zona || '', unidad: data.unidadPrecioBase || suggested?.unidad || unitForArea(data.unidadArea), precioBaseSugerido: suggestedValue, precioBaseAplicado: appliedValue, precioBaseFueEditado: edited, variacionPorcentual: variation, motivoAjuste: edited ? (data.motivoAjustePrecioBase || '') : '', detalleAjuste: edited ? (data.detalleAjustePrecioBase || '') : '', confirmacionExtraordinaria: Boolean(data.confirmacionValorExtraordinario), fechaReferencia: new Date().toISOString() };
}

export const isOutOfRecommendedRange = (suggested: unknown, applied: unknown) => { const s = toFinitePositive(suggested); const a = toFinitePositive(applied); return !!(s && a && (a < s * 0.4 || a > s * 2.5)); };
