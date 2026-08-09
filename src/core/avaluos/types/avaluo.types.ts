export type PropertyType = 'terreno' | 'casa';
export type CiudadObjetivo = 'Matagalpa' | 'Estelí';

export type UnidadArea = 'm2' | 'manzana' | 'vara2';
export type TipoTerritorio = 'Urbano' | 'Semiurbano' | 'Semirural' | 'Rural cercano' | 'Rural productivo' | 'Rural aislado';
export type Topografia = 'Plano' | 'Semi plano' | 'Ondulado' | 'Inclinado' | 'Muy inclinado' | 'Ondulado leve' | 'Ondulado medio' | 'Quebrado' | 'Escarpado' | 'Con terrazas naturales';
export type Acceso = 'Pavimentado' | 'Adoquinado' | 'Macadán' | 'Tierra';
export type AccesoGeneral = 'Excelente' | 'Bueno' | 'Regular' | 'Difícil' | 'Muy difícil';
export type TipoVia = 'Carretera pavimentada' | 'Calle adoquinada' | 'Calle de concreto' | 'Macadán' | 'Tierra transitable' | 'Camino rural' | 'Vereda';
export type NivelTrafico = 'Alto' | 'Medio' | 'Bajo' | 'Muy bajo';
export type SeguridadZona = 'Alta' | 'Media alta' | 'Media' | 'Baja';
export interface ServiciosBasicos { agua?: boolean; energia?: boolean; drenaje?: boolean; senalTelefonica?: boolean; internet?: boolean; alumbradoPublico?: boolean; recoleccionBasura?: boolean; }
export type UsoPotencial = 'Residencial' | 'Comercial' | 'Industrial' | 'Turístico' | 'Agrícola' | 'Ganadero' | 'Forestal' | 'Mixto' | 'Lotificación' | 'Industrial liviano' | 'Reserva natural';
export type FormaTerreno = 'Regular' | 'Irregular' | 'Irregular leve' | 'Irregular compleja' | 'Esquinero' | 'Fondo amplio' | 'Frente amplio';
export type NivelComercial = 'Alto' | 'Medio' | 'Bajo';
export type EntornoTerreno = 'Residencial premium' | 'Residencial alta' | 'Residencial media' | 'Residencial media alta' | 'Residencial medio' | 'Comercial' | 'Comercial / urbano premium' | 'Mixto' | 'Popular' | 'Popular consolidado' | 'Residencial popular' | 'Urbano popular' | 'Urbano popular consolidado' | 'Rural productivo' | 'Natural/turístico';
export type DesarrolloUrbano = 'Consolidado' | 'En crecimiento' | 'Crecimiento' | 'Emergente' | 'Bajo desarrollo' | 'Sin desarrollo urbano';
export type TipoSuelo = 'Suelo firme' | 'Suelo arcilloso' | 'Suelo rocoso' | 'Suelo arenoso' | 'Suelo húmedo' | 'Suelo agrícola fértil' | 'Suelo mixto' | 'Arcilloso' | 'Franco' | 'Franco arcilloso' | 'Franco arenoso' | 'Arenoso' | 'Pedregoso' | 'Volcánico' | 'Muy fértil' | 'Rocoso';
export type RecursoNatural = 'Fuente de agua' | 'Río o quebrada' | 'Pozo' | 'Árboles maderables' | 'Vista panorámica' | 'Área cultivable' | 'Ninguno';
export type Proximity = 'Cerca de ciudad principal' | 'Cerca de comunidad' | 'Remoto';
export type LegalStatus = 'Documentación completa' | 'Documentación revisable' | 'Problemas legales';
export type NivelDeforestacion = 'Sin deforestación' | 'Baja' | 'Media' | 'Alta' | 'Muy alta';
export type RiesgoTerreno = 'Riesgo de inundación' | 'Riesgo de deslizamiento' | 'Zona de difícil acceso' | 'Conflicto de servidumbre' | 'Ninguno';

export interface CoeficienteAplicado { factor: string; valorAplicado: string; coeficiente: number; impacto: string; justificacion?: string; }

export interface TerrenoInput {
  titulo: string;
  ciudad: CiudadObjetivo;
  zona: string;
  unidadArea?: UnidadArea;
  areaOriginal?: number;
  areaM2Convertida?: number;
  areaConvertida?: number;
  unidad?: UnidadArea;
  areaTerreno: number;
  tipoTerritorio?: TipoTerritorio;
  tipoSuelo?: TipoSuelo;
  topografia: Topografia;
  acceso?: Acceso;
  accesoGeneral?: AccesoGeneral;
  tipoVia?: TipoVia;
  nivelTrafico?: NivelTrafico | NivelComercial;
  seguridadZona?: SeguridadZona | NivelComercial;
  serviciosBasicos: ServiciosBasicos;
  usoPotencial: UsoPotencial;
  formaTerreno: FormaTerreno;
  entorno?: EntornoTerreno;
  tipoEntorno?: 'Residencial premium'|'Residencial alta'|'Residencial media'|'Comercial'|'Mixto'|'Popular' | EntornoTerreno;
  desarrolloUrbano?: DesarrolloUrbano;
  recursosNaturales?: RecursoNatural[];
  nivelDeforestacion?: NivelDeforestacion;
  riesgos?: RiesgoTerreno[];
  proximity?: Proximity;
  legalStatus?: LegalStatus;
  hidrologia?: 'Pozo'|'Río permanente'|'Río estacional'|'Quebrada'|'Nacimiento'|'Lago'|'Laguna'|'Sin agua';
  vegetacion?: 'Bosque'|'Pasto'|'Cultivo'|'Matorral'|'Sin cobertura'|'Bosque secundario'|'Bosque primario';
  orientacion?: 'Norte'|'Sur'|'Este'|'Oeste'|'Esquina'|'Doble frente';
  liquidez?: 'Muy alta'|'Alta'|'Media'|'Baja'|'Muy baja';
  demanda?: 'Muy alta'|'Alta'|'Media'|'Baja'|'Muy baja';
  oferta?: 'Escasa'|'Normal'|'Alta'|'Excesiva';
  nivelComercial: NivelComercial;
  esquina: boolean;
  cercaniaPrincipal: boolean;
  frenteTerreno?: number;
  fondoTerreno?: number;
  pendiente?: boolean;
  cercaniaComercial?: boolean;
  exposicionComercial?: 'Alta'|'Media'|'Baja';
  riesgoInundacion?: boolean;
  densidadUrbana?: NivelComercial;
  potencialSubdivision?: boolean;
  precioBaseSugerido?: number;
  precioBaseAplicado?: number;
  unidadPrecioBase?: 'USD_M2' | 'USD_MNZ';
  precioBaseFueEditado?: boolean;
  motivoAjustePrecioBase?: string;
  detalleAjustePrecioBase?: string;
  confirmacionValorExtraordinario?: boolean;
}
export interface CasaInput extends TerrenoInput { areaConstruccion: number; habitaciones: '1'|'2'|'3'|'4'|'5'|'6+'; banos: '1'|'2'|'3'|'4'|'5+'; niveles: '1'|'2'|'3'|'4+'; garaje: boolean; patio: boolean; jardin: boolean; estadoConstruccion: 'Excelente'|'Bueno'|'Regular'|'Malo'; acabados: 'Premium'|'Alto'|'Medio'|'Básico'; antiguedad: '0-5'|'6-10'|'11-20'|'20+'; tipoConstruccion: 'Lujo moderno'|'Residencial alta'|'Residencial media'|'Económica'; }

export interface ZonaData { id: string; ciudad: CiudadObjetivo; zona: string; nombre: string; clasificacion: 'A+'|'A'|'B+'|'B'|'C'|'D'; tipoEntorno: EntornoTerreno; factorPlusvalia: number; valorTerrenoM2: number; valorConstruccionM2: number; observacionTecnica: string; }
export interface ResultadoAvaluo { valorTerreno: number; valorConstruccion?: number; valorM2: number; clasificacionZona: string; plusvaliaAplicada: number; coeficientesAplicados: Record<string, number> | CoeficienteAplicado[]; rangoMercado: { minimo: number; maximo: number }; nivelConfianza: 'Muy Alta'|'Alto'|'Medio'|'Baja'|'Base'; valorFinalEstimado: number; valorBase?: number; factorGlobal?: number; areaOriginal?: number; unidadArea?: UnidadArea; areaM2Convertida?: number; areaM2?: number; areaManzanas?: number; valorTerrenoM2?: number; basePriceM2?: number; scaleMultiplier?: number; adjustedPriceM2?: number; lowValue?: number; estimatedValue?: number; highValue?: number; appliedFactors?: CoeficienteAplicado[]; normalizacionAplicada?: boolean; notaNormalizacion?: string; pricePerManzana?: number; basePricePerManzana?: number; baseValueTotal?: number; technicalAdjustmentFactor?: number; ruralSurScaleApplied?: boolean; rangoPorcentaje?: number; indiceLiquidez?: number; tiempoEstimadoVenta?: string; precioRecomendadoPublicacion?: number; precioMinimoNegociacion?: number; precioObjetivoCierre?: number; valorComercial?: number; valorTecnico?: number; nivelDemanda?: string; nivelPlusvalia?: string; potencialCrecimiento?: string; indiceComercializacion?: number; }

export interface ReferenciaBase { fuente: 'territorial' | 'curva_extension' | 'ajuste_manual'; ciudad: string; zona: string; unidad: string; precioBaseSugerido: number | null; precioBaseAplicado: number | null; precioBaseFueEditado: boolean; variacionPorcentual: number; motivoAjuste: string; detalleAjuste: string; confirmacionExtraordinaria: boolean; fechaReferencia: string; }
export interface AvaluoRecord { id?: string; titulo: string; tipoPropiedad: PropertyType; ciudad: CiudadObjetivo; zona: string; unidadArea?: UnidadArea; areaOriginal?: number; areaM2Convertida?: number; createdAt: string; usuarioId: string; caracteristicas: TerrenoInput | CasaInput; coeficientesAplicados: Record<string, number> | CoeficienteAplicado[]; valorBase?: number; valorTerreno: number; valorConstruccion?: number; valorFinal: number; valorM2?: number; rangoMercado: { minimo: number; maximo: number }; nivelConfianza: ResultadoAvaluo['nivelConfianza']; zonaSnapshot: (ZonaData & { curvaAplicada?: unknown; precioSugeridoCalculado?: number | null; valorTerrenoM2Original?: number | null }); referenciaBase?: ReferenciaBase; }
