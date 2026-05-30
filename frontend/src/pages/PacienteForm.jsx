import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pacientesAPI } from '../services/api';
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

function PacienteForm() {
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!esEdicion) return;

    let cancelado = false;

    pacientesAPI.getById(id)
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
      .catch(() => {
        if (cancelado) return;
        setError('No se pudo cargar el paciente.');
      })
      .finally(() => {
        if (cancelado) return;
        setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [esEdicion, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      if (esEdicion) {
        await pacientesAPI.update(id, form);
      } else {
        await pacientesAPI.create(form);
      }
      navigate('/pacientes');
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el paciente. Revisá los datos.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div>Cargando datos del paciente...</div>;

  return (
    <div className="card">
      <div className="card-title">
        {esEdicion ? 'Editar paciente' : 'Nuevo paciente'}
      </div>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        {/* Nombre + Apellido */}
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* DNI + Fecha de nacimiento */}
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">DNI</label>
            <input
              type="text"
              name="dni"
              value={form.dni}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Fecha de nacimiento</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        </div>

        {/* Teléfono + Email */}
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        </div>
        
        {/* Observaciones */}
        <div className="form-field">
          <label className="form-label">Observaciones</label>
          <textarea
            name="observaciones"
            value={form.observaciones}
            onChange={handleChange}
            rows={3}
            className="form-textarea"
          />
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={guardando}
            className="btn btn-primary"
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/pacientes')}
            className="btn btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>

      {esEdicion && (
        <>
          <PacienteDocumentosPanel pacienteId={id} />
          <PacienteTurnosPanel pacienteId={id} />
          <PacientePagosPanel pacienteId={id} />
        </>
      )}
    </div>
  );
}

export default PacienteForm;
