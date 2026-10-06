import { BadgeCheck, ImagePlus, Trash2, UserRound } from 'lucide-react';
import { useId } from 'react';

const accept = 'image/jpeg,image/jpg,image/png,image/webp';

function UploadField({ label, file, multiple = false, count = 0, onFiles }) {
  const id = useId();
  const files = multiple ? (file || []) : file ? [file] : [];
  const status = files.length ? (multiple ? files.length + ' archivos' : 'Imagen cargada') : 'Pendiente';

  return <div className='avaluo-upload-field'>
    <div className='avaluo-upload-label'>
      <span><strong>{label}</strong><small>{multiple ? 'Hasta 5 fotografías del inmueble' : 'Portada visual del expediente'}</small></span>
      <em className={files.length ? 'is-ready' : ''}>{status}</em>
    </div>
    <label htmlFor={id} className='avaluo-dropzone'>
      <span className='avaluo-dropzone-icon'><ImagePlus aria-hidden='true' /></span>
      <strong>{multiple ? 'Agregar evidencia fotográfica' : 'Seleccionar imagen principal'}</strong>
      <small>JPG, PNG o WEBP · máximo 10 MB por archivo</small>
      <b>{multiple ? 'Seleccionar fotografías' : 'Seleccionar imagen'}</b>
      <input id={id} className='sr-only' type='file' accept={accept} multiple={multiple} onChange={(event) => onFiles(Array.from(event.target.files || []))} />
    </label>
    {!!files.length && <div className='avaluo-file-list'>{files.map((selected, index) => <div key={selected.name + '-' + index}>
      <span className='avaluo-file-status'><BadgeCheck /></span>
      <span className='avaluo-file-copy'><strong>{selected.name}</strong><small>{(selected.size / 1024 / 1024).toFixed(2)} MB · listo para guardar</small></span>
      <button type='button' aria-label={'Eliminar ' + selected.name} onClick={() => onFiles(files.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></button>
    </div>)}</div>}
  </div>;
}

export default function InformeGeneralSection({ value, onChange }: { value: any; onChange: (key: string, value: any) => void }) {
  const gallery = value.imagenesAdicionalesFiles || [];
  const evidenceCount = gallery.length + (value.imagenPrincipalFile ? 1 : 0);

  return <section className='avaluo-report-data' aria-labelledby='report-data-title'>
    <div className='avaluo-card-title'>
      <span><UserRound /></span>
      <div><p>Identificación del expediente</p><h2 id='report-data-title'>Responsable y evidencia</h2><small>Estos datos acompañan el informe técnico y quedan vinculados al registro de la organización.</small></div>
      <em>{evidenceCount ? evidenceCount + ' evidencia(s)' : 'Sin evidencia'}</em>
    </div>

    <div className='avaluo-report-grid'>
      <label className='avaluo-input-card'><span>Agente evaluador <b>*</b><small>Nombre que aparecerá en el expediente</small></span><input placeholder='Nombre completo' value={value.agenteEvaluador || ''} onChange={(event) => onChange('agenteEvaluador', event.target.value)} /></label>
      <label className='avaluo-input-card'><span>Teléfono del agente <small>Opcional</small></span><input type='tel' placeholder='+505 0000 0000' value={value.telefonoAgente || ''} onChange={(event) => onChange('telefonoAgente', event.target.value)} /></label>
      <UploadField label='Imagen principal' file={value.imagenPrincipalFile} onFiles={(files) => onChange('imagenPrincipalFile', files[0] || null)} />
      <UploadField label='Fotografías adicionales' multiple file={gallery} count={gallery.length} onFiles={(files) => onChange('imagenesAdicionalesFiles', files.slice(0, 5))} />
    </div>
  </section>;
}
