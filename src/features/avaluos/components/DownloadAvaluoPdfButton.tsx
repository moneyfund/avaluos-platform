import { useState } from 'react';
import { Download, LoaderCircle } from 'lucide-react';
import { exportAvaluoToPdf } from '../../../pdf/exportAvaluoPdf';

export default function DownloadAvaluoPdfButton({ avaluo }: { avaluo: any }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    if (!avaluo || loading) return;
    setLoading(true);
    setError('');
    try {
      await exportAvaluoToPdf(avaluo);
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : 'No fue posible generar el PDF.');
    } finally {
      setLoading(false);
    }
  };

  return <div className='pdf-download-wrap'>
    <button type='button' className='pdf-download-button' onClick={download} disabled={loading}>
      {loading ? <LoaderCircle className='pdf-spin' /> : <Download />}
      {loading ? 'Generando informe…' : 'Descargar informe PDF'}
    </button>
    {error && <p className='pdf-download-error'>{error}</p>}
  </div>;
}
