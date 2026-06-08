import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { pacientesAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import { hoyLocal } from '../utils/fechas';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import PacienteDocumentosPanel from '../components/PacienteDocumentosPanel';
import PacienteTurnosPanel from '../components/PacienteTurnosPanel';
import PacientePagosPanel from '../components/PacientePagosPanel';

const initialForm = {
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  telefono: '',
  email: '',
  observaciones: '',
};

const TABS = [
  { id: 'datos', label: 'Datos' },
  { id: 'turnos', label: 'Turnos' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'pagos', label: 'Pagos' },
];

function PacienteForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [cargando, setCargando] = useState(esEdicion);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('datos');
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (!esEdicion) return;
    let cancelado = false;
    pacientesAPI
      .getById(id)
      .then((res) => {
        if (cancelado) return;
        const data = res.data;
        setForm({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          dni: data.dni || '',
          fecha_nacimiento: data.fecha_nacimiento || '',
          telefono: data.telefono || '',
          email: data.email || '',
          observaciones: data.observaciones || '',
        });
      })
      .catch((err) => {
        if (cancelado) return;
        setErrorCarga(getErrorMessage(err, 'No se pudo cargar el paciente.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => { cancelado = true; };
  }, [esEdicion, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (esEdicion) {
        await pacientesAPI.update(id, form);
        showToast('Paciente actualizado', 'success');
      } else {
        await pacientesAPI.create(form);
        showToast('Paciente creado', 'success');
      }
      navigate('/pacientes');
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el paciente.'));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <Card><Spinner label="Cargando ficha..." /></Card>;
  }

  if (errorCarga) {
    return (
      <Card>
        <div className="error-box">{errorCarga}</div>
        <Button variant="primary" onClick={() => navigate('/pacientes')}>
          Volver a la lista
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <PageHeader
        title={esEdicion ? `${form.apellido}, ${form.nombre}` : 'Nuevo paciente'}
        subtitle={esEdicion ? `DNI ${form.dni}` : undefined}
        action={
          esEdicion && (
            <Link to={`/turnos/nuevo?paciente=${id}&fecha=${hoyLocal()}`}>
              <Button variant="primary">+ Nuevo turno</Button>
            </Link>
          )
        }
      />

      {esEdicion && (
        <div className="tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              className={`tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {(tab === 'datos' || !esEdicion) && (
        <>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-row-2">
              <div className="form-field">
                <label className="form-label">Nombre</label>
                <input type="text" name="nombre" className="form-input" value={form.nombre} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="form-label">Apellido</label>
                <input type="text" name="apellido" className="form-input" value={form.apellido} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-field">
                <label className="form-label">DNI</label>
                <input type="text" name="dni" className="form-input" value={form.dni} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label className="form-label">Fecha de nacimiento</label>
                <input type="date" name="fecha_nacimiento" className="form-input" value={form.fecha_nacimiento} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-field">
                <label className="form-label">Teléfono</label>
                <input type="tel" name="telefono" className="form-input" value={form.telefono} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-input" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Observaciones</label>
              <textarea name="observaciones" className="form-textarea" value={form.observaciones} onChange={handleChange} rows={3} />
            </div>
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate('/pacientes')}>
                Cancelar
              </Button>
            </div>
          </form>
        </>
      )}

      {esEdicion && tab === 'turnos' && <PacienteTurnosPanel pacienteId={id} />}
      {esEdicion && tab === 'documentos' && <PacienteDocumentosPanel pacienteId={id} />}
      {esEdicion && tab === 'pagos' && <PacientePagosPanel pacienteId={id} />}
    </Card>
  );
}

export default PacienteForm;
