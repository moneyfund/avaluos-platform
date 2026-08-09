import { COEF_CASA, EXTRA_FACTORES, PESOS_CASA, VARA2_A_M2 } from '../constants/coeficientesCasas';
import { FACTORES_CONSTRUCCION } from '../constants/factoresConstruccion';
import { confidence, formatServiciosBasicos, getServiciosBasicosFactor, range, safeDivide, toSafeFactor, toSafeNumber } from './shared/formulas';
import type { CasaInput, CoeficienteAplicado, ZonaData, ResultadoAvaluo } from '../types/avaluo.types';

const impactText = (coeficiente: number) => { const pct = (coeficiente - 1) * 100; if (Math.abs(pct) < 0.1) return '0%'; return `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`; };
const coefRow = (factor: string, valorAplicado: string, coeficiente: number): CoeficienteAplicado => ({ factor, valorAplicado, coeficiente: toSafeNumber(coeficiente, 1), impacto: impactText(coeficiente) });
const pick = (group: string, value: any, fallback = 1) => toSafeFactor(COEF_CASA[group]?.[value], fallback);
const avg = (items: number[]) => items.length ? items.reduce((a,b)=>a+b,0) / items.length : 1;
const weighted = (scores: Record<keyof typeof PESOS_CASA, number>) => Object.entries(PESOS_CASA).reduce((total, [k, w]) => total + (scores[k as keyof typeof PESOS_CASA] || 1) * w, 0);
const boolFactor = (data: any, keys: string[]) => keys.reduce((f, k) => f * (data[k] ? (EXTRA_FACTORES[k] || 1.01) : 1), 1);
const docFactor = (data: any) => avg(['escritura','catastro','planoAprobado','impuestosAlDia','libreGravamen'].map((k) => pick('documentacion', data[k] || 'Completa')));
const materialFactor = (data: any) => avg(Object.entries({ tipoCimentacion:'cimentacion', tipoParedes:'paredes', tipoTecho:'techo', tipoCieloRaso:'cieloRaso', tipoPiso:'piso', tipoVentanas:'ventanas', tipoPuertas:'puertas', sistemaElectrico:'sistemas', sistemaHidraulico:'sistemas', sistemaSanitario:'sistemas', sistemaPluvial:'sistemas' }).map(([field, group]) => toSafeFactor((FACTORES_CONSTRUCCION as any)[group]?.[data[field]], 1)));

export const calcularCasa = (data: CasaInput, zona: ZonaData): ResultadoAvaluo => {
  const unidad = (data as any).unidad || data.unidadArea || 'm2';
  const areaOriginal = toSafeNumber(data.areaOriginal || data.areaTerreno);
  const areaTerreno = unidad === 'vara2' ? areaOriginal * VARA2_A_M2 : toSafeNumber(data.areaM2Convertida || (data as any).areaConvertida || data.areaTerreno);
  const areaConstruccion = toSafeNumber(data.areaConstruccion);
  const valorTerrenoM2 = toSafeNumber(zona.valorTerrenoM2);
  const costoConstruccionM2 = toSafeNumber(zona.valorConstruccionM2, 0);
  const terrenoBase = areaTerreno * valorTerrenoM2;
  const construccionBase = areaConstruccion * costoConstruccionM2;
  const valorBase = terrenoBase + construccionBase;

  const ubicacion = avg([toSafeFactor(zona.factorPlusvalia), pick('nivelComercial', data.nivelComercial), pick('seguridadZona', data.seguridadZona), pick('desarrolloUrbano', data.desarrolloUrbano), pick('uso', (data as any).usoInmueble || 'Residencial')]);
  const terreno = avg([pick('topografia', data.topografia), pick('formaTerreno', data.formaTerreno), pick('tipoSuelo', data.tipoSuelo), pick('accesoGeneral', data.accesoGeneral || data.acceso), toSafeFactor(getServiciosBasicosFactor(data.serviciosBasicos))]);
  const construccion = avg([pick('calidadConstructiva', (data as any).calidadConstructiva || data.acabados), materialFactor(data), pick('antiguedad', data.antiguedad), pick('plantas', data.niveles)]);
  const estado = avg([pick('estadoGeneral', (data as any).estadoGeneral || data.estadoConstruccion), pick('mantenimiento', (data as any).nivelMantenimiento || 'Bueno'), docFactor(data)]);
  const extras = Math.min(1.18, boolFactor(data, ['garaje','patio','jardin','terraza','balcon','piscina','rancho','oficina','salaFamiliar','estudio','bar','areaBBQ','portonElectrico','cercaPerimetral','muroFrontal','sistemaCCTV','alarma','panelesSolares','calentadorSolar','pozoPropio','tanqueAgua','bombaHidroneumatica','internetFibra','aireAcondicionado','sistemaInteligente']));
  const factorPonderado = weighted({ ubicacion, terreno, construccion, estado, extras });
  const valorTerreno = terrenoBase * (0.65 + ubicacion * 0.20 + terreno * 0.15);
  const valorConstruccion = construccionBase * (0.55 + construccion * 0.25 + estado * 0.15 + extras * 0.05);
  const valorFinal = toSafeNumber((valorTerreno + valorConstruccion) * factorPonderado);

  const coeficientesAplicados: CoeficienteAplicado[] = [
    coefRow('Ubicación ponderada', `${zona.zona} ${zona.clasificacion}; plusvalía, seguridad, desarrollo y uso`, ubicacion),
    coefRow('Terreno ponderado', `Topografía, forma, suelo, accesos y servicios (${formatServiciosBasicos(data.serviciosBasicos)})`, terreno),
    coefRow('Construcción ponderada', `Calidad, materiales, sistemas, plantas y antigüedad`, construccion),
    coefRow('Estado técnico/documental', `Estado, mantenimiento y documentación`, estado),
    coefRow('Extras y amenidades', 'Distribución, seguridad, sostenibilidad y equipamiento', extras),
    coefRow('Matriz final ponderada', 'Ubicación 30%, terreno 15%, construcción 30%, estado 15%, extras 10%', factorPonderado),
  ];
  return { valorTerreno: toSafeNumber(valorTerreno), valorConstruccion: toSafeNumber(valorConstruccion), valorM2: safeDivide(valorFinal, areaConstruccion || areaTerreno, 0), clasificacionZona: zona.clasificacion, plusvaliaAplicada: zona.factorPlusvalia, coeficientesAplicados, rangoMercado: range(valorFinal), nivelConfianza: confidence(coeficientesAplicados.length + 8), valorFinalEstimado: valorFinal, valorBase: toSafeNumber(valorBase), areaOriginal, unidadArea: unidad as any, areaM2Convertida: areaTerreno, areaM2: areaTerreno, factorGlobal: factorPonderado };
};
