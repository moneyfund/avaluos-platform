import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const tempDir = await mkdtemp(join(tmpdir(), 'avaluos-core-'));
const terrenoOutfile = join(tempDir, 'terreno.engine.mjs');
const casaOutfile = join(tempDir, 'casa.engine.mjs');

try {
  await build({
    entryPoints: ['src/core/avaluos/engine/terreno.engine.ts'],
    outfile: terrenoOutfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    logLevel: 'silent',
  });

  const {
    M2_POR_MANZANA,
    getRuralSurPricePerManzana,
    calculateLandValuation,
  } = await import(pathToFileURL(terrenoOutfile));

  const curveCases = [
    [1, 35000], [5, 30000], [10, 28000], [20, 24000], [40, 16000],
    [60, 12000], [80, 8000], [90, 7000], [100, 6000], [150, 5000], [200, 5000],
  ];

  for (const [area, expected] of curveCases) {
    assert.equal(getRuralSurPricePerManzana(area), expected, `${area} manzanas`);
  }

  let previous = Infinity;
  for (let area = 1; area <= 200; area += 1) {
    const price = getRuralSurPricePerManzana(area);
    assert.ok(price <= previous, `precio no aumenta en ${area} manzanas`);
    previous = price;
  }

  const ruralZona = {
    id: 'matagalpa-zona-rural-sur', ciudad: 'Matagalpa', zona: 'Zona Rural Sur', nombre: 'Zona Rural Sur',
    clasificacion: 'D', tipoEntorno: 'Rural productivo', factorPlusvalia: 0.78, valorTerrenoM2: 6.40,
    valorConstruccionM2: 330, observacionTecnica: 'Rural productivo',
  };

  const baseInput = {
    ciudad: ' Matagalpa ', zona: 'Zona Rural Sur', areaOriginal: 90, unidadArea: 'manzana',
    tipoTerritorio: 'Rural productivo', tipoSuelo: 'Franco arcilloso', topografia: 'Ondulado medio',
    accesoGeneral: 'Regular', seguridadZona: 'Media', formaTerreno: 'Regular', entorno: 'Rural productivo',
    usoPotencial: 'Agrícola', desarrolloUrbano: 'Emergente', recursosNaturales: ['Ninguno'], riesgos: ['Ninguno'],
    nivelDeforestacion: 'Baja', serviciosBasicos: { agua: true, energia: true, internet: true, senalTelefonica: true, drenaje: true },
    legalStatus: 'Documentación revisable', liquidez: 'Media', demanda: 'Media', oferta: 'Normal',
  };

  const result = calculateLandValuation(baseInput, ruralZona);
  assert.equal(result.ruralSurScaleApplied, true);
  assert.equal(result.basePricePerManzana, 7000);
  assert.equal(result.scaleMultiplier, 1);
  assert.equal(result.baseValueTotal, 630000);
  assert.notEqual(result.basePriceM2, 6.40);
  assert.ok(Math.abs(result.basePriceM2 - (7000 / M2_POR_MANZANA)) < 0.000001);
  assert.ok(result.technicalAdjustmentFactor >= 0.80 && result.technicalAdjustmentFactor <= 1.20);

  const m2Result = calculateLandValuation({ ...baseInput, areaOriginal: 90 * M2_POR_MANZANA, unidadArea: 'm2' }, ruralZona);
  assert.equal(m2Result.basePricePerManzana, 7000);
  assert.equal(m2Result.baseValueTotal, 630000);
  assert.equal(m2Result.scaleMultiplier, 1);

  await build({
    entryPoints: ['src/core/avaluos/engine/casa.engine.ts'],
    outfile: casaOutfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    logLevel: 'silent',
  });

  const { calcularCasa } = await import(pathToFileURL(casaOutfile));
  const houseZona = {
    id: 'matagalpa-guanuca', ciudad: 'Matagalpa', zona: 'Guanuca', nombre: 'Guanuca',
    clasificacion: 'A', tipoEntorno: 'Residencial alta', factorPlusvalia: 1.20, valorTerrenoM2: 150,
    valorConstruccionM2: 590, observacionTecnica: 'Residencial alta',
  };
  const houseInput = {
    titulo: 'Caso de regresión casa', ciudad: 'Matagalpa', zona: 'Guanuca', unidadArea: 'm2', unidad: 'm2',
    areaOriginal: 300, areaTerreno: 300, areaM2Convertida: 300, areaConstruccion: 150,
    topografia: 'Plano', formaTerreno: 'Regular', tipoSuelo: 'Suelo firme', accesoGeneral: 'Bueno',
    nivelComercial: 'Medio', seguridadZona: 'Media', desarrolloUrbano: 'Consolidado', usoInmueble: 'Residencial',
    serviciosBasicos: { agua: true, energia: true, drenaje: true, internet: true },
    calidadConstructiva: 'Media', acabados: 'Media', antiguedad: '6-10', niveles: '1',
    estadoConstruccion: 'Bueno', nivelMantenimiento: 'Bueno', estadoGeneral: 'Bueno',
    tipoCimentacion: 'Mixta', tipoParedes: 'Bloque', tipoTecho: 'Zinc', tipoCieloRaso: 'PVC',
    tipoPiso: 'Cerámica', tipoVentanas: 'Aluminio', tipoPuertas: 'Madera', sistemaElectrico: 'Bueno',
    sistemaHidraulico: 'Bueno', sistemaSanitario: 'Bueno', sistemaPluvial: 'Bueno',
    escritura: 'Completa', catastro: 'Completa', planoAprobado: 'Completa', impuestosAlDia: 'Completa', libreGravamen: 'Completa',
    habitaciones: 3, banos: 2, garaje: false, patio: false, jardin: false,
  };
  const houseResult = calcularCasa(houseInput, houseZona);
  assert.ok(Math.abs(houseResult.valorFinalEstimado - 138723.4972469008) < 0.000001);
  assert.ok(Math.abs(houseResult.factorGlobal - 1.029472727272727) < 0.000001);
  assert.equal(houseResult.coeficientesAplicados.length, 6);
  assert.equal(houseResult.clasificacionZona, 'A');
  assert.ok(houseResult.valorTerreno > 0 && houseResult.valorConstruccion > 0);

  console.log('Core appraisal parity checks passed for terrain and houses.');
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
