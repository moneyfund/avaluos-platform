import { formatServiciosBasicos, getServiciosBasicosFactor, safeDivide, toSafeNumber } from './shared/formulas';
import type { CoeficienteAplicado, TerrenoInput, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

export const M2_POR_MANZANA = 7042.25;
type FactorMap = Record<string, number>;

type RuralSurPricePoint = { area: number; pricePerManzana: number };

export const RURAL_SUR_PRICE_CURVE: RuralSurPricePoint[] = [
  { area: 1, pricePerManzana: 35000 },
  { area: 5, pricePerManzana: 30000 },
  { area: 10, pricePerManzana: 28000 },
  { area: 20, pricePerManzana: 24000 },
  { area: 40, pricePerManzana: 16000 },
  { area: 60, pricePerManzana: 12000 },
  { area: 80, pricePerManzana: 8000 },
  { area: 90, pricePerManzana: 7000 },
  { area: 100, pricePerManzana: 6000 },
  { area: 150, pricePerManzana: 5000 },
];

const interpolatePrice = (area: number, pointA: RuralSurPricePoint, pointB: RuralSurPricePoint) => {
  const progress = (area - pointA.area) / (pointB.area - pointA.area);
  return pointA.pricePerManzana + progress * (pointB.pricePerManzana - pointA.pricePerManzana);
};

export function getRuralSurPricePerManzana(areaManzanas: number): number {
  const area = Number(areaManzanas);
  if (!Number.isFinite(area) || area <= 0) {
    throw new Error('Área en manzanas inválida');
  }
  const firstPoint = RURAL_SUR_PRICE_CURVE[0];
  const lastPoint = RURAL_SUR_PRICE_CURVE[RURAL_SUR_PRICE_CURVE.length - 1];
  if (area <= firstPoint.area) return firstPoint.pricePerManzana;
  for (let i = 0; i < RURAL_SUR_PRICE_CURVE.length - 1; i += 1) {
    const current = RURAL_SUR_PRICE_CURVE[i];
    const next = RURAL_SUR_PRICE_CURVE[i + 1];
    if (area >= current.area && area <= next.area) return interpolatePrice(area, current, next);
  }
  return lastPoint.pricePerManzana;
}

export const normalizeText = (value: unknown = '') => String(value || '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

export const isZonaRuralSurMatagalpa = (zona: ZonaData, data: TerrenoInput) => {
  const ciudad = normalizeText(data.ciudad || zona.ciudad);
  const zonaNombre = normalizeText(data.zona || zona.zona || zona.nombre);
  const zonaId = normalizeText(zona.id);
  return ciudad === 'matagalpa' && (zonaNombre === 'zona rural sur' || zonaId === 'matagalpa-zona-rural-sur');
};

export const getZonaRuralSurBasePricePerManzana = getRuralSurPricePerManzana;

export const FACTORES_TERRENO = {
  tipoTerritorio: { Urbano: 1.06, Semiurbano: 1.01, Semirural: 0.95, 'Rural cercano': 0.92, 'Rural productivo': 0.90, 'Rural aislado': 0.82 },
  tipoSuelo: { Arcilloso: 0.95, Franco: 1.04, 'Franco arcilloso': 1.00, 'Franco arenoso': 1.01, Arenoso: 0.94, Pedregoso: 0.92, Volcánico: 1.03, 'Muy fértil': 1.08, Rocoso: 0.88, 'Suelo firme': 1.04, 'Suelo arcilloso': 0.95, 'Suelo rocoso': 0.88, 'Suelo arenoso': 0.94, 'Suelo húmedo': 0.90, 'Suelo agrícola fértil': 1.08, 'Suelo mixto': 1.00 },
  topografia: { Plano: 1.08, 'Ondulado leve': 1.02, 'Ondulado medio': 0.96, Quebrado: 0.86, Escarpado: 0.76, 'Con terrazas naturales': 1.03, 'Semi plano': 1.02, Ondulado: 0.96, Inclinado: 0.86, 'Muy inclinado': 0.76 },
  hidrologia: { Pozo: 1.06, 'Río permanente': 1.09, 'Río estacional': 1.03, Quebrada: 1.02, Nacimiento: 1.08, Lago: 1.07, Laguna: 1.05, 'Sin agua': 0.94 },
  vegetacion: { Bosque: 1.02, Pasto: 1.00, Cultivo: 1.03, Matorral: 0.97, 'Sin cobertura': 0.95, 'Bosque secundario': 1.01, 'Bosque primario': 1.04 },
  riesgos: { Inundación: 0.88, Deslizamientos: 0.84, Sequía: 0.92, Incendios: 0.94, Ninguno: 1.03, 'Riesgo de inundación': 0.88, 'Riesgo de deslizamiento': 0.84, 'Zona de difícil acceso': 0.90, 'Conflicto de servidumbre': 0.86 },
  acceso: { Asfalto: 1.13, Concreto: 1.11, Adoquín: 1.08, Macadán: 1.02, 'Tierra buena': 0.98, 'Tierra regular': 0.91, 'Camino temporal': 0.78, 'Carretera pavimentada': 1.13, 'Calle adoquinada': 1.08, 'Calle de concreto': 1.11, 'Tierra transitable': 0.98, 'Camino rural': 0.88, Vereda: 0.72, Excelente: 1.13, Bueno: 1.06, Regular: 1, Difícil: 0.86, 'Muy difícil': 0.72, Pavimentado: 1.13, Adoquinado: 1.08, Tierra: 0.94 },
  orientacion: { Norte: 1.01, Sur: 1.00, Este: 1.01, Oeste: 0.99, Esquina: 1.05, 'Doble frente': 1.06 },
  nivelTrafico: { Alto: 1.04, Medio: 1, Bajo: 0.98, 'Muy bajo': 0.95 },
  seguridadZona: { Alta: 1.06, 'Media alta': 1.03, Media: 1, Baja: 0.91, Alto: 1.06, Medio: 1, Bajo: 0.91 },
  formaTerreno: { Regular: 1.03, Rectangular: 1.02, Cuadrado: 1.03, 'Irregular leve': 0.98, Irregular: 0.92, 'Irregular compleja': 0.88, Esquinero: 1.05, 'Fondo amplio': 1.00, 'Frente amplio': 1.04 },
  entorno: { 'Residencial premium': 1.11, 'Residencial medio': 1.03, Comercial: 1.10, Mixto: 1.05, Popular: 0.95, 'Rural productivo': 0.99, 'Natural/turístico': 1.08, 'Residencial alta': 1.08, 'Residencial media': 1.03 },
  usoPotencial: { Residencial: 1.07, Comercial: 1.14, Industrial: 1.06, Turístico: 1.13, Agrícola: 1.00, Ganadero: 0.96, Forestal: 0.93, Mixto: 1.10, Lotificación: 1.09, 'Industrial liviano': 1.06, 'Reserva natural': 0.91 },
  desarrolloUrbano: { Consolidado: 1.08, 'En crecimiento': 1.04, Crecimiento: 1.04, Emergente: 1, 'Bajo desarrollo': 0.94, 'Sin desarrollo urbano': 0.88 },
  mercado: { 'Muy alta': 1.08, Alta: 1.04, Media: 1, Baja: 0.94, 'Muy baja': 0.88, Favorable: 1.04, Equilibrada: 1, Saturada: 0.94 },
  oferta: { Escasa: 1.05, Normal: 1, Alta: 0.95, Excesiva: 0.90 },
  liquidez: { 'Muy alta': 1.06, Alta: 1.03, Media: 1, Baja: 0.94, 'Muy baja': 0.88 },
  nivelDeforestacion: { 'Sin deforestación': 1.02, Baja: 1, Media: 0.97, Alta: 0.92, 'Muy alta': 0.86 },
  proximidad: { 'Cerca de ciudad principal': 1.10, 'Cerca de comunidad': 1.04, Remoto: 0.88 },
  legalStatus: { 'Documentación completa': 1.06, 'Documentación revisable': 0.92, 'Problemas legales': 0.70 },
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const normalizeArea = (data: TerrenoInput) => {
  const areaOriginal = toSafeNumber(data.areaOriginal ?? data.areaTerreno);
  const unidadArea = data.unidadArea || 'm2';
  const areaM2Convertida = unidadArea === 'manzana' ? areaOriginal * M2_POR_MANZANA : areaOriginal;
  return { areaOriginal, unidadArea, areaM2Convertida, areaManzanas: safeDivide(areaM2Convertida, M2_POR_MANZANA, 0) };
};
const lookup = (map: FactorMap, value: unknown, fallback = 1) => toSafeNumber(map[String(value)], fallback);
const impactText = (coeficiente: number) => {
  const pct = (coeficiente - 1) * 100;
  if (Math.abs(pct) < 0.1) return '0%';
  return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`;
};
const justificationFor = (factor: string, coeficiente: number) => {
  const pct = (coeficiente - 1) * 100;
  if (Math.abs(pct) < 0.1) return `${factor} se mantiene neutro por estar alineado con el mercado de referencia.`;
  return pct > 0
    ? `${factor} fortalece la capacidad de absorción, uso o desarrollo del inmueble.`
    : `${factor} introduce una restricción técnica, comercial o documental que reduce el valor unitario.`;
};
const coefRow = (factor: string, valorAplicado: string, coeficiente: number, justificacion?: string): CoeficienteAplicado => ({ factor, valorAplicado, coeficiente: toSafeNumber(coeficiente, 1), impacto: impactText(coeficiente), justificacion: justificacion || justificationFor(factor, toSafeNumber(coeficiente, 1)) });

const CATEGORY_LIMITS = {
  ubicacion: { min: 0.80, max: 1.20 },
  topografia: { min: 0.92, max: 1.08 },
  forma: { min: 0.95, max: 1.05 },
  tipoSuelo: { min: 0.92, max: 1.08 },
  acceso: { min: 0.92, max: 1.08 },
  serviciosBasicos: { min: 0.92, max: 1.08 },
  seguridadJuridica: { min: 0.92, max: 1.08 },
  usoPotencial: { min: 0.85, max: 1.15 },
  entorno: { min: 0.92, max: 1.08 },
  desarrolloUrbano: { min: 0.90, max: 1.10 },
  recursosNaturales: { min: 0.94, max: 1.06 },
  liquidez: { min: 0.90, max: 1.10 },
  ambiental: { min: 0.90, max: 1.08 },
} as const;

const limitCategoryFactor = (value: number, limits: { min: number; max: number }) => clamp(toSafeNumber(value, 1), limits.min, limits.max);
const limitText = (raw: number, limited: number) => Math.abs(raw - limited) < 0.0005
  ? 'Dentro del rango técnico de la categoría'
  : `Ajustado por límite de categoría de ${raw.toFixed(3)} a ${limited.toFixed(3)}`;
const reductionCoef = (valorDespuesTope: number, valorAntesTope: number) => {
  const before = toSafeNumber(valorAntesTope, 0);
  if (before <= 0) return 1;
  return Math.min(1, safeDivide(valorDespuesTope, before, 1));
};

export function getFactorEscala(areaM2Convertida: number): number {
  const areaManzanas = Math.max(0.01, safeDivide(toSafeNumber(areaM2Convertida, 0), M2_POR_MANZANA, 0.01));
  if (areaManzanas <= 1) return 1;
  const logArea = Math.log(areaManzanas);
  const earlyDiscount = 0.06 * (logArea / Math.log(10));
  const largeParcelDiscount = 0.17 * (Math.log1p(areaManzanas / 20) / (1 + 0.35 * Math.log1p(areaManzanas / 20)));
  return clamp(1 - earlyDiscount - largeParcelDiscount, 0.54, 1);
}

export const getScaleMultiplier = getFactorEscala;

const getScaleExplanation = (areaM2Convertida: number, areaManzanas: number, factorEscala: number) => {
  if (factorEscala >= 1) return 'Solar pequeño urbano: se mantiene el valor por m² de referencia de la zona.';
  const areaLabel = areaManzanas >= 1
    ? `${areaManzanas.toFixed(2)} manzanas equivalentes`
    : `${areaM2Convertida.toFixed(0)} m²`;
  if (areaM2Convertida <= 2500) return `Terreno mediano (${areaLabel}): se aplica reducción moderada al valor por m² por economía de escala.`;
  if (areaM2Convertida <= M2_POR_MANZANA * 10) return `Área grande (${areaLabel}): se aplica reducción al valor por m² por economía de escala.`;
  return `Gran extensión rural (${areaLabel}): se aplica reducción fuerte al valor por m² por economía de escala.`;
};

const inferZoneType = (zona: ZonaData, data: TerrenoInput): 'urbana' | 'semiurbana' | 'rural' => {
  if (String(data.tipoTerritorio).toLowerCase().includes('rural')) return 'rural';
  if (String(data.tipoTerritorio).toLowerCase().includes('semi')) return 'semiurbana';
  return 'urbana';
};

const getBasePriceM2 = (zona: ZonaData, data: TerrenoInput, areaManzanas: number) => {
  if (isZonaRuralSurMatagalpa(zona, data)) return getRuralSurPricePerManzana(areaManzanas) / M2_POR_MANZANA;
  const zoneType = inferZoneType(zona, data);
  const listedBase = toSafeNumber(zona.valorTerrenoM2);
  if (data.unidadArea === 'manzana' && zoneType === 'urbana') return clamp(listedBase, 18, 34);
  if (data.unidadArea === 'manzana' && zoneType === 'semiurbana') return clamp(listedBase, 9, 18);
  if (zoneType === 'rural') return listedBase;
  if (zoneType === 'semiurbana') return clamp(listedBase, 9, 22);
  if (areaManzanas > 1) return clamp(listedBase, 12, 34);
  return clamp(listedBase, 20, 45);
};

const getNaturalResourcesFactor = (recursos: unknown[] | undefined, riesgos: unknown[] | undefined) => {
  const selected = Array.isArray(recursos) ? recursos.map(String) : [];
  const selectedRisks = Array.isArray(riesgos) ? riesgos.map(String) : [];
  if (selectedRisks.includes('Riesgo de inundación')) return 0.8;
  if (selected.includes('Río o quebrada')) return 1.1;
  if (selected.includes('Fuente de agua') || selected.includes('Pozo')) return 1.08;
  if (selected.length === 0 || selected.includes('Ninguno')) return 1;
  return clamp(1 + selected.length * 0.02, 1, 1.08);
};

const getProximityFactor = (data: TerrenoInput) => {
  if (data.proximity) return lookup(FACTORES_TERRENO.proximidad, data.proximity);
  if (data.cercaniaPrincipal || data.desarrolloUrbano === 'Consolidado') return 1.15;
  if (['En crecimiento', 'Crecimiento', 'Emergente'].includes(String(data.desarrolloUrbano))) return 1.05;
  if (data.desarrolloUrbano === 'Sin desarrollo urbano') return 0.85;
  return 1;
};

const getAccessFactor = (data: TerrenoInput) => {
  if (data.tipoVia) return lookup(FACTORES_TERRENO.acceso, data.tipoVia);
  if (data.accesoGeneral) return lookup(FACTORES_TERRENO.acceso, data.accesoGeneral);
  return lookup(FACTORES_TERRENO.acceso, data.acceso);
};

const frontDepthFactor = (frente?: number, fondo?: number) => {
  const f = toSafeNumber(frente, 0); const d = toSafeNumber(fondo, 0);
  if (f <= 0 || d <= 0) return 1;
  const ratio = f / d;
  if (ratio >= 0.45 && ratio <= 1.6) return 1.03;
  if (ratio >= 0.25 && ratio <= 2.4) return 1;
  return 0.94;
};
const serviciosIndividuales = (servicios: any = {}) => ({
  agua: servicios.agua ? 1.035 : 0.965,
  energia: servicios.energia ? 1.035 : 0.965,
  internet: servicios.internet ? 1.015 : 0.99,
  senalTelefonica: servicios.senalTelefonica ? 1.01 : 0.995,
  drenaje: servicios.drenaje ? 1.025 : 0.985,
  alumbradoPublico: servicios.alumbradoPublico ? 1.012 : 0.995,
  recoleccionBasura: servicios.recoleccionBasura ? 1.01 : 0.995,
});
const synergyFactor = (data: TerrenoInput, zoneType: string, access: number, services: number, topo: number, use: number, risk: number) => {
  const premiumCombo = access > 1.04 && services > 1.02 && topo > 1 && use > 1.05 && risk >= 1 && zoneType !== 'rural';
  const productiveCombo = zoneType === 'rural' && services >= 1 && topo >= 0.96 && ['Agrícola','Ganadero','Forestal','Turístico'].includes(String(data.usoPotencial));
  const friction = access < 0.92 && services < 1 && risk < 1;
  return premiumCombo ? 1.045 : productiveCombo ? 1.025 : friction ? 0.94 : 1;
};
const confidenceRange = (nivel: ResultadoAvaluo['nivelConfianza']) => nivel === 'Muy Alta' || nivel === 'Alto' ? 0.04 : nivel === 'Medio' ? 0.06 : nivel === 'Baja' ? 0.08 : 0.10;
const liquidityIndex = (nivel: any, demanda: any, oferta: any) => clamp(50 * lookup(FACTORES_TERRENO.liquidez, nivel) * lookup(FACTORES_TERRENO.mercado, demanda) * lookup(FACTORES_TERRENO.oferta, oferta), 18, 92);
const ventaMeses = (indice: number) => indice >= 78 ? '1 a 3 meses' : indice >= 62 ? '3 a 6 meses' : indice >= 45 ? '6 a 9 meses' : '9 a 14 meses';

const confianza = (data: TerrenoInput, areaM2Convertida: number, zona?: ZonaData): ResultadoAvaluo['nivelConfianza'] => {
  const requeridos = Boolean(zona?.zona) && areaM2Convertida > 0 && Boolean(data.usoPotencial) && Boolean(data.serviciosBasicos);
  const ruralVariable = ['Rural productivo', 'Rural aislado'].includes(String(data.tipoTerritorio)) || ['Alta', 'Muy alta'].includes(String(data.nivelDeforestacion));
  const faltantesSecundarios = [data.tipoSuelo, data.topografia, data.tipoVia || data.accesoGeneral, data.seguridadZona, data.formaTerreno, data.entorno, data.desarrolloUrbano, data.nivelDeforestacion].filter((v) => !v).length;
  if (!requeridos || ruralVariable) return 'Baja';
  if (faltantesSecundarios === 0 && areaM2Convertida > 0 && data.legalStatus === 'Documentación completa') return 'Muy Alta';
  if (faltantesSecundarios > 2) return 'Medio';
  return 'Alto';
};

const booleanCoef = (enabled: unknown, positive: number, negative = 0) => enabled === true ? 1 + positive : enabled === false && negative ? 1 - negative : 1;
const optionCoef = (value: unknown, scores: Record<string, number>, fallback = 1) => toSafeNumber(scores[String(value)], fallback);
const potencialCoef = (enabled: unknown, selectedUse: unknown, useName: string, impact = 0.035) => enabled === true || String(selectedUse) === useName ? 1 + impact : 1;

export const calculateLandValuation = (data: TerrenoInput, zona: ZonaData): ResultadoAvaluo => {
  const { areaOriginal, unidadArea, areaM2Convertida, areaManzanas } = normalizeArea(data);
  const suggestedBasePriceM2 = getBasePriceM2(zona, data, areaManzanas);
  const isRuralSur = isZonaRuralSurMatagalpa(zona, data);
  const suggestedBasePricePerManzana = isRuralSur ? getRuralSurPricePerManzana(areaManzanas) : suggestedBasePriceM2 * M2_POR_MANZANA;
  const manualApplied = toSafeNumber((data as any).precioBaseAplicado, 0);
  const basePricePerManzana = data.unidadArea === 'manzana' && manualApplied > 0 ? manualApplied : suggestedBasePricePerManzana;
  const basePriceM2 = data.unidadArea === 'm2' && manualApplied > 0 ? manualApplied : basePricePerManzana / M2_POR_MANZANA;
  const factorEscala = isRuralSur ? 1 : getFactorEscala(areaM2Convertida);
  const scaleMultiplier = factorEscala;
  const riesgos = data.riesgos || (data.riesgoInundacion ? ['Riesgo de inundación'] : ['Ninguno']);
  const entorno = data.entorno || data.tipoEntorno;
  const zoneType = inferZoneType(zona, data);

  const coefNumericos = {
    factorZona: isRuralSur ? 1 : toSafeNumber(zona.factorPlusvalia, 1),
    factorTipoTerritorio: isRuralSur ? 1 : lookup(FACTORES_TERRENO.tipoTerritorio, data.tipoTerritorio),
    factorTipoSuelo: lookup(FACTORES_TERRENO.tipoSuelo, data.tipoSuelo),
    factorTopografia: lookup(FACTORES_TERRENO.topografia, data.topografia),
    factorAcceso: getAccessFactor(data),
    factorTrafico: lookup(FACTORES_TERRENO.nivelTrafico, data.nivelTrafico),
    factorSeguridadZona: lookup(FACTORES_TERRENO.seguridadZona, data.seguridadZona),
    factorForma: lookup(FACTORES_TERRENO.formaTerreno, data.formaTerreno),
    factorEntorno: lookup(FACTORES_TERRENO.entorno, entorno),
    factorUsoPotencial: lookup(FACTORES_TERRENO.usoPotencial, data.usoPotencial),
    factorDesarrolloUrbano: lookup(FACTORES_TERRENO.desarrolloUrbano, data.desarrolloUrbano),
    factorProximidad: getProximityFactor(data),
    factorRecursosNaturales: getNaturalResourcesFactor(data.recursosNaturales, riesgos),
    factorDeforestacion: lookup(FACTORES_TERRENO.nivelDeforestacion, data.nivelDeforestacion),
    factorServiciosBasicos: getServiciosBasicosFactor(data.serviciosBasicos),
    factorLegal: lookup(FACTORES_TERRENO.legalStatus, data.legalStatus || 'Documentación completa'),
    factorHidrologia: lookup(FACTORES_TERRENO.hidrologia, (data as any).hidrologia || ((data.recursosNaturales || []).includes('Pozo') ? 'Pozo' : 'Sin agua')),
    factorVegetacion: lookup(FACTORES_TERRENO.vegetacion, (data as any).vegetacion || 'Pasto'),
    factorRiesgo: Math.min(...(riesgos.length ? riesgos : ['Ninguno']).map((r) => lookup(FACTORES_TERRENO.riesgos, r, 1))),
    factorOrientacion: lookup(FACTORES_TERRENO.orientacion, (data as any).orientacion || (data.esquina ? 'Esquina' : 'Norte')),
    factorGeometria: frontDepthFactor(data.frenteTerreno, data.fondoTerreno),
    factorLiquidez: lookup(FACTORES_TERRENO.liquidez, (data as any).liquidez || 'Media'),
    factorDemanda: lookup(FACTORES_TERRENO.mercado, (data as any).demanda || 'Media'),
    factorOferta: lookup(FACTORES_TERRENO.oferta, (data as any).oferta || 'Normal'),
  };
  const servicios = serviciosIndividuales(data.serviciosBasicos);

  const factorTopografiaRaw = coefNumericos.factorTopografia * coefNumericos.factorTipoSuelo * coefNumericos.factorForma;
  const factorAccesoRaw = coefNumericos.factorAcceso * coefNumericos.factorTrafico * coefNumericos.factorProximidad;
  const factorServiciosBasicosRaw = Object.values(servicios).reduce((acc, value) => acc * value, 1);
  const factorSeguridadRaw = coefNumericos.factorLegal * coefNumericos.factorSeguridadZona;
  const factorUsoRaw = coefNumericos.factorUsoPotencial;
  const factorEntornoRaw = coefNumericos.factorEntorno;
  const factorRiesgos = coefNumericos.factorRecursosNaturales * coefNumericos.factorDeforestacion * coefNumericos.factorRiesgo;
  const factorDesarrolloRaw = coefNumericos.factorDesarrolloUrbano * coefNumericos.factorTipoTerritorio;
  const factorMercado = limitCategoryFactor(coefNumericos.factorLiquidez * coefNumericos.factorDemanda * coefNumericos.factorOferta, { min: 0.84, max: 1.12 });

  const factorTopografia = limitCategoryFactor(factorTopografiaRaw, CATEGORY_LIMITS.topografia);
  const factorAcceso = limitCategoryFactor(factorAccesoRaw, CATEGORY_LIMITS.acceso);
  const factorServiciosBasicos = limitCategoryFactor(factorServiciosBasicosRaw, CATEGORY_LIMITS.serviciosBasicos);
  const factorSeguridad = limitCategoryFactor(factorSeguridadRaw, CATEGORY_LIMITS.seguridadJuridica);
  const factorUso = limitCategoryFactor(factorUsoRaw, CATEGORY_LIMITS.usoPotencial);
  const factorEntorno = limitCategoryFactor(factorEntornoRaw, CATEGORY_LIMITS.entorno);
  const factorDesarrollo = limitCategoryFactor(factorDesarrolloRaw, CATEGORY_LIMITS.desarrolloUrbano);

  const factorSinergia = limitCategoryFactor(synergyFactor(data, zoneType, factorAcceso, factorServiciosBasicos, factorTopografia, factorUso, factorRiesgos), { min: 0.98, max: 1.025 });
  const factorInfraestructura = limitCategoryFactor(
    optionCoef((data as any).cercaniaHospitales, { Alta: 1.025, Media: 1.01, Baja: 0.99, Lejana: 0.98 })
    * optionCoef((data as any).cercaniaEscuelas, { Alta: 1.02, Media: 1.01, Baja: 0.995, Lejana: 0.985 })
    * optionCoef((data as any).transportePublico, { Alta: 1.025, Media: 1.01, Baja: 0.99, Nula: 0.975 }),
    { min: 0.96, max: 1.06 }
  );
  const factorProductividadSuelo = optionCoef((data as any).productividadSuelo, { Alta: 1.05, Media: 1.01, Baja: 0.96 });
  const factorRestriccionAmbiental = (data as any).restriccionesAmbientales ? 0.96 : 1;
  const factorRestriccionLegal = (data as any).restriccionesLegales ? 0.95 : 1;
  const factorPotenciales = limitCategoryFactor(
    potencialCoef((data as any).potencialAgricola, data.usoPotencial, 'Agrícola')
    * potencialCoef((data as any).potencialGanadero, data.usoPotencial, 'Ganadero', 0.025)
    * potencialCoef((data as any).potencialTuristico, data.usoPotencial, 'Turístico', 0.04)
    * potencialCoef((data as any).potencialComercial, data.usoPotencial, 'Comercial', 0.045)
    * potencialCoef((data as any).potencialIndustrial, data.usoPotencial, 'Industrial', 0.035),
    { min: 0.95, max: 1.08 }
  );
  const factorUbicacion = limitCategoryFactor(coefNumericos.factorZona * factorDesarrollo * coefNumericos.factorSeguridadZona, CATEGORY_LIMITS.ubicacion);
  const factorLiquidezTecnica = limitCategoryFactor(coefNumericos.factorLiquidez * coefNumericos.factorDemanda * coefNumericos.factorOferta, CATEGORY_LIMITS.liquidez);
  const factorUrbanistico = limitCategoryFactor(factorDesarrollo * factorEntorno * booleanCoef((data as any).potencialSubdivision, 0.04) * potencialCoef((data as any).potencialUrbanizar, data.usoPotencial, 'Lotificación', 0.05), { min: 0.90, max: 1.10 });
  const factorAmbiental = limitCategoryFactor(factorRiesgos * coefNumericos.factorHidrologia * coefNumericos.factorVegetacion * factorRestriccionAmbiental, CATEGORY_LIMITS.ambiental);
  const factorJuridico = limitCategoryFactor(factorSeguridad * factorRestriccionLegal, CATEGORY_LIMITS.seguridadJuridica);

  const valorBase = data.unidadArea === 'manzana' ? areaManzanas * basePricePerManzana : areaM2Convertida * basePriceM2;
  const valorNormalizado = valorBase * factorEscala;
  const valorConLiquidez = valorNormalizado * factorLiquidezTecnica;
  const valorConUso = valorConLiquidez * factorUso * factorPotenciales;
  const valorConUrbanismo = valorConUso * factorUrbanistico;
  const valorConTopografia = valorConUrbanismo * factorTopografia * limitCategoryFactor(coefNumericos.factorTipoSuelo * factorProductividadSuelo, CATEGORY_LIMITS.tipoSuelo) * limitCategoryFactor(coefNumericos.factorForma * coefNumericos.factorGeometria, CATEGORY_LIMITS.forma);
  const valorConAccesibilidad = valorConTopografia * factorAcceso * factorInfraestructura;
  const valorConServicios = valorConAccesibilidad * factorServiciosBasicos;
  const valorConAmbiente = valorConServicios * factorAmbiental;
  const valorFinalSinTope = valorConAmbiente * factorJuridico * factorUbicacion * factorSinergia;
  const ajusteTecnicoSinTope = safeDivide(valorFinalSinTope, valorBase, 1);
  const ajusteTecnicoTotal = isRuralSur ? clamp(ajusteTecnicoSinTope, 0.80, 1.20) : ajusteTecnicoSinTope;
  const valorFinal = valorBase * ajusteTecnicoTotal;
  const factorGlobal = safeDivide(valorFinal, valorBase, 1);
  const adjustedPriceM2 = safeDivide(valorFinal, areaM2Convertida, 0);
  const normalizacionAplicada = factorEscala < 0.995;
  const nivelConfianza = confianza(data, areaM2Convertida, zona);
  const margenConfianza = confidenceRange(nivelConfianza);
  const rangoMercado = { minimo: valorFinal * (1 - margenConfianza), maximo: valorFinal * (1 + margenConfianza) };
  const indiceLiquidez = liquidityIndex((data as any).liquidez || 'Media', (data as any).demanda || 'Media', (data as any).oferta || 'Normal');
  const precioPublicacion = valorFinal * (1 + Math.min(0.035, margenConfianza / 2));
  const precioMinimoNegociacion = rangoMercado.minimo;
  const precioObjetivoCierre = valorFinal * (1 - Math.min(0.018, margenConfianza / 3));
  const valorTecnico = valorFinal;
  const valorComercial = valorFinal * factorLiquidezTecnica;
  const nivelDemanda = indiceLiquidez >= 75 ? 'Alta' : indiceLiquidez >= 55 ? 'Media' : 'Baja';
  const nivelPlusvalia = factorUbicacion >= 1.08 ? 'Alta' : factorUbicacion >= 0.99 ? 'Media' : 'Baja';
  const potencialCrecimiento = factorUrbanistico >= 1.06 ? 'Alto' : factorUrbanistico >= 0.99 ? 'Medio' : 'Bajo';
  const indiceComercializacion = Math.round(clamp(indiceLiquidez * factorUrbanistico * factorAcceso, 10, 98));

  const coeficientesAplicados: CoeficienteAplicado[] = [
    coefRow('Zona / plusvalía', isRuralSur ? `${zona.zona} — incluida en la curva territorial` : zona.zona, coefNumericos.factorZona),
    ...(isRuralSur ? [coefRow('Escala territorial aplicada', `${areaManzanas.toFixed(2)} manzanas → USD ${suggestedBasePricePerManzana.toFixed(2)} por manzana sugerido`, 1), coefRow('Precio base por manzana aplicado', `${basePricePerManzana.toFixed(2)} USD/manzana`, 1)] : []),
    coefRow('Precio base por m²', `${basePriceM2.toFixed(2)} USD/m²`, 1),
    coefRow('Normalización por escala', isRuralSur ? 'Incluida en la curva territorial; multiplicador adicional 1.00.' : `Factor ${factorEscala.toFixed(2)} — ${getScaleExplanation(areaM2Convertida, areaManzanas, factorEscala)}`, factorEscala),
    coefRow('Categoría territorial', isRuralSur ? `${data.tipoTerritorio || 'Rural'} — condición rural incluida en curva base` : data.tipoTerritorio || 'No definido', coefNumericos.factorTipoTerritorio),
    coefRow('Tipo de suelo', data.tipoSuelo || 'No definido', coefNumericos.factorTipoSuelo),
    coefRow('Topografía', `${data.topografia || 'No definido'} — ${limitText(coefNumericos.factorTopografia, coefNumericos.factorTopografia)}`, coefNumericos.factorTopografia),
    coefRow('Forma', data.formaTerreno || 'No definido', coefNumericos.factorForma),
    coefRow('Frente', data.frenteTerreno ? `${data.frenteTerreno} m` : 'No definido', coefNumericos.factorGeometria),
    coefRow('Fondo', data.fondoTerreno ? `${data.fondoTerreno} m` : 'No definido', coefNumericos.factorGeometria),
    coefRow('Acceso', `${data.tipoVia || data.accesoGeneral || data.acceso || 'No definido'}; tráfico: ${String(data.nivelTrafico || 'No definido')}; cercanía: ${data.proximity || (data.cercaniaPrincipal ? 'Cerca de ciudad principal' : 'Según desarrollo urbano')} — ${limitText(factorAccesoRaw, factorAcceso)}`, factorAcceso),
    coefRow('Entorno', `${String(entorno || 'No definido')} — ${limitText(factorEntornoRaw, factorEntorno)}`, factorEntorno),
    coefRow('Uso potencial', `${data.usoPotencial || 'No definido'} — ${limitText(factorUsoRaw, factorUso)}`, factorUso),
    coefRow('Hidrología', (data as any).hidrologia || 'Según recursos declarados', coefNumericos.factorHidrologia),
    coefRow('Recursos naturales', `${(data.recursosNaturales || ['Ninguno']).join(', ')}`, coefNumericos.factorRecursosNaturales),
    coefRow('Vegetación', (data as any).vegetacion || 'Pasto / no especificada', coefNumericos.factorVegetacion),
    coefRow('Riesgos', riesgos.join(', '), coefNumericos.factorRiesgo),
    coefRow('Servicios básicos', `${formatServiciosBasicos(data.serviciosBasicos)} — ${limitText(factorServiciosBasicosRaw, factorServiciosBasicos)}`, factorServiciosBasicos),
    coefRow('Agua', data.serviciosBasicos?.agua ? 'Disponible' : 'No disponible', servicios.agua),
    coefRow('Luz', data.serviciosBasicos?.energia ? 'Disponible' : 'No disponible', servicios.energia),
    coefRow('Internet', data.serviciosBasicos?.internet ? 'Disponible' : 'No disponible', servicios.internet),
    coefRow('Telefonía', data.serviciosBasicos?.senalTelefonica ? 'Disponible' : 'No disponible', servicios.senalTelefonica),
    coefRow('Drenaje', data.serviciosBasicos?.drenaje ? 'Disponible' : 'No disponible', servicios.drenaje),
    coefRow('Alumbrado público', (data.serviciosBasicos as any)?.alumbradoPublico ? 'Disponible' : 'No disponible', servicios.alumbradoPublico),
    coefRow('Recolección de basura', (data.serviciosBasicos as any)?.recoleccionBasura ? 'Disponible' : 'No disponible', servicios.recoleccionBasura),
    coefRow('Seguridad jurídica', `${data.legalStatus || 'Documentación completa'}; zona: ${String(data.seguridadZona || 'No definido')} — ${limitText(factorSeguridadRaw, factorSeguridad)}`, factorSeguridad),
    coefRow('Desarrollo urbano', `${data.desarrolloUrbano || 'No definido'}; territorio: ${data.tipoTerritorio || 'No definido'} — ${limitText(factorDesarrolloRaw, factorDesarrollo)}`, factorDesarrollo),
    coefRow('Liquidez', (data as any).liquidez || 'Media', coefNumericos.factorLiquidez),
    coefRow('Demanda', (data as any).demanda || 'Media', coefNumericos.factorDemanda),
    coefRow('Oferta', (data as any).oferta || 'Normal', coefNumericos.factorOferta),
    coefRow('Mercado local', `Liquidez ${(data as any).liquidez || 'Media'} · Demanda ${(data as any).demanda || 'Media'} · Oferta ${(data as any).oferta || 'Normal'}`, factorMercado),
    coefRow('Sinergia multicriterio', 'Interacción topografía + servicios + zona + accesibilidad + seguridad + uso potencial', factorSinergia),
    coefRow('Riesgo de inundación', data.riesgoInundacion ? 'Declarado' : riesgos.includes('Riesgo de inundación') ? 'En lista de riesgos' : 'No declarado', optionCoef(data.riesgoInundacion ? 'Sí' : 'No', { Sí: 0.96, No: 1 })),
    coefRow('Riesgo por deslizamientos', riesgos.includes('Riesgo de deslizamiento') ? 'Declarado' : 'No declarado', riesgos.includes('Riesgo de deslizamiento') ? 0.95 : 1),
    coefRow('Cercanía a carreteras principales', data.cercaniaPrincipal ? 'Cercano' : 'No declarado', booleanCoef(data.cercaniaPrincipal, 0.035)),
    coefRow('Cercanía a centros urbanos', data.proximity || 'Según desarrollo urbano', coefNumericos.factorProximidad),
    coefRow('Cercanía a hospitales', (data as any).cercaniaHospitales || 'No declarado', optionCoef((data as any).cercaniaHospitales, { Alta: 1.025, Media: 1.01, Baja: 0.99, Lejana: 0.98 })),
    coefRow('Cercanía a escuelas', (data as any).cercaniaEscuelas || 'No declarado', optionCoef((data as any).cercaniaEscuelas, { Alta: 1.02, Media: 1.01, Baja: 0.995, Lejana: 0.985 })),
    coefRow('Disponibilidad de transporte', (data as any).transportePublico || 'No declarado', optionCoef((data as any).transportePublico, { Alta: 1.025, Media: 1.01, Baja: 0.99, Nula: 0.975 })),
    coefRow('Disponibilidad de agua permanente', data.serviciosBasicos?.agua ? 'Disponible' : 'No disponible', data.serviciosBasicos?.agua ? 1.03 : 0.97),
    coefRow('Nivel de productividad del suelo', (data as any).productividadSuelo || data.tipoSuelo || 'No declarado', optionCoef((data as any).productividadSuelo, { Alta: 1.05, Media: 1.01, Baja: 0.96 })),
    coefRow('Restricciones ambientales', (data as any).restriccionesAmbientales ? 'Presentes' : 'No declaradas', booleanCoef(!(data as any).restriccionesAmbientales, 0, 0.04)),
    coefRow('Restricciones legales', (data as any).restriccionesLegales ? 'Presentes' : 'No declaradas', booleanCoef(!(data as any).restriccionesLegales, 0, 0.05)),
    coefRow('Posibilidad de subdivisión', (data as any).potencialSubdivision ? 'Viable' : 'No declarada', booleanCoef((data as any).potencialSubdivision, 0.04)),
    coefRow('Potencial agrícola', data.usoPotencial === 'Agrícola' ? 'Uso principal' : 'No predominante', potencialCoef((data as any).potencialAgricola, data.usoPotencial, 'Agrícola')),
    coefRow('Potencial ganadero', data.usoPotencial === 'Ganadero' ? 'Uso principal' : 'No predominante', potencialCoef((data as any).potencialGanadero, data.usoPotencial, 'Ganadero', 0.025)),
    coefRow('Potencial turístico', data.usoPotencial === 'Turístico' ? 'Uso principal' : 'No predominante', potencialCoef((data as any).potencialTuristico, data.usoPotencial, 'Turístico', 0.04)),
    coefRow('Potencial comercial', data.usoPotencial === 'Comercial' ? 'Uso principal' : 'No predominante', potencialCoef((data as any).potencialComercial, data.usoPotencial, 'Comercial', 0.045)),
    coefRow('Potencial industrial', data.usoPotencial === 'Industrial' ? 'Uso principal' : 'No predominante', potencialCoef((data as any).potencialIndustrial, data.usoPotencial, 'Industrial', 0.035)),
    coefRow('Precio base zona', isRuralSur ? `${basePricePerManzana.toFixed(2)} USD/manzana × ${areaManzanas.toFixed(2)} manzanas` : `${basePriceM2.toFixed(2)} USD/m² × ${areaM2Convertida.toFixed(2)} m²`, 1),
    coefRow('Normalización por tamaño', isRuralSur ? `No aplicada; incluida en la curva territorial. Valor base por curva: ${valorBase.toFixed(2)}` : `Valor normalizado: ${valorNormalizado.toFixed(2)}`, factorEscala),
    coefRow('Coeficiente de liquidez', `Valor: ${valorConLiquidez.toFixed(2)}`, factorLiquidezTecnica),
    coefRow('Coeficiente de uso potencial', `Valor: ${valorConUso.toFixed(2)}`, factorUso),
    coefRow('Coeficiente urbanístico', `Valor: ${valorConUrbanismo.toFixed(2)}`, factorUrbanistico),
    coefRow('Coeficiente de topografía', `Valor: ${valorConTopografia.toFixed(2)}`, factorTopografia),
    coefRow('Coeficiente de accesibilidad', `Valor: ${valorConAccesibilidad.toFixed(2)}`, factorAcceso),
    coefRow('Coeficiente de servicios', `Valor: ${valorConServicios.toFixed(2)}`, factorServiciosBasicos),
    coefRow('Coeficiente ambiental', `Valor: ${valorConAmbiente.toFixed(2)}`, factorAmbiental),
    coefRow('Coeficiente jurídico', `Resultado final: ${valorFinal.toFixed(2)}`, factorJuridico),
    ...(isRuralSur ? [coefRow('Ajuste técnico acumulado', `Factor técnico ${ajusteTecnicoTotal.toFixed(3)} aplicado después de la curva base`, ajusteTecnicoTotal)] : []),
    coefRow('Resultado final', `Valor base ${valorBase.toFixed(2)} → final ${valorFinal.toFixed(2)}`, factorGlobal),
  ];

  return {
    valorTerreno: toSafeNumber(valorFinal),
    valorM2: safeDivide(valorFinal, areaM2Convertida, 0),
    clasificacionZona: zona.clasificacion,
    plusvaliaAplicada: coefNumericos.factorZona,
    coeficientesAplicados,
    rangoMercado,
    nivelConfianza,
    valorFinalEstimado: toSafeNumber(valorFinal),
    valorBase: toSafeNumber(valorBase),
    factorGlobal: toSafeNumber(factorGlobal, 1),
    areaOriginal,
    unidadArea,
    areaM2Convertida: toSafeNumber(areaM2Convertida),
    areaM2: toSafeNumber(areaM2Convertida),
    areaManzanas: toSafeNumber(areaManzanas),
    valorTerrenoM2: basePriceM2,
    basePriceM2,
    scaleMultiplier,
    adjustedPriceM2: toSafeNumber(adjustedPriceM2),
    lowValue: toSafeNumber(rangoMercado.minimo),
    estimatedValue: toSafeNumber(valorFinal),
    highValue: toSafeNumber(rangoMercado.maximo),
    appliedFactors: coeficientesAplicados,
    normalizacionAplicada,
    notaNormalizacion: normalizacionAplicada ? getScaleExplanation(areaM2Convertida, areaManzanas, factorEscala) : undefined,
    pricePerManzana: toSafeNumber(adjustedPriceM2 * M2_POR_MANZANA),
    basePricePerManzana: toSafeNumber(basePricePerManzana),
    baseValueTotal: toSafeNumber(valorBase),
    technicalAdjustmentFactor: toSafeNumber(ajusteTecnicoTotal, 1),
    ruralSurScaleApplied: isRuralSur,
    valorComercial: toSafeNumber(valorComercial),
    valorTecnico: toSafeNumber(valorTecnico),
    nivelDemanda,
    nivelPlusvalia,
    potencialCrecimiento,
    indiceComercializacion,
    rangoPorcentaje: margenConfianza,
    indiceLiquidez: Math.round(indiceLiquidez),
    tiempoEstimadoVenta: ventaMeses(indiceLiquidez),
    precioRecomendadoPublicacion: toSafeNumber(precioPublicacion),
    precioMinimoNegociacion: toSafeNumber(precioMinimoNegociacion),
    precioObjetivoCierre: toSafeNumber(precioObjetivoCierre),
  };
};

export const calcularTerreno = calculateLandValuation;
