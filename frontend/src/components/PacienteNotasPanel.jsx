import { useEffect, useState } from 'react';
import { notasAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';

function formatoFechaHora(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function PacienteNotasPanel({ pacienteId }) {
  const [notas, setNotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [textoNuevo, setTextoNuevo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [textoEdit, setTextoEdit] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [accionId, setAccionId] = useState(null);
  const { showToast } = useToast();

  const cargarNotas = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await notasAPI.getByPaciente(pacienteId);
      setNotas(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las notas.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (pacienteId) cargarNotas();
  }, [pacienteId]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!textoNuevo.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      await notasAPI.create({ paciente: Number(pacienteId), texto: textoNuevo.trim() });
      setTextoNuevo('');
      showToast('Nota agregada', 'success');
      await cargarNotas();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar la nota.'));
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicion = (nota) => {
    setEditandoId(nota.id);
    setTextoEdit(nota.texto);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTextoEdit('');
  };

  const guardarEdicion = async (notaId) => {
    if (!textoEdit.trim()) return;
    setAccionId(notaId);
    try {
      await notasAPI.update(notaId, { paciente: Number(pacienteId), texto: textoEdit.trim() });
      showToast('Nota actualizada', 'success');
      cancelarEdicion();
      await cargarNotas();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo actualizar.'), 'error');
    } finally {
      setAccionId(null);
    }
  };

  const handleDelete = async (notaId) => {
    setAccionId(notaId);
    try {
      await notasAPI.delete(notaId);
      showToast('Nota eliminada', 'success');
      await cargarNotas();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo eliminar.'), 'error');
    } finally {
      setAccionId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="ficha-subpanel">
      <div>
        <h3 className="ficha-subpanel-title">Notas del paciente</h3>
        <p className="ficha-subpanel-desc">Registrá observaciones acumulables sobre el paciente.</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleAgregar} className="form-grid ficha-subpanel-form">
        <div className="form-field">
          <label className="form-label">Nueva nota</label>
          <textarea
            className="form-textarea"
            value={textoNuevo}
            onChange={(e) => setTextoNuevo(e.target.value)}
            rows={3}
            placeholder="Escribí una nota sobre el paciente..."
          />
        </div>
        <Button type="submit" variant="primary" disabled={guardando || !textoNuevo.trim()}>
          {guardando ? 'Guardando...' : 'Agregar nota'}
        </Button>
      </form>

      {cargando ? (
        <Spinner />
      ) : notas.length === 0 ? (
        <EmptyState icon="📝" title="Sin notas" description="Agregá la primera nota con el formulario de arriba." />
      ) : (
        notas.map((nota) => (
          <div key={nota.id} className="data-card">
            <div className="data-card-meta" style={{ marginBottom: '0.5rem' }}>
              {formatoFechaHora(nota.fecha_creacion)}
              {nota.fecha_actualizacion !== nota.fecha_creacion && ' (editada)'}
            </div>
            {editandoId === nota.id ? (
              <>
                <textarea
                  className="form-textarea"
                  value={textoEdit}
                  onChange={(e) => setTextoEdit(e.target.value)}
                  rows={3}
                  style={{ marginBottom: '0.75rem' }}
                />
                <div className="data-card-actions">
                  <Button size="sm" variant="primary" disabled={accionId === nota.id} onClick={() => guardarEdicion(nota.id)}>
                    Guardar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={cancelarEdicion}>
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="data-card-title" style={{ whiteSpace: 'pre-wrap', fontWeight: 400 }}>
                  {nota.texto}
                </div>
                <div className="data-card-actions" style={{ marginTop: '0.75rem' }}>
                  <Button size="sm" variant="secondary" onClick={() => iniciarEdicion(nota)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="danger" disabled={accionId === nota.id} onClick={() => setConfirmDelete(nota)}>
                    Eliminar
                  </Button>
                </div>
              </>
            )}
          </div>
        ))
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar nota"
        message="¿Eliminar esta nota? No se puede deshacer."
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
      />
    </div>
  );
}

export default PacienteNotasPanel;
