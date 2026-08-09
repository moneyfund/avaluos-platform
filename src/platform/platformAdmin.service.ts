import { collection, deleteDoc, doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
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
    state.users = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    emit();
  }, onError);

  return () => {
    unsubTenants();
    unsubAvaluos();
    unsubUsers();
  };
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
    email: String(input.email || '').trim(),
    phone: String(input.phone || '').trim(),
    membersCount: 0,
    branding: {
      organizationName: String(input.name || '').trim(),
      shortName: String(input.shortName || '').trim(),
      primaryColor: input.primaryColor || '#0b1728',
      secondaryColor: input.secondaryColor || '#d6b75d',
      website: String(input.website || '').trim(),
      email: String(input.email || '').trim(),
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

export async function deletePlatformTenantDomain(domain?: string) {
  if (!db || !domain) return;
  await deleteDoc(doc(db, 'tenantDomains', normalizeDomain(domain)));
}
