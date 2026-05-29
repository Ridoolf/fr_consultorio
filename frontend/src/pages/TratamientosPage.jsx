import { useEffect, useState } from 'react';
import { tratamientosAPI } from '../services/api';

function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: null, nombre: '', precio_base: '' });
  const [guardando, setGuardando] = useState(false);

  const cargarTratamientos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await tratamientosAPI.getAll();
      setTratamientos(res.data);
    } catch {
      setError('No se pudieron cargar los tratamientos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTratamientos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const editar = (t) => {
    setForm({
      id: t.id,
      nombre: t.nombre,
      precio_base: String(t.precio_base),
    });
  };

  const resetForm = () => {
    setForm({ id: null, nombre: '', precio_base: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio_base) return;
    setGuardando(true);
    setError(null);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        precio_base: form.precio_base,
        activo: true,
      };
      if (form.id) {
        await tratamientosAPI.update(form.id, payload);
      } else {
        await tratamientosAPI.create(payload);
      }
      resetForm();
      await cargarTratamientos();
    } catch {
      setError('No se pudo guardar el tratamiento.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="card">
      <div className="card-title">Tratamientos</div>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      {/* Formulario alta/edición */}
      <form onSubmit={handleSubmit} className="form-grid" style={{ marginBottom: '1rem' }}>
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">Nombre del tratamiento</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="form-input"
              placeholder="Ej: Blanqueamiento maxilar, Limpieza, etc."
            />
          </div>
          <div className="form-field">
            <label className="form-label">Precio base</label>
            <input
              type="number"
              name="precio_base"
              value={form.precio_base}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="50"
            />
          </div>
        </div>
        <div className="form-actions">
          <button
            type="submit"
            disabled={guardando}
            className="btn btn-primary"
          >
            {guardando
              ? 'Guardando...'
              : form.id
              ? 'Guardar cambios'
              : 'Agregar tratamiento'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={resetForm}
              className="btn btn-secondary"
            >
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      {/* Lista */}
      {cargando ? (
        <div>Cargando tratamientos...</div>
      ) : tratamientos.length === 0 ? (
        <p>No hay tratamientos cargados aún.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Precio base</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {tratamientos.map((t) => (
              <tr key={t.id}>
                <td>{t.nombre}</td>
                <td>${Number(t.precio_base).toLocaleString('es-AR')}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => editar(t)}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem' }}
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TratamientosPage;
