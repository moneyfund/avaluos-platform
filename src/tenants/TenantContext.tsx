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

type TenantContextValue = {
  tenantId: string | null;
  tenant: any | null;
  membership: Membership | null;
  loading: boolean;
  error: string;
  canWrite: boolean;
  canAdmin: boolean;
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
    return {
      tenantId: tenant?.id || null,
      tenant,
      membership,
      loading,
      error,
      canWrite: ['owner', 'admin', 'valuer', 'agent'].includes(role || ''),
      canAdmin: ['owner', 'admin'].includes(role || ''),
    };
  }, [tenant, membership, loading, error]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const value = useContext(TenantContext);
  if (!value) throw new Error('useTenant debe utilizarse dentro de TenantProvider.');
  return value;
}
