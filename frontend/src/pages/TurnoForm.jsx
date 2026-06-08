import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { pacientesAPI, turnosAPI, tratamientosAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import { hoyLocal } from '../utils/fechas';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PacienteCombobox from '../components/ui/PacienteCombobox';
import TimeInput24 from '../components/ui/TimeInput24';
import { normalizarHora } from '../utils/hora';

const initialForm = {
  paciente: '',
  fecha: '',
  hora_inicio: '',
  duracion_minutos: 30,
  motivo: '',
  notas_internas: '',
};

function TurnoForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const params = new URLSearchParams(location.search);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    ...initialForm,
    fecha: params.get('fecha') || hoyLocal(),
    paciente: params.get('paciente') || '',
  });

  const [pacientes, setPacientes] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorTratamientos, setErrorTratamientos] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [pacRes, tratRes] = await Promise.all([
          pacientesAPI.getAll(),
          tratamientosAPI.getAll({ activos: 'true' }),
        ]);
        setPacientes(pacRes.data);
        setTratamientos(tratRes.data);

        if (esEdicion) {
          const turnoRes = await turnosAPI.getById(id);
          const t = turnoRes.data;
          setForm({
            paciente: String(t.paciente),
            fecha: t.fecha,
            hora_inicio: t.hora_inicio?.slice(0, 5) || '',
            duracion_minutos: t.duracion_minutos,
            motivo: t.motivo || '',
            notas_internas: t.notas_internas || '',
          });
        }
      } catch (err) {
        setError(getErrorMessage(err, 'No se pudieron cargar los datos.'));
        if (!esEdicion) setErrorTratamientos('No se pudieron cargar tratamientos.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [esEdicion, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'duracion_minutos' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.paciente) {
      setError('Seleccioná un paciente.');
      return;
    }
    const horaNormalizada = normalizarHora(form.hora_inicio);
    if (!horaNormalizada) {
      setError('La hora no es válida. Usá formato 24 h (ej: 17:30 o 1730).');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        ...form,
        paciente: Number(form.paciente),
        hora_inicio: horaNormalizada,
      };
      if (esEdicion) {
        await turnosAPI.update(id, payload);
        showToast('Turno actualizado', 'success');
      } else {
        await turnosAPI.create(payload);
        showToast('Turno creado', 'success');
      }
      navigate(`/turnos?fecha=${form.fecha}`);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el turno.'));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Card><Spinner /></Card>;

  return (
    <Card>
      <PageHeader title={esEdicion ? 'Editar turno' : 'Nuevo turno'} />

      {error && <div className="error-box">{error}</div>}
      {errorTratamientos && <div className="error-box">{errorTratamientos}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <PacienteCombobox
          pacientes={pacientes}
          value={form.paciente}
          onChange={(id) => setForm((prev) => ({ ...prev, paciente: id }))}
          required
        />

        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">Fecha</label>
            <input type="date" name="fecha" className="form-input" value={form.fecha} onChange={handleChange} required />
          </div>
          <TimeInput24
            name="hora_inicio"
            value={form.hora_inicio}
            onChange={(v) => setForm((prev) => ({ ...prev, hora_inicio: v }))}
            required
          />
        </div>

        <div className="form-field">
          <label className="form-label">Duración (min)</label>
          <input type="number" name="duracion_minutos" className="form-input" value={form.duracion_minutos} onChange={handleChange} min={5} step={5} />
        </div>

        <div className="form-field">
          <label className="form-label">Motivo (tratamiento)</label>
          <select name="motivo" className="form-select" value={form.motivo} onChange={handleChange} required>
            <option value="">Seleccionar...</option>
            {tratamientos.map((t) => (
              <option key={t.id} value={t.nombre}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Notas internas</label>
          <textarea name="notas_internas" className="form-textarea" value={form.notas_internas} onChange={handleChange} rows={2} />
        </div>

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar turno'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate(`/turnos?fecha=${form.fecha}`)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default TurnoForm;
