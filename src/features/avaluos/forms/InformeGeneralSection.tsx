import { ImagePlus, Trash2, UserRound } from 'lucide-react';
import { useId } from 'react';

const accept = 'image/jpeg,image/jpg,image/png,image/webp';

function UploadField({ label, file, multiple = false, count = 0, onFiles }) {
  const id = useId();
  const files = multiple ? (file || []) : file ? [file] : [];
  return <div className="avaluo-upload-field"><div className="avaluo-upload-label"><span>{label}</span>{multiple && <small>{count}/5</small>}</div>
    <label htmlFor={id} className="avaluo-dropzone"><ImagePlus aria-hidden="true" /><strong>Arrastra o selecciona {multiple ? 'fotografías' : 'una imagen'}</strong><small>JPG, PNG o WEBP · máximo 10 MB</small><input id={id} className="sr-only" type="file" accept={accept} multiple={multiple} onChange={(event) => onFiles(Array.from(event.target.files || []))} /></label>
    {!!files.length && <div className="avaluo-file-list">{files.map((selected, index) => <div key={`${selected.name}-${index}`}><span><strong>{selected.name}</strong><small>{(selected.size / 1024 / 1024).toFixed(2)} MB</small></span><button type="button" aria-label={`Eliminar ${selected.name}`} onClick={() => onFiles(files.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></button></div>)}</div>}
  </div>;
}

export default function InformeGeneralSection({ value, onChange }: { value: any; onChange: (key: string, value: any) => void }) {
  const gallery = value.imagenesAdicionalesFiles || [];
  return <section className="avaluo-report-data" aria-labelledby="report-data-title"><div className="avaluo-card-title"><span><UserRound /></span><div><p>Datos del informe</p><h2 id="report-data-title">Responsable y evidencia fotográfica</h2><small>Las imágenes se mantienen localmente en esta fase; Storage se conectará con el Firebase independiente.</small></div></div>
    <div className="avaluo-report-grid"><label><span>Agente evaluador <b>*</b></span><input value={value.agenteEvaluador || ''} onChange={(event) => onChange('agenteEvaluador', event.target.value)} /></label><label><span>Teléfono del agente <small>Opcional</small></span><input type="tel" value={value.telefonoAgente || ''} onChange={(event) => onChange('telefonoAgente', event.target.value)} /></label>
      <UploadField label="Imagen principal" file={value.imagenPrincipalFile} onFiles={(files) => onChange('imagenPrincipalFile', files[0] || null)} />
      <UploadField label="Fotografías adicionales" multiple file={gallery} count={gallery.length} onFiles={(files) => onChange('imagenesAdicionalesFiles', files.slice(0, 5))} />
    </div></section>;
}
