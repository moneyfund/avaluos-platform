export type ReportConfig = {
  organizationName: string;
  shortName: string;
  website: string;
  reportTitle: string;
  footerText: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

// Baseline visual identity preserved from the current production reports.
// This will become tenant-configurable when the multi-tenant layer is introduced.
export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  organizationName: 'DIAMANTES REALTY GROUP',
  shortName: 'DRG',
  website: 'www.diamantesrealtygroup.com',
  reportTitle: 'Informe Técnico de Avalúo',
  footerText: 'Documento generado automáticamente por el Sistema Profesional de Avalúos Inmobiliarios.',
  primaryColor: '#991b1b',
  secondaryColor: '#111827',
};

export const resolveReportConfig = (avaluo: any): ReportConfig => ({
  ...DEFAULT_REPORT_CONFIG,
  ...(avaluo?.reportConfig || {}),
});
