import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export type PlatformTenant = {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'expired';
  plan?: string;
  branding?: Record<string, any>;
  license?: Record<string, any>;
  website?: string;
  domain?: string;
  email?: string;
  phone?: string;
  membersCount?: number;
  createdAt?: any;
  updatedAt?: any;
};

export type PlatformMember = {
  uid: string;
  role: 'owner' | 'admin' | 'valuer' | 'agent' | 'viewer';
  status: 'active' | 'suspended';
  email?: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
};

export type PlatformDashboardSnapshot = {
  tenants: PlatformTenant[];
  avaluos: any[];
  users: any[];
};

const emptySnapshot: PlatformDashboardSnapshot = { tenants: [], avaluos: [], users: [] };

export function subscribePlatformDashboard(
  onData: (snapshot: PlatformDashboardSnapshot) => void,
  onError: (error: Error) => void,
) {
  if (!db) {
    onError(new Error('Firestore no está configurado.'));
    return () => undefined;
  }

  const state: PlatformDashboardSnapshot = { ...emptySnapshot };
  const emit = () => onData({ ...state });

  const unsubTenants = onSnapshot(collection(db, 'tenants'), (snapshot) => {
    state.tenants = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() } as PlatformTenant))
      .sort((a, b) => String(a.name || a.slug).localeCompare(String(b.name || b.slug), 'es'));
    emit();
  }, onError);

  const unsubAvaluos = onSnapshot(collection(db, 'avaluos'), (snapshot) => {
    state.avaluos = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    emit();
  }, onError);

  const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
    state.users = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a: any, b: any) => String(a.displayName || a.email).localeCompare(String(b.displayName || b.email), 'es'));
    emit();
  }, onError);

  return () => {
    unsubTenants();
    unsubAvaluos();
    unsubUsers();
  };
}

export function subscribeTenantMembers(
  tenantId: string,
  onData: (members: PlatformMember[]) => void,
  onError: (error: Error) => void,
) {
  if (!db || !tenantId) return () => undefined;
  return onSnapshot(collection(db, 'tenants', tenantId, 'members'), (snapshot) => {
    const members = snapshot.docs
      .map((item) => ({ uid: item.id, ...item.data() } as PlatformMember))
      .sort((a, b) => String(a.displayName || a.email).localeCompare(String(b.displayName || b.email), 'es'));
    onData(members);
  }, onError);
}

const normalizeSlug = (value: string) => String(value || '')
  .trim()
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .replace(/-{2,}/g, '-');

const normalizeDomain = (value: string) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/^https?:\/\//, '')
  .replace(/\/$/, '');

export async function createPlatformTenant(input: any, createdBy: string) {
  if (!db) throw new Error('Firestore no está configurado.');

  const slug = normalizeSlug(input.slug || input.name);
  if (!slug || slug.length < 2) throw new Error('Define un identificador válido para la organización.');
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error('El identificador solo puede usar letras, números y guiones.');

  const tenantRef = doc(db, 'tenants', slug);
  if ((await getDoc(tenantRef)).exists()) throw new Error('Ya existe una organización con ese identificador.');

  const status = input.status || 'active';
  const plan = input.plan || 'professional';
  const domain = normalizeDomain(input.domain);

  await setDoc(tenantRef, {
    name: String(input.name || '').trim(),
    slug,
    status,
    plan,
    website: String(input.website || '').trim(),
    domain,
    email: String(input.email || '').trim().toLowerCase(),
    phone: String(input.phone || '').trim(),
    membersCount: 0,
    branding: {
      organizationName: String(input.name || '').trim(),
      shortName: String(input.shortName || '').trim(),
      primaryColor: input.primaryColor || '#ffffff',
      secondaryColor: input.secondaryColor || '#d4af37',
      website: String(input.website || '').trim(),
      email: String(input.email || '').trim().toLowerCase(),
      phone: String(input.phone || '').trim(),
      footerText: input.footerText || 'Avalúos profesionales',
      reportTitle: input.reportTitle || 'Informe técnico de avalúo',
      logoUrl: String(input.logoUrl || '').trim(),
    },
    license: {
      status,
      plan,
      startsAt: serverTimestamp(),
      expiresAt: null,
      limits: {
        maxUsers: plan === 'starter' ? 3 : plan === 'enterprise' ? 50 : 10,
        monthlyAvaluos: plan === 'starter' ? 25 : plan === 'enterprise' ? 1000 : 200,
      },
      features: {
        terrenos: true,
        casas: true,
        pdf: true,
      },
    },
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (domain) {
    await setDoc(doc(db, 'tenantDomains', domain), {
      tenantId: slug,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return slug;
}

export async function updatePlatformTenantStatus(tenantId: string, status: PlatformTenant['status']) {
  if (!db) throw new Error('Firestore no está configurado.');
  await updateDoc(doc(db, 'tenants', tenantId), {
    status,
    'license.status': status,
    updatedAt: serverTimestamp(),
  });
}

export async function updatePlatformTenantProfile(tenantId: string, input: any) {
  if (!db) throw new Error('Firestore no está configurado.');
  const tenantRef = doc(db, 'tenants', tenantId);
  const snapshot = await getDoc(tenantRef);
  if (!snapshot.exists()) throw new Error('La organización ya no existe.');

  const current = snapshot.data() as any;
  const previousDomain = normalizeDomain(current.domain || '');
  const nextDomain = normalizeDomain(input.domain || '');
  const branding = current.branding || {};

  await updateDoc(tenantRef, {
    name: String(input.name || current.name || '').trim(),
    website: String(input.website || '').trim(),
    domain: nextDomain,
    email: String(input.email || '').trim().toLowerCase(),
    phone: String(input.phone || '').trim(),
    branding: {
      ...branding,
      organizationName: String(input.name || current.name || '').trim(),
      shortName: String(input.shortName || '').trim(),
      primaryColor: input.primaryColor || branding.primaryColor || '#ffffff',
      secondaryColor: input.secondaryColor || branding.secondaryColor || '#d4af37',
      website: String(input.website || '').trim(),
      email: String(input.email || '').trim().toLowerCase(),
      phone: String(input.phone || '').trim(),
      footerText: String(input.footerText || branding.footerText || 'Avalúos profesionales').trim(),
      reportTitle: String(input.reportTitle || branding.reportTitle || 'Informe técnico de avalúo').trim(),
      logoUrl: String(input.logoUrl ?? branding.logoUrl ?? '').trim(),
    },
    updatedAt: serverTimestamp(),
  });

  if (previousDomain && previousDomain !== nextDomain) {
    await deleteDoc(doc(db, 'tenantDomains', previousDomain));
  }
  if (nextDomain) {
    await setDoc(doc(db, 'tenantDomains', nextDomain), {
      tenantId,
      status: 'active',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }, { merge: true });
  }
}

export async function updatePlatformTenantLicense(tenantId: string, input: any) {
  if (!db) throw new Error('Firestore no está configurado.');
  const tenantRef = doc(db, 'tenants', tenantId);
  const tenantSnap = await getDoc(tenantRef);
  if (!tenantSnap.exists()) throw new Error('La organización ya no existe.');

  const currentLicense = (tenantSnap.data() as any).license || {};
  const status = input.status || 'active';
  const plan = input.plan || 'professional';
  const expiresAt = input.expiresAt
    ? Timestamp.fromDate(new Date(`${input.expiresAt}T23:59:59`))
    : null;

  await updateDoc(tenantRef, {
    status,
    plan,
    license: {
      ...currentLicense,
      status,
      plan,
      startsAt: currentLicense.startsAt || serverTimestamp(),
      expiresAt,
      limits: {
        maxUsers: Math.max(1, Number(input.maxUsers || 1)),
        monthlyAvaluos: Math.max(1, Number(input.monthlyAvaluos || 1)),
      },
      features: {
        terrenos: input.terrenos !== false,
        casas: input.casas !== false,
        pdf: input.pdf !== false,
      },
    },
    updatedAt: serverTimestamp(),
  });
}

export async function addPlatformTenantMember(tenantId: string, user: any, role: PlatformMember['role']) {
  if (!db) throw new Error('Firestore no está configurado.');
  if (!user?.id) throw new Error('Selecciona un usuario registrado.');

  const memberRef = doc(db, 'tenants', tenantId, 'members', user.id);
  const existingMember = await getDoc(memberRef);
  const mappingRef = doc(db, 'userTenants', user.id);
  const mappingSnap = await getDoc(mappingRef);
  const currentMapping = mappingSnap.exists() ? mappingSnap.data() as any : {};
  const currentTenantIds = Array.isArray(currentMapping.tenantIds) ? currentMapping.tenantIds : [];
  const tenantIds = Array.from(new Set([...currentTenantIds, tenantId]));

  await setDoc(memberRef, {
    role,
    status: 'active',
    email: String(user.email || '').toLowerCase(),
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    createdAt: existingMember.exists() ? existingMember.data().createdAt || serverTimestamp() : serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await setDoc(mappingRef, {
    uid: user.id,
    email: String(user.email || '').toLowerCase(),
    displayName: user.displayName || '',
    tenantIds,
    defaultTenantId: currentMapping.defaultTenantId || tenantId,
    updatedAt: serverTimestamp(),
    createdAt: currentMapping.createdAt || serverTimestamp(),
  }, { merge: true });

  if (!existingMember.exists()) {
    await updateDoc(doc(db, 'tenants', tenantId), {
      membersCount: increment(1),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function updatePlatformTenantMember(
  tenantId: string,
  uid: string,
  patch: Partial<Pick<PlatformMember, 'role' | 'status'>>,
) {
  if (!db) throw new Error('Firestore no está configurado.');
  await updateDoc(doc(db, 'tenants', tenantId, 'members', uid), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
}

export async function removePlatformTenantMember(tenantId: string, uid: string) {
  if (!db) throw new Error('Firestore no está configurado.');
  const memberRef = doc(db, 'tenants', tenantId, 'members', uid);
  const memberSnap = await getDoc(memberRef);
  if (!memberSnap.exists()) return;

  await deleteDoc(memberRef);

  const mappingRef = doc(db, 'userTenants', uid);
  const mappingSnap = await getDoc(mappingRef);
  if (mappingSnap.exists()) {
    const mapping = mappingSnap.data() as any;
    const tenantIds = (Array.isArray(mapping.tenantIds) ? mapping.tenantIds : []).filter((id: string) => id !== tenantId);
    const defaultTenantId = mapping.defaultTenantId === tenantId ? (tenantIds[0] || null) : (mapping.defaultTenantId || tenantIds[0] || null);
    await setDoc(mappingRef, { tenantIds, defaultTenantId, updatedAt: serverTimestamp() }, { merge: true });
  }

  const tenantRef = doc(db, 'tenants', tenantId);
  const tenantSnap = await getDoc(tenantRef);
  if (tenantSnap.exists()) {
    const currentCount = Number((tenantSnap.data() as any).membersCount || 0);
    await updateDoc(tenantRef, {
      membersCount: Math.max(0, currentCount - 1),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function deletePlatformTenantDomain(domain?: string) {
  if (!db || !domain) return;
  await deleteDoc(doc(db, 'tenantDomains', normalizeDomain(domain)));
}
