import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../auth/AuthContext';

export const DEFAULT_TENANT_ID = 'norvin';

type Membership = {
  role: 'owner' | 'admin' | 'valuer' | 'agent' | 'viewer';
  status: 'active' | 'suspended';
  email?: string;
  displayName?: string;
};

type TenantFeature = 'terrenos' | 'casas' | 'pdf';

type TenantContextValue = {
  tenantId: string | null;
  tenant: any | null;
  membership: Membership | null;
  loading: boolean;
  error: string;
  canWrite: boolean;
  canAdmin: boolean;
  licenseActive: boolean;
  licenseExpired: boolean;
  licenseStatus: string;
  features: Record<TenantFeature, boolean>;
  limits: { maxUsers: number; monthlyAvaluos: number };
  reportConfig: any;
  canUseFeature: (feature: TenantFeature) => boolean;
};

const TenantContext = createContext<TenantContextValue | null>(null);

async function ensureUserProfile(user: any) {
  if (!db) throw new Error('Firestore no está configurado.');
  await setDoc(doc(db, 'users', user.uid), {
    displayName: user.displayName || '',
    email: String(user.email || '').toLowerCase(),
    photoURL: user.photoURL || '',
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

async function loadTenantForUser(user: any, tenantId: string) {
  if (!db || !tenantId) return null;
  const [memberSnap, tenantSnap] = await Promise.all([
    getDoc(doc(db, 'tenants', tenantId, 'members', user.uid)),
    getDoc(doc(db, 'tenants', tenantId)),
  ]);

  if (!memberSnap.exists() || !tenantSnap.exists()) return null;
  const membership = memberSnap.data() as Membership;
  const tenant = { id: tenantSnap.id, ...tenantSnap.data() } as any;
  if (membership.status !== 'active') return null;
  if (tenant.status && tenant.status !== 'active') return null;
  return { tenant, membership };
}

async function resolveAssignedTenant(user: any) {
  if (!db) throw new Error('Firestore no está configurado.');
  await ensureUserProfile(user);

  const mappingSnap = await getDoc(doc(db, 'userTenants', user.uid));
  if (mappingSnap.exists()) {
    const mapping = mappingSnap.data() as any;
    const candidates = [
      mapping.defaultTenantId,
      ...(Array.isArray(mapping.tenantIds) ? mapping.tenantIds : []),
    ].filter(Boolean);

    for (const tenantId of Array.from(new Set(candidates))) {
      const resolved = await loadTenantForUser(user, String(tenantId));
      if (resolved) return resolved;
    }
  }

  // Compatibilidad con el primer tenant creado antes del mapa userTenants.
  return loadTenantForUser(user, DEFAULT_TENANT_ID);
}

function timestampToDate(value: any) {
  if (!value) return null;
  try {
    if (typeof value?.toDate === 'function') return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

function initials(value: string) {
  return String(value || 'AP').split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 3).toUpperCase();
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setTenant(null);
    setMembership(null);
    setError('');
    if (!user) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    resolveAssignedTenant(user)
      .then((resolved) => {
        if (!active) return;
        if (!resolved) {
          setError('Esta cuenta todavía no tiene acceso a una organización activa. Inicia sesión una vez y solicita al administrador que te asigne una empresa.');
          return;
        }
        setTenant(resolved.tenant);
        setMembership(resolved.membership);
      })
      .catch((cause) => {
        console.error(cause);
        if (active) setError('No fue posible cargar la organización. Verifica las reglas de Firebase.');
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [user]);

  const value = useMemo<TenantContextValue>(() => {
    const role = membership?.role;
    const license = tenant?.license || {};
    const branding = tenant?.branding || {};
    const expiresAt = timestampToDate(license.expiresAt);
    const licenseExpired = Boolean(expiresAt && expiresAt.getTime() < Date.now());
    const licenseStatus = String(license.status || tenant?.status || 'active');
    const licenseActive = Boolean(tenant && tenant.status !== 'suspended' && tenant.status !== 'expired' && licenseStatus === 'active' && !licenseExpired);
    const features = {
      terrenos: license.features?.terrenos !== false,
      casas: license.features?.casas !== false,
      pdf: license.features?.pdf !== false,
    };
    const limits = {
      maxUsers: Math.max(1, Number(license.limits?.maxUsers || 10)),
      monthlyAvaluos: Math.max(1, Number(license.limits?.monthlyAvaluos || 200)),
    };
    const reportConfig = {
      organizationName: branding.organizationName || tenant?.name || 'Avalúos Platform',
      shortName: branding.shortName || initials(tenant?.name || tenant?.slug || 'AP'),
      website: branding.website || tenant?.website || '',
      reportTitle: branding.reportTitle || 'Informe Técnico de Avalúo',
      footerText: branding.footerText || 'Documento generado por Avalúos Platform.',
      logoUrl: branding.logoUrl || '',
      primaryColor: branding.primaryColor || '#ffffff',
      secondaryColor: branding.secondaryColor || '#d4af37',
    };

    return {
      tenantId: tenant?.id || null,
      tenant,
      membership,
      loading,
      error,
      canWrite: licenseActive && ['owner', 'admin', 'valuer', 'agent'].includes(role || ''),
      canAdmin: ['owner', 'admin'].includes(role || ''),
      licenseActive,
      licenseExpired,
      licenseStatus,
      features,
      limits,
      reportConfig,
      canUseFeature: (feature: TenantFeature) => licenseActive && features[feature],
    };
  }, [tenant, membership, loading, error]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const value = useContext(TenantContext);
  if (!value) throw new Error('useTenant debe utilizarse dentro de TenantProvider.');
  return value;
}