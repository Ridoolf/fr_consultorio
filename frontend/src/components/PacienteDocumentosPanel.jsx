import { useEffect, useState, useRef } from 'react';
import { documentosAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';

function obtenerExtension(url) {
  if (!url) return 'DOC';
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'PDF';
  if (['jpg', 'jpeg'].includes(ext)) return 'JPG';
  if (ext === 'png') return 'PNG';
  return ext?.toUpperCase() || 'DOC';
}

function PacienteDocumentosPanel({ pacienteId }) {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [accionId, setAccionId] = useState(null);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const cargarDocumentos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await documentosAPI.getByPaciente(pacienteId);
      setDocumentos(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los documentos.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (pacienteId) cargarDocumentos();
  }, [pacienteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!archivo || !titulo.trim()) return;
    setSubiendo(true);
    setError(null);
    const formData = new FormData();
    formData.append('paciente', pacienteId);
    formData.append('titulo', titulo.trim());
    formData.append('archivo', archivo);
    try {
      await documentosAPI.create(formData);
      setTitulo('');
      setArchivo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      showToast('Documento subido', 'success');
      await cargarDocumentos();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo subir el archivo.'));
    } finally {
      setSubiendo(false);
    }
  };

  const handleDelete = async (docId) => {
    setAccionId(docId);
    try {
      await documentosAPI.delete(docId);
      showToast('Documento eliminado', 'success');
      await cargarDocumentos();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo eliminar.'), 'error');
    } finally {
      setAccionId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="form-field">
          <label className="form-label">Título</label>
          <input type="text" className="form-input" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Historia clínica, Radiografía..." />
        </div>
        <div className="form-field">
          <label className="form-label">Archivo (PDF, JPG, PNG — máx. 10 MB)</label>
          <input ref={fileInputRef} type="file" className="form-input" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setArchivo(e.target.files[0] || null)} />
        </div>
        {subiendo && (
          <div className="upload-progress"><div className="upload-progress-bar" /></div>
        )}
        <Button type="submit" variant="primary" disabled={subiendo || !archivo || !titulo.trim()}>
          {subiendo ? 'Subiendo...' : 'Subir documento'}
        </Button>
      </form>

      {cargando ? (
        <Spinner />
      ) : documentos.length === 0 ? (
        <EmptyState icon="📄" title="Sin documentos" description="Subí el primer archivo con el formulario." />
      ) : (
        documentos.map((doc) => (
          <div key={doc.id} className="data-card">
            <div className="data-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-principal)' }}>{obtenerExtension(doc.archivo)}</span>
                <div>
                  <div className="data-card-title">{doc.titulo}</div>
                  <div className="data-card-meta">{doc.fecha}</div>
                </div>
              </div>
              {!doc.archivo_disponible && <Badge variant="warning">Re-subir archivo</Badge>}
            </div>
            <div className="data-card-actions">
              {doc.archivo_disponible ? (
                <a href={doc.archivo} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="primary">Ver / descargar</Button>
                </a>
              ) : (
                <span className="data-card-meta">Archivo no disponible — volvé a subirlo</span>
              )}
              <Button size="sm" variant="danger" disabled={accionId === doc.id} onClick={() => setConfirmDelete(doc)}>
                Eliminar
              </Button>
            </div>
          </div>
        ))
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar documento"
        message={`¿Eliminar "${confirmDelete?.titulo}"?`}
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
      />
    </div>
  );
}

export default PacienteDocumentosPanel;
