import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase/config';

const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);

const safeName = (value: string) => String(value || 'logo')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9._-]+/g, '-')
  .replace(/^-+|-+$/g, '');

export async function uploadTenantBrandingLogo(tenantId: string, file: File, previousPath?: string) {
  if (!storage) throw new Error('Firebase Storage no está configurado.');
  if (!tenantId) throw new Error('La organización no es válida.');
  if (!allowedTypes.has(file.type)) throw new Error('El logo debe ser PNG, JPG o WEBP.');
  if (file.size > 2 * 1024 * 1024) throw new Error('El logo no puede superar 2 MB.');

  const path = `tenants/${tenantId}/branding/logo/${Date.now()}-${safeName(file.name)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);

  if (previousPath && previousPath !== path) {
    await deleteObject(ref(storage, previousPath)).catch((error: any) => {
      if (error?.code !== 'storage/object-not-found') console.warn(error);
    });
  }

  return { url, path };
}