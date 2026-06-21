import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
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
import PacienteNotasPanel from '../components/PacienteNotasPanel';
import PacienteAlertasPanel from '../components/PacienteAlertasPanel';
import OdontogramaPanel from '../components/OdontogramaPanel';
import PacienteResumenClinico from '../components/PacienteResumenClinico';

const initialForm = {
  nombre: '',
  apellido: '',
  dni: '',
  fecha_nacimiento: '',
  telefono: '',
  email: '',
  direccion: '',
  ocupacion: '',
  estado_civil: '',
  genero: '',
};

const REGISTRO_TABS = [
  { id: 'datos', label: 'Datos' },
  { id: 'notas', label: 'Notas' },
  { id: 'alertas', label: 'Alertas médicas' },
  { id: 'odontograma', label: 'Odontograma' },
];

const FICHA_TAB_GROUPS = [
  {
    label: 'Historia clínica',
    tabs: [
      { id: 'datos', label: 'Datos' },
      { id: 'notas', label: 'Notas' },
      { id: 'alertas', label: 'Alertas médicas' },
      { id: 'odontograma', label: 'Odontograma' },
    ],
  },
  {
    label: 'Gestión',
    tabs: [
      { id: 'turnos', label: 'Turnos' },
      { id: 'documentos', label: 'Documentos' },
      { id: 'pagos', label: 'Pagos' },
    ],
  },
];

const ESTADO_CIVIL_OPTIONS = [
  { value: '', label: 'Seleccionar...' },
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
  { value: 'union_convivencial', label: 'Unión convivencial' },
  { value: 'otro', label: 'Otro' },
];

const GENERO_OPTIONS = [
  { value: '', label: 'Seleccionar...' },
  { value: 'masculino', label: 'Masculino' },
  { value: 'femenino', label: 'Femenino' },
  { value: 'otro', label: 'Otro' },
  { value: 'prefiero_no_decir', label: 'Prefiero no decir' },
];

function PacienteForm() {
  const { id } = useParams();
  const location = useLocation();
  const esEdicion = Boolean(id);
  const enRegistro = location.state?.registro === true;
  const [form, setForm] = useState(initialForm);
  const [cargando, setCargando] = useState(esEdicion);
  const [errorCarga, setErrorCarga] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(location.state?.tab || 'datos');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const mostrarWizard = !esEdicion || enRegistro;
  const pacienteCreado = esEdicion;

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
          direccion: data.direccion || '',
          ocupacion: data.ocupacion || '',
          estado_civil: data.estado_civil || '',
          genero: data.genero || '',
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

  const handleTabClick = (tabId) => {
    if (mostrarWizard && !pacienteCreado && tabId !== 'datos') return;
    setTab(tabId);
  };

  const handleSubmitDatos = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (esEdicion) {
        await pacientesAPI.update(id, form);
        showToast('Paciente actualizado', 'success');
        if (enRegistro) {
          setTab('notas');
        }
      } else {
        const res = await pacientesAPI.create(form);
        showToast('Paciente creado', 'success');
        navigate(`/pacientes/${res.data.id}`, {
          replace: true,
          state: { tab: 'notas', registro: true },
        });
      }
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el paciente.'));
    } finally {
      setGuardando(false);
    }
  };

  const handleFinalizarRegistro = () => {
    navigate('/pacientes');
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
        subtitle={
          esEdicion
            ? `DNI ${form.dni}${enRegistro ? ' — Registro en curso' : ''}`
            : 'Completá la ficha del paciente paso a paso'
        }
        action={
          esEdicion && !enRegistro && (
            <Link to={`/turnos/nuevo?paciente=${id}&fecha=${hoyLocal()}`}>
              <Button variant="primary">+ Nuevo turno</Button>
            </Link>
          )
        }
      />

      {pacienteCreado && (
        <PacienteResumenClinico
          pacienteId={id}
          onIrAAlertas={() => setTab('alertas')}
        />
      )}

      {mostrarWizard ? (
        <div className="ficha-tabs ficha-tabs--simple" role="tablist">
          {REGISTRO_TABS.map((t) => {
            const deshabilitada = !pacienteCreado && t.id !== 'datos';
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                className={`tab${tab === t.id ? ' active' : ''}${deshabilitada ? ' disabled' : ''}`}
                onClick={() => handleTabClick(t.id)}
                disabled={deshabilitada}
                title={deshabilitada ? 'Guardá los datos básicos primero' : undefined}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="ficha-tabs ficha-tabs--grouped">
          {FICHA_TAB_GROUPS.map((grupo) => (
            <div key={grupo.label} className="ficha-tab-group" role="tablist" aria-label={grupo.label}>
              <span className="ficha-tab-group-label">{grupo.label}</span>
              <div className="ficha-tab-group-items">
                {grupo.tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    className={`tab${tab === t.id ? ' active' : ''}`}
                    onClick={() => handleTabClick(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ficha-tab-panel">
        {!pacienteCreado && tab !== 'datos' && (
          <div className="info-box">
            Guardá los datos básicos del paciente para habilitar las demás secciones.
          </div>
        )}

        {tab === 'datos' && (
          <>
            {error && <div className="error-box">{error}</div>}
            <form onSubmit={handleSubmitDatos} className="form-grid">
              <h3 className="form-section-title form-section-title--first">Datos básicos</h3>
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

              <h3 className="form-section-title form-section-title--divider">Datos particulares</h3>
              <div className="form-field">
                <label className="form-label">Dirección</label>
                <input type="text" name="direccion" className="form-input" value={form.direccion} onChange={handleChange} />
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Ocupación</label>
                  <input type="text" name="ocupacion" className="form-input" value={form.ocupacion} onChange={handleChange} />
                </div>
                <div className="form-field">
                  <label className="form-label">Estado civil</label>
                  <select name="estado_civil" className="form-select" value={form.estado_civil} onChange={handleChange}>
                    {ESTADO_CIVIL_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Género</label>
                <select name="genero" className="form-select" value={form.genero} onChange={handleChange}>
                  {GENERO_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                {!esEdicion || enRegistro ? (
                  <Button type="submit" variant="primary" disabled={guardando}>
                    {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Guardar y continuar'}
                  </Button>
                ) : (
                  <Button type="submit" variant="primary" disabled={guardando}>
                    {guardando ? 'Guardando...' : 'Guardar'}
                  </Button>
                )}
                <Button type="button" variant="secondary" onClick={() => navigate('/pacientes')}>
                  Cancelar
                </Button>
              </div>
            </form>
          </>
        )}

        {pacienteCreado && tab === 'notas' && <PacienteNotasPanel pacienteId={id} />}
        {pacienteCreado && tab === 'alertas' && <PacienteAlertasPanel pacienteId={id} />}
        {pacienteCreado && tab === 'odontograma' && <OdontogramaPanel pacienteId={id} />}
        {pacienteCreado && tab === 'turnos' && <PacienteTurnosPanel pacienteId={id} />}
        {pacienteCreado && tab === 'documentos' && <PacienteDocumentosPanel pacienteId={id} />}
        {pacienteCreado && tab === 'pagos' && <PacientePagosPanel pacienteId={id} />}

        {enRegistro && pacienteCreado && tab !== 'datos' && (
          <div className="ficha-panel-footer">
            <Button type="button" variant="primary" onClick={handleFinalizarRegistro}>
              Finalizar registro
            </Button>
            <Button type="button" variant="secondary" onClick={() => setTab('datos')}>
              Volver a datos
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default PacienteForm;
