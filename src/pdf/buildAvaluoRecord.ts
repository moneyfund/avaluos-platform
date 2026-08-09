export function buildAvaluoRecord(tipoPropiedad: 'terreno' | 'casa', form: any, result: any, reportConfig?: any) {
  return {
    id: `preview-${Date.now()}`,
    tipoPropiedad,
    titulo: form?.titulo || (tipoPropiedad === 'casa' ? 'Avalúo de casa' : 'Avalúo de terreno'),
    ciudad: form?.ciudad,
    zona: form?.zona,
    agenteEvaluador: form?.agenteEvaluador,
    telefonoAgente: form?.telefonoAgente,
    createdAt: new Date().toISOString(),
    caracteristicas: { ...form },
    zonaSnapshot: form?.zonaData ? { ...form.zonaData } : null,
    imagenPrincipalFile: form?.imagenPrincipalFile || null,
    imagenesAdicionalesFiles: form?.imagenesAdicionalesFiles || [],
    reportConfig: reportConfig ? { ...reportConfig } : null,
    ...result,
    valorFinal: result?.valorFinalEstimado ?? result?.estimatedValue ?? 0,
    valorFinalEstimado: result?.valorFinalEstimado ?? result?.estimatedValue ?? 0,
    coeficientesAplicados: result?.coeficientesAplicados || result?.appliedFactors || [],
  };
}