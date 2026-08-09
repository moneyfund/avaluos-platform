import { useEffect, useState } from 'react';
import { FileText, Home, MapPinned, Trash2 } from 'lucide-react';
import { useTenant } from '../../tenants/TenantContext';
import { deleteTenantAvaluo, subscribeTenantAvaluos } from '../../services/avaluosPersistence.service';
import DownloadAvaluoPdfButton from '../avaluos/components/DownloadAvaluoPdfButton';

const usd = (value: any) => Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const date = (value: any) => {
  const resolved = value?.toDate instanceof Function ? value.toDate() : value?.seconds ? new Date(value.seconds * 1000) : new Date(value || Date.now());
  return resolved.toLocaleDateString('es-NI', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function HistoryPage() {
  const { tenantId, canAdmin } = useTenant();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState('');

  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    const unsubscribe = subscribeTenantAvaluos(tenantId, (items) => {
      setRows(items);
      setLoading(false);
    }, (cause) => {
      console.error(cause);
      setError('No fue posible cargar el historial.');
      setLoading(false);
    });
    return unsubscribe;
  }, [tenantId]);

  const remove = async (avaluo: any) => {
    if (!canAdmin || !window.confirm(`¿Eliminar definitivamente “${avaluo.titulo || 'este avalúo'}”?`)) return;
    setDeleting(avaluo.id);
    setError('');
    try {
      await deleteTenantAvaluo(avaluo);
    } catch (cause) {
      console.error(cause);
      setError('No fue posible eliminar el avalúo.');
    } finally {
      setDeleting('');
    }
  };

  return <main className='history-page'>
    <header className='history-hero'><div><p>REGISTROS DE LA ORGANIZACIÓN</p><h1>Historial de avalúos</h1><span>Los registros de este espacio están aislados por organización.</span></div><strong>{rows.length}</strong></header>
    {error && <div className='terrain-error'>{error}</div>}
    {loading ? <div className='history-empty'>Cargando historial...</div> : !rows.length ? <div className='history-empty'><FileText /><h2>Todavía no hay avalúos guardados</h2><p>Calcula un terreno o una casa y utiliza “Guardar avalúo”.</p></div> : <div className='history-grid'>
      {rows.map((avaluo) => <article className='history-card' key={avaluo.id}>
        <div className='history-card-head'><span>{avaluo.tipoPropiedad === 'casa' ? <Home /> : <MapPinned />}</span><div><small>{avaluo.tipoPropiedad === 'casa' ? 'Casa' : 'Terreno'} · {date(avaluo.createdAt || avaluo.createdAtClient)}</small><h2>{avaluo.titulo || 'Avalúo sin título'}</h2><p>{avaluo.ciudad || '—'} · {avaluo.zona || '—'}</p></div></div>
        <div className='history-value'><small>Valor estimado</small><strong>{usd(avaluo.valorFinal || avaluo.valorFinalEstimado)}</strong></div>
        <div className='history-meta'><span>Evaluador<strong>{avaluo.agenteEvaluador || '—'}</strong></span><span>Creado por<strong>{avaluo.createdByName || avaluo.createdByEmail || '—'}</strong></span></div>
        <div className='history-actions'><DownloadAvaluoPdfButton avaluo={avaluo} />{canAdmin && <button type='button' className='history-delete' disabled={deleting === avaluo.id} onClick={() => remove(avaluo)}><Trash2 />{deleting === avaluo.id ? 'Eliminando...' : 'Eliminar'}</button>}</div>
      </article>)}
    </div>}
  </main>;
}
