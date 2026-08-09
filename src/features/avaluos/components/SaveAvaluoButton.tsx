import { useState } from 'react';
import { CheckCircle2, CloudUpload } from 'lucide-react';
import { useAuth } from '../../../auth/AuthContext';
import { useTenant } from '../../../tenants/TenantContext';
import { saveTenantAvaluo } from '../../../services/avaluosPersistence.service';

export default function SaveAvaluoButton({ tipo, form, result }: { tipo: 'terreno' | 'casa'; form: any; result: any }) {
  const { user } = useAuth();
  const { tenantId, canWrite } = useTenant();
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState('');
  const [error, setError] = useState('');

  if (!result || !canWrite) return null;

  const save = async () => {
    if (!user || !tenantId || saving || savedId) return;
    setSaving(true);
    setError('');
    try {
      const id = await saveTenantAvaluo({ tenantId, user, tipo, form, result });
      setSavedId(id);
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar el avalúo.');
    } finally {
      setSaving(false);
    }
  };

  return <div className='avaluo-save-box'>
    <button type='button' className={`avaluo-save-button ${savedId ? 'is-saved' : ''}`} onClick={save} disabled={saving || !!savedId}>
      {savedId ? <CheckCircle2 /> : <CloudUpload />}
      {savedId ? 'Avalúo guardado' : saving ? 'Guardando en Firebase...' : 'Guardar avalúo'}
    </button>
    {savedId && <small>Registro: {savedId}</small>}
    {error && <p className='avaluo-save-error'>{error}</p>}
  </div>;
}
