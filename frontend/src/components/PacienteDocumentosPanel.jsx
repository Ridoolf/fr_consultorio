import { useEffect, useState } from 'react';
import { documentosAPI } from '../services/api';

function obtenerExtension(archivoUrl) {
  if (!archivoUrl) return 'DOC';
  // quita parámetros tipo ?x=...
  const sinQuery = archivoUrl.split('?')[0];
  const partes = sinQuery.split('.');
  if (partes.length < 2) return 'DOC';
  const ext = partes[partes.length - 1].toLowerCase();

  if (ext === 'pdf') return 'PDF';
  if (['jpg', 'jpeg'].includes(ext)) return 'JPG';
  if (ext === 'png') return 'PNG';
  if (['doc', 'docx'].includes(ext)) return 'DOC';
  if (['xls', 'xlsx'].includes(ext)) return 'XLS';
  return ext.toUpperCase();
}


function PacienteDocumentosPanel({ pacienteId }) {
  const [documentos, setDocumentos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const cargarDocumentos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await documentosAPI.getByPaciente(pacienteId);
      setDocumentos(res.data);
    } catch {
      setError('No se pudieron cargar los documentos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!pacienteId) return;
    cargarDocumentos();
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
      await cargarDocumentos();
    } catch {
      setError('No se pudo subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.3rem', color: 'var(--color-principal)' }}>
          Documentos del paciente
        </h3>
        {documentos.length > 0 && (
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--color-texto-claro)',
            }}
          >
            {documentos.length} documento{documentos.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      {/* Formulario de subida */}
      <form onSubmit={handleSubmit} className="form-grid" style={{ marginBottom: '1rem' }}>
        <div className="form-field">
          <label className="form-label">Título del documento</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="form-input"
            placeholder="Ej: Historia clínica firmada 2026, Foto antes, etc."
          />
        </div>
        <div className="form-field">
          <label className="form-label">Archivo</label>
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files[0] || null)}
            className="form-input"
          />
        </div>
        <div className="form-actions">
          <button
            type="submit"
            disabled={subiendo || !archivo || !titulo.trim()}
            className="btn btn-primary"
          >
            {subiendo ? 'Subiendo...' : 'Subir documento'}
          </button>
        </div>
      </form>

      {/* Lista de documentos */}
      {cargando ? (
        <div>Cargando documentos...</div>
      ) : documentos.length === 0 ? (
        <p>No hay documentos cargados para este paciente.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.4rem' }}>
          {documentos.map((doc) => (
            <li
              key={doc.id}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(230, 192, 180, 0.2)', // usa tu color secundario suave
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(150, 145, 115, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--color-principal)',
                  }}
                >
                  {obtenerExtension(doc.archivo)}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem' }}>{doc.titulo}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-texto-claro)' }}>
                    {doc.fecha}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <a
                  href={doc.archivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(150, 145, 115, 0.4)',
                    fontSize: '0.8rem',
                    color: 'var(--color-principal)',
                    textDecoration: 'none',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Ver / descargar
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = window.confirm('¿Eliminar este documento?');
                    if (!ok) return;
                    await documentosAPI.delete(doc.id);
                    await cargarDocumentos();
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.25rem 0.6rem',
                    fontSize: '0.75rem',
                    borderRadius: '999px',
                  }}
                >
                  Eliminar
                </button>
              </div>

            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PacienteDocumentosPanel;
