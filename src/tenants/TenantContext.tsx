import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../auth/AuthContext';

export const DEFAULT_TENANT_ID = 'norvin';
const BOOTSTRAP_OWNER_EMAIL = 'norvingarcia220@gmail.com';

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

async function ensureBootstrapTenant(user: any) {
  if (!db) throw new Error('Firestore no está configurado.');

  await setDoc(doc(db, 'users', user.uid), {
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    updatedAt: serverTimestamp(),
  }, { merge: true });

  const memberRef = doc(db, 'tenants', DEFAULT_TENANT_ID, 'members', user.uid);
  let memberSnap = await getDoc(memberRef);

  if (!memberSnap.exists()) {
    if (String(user.email || '').toLowerCase() !== BOOTSTRAP_OWNER_EMAIL) return null;

    await setDoc(memberRef, {
      role: 'owner',
      status: 'active',
      email: user.email || '',
      displayName: user.displayName || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(db, 'tenants', DEFAULT_TENANT_ID), {
      name: 'Norvin',
      slug: DEFAULT_TENANT_ID,
      status: 'active',
      branding: {
        organizationName: 'Norvin García',
        primaryColor: '#0b1728',
        secondaryColor: '#d6b75d',
      },
      license: {
        status: 'active',
        plan: 'professional',
      },
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    memberSnap = await getDoc(memberRef);
  }

  if (!memberSnap.exists() || memberSnap.data().status !== 'active') return null;
  const tenantSnap = await getDoc(doc(db, 'tenants', DEFAULT_TENANT_ID));
  if (!tenantSnap.exists()) throw new Error('La organización asignada no existe.');

  return {
    tenant: { id: tenantSnap.id, ...tenantSnap.data() },
    membership: memberSnap.data() as Membership,
  };
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
    ensureBootstrapTenant(user)
      .then((resolved) => {
        if (!active) return;
        if (!resolved) {
          setError('Esta cuenta todavía no tiene acceso a una organización activa.');
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
