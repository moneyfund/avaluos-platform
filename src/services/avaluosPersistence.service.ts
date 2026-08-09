import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { buildAvaluoRecord } from '../pdf/buildAvaluoRecord';

const safeName = (value: string) => String(value || 'imagen').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');

const cleanForFirestore = (value: any): any => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof File !== 'undefined' && value instanceof File) return undefined;
  if (Array.isArray(value)) return value.map(cleanForFirestore).filter((item) => item !== undefined);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cleanForFirestore(item)]).filter(([, item]) => item !== undefined));
  }
  return value;
};

async function uploadEvidence(tenantId: string, avaluoId: string, form: any) {
  if (!storage) throw new Error('Firebase Storage no está configurado.');

  const uploaded: { principalUrl: string; galleryUrls: string[]; storagePaths: string[] } = {
    principalUrl: '', galleryUrls: [], storagePaths: [],
  };

  if (form?.imagenPrincipalFile instanceof File) {
    const path = `tenants/${tenantId}/avaluos/${avaluoId}/principal/${Date.now()}-${safeName(form.imagenPrincipalFile.name)}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, form.imagenPrincipalFile, { contentType: form.imagenPrincipalFile.type });
    uploaded.principalUrl = await getDownloadURL(storageRef);
    uploaded.storagePaths.push(path);
  }

  for (const [index, file] of (form?.imagenesAdicionalesFiles || []).slice(0, 5).entries()) {
    if (!(file instanceof File)) continue;
    const path = `tenants/${tenantId}/avaluos/${avaluoId}/galeria/${index + 1}-${Date.now()}-${safeName(file.name)}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, { contentType: file.type });
    uploaded.galleryUrls.push(await getDownloadURL(storageRef));
    uploaded.storagePaths.push(path);
  }

  return uploaded;
}

export async function saveTenantAvaluo({ tenantId, user, tipo, form, result }: any) {
  if (!db || !storage) throw new Error('Firebase no está configurado completamente.');
  if (!tenantId || !user?.uid) throw new Error('No existe una organización o usuario válido.');

  const avaluoRef = doc(collection(db, 'avaluos'));
  const baseRecord = buildAvaluoRecord(tipo, form, result);
  const sanitized = cleanForFirestore(baseRecord);
  delete sanitized.id;
  delete sanitized.imagenPrincipalFile;
  delete sanitized.imagenesAdicionalesFiles;
  if (sanitized.caracteristicas) {
    delete sanitized.caracteristicas.imagenPrincipalFile;
    delete sanitized.caracteristicas.imagenesAdicionalesFiles;
  }

  await setDoc(avaluoRef, {
    ...sanitized,
    tenantId,
    createdBy: user.uid,
    createdByName: user.displayName || '',
    createdByEmail: user.email || '',
    createdAt: serverTimestamp(),
    createdAtClient: new Date().toISOString(),
    updatedAt: serverTimestamp(),
    status: 'saving-images',
    imagenPrincipalUrl: '',
    imagenesAdicionales: [],
    storagePaths: [],
  });

  try {
    const evidence = await uploadEvidence(tenantId, avaluoRef.id, form);
    await updateDoc(avaluoRef, {
      imagenPrincipalUrl: evidence.principalUrl,
      imagenesAdicionales: evidence.galleryUrls,
      storagePaths: evidence.storagePaths,
      status: 'complete',
      updatedAt: serverTimestamp(),
    });
    return avaluoRef.id;
  } catch (error) {
    await updateDoc(avaluoRef, { status: 'image-error', updatedAt: serverTimestamp() }).catch(() => undefined);
    throw error;
  }
}

export function subscribeTenantAvaluos(tenantId: string, onData: (rows: any[]) => void, onError: (error: Error) => void) {
  if (!db) return () => undefined;
  const q = query(collection(db, 'avaluos'), where('tenantId', '==', tenantId));
  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    rows.sort((a: any, b: any) => {
      const aTime = a.createdAt?.seconds || Date.parse(a.createdAtClient || '') / 1000 || 0;
      const bTime = b.createdAt?.seconds || Date.parse(b.createdAtClient || '') / 1000 || 0;
      return bTime - aTime;
    });
    onData(rows);
  }, onError);
}

export async function deleteTenantAvaluo(avaluo: any) {
  if (!db || !storage) throw new Error('Firebase no está configurado completamente.');
  for (const path of (avaluo?.storagePaths || [])) {
    await deleteObject(ref(storage, path)).catch((error: any) => {
      if (error?.code !== 'storage/object-not-found') throw error;
    });
  }
  await deleteDoc(doc(db, 'avaluos', avaluo.id));
}
