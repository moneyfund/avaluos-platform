export function normalizeHostname(hostname: string) {
  return String(hostname || '').trim().toLowerCase().replace(/^www\./, '').replace(/:\d+$/, '');
}

export function getTenantResolutionHint() {
  const hostname = typeof window !== 'undefined' ? normalizeHostname(window.location.hostname) : '';
  const defaultTenantId = import.meta.env.VITE_DEFAULT_TENANT_ID || '';

  return {
    hostname,
    defaultTenantId,
    isLocal: hostname === 'localhost' || hostname === '127.0.0.1',
  };
}
