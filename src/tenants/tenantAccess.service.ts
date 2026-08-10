import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

function normalizedEmail(user: any) {
  return String(user?.email || '').trim().toLowerCase();
}

export async function claimTenantAccess(user: any, tenantId: string) {
  if (!db || !user?.uid || !tenantId) return false;

  const email = normalizedEmail(user);
  if (!email) return false;

  const memberRef = doc(db, 'tenants', tenantId, 'members', user.uid);
  const existingMember = await getDoc(memberRef);
  if (existingMember.exists()) return true;

  let role = '';
  let inviteRef: any = null;

  // Invitación explícita por correo (preparado para el flujo multiusuario).
  try {
    inviteRef = doc(db, 'tenants', tenantId, 'invites', email);
    const inviteSnap = await getDoc(inviteRef);
    if (inviteSnap.exists()) {
      const invite = inviteSnap.data() as any;
      if (invite.status === 'active' && String(invite.email || '').toLowerCase() === email) {
        role = String(invite.role || 'agent');
      }
    }
  } catch {
    // Si aún no existen reglas de invitaciones, se intenta el propietario principal.
  }

  // Bootstrap del primer propietario: el email institucional configurado por
  // Platform Admin puede reclamar owner en su primer acceso.
  if (!role) {
    try {
      const tenantSnap = await getDoc(doc(db, 'tenants', tenantId));
      if (tenantSnap.exists()) {
        const tenant = tenantSnap.data() as any;
        if (String(tenant.email || '').trim().toLowerCase() === email) role = 'owner';
      }
    } catch {
      return false;
    }
  }

  if (!['owner', 'admin', 'valuer', 'agent', 'viewer'].includes(role)) return false;

  await setDoc(memberRef, {
    role,
    status: 'active',
    email,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  const mappingRef = doc(db, 'userTenants', user.uid);
  const mappingSnap = await getDoc(mappingRef);
  const current = mappingSnap.exists() ? mappingSnap.data() as any : {};
  const tenantIds = Array.from(new Set([
    ...(Array.isArray(current.tenantIds) ? current.tenantIds : []),
    tenantId,
  ]));

  await setDoc(mappingRef, {
    uid: user.uid,
    email,
    displayName: user.displayName || '',
    tenantIds,
    defaultTenantId: current.defaultTenantId || tenantId,
    createdAt: current.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  if (inviteRef) {
    try {
      await deleteDoc(inviteRef);
    } catch {
      // La membresía ya quedó creada; una invitación residual no bloquea el acceso.
    }
  }

  return true;
}
