const money = (value: unknown) => new Intl.NumberFormat('es-NI', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));

export function generateAvaluoAnalysis(avaluo: any) {
  const tipo = avaluo?.tipoPropiedad === 'casa' ? 'La vivienda' : 'El terreno';
  const ciudad = avaluo?.ciudad || 'la ciudad indicada';
  const zona = avaluo?.zona || 'la zona registrada';
  const clasificacion = avaluo?.zonaSnapshot?.clasificacion || avaluo?.caracteristicas?.tipoTerritorio || 'clasificación urbana referencial';
  const entorno = avaluo?.caracteristicas?.entorno || avaluo?.caracteristicas?.tipoEntorno || 'entorno inmobiliario mixto';
  const confianza = avaluo?.nivelConfianza || 'media';
  const rango = avaluo?.rangoMercado ? `entre ${money(avaluo.rangoMercado.minimo)} y ${money(avaluo.rangoMercado.maximo)}` : 'dentro de un rango de mercado razonable';
  const servicios = avaluo?.caracteristicas?.serviciosBasicos;
  const tieneServicios = servicios && Object.values(servicios).some(Boolean);
  const c = avaluo?.caracteristicas || {};
  const premium = ['Premium', 'Alta'].includes(c.calidadConstructiva || c.acabados) || c.cocinaModerna || c.estadoGeneral === 'Excelente';
  const limitado = ['Regular', 'Malo'].includes(c.estadoGeneral || c.estadoConstruccion) || ['Básica', 'Económica', 'Básico'].includes(c.calidadConstructiva || c.acabados);
  const extra = avaluo?.tipoPropiedad === 'casa'
    ? premium
      ? ' La vivienda presenta alta competitividad por su estado, calidad constructiva, acabados y amenidades registradas.'
      : limitado
        ? ' La vivienda muestra factores que pueden limitar su competitividad por estado, mantenimiento o acabados que requieren inversión correctiva.'
        : ' La construcción aporta valor por área, estado, acabados y funcionalidad habitacional, elementos que influyen en la liquidez comercial del activo.'
    : ' La ponderación integra suelo, topografía, acceso, uso potencial y desarrollo urbano, factores críticos para estimar aprovechamiento y absorción de mercado.';

  return `${tipo} evaluado se ubica en ${zona}, ${ciudad}, con ${clasificacion} y un ${entorno}. ${tieneServicios ? 'La presencia de servicios básicos fortalece su atractivo comercial y reduce riesgos operativos.' : 'La disponibilidad de servicios y condiciones de acceso debe validarse en campo para operaciones definitivas.'}${extra} El valor estimado de ${money(avaluo?.valorFinal)} se posiciona ${rango}, con nivel de confianza ${confianza}, por lo que funciona como referencia técnica preliminar para compra, venta, negociación o análisis patrimonial.`;
}
