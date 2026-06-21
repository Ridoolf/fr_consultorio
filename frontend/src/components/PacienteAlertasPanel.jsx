import { useEffect, useState } from 'react';
import { alertasAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';

const TIPOS_ALERTA = [
  { value: 'alergia', label: 'Alergia' },
  { value: 'enfermedad', label: 'Enfermedad' },
  { value: 'medicacion', label: 'Medicación' },
  { value: 'otro', label: 'Otro' },
];

const BADGE_VARIANT = {
  alergia: 'danger',
  enfermedad: 'warning',
  medicacion: 'default',
  otro: 'default',
};

const initialForm = {
  tipo: 'alergia',
  descripcion: '',
  detalle: '',
};

function PacienteAlertasPanel({ pacienteId }) {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [accionId, setAccionId] = useState(null);
  const { showToast } = useToast();

  const cargarAlertas = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await alertasAPI.getByPaciente(pacienteId);
      setAlertas(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar las alertas.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (pacienteId) cargarAlertas();
  }, [pacienteId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditandoId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.descripcion.trim()) return;
    setGuardando(true);
    setError(null);
    const payload = {
      paciente: Number(pacienteId),
      tipo: form.tipo,
      descripcion: form.descripcion.trim(),
      detalle: form.detalle.trim(),
      activa: true,
    };
    try {
      if (editandoId) {
        await alertasAPI.update(editandoId, payload);
        showToast('Alerta actualizada', 'success');
      } else {
        await alertasAPI.create(payload);
        showToast('Alerta agregada', 'success');
      }
      resetForm();
      await cargarAlertas();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar la alerta.'));
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicion = (alerta) => {
    setEditandoId(alerta.id);
    setForm({
      tipo: alerta.tipo,
      descripcion: alerta.descripcion,
      detalle: alerta.detalle || '',
    });
  };

  const handleDelete = async (alertaId) => {
    setAccionId(alertaId);
    try {
      await alertasAPI.delete(alertaId);
      showToast('Alerta eliminada', 'success');
      await cargarAlertas();
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
        <h3 className="ficha-subpanel-title">Alertas médicas</h3>
        <p className="ficha-subpanel-desc">Alergias, enfermedades, medicación y otras alertas importantes.</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid ficha-subpanel-form">
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">Tipo</label>
            <select name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
              {TIPOS_ALERTA.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Descripción</label>
            <input
              type="text"
              name="descripcion"
              className="form-input"
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Ej: Penicilina, Diabetes..."
              required
            />
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Detalle (opcional)</label>
          <textarea
            name="detalle"
            className="form-textarea"
            value={form.detalle}
            onChange={handleChange}
            rows={2}
            placeholder="Información adicional..."
          />
        </div>
        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={guardando || !form.descripcion.trim()}>
            {guardando ? 'Guardando...' : editandoId ? 'Actualizar alerta' : 'Agregar alerta'}
          </Button>
          {editandoId && (
            <Button type="button" variant="secondary" onClick={resetForm}>
              Cancelar edición
            </Button>
          )}
        </div>
      </form>

      {cargando ? (
        <Spinner />
      ) : alertas.length === 0 ? (
        <EmptyState icon="⚠️" title="Sin alertas médicas" description="Registrá alergias, enfermedades o medicación." />
      ) : (
        alertas.map((alerta) => (
          <div key={alerta.id} className="data-card">
            <div className="data-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Badge variant={BADGE_VARIANT[alerta.tipo] || 'default'}>
                  {alerta.tipo_display || alerta.tipo}
                </Badge>
                <div className="data-card-title">{alerta.descripcion}</div>
              </div>
            </div>
            {alerta.detalle && (
              <div className="data-card-meta" style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                {alerta.detalle}
              </div>
            )}
            <div className="data-card-actions" style={{ marginTop: '0.75rem' }}>
              <Button size="sm" variant="secondary" onClick={() => iniciarEdicion(alerta)}>
                Editar
              </Button>
              <Button size="sm" variant="danger" disabled={accionId === alerta.id} onClick={() => setConfirmDelete(alerta)}>
                Eliminar
              </Button>
            </div>
          </div>
        ))
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar alerta"
        message={`¿Eliminar "${confirmDelete?.descripcion}"?`}
        danger
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
      />
    </div>
  );
}

export default PacienteAlertasPanel;
