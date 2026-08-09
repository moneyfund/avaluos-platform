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

// Neutral fallback only. Normal app flows inject the active tenant branding.
export const DEFAULT_REPORT_CONFIG: ReportConfig = {
  organizationName: 'AVALÚOS PLATFORM',
  shortName: 'AP',
  website: '',
  reportTitle: 'Informe Técnico de Avalúo',
  footerText: 'Documento generado por Avalúos Platform.',
  primaryColor: '#ffffff',
  secondaryColor: '#d4af37',
};

export const resolveReportConfig = (avaluo: any): ReportConfig => ({
  ...DEFAULT_REPORT_CONFIG,
  ...(avaluo?.reportConfig || {}),
});