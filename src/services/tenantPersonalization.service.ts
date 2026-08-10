import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export type PortalTheme = {
  accentColor: string;
  pageBackground: string;
  sidebarBackground: string;
  topbarBackground: string;
  cardBackground: string;
  navActiveBackground: string;
  textColor: string;
};

export async function saveTenantPortalTheme(tenantId: string, theme: PortalTheme) {
  if (!db) throw new Error('Firestore no está configurado.');
  if (!tenantId) throw new Error('No se pudo identificar la organización.');

  await updateDoc(doc(db, 'tenants', tenantId), {
    'branding.portalTheme': theme,
    updatedAt: serverTimestamp(),
  });
}
