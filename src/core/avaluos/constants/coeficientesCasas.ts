export const VARA2_A_M2 = 0.698896;
export const PESOS_CASA = { ubicacion: 0.30, terreno: 0.15, construccion: 0.30, estado: 0.15, extras: 0.10 } as const;
export const COEF_CASA: Record<string, Record<string, number>> = {
  estadoGeneral: { Excelente: 1.18, 'Muy bueno': 1.10, Bueno: 1, Regular: 0.92, Malo: 0.80 },
  topografia: { Plano: 1.07, 'Semi plano': 1.03, Ondulado: 0.98, Inclinado: 0.92, 'Muy inclinado': 0.86, Quebrado: 0.78 },
  formaTerreno: { Regular: 1.04, 'Irregular leve': 0.98, 'Irregular compleja': 0.90, Esquinero: 1.08, 'Fondo amplio': 1.02, 'Frente amplio': 1.05, Irregular: 0.92 },
  tipoSuelo: { 'Suelo firme': 1.04, 'Suelo arcilloso': 0.96, 'Suelo rocoso': 0.98, 'Suelo arenoso': 0.94, 'Suelo húmedo': 0.88, 'Suelo agrícola fértil': 1, 'Suelo mixto': 0.99 },
  accesoGeneral: { Excelente: 1.08, Bueno: 1.03, Regular: 0.96, Difícil: 0.88, 'Muy difícil': 0.78 },
  nivelComercial: { Alto: 1.10, Medio: 1, Bajo: 0.92 },
  seguridadZona: { Alta: 1.07, 'Media alta': 1.04, Media: 1, Baja: 0.90, Alto: 1.07, Medio: 1, Bajo: 0.90 },
  desarrolloUrbano: { Consolidado: 1.06, 'En crecimiento': 1.02, Crecimiento: 1.02, Emergente: 0.98, 'Bajo desarrollo': 0.90, 'Sin desarrollo urbano': 0.82 },
  calidadConstructiva: { Premium: 1.18, Alta: 1.10, 'Media alta': 1.06, Media: 1, Básica: 0.90, Económica: 0.82, Alto: 1.10, Medio: 1, 'Básico': 0.88 },
  mantenimiento: { Excelente: 1.10, 'Muy bueno': 1.06, Bueno: 1, Regular: 0.90, Malo: 0.78 },
  antiguedad: { '0-5': 1.08, '6-10': 1.02, '11-20': 0.94, '20+': 0.82 },
  plantas: { '1': 1, '2': 1.04, '3': 1.03, '4+': 1.01 },
  cocina: { Moderna: 1.08, Desayunador: 1.04, Tradicional: 1, Básica: 0.92 },
  documentacion: { Completa: 1.05, Parcial: 0.96, Pendiente: 0.88 },
  uso: { Residencial: 1, 'Residencial premium': 1.09, Comercial: 1.08, Mixto: 1.05, Institucional: 1.02 },
};
export const EXTRA_FACTORES: Record<string, number> = {
  garaje: 1.025, patio: 1.015, jardin: 1.02, terraza: 1.02, balcon: 1.01, piscina: 1.04, rancho: 1.025, oficina: 1.015, salaFamiliar: 1.012, estudio: 1.012, bar: 1.012, areaBBQ: 1.018,
  portonElectrico: 1.015, cercaPerimetral: 1.012, muroFrontal: 1.01, sistemaCCTV: 1.015, alarma: 1.01, panelesSolares: 1.025, calentadorSolar: 1.012, pozoPropio: 1.018, tanqueAgua: 1.012, bombaHidroneumatica: 1.015, internetFibra: 1.01, aireAcondicionado: 1.02, sistemaInteligente: 1.025,
};
