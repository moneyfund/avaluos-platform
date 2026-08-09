import { useState } from 'react';
import { Download, KeyRound, LoaderCircle } from 'lucide-react';
import { exportAvaluoToPdf } from '../../../pdf/exportAvaluoPdf';
import { useTenant } from '../../../tenants/TenantContext';

export default function DownloadAvaluoPdfButton({ avaluo }: { avaluo: any }) {
  const { canUseFeature } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pdfEnabled = canUseFeature('pdf');

  const download = async () => {
    if (!avaluo || loading || !pdfEnabled) return;
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
    <button type='button' className='pdf-download-button' onClick={download} disabled={loading || !pdfEnabled} title={!pdfEnabled ? 'El módulo PDF no está incluido en esta licencia.' : undefined}>
      {!pdfEnabled ? <KeyRound /> : loading ? <LoaderCircle className='pdf-spin' /> : <Download />}
      {!pdfEnabled ? 'PDF no habilitado' : loading ? 'Generando informe…' : 'Descargar informe PDF'}
    </button>
    {error && <p className='pdf-download-error'>{error}</p>}
  </div>;
}