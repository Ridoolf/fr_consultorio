import { useEffect, useState } from 'react';
import { pacientesAPI, tratamientosAPI, pagosAPI } from '../services/api';

function formatoFechaInput(fecha) {
  return fecha.toISOString().slice(0, 10);
}

function CajaPage() {
  const hoy = new Date();
  const [pacientes, setPacientes] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);
  const [filtros, setFiltros] = useState({
    fecha: formatoFechaInput(hoy),
    paciente: '',
  });

  const cargarPagos = async (f = filtros) => {
    setCargandoPagos(true);
    try {
      const params = {};
      if (f.fecha) params.fecha = f.fecha;
      if (f.paciente) params.paciente = f.paciente;
      const res = await pagosAPI.getAll(params);
      setPagos(res.data);
    } catch {
      // opcional: podés setear error específico de pagos
    } finally {
      setCargandoPagos(false);
    }
  };


  const [form, setForm] = useState({
    paciente: '',
    fecha: formatoFechaInput(hoy),
    tratamiento: '',
    cantidad: 1,
    precio_unitario: '',
    monto_total: '',
    medio: 'efectivo',
    notas: '',
  });

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const [pacRes, tratRes] = await Promise.all([
          pacientesAPI.getAll({ activos: 'false' }),
          tratamientosAPI.getAll({ activos: 'true' }),
        ]);
        setPacientes(pacRes.data);
        setTratamientos(tratRes.data);
        await cargarPagos();   // 👈
      } catch {
        setError('No se pudieron cargar pacientes o tratamientos.');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    cargarPagos(filtros);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.fecha, filtros.paciente]);


  const selectedTrat = tratamientos.find((t) => t.id === Number(form.tratamiento));

  // cuando cambia tratamiento o cantidad, sugerimos precio y total
  useEffect(() => {
    if (!selectedTrat) return;
    setForm((prev) => {
      const precioUnit = prev.precio_unitario || selectedTrat.precio_base;
      const cantidad = Number(prev.cantidad) || 1;
      const total = Number(precioUnit) * cantidad || '';
      return {
        ...prev,
        precio_unitario: precioUnit,
        monto_total: total,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.tratamiento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const nuevo = { ...prev, [name]: value };
      if (name === 'cantidad' || name === 'precio_unitario') {
        const cantidad = Number(name === 'cantidad' ? value : nuevo.cantidad) || 1;
        const precio = Number(name === 'precio_unitario' ? value : nuevo.precio_unitario) || 0;
        nuevo.monto_total = cantidad * precio || '';
      }
      return nuevo;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.paciente || !form.tratamiento || !form.monto_total) return;

    setGuardando(true);
    setError(null);

    try {
      const payload = {
        paciente: Number(form.paciente),
        fecha: form.fecha,
        monto_total: form.monto_total,
        medio: form.medio,
        notas: form.notas,
        items: [
          {
            tratamiento: Number(form.tratamiento),
            cantidad: Number(form.cantidad) || 1,
            precio_unitario: Number(form.precio_unitario) || 0,
            subtotal: Number(form.monto_total) || 0,
          },
        ],
      };

      await pagosAPI.create(payload);
      await cargarPagos(filtros);

      // reset básico manteniendo fecha
      setForm((prev) => ({
        paciente: '',
        fecha: prev.fecha,
        tratamiento: '',
        cantidad: 1,
        precio_unitario: '',
        monto_total: '',
        medio: 'efectivo',
        notas: '',
      }));
    } catch {
      setError('No se pudo registrar el pago.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div className="card">Cargando datos para caja...</div>;

  return (
    <div className="card">
      <div className="card-title">Registrar cobro</div>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        {/* Paciente + fecha */}
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">Paciente</label>
            <select
              name="paciente"
              value={form.paciente}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Seleccionar paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre} (DNI {p.dni})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={form.fecha}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        {/* Tratamiento + cantidad */}
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">Tratamiento</label>
            <select
              name="tratamiento"
              value={form.tratamiento}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="">Seleccionar tratamiento...</option>
              {tratamientos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} (${Number(t.precio_base).toLocaleString('es-AR')})
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              name="cantidad"
              value={form.cantidad}
              onChange={handleChange}
              className="form-input"
              min="1"
              step="1"
            />
          </div>
        </div>

        {/* Precio unitario + total */}
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">
              Precio unitario (editable, para promo)
            </label>
            <input
              type="number"
              name="precio_unitario"
              value={form.precio_unitario}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="50"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Monto total</label>
            <input
              type="number"
              name="monto_total"
              value={form.monto_total}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="50"
            />
          </div>
        </div>

        {/* Medio de pago */}
        <div className="form-field">
          <label className="form-label">Medio de pago</label>
          <select
            name="medio"
            value={form.medio}
            onChange={handleChange}
            className="form-select"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>

        {/* Notas */}
        <div className="form-field">
          <label className="form-label">Notas</label>
          <textarea
            name="notas"
            value={form.notas}
            onChange={handleChange}
            className="form-textarea"
            rows={2}
            placeholder="Ej: Promo 2 maxilares, se cobra 240.000..."
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={guardando}
            className="btn btn-primary"
          >
            {guardando ? 'Guardando...' : 'Registrar cobro'}
          </button>
        </div>
      </form>

      {/* Pagos recientes */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1rem',
            marginBottom: '0.5rem',
            color: 'var(--color-principal)',
          }}
        >
          Pagos recientes
        </h3>

        {/* Filtros */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
            marginBottom: '0.75rem',
            backgroundColor: '#f7ede4',
            padding: '0.75rem',
            borderRadius: '8px',
          }}
        >
          <div className="form-field" style={{ flex: '0 0 160px' }}>
            <label className="form-label">Fecha</label>
            <input
              type="date"
              value={filtros.fecha}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, fecha: e.target.value }))
              }
              className="form-input"
            />
          </div>
          <div className="form-field" style={{ flex: '1 1 200px' }}>
            <label className="form-label">Paciente</label>
            <select
              value={filtros.paciente}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, paciente: e.target.value }))
              }
              className="form-select"
            >
              <option value="">Todos</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre} (DNI {p.dni})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de pagos */}
        {cargandoPagos ? (
          <div>Cargando pagos...</div>
        ) : pagos.length === 0 ? (
          <p>No hay pagos para esos filtros.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Tratamiento</th>
                <th>Monto</th>
                <th>Medio</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td>{p.fecha}</td>
                  <td>{p.paciente_nombre_completo}</td>
                  <td>
                    {p.items && p.items.length > 0
                      ? p.items[0].tratamiento_nombre
                      : '-'}
                  </td>
                  <td>${Number(p.monto_total).toLocaleString('es-AR')}</td>
                  <td>{p.medio}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}

export default CajaPage;
