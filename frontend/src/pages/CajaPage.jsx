import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { pacientesAPI, tratamientosAPI, pagosAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import { hoyLocal } from '../utils/fechas';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

function CajaPage() {
  const [paso, setPaso] = useState(1);
  const [pacientes, setPacientes] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [errorPagos, setErrorPagos] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [cargandoPagos, setCargandoPagos] = useState(true);
  const [filtros, setFiltros] = useState({ fecha: hoyLocal(), paciente: '' });
  const { showToast } = useToast();

  const [form, setForm] = useState({
    paciente: '',
    fecha: hoyLocal(),
    tratamiento: '',
    cantidad: 1,
    precio_unitario: '',
    monto_total: '',
    medio: 'efectivo',
    notas: '',
  });

  const cargarPagos = async (f = filtros) => {
    setCargandoPagos(true);
    setErrorPagos(null);
    try {
      const params = {};
      if (f.fecha) params.fecha = f.fecha;
      if (f.paciente) params.paciente = f.paciente;
      const res = await pagosAPI.getAll(params);
      setPagos(res.data);
    } catch (err) {
      setErrorPagos(getErrorMessage(err, 'No se pudieron cargar los pagos.'));
    } finally {
      setCargandoPagos(false);
    }
  };

  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const [pacRes, tratRes] = await Promise.all([
          pacientesAPI.getAll(),
          tratamientosAPI.getAll({ activos: 'true' }),
        ]);
        setPacientes(pacRes.data);
        setTratamientos(tratRes.data);
        await cargarPagos();
      } catch (err) {
        setError(getErrorMessage(err, 'No se pudieron cargar los datos.'));
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

  useEffect(() => {
    const t = tratamientos.find((x) => x.id === Number(form.tratamiento));
    if (!t) return;
    setForm((prev) => {
      const precio = prev.precio_unitario || t.precio_base;
      const cantidad = Number(prev.cantidad) || 1;
      return { ...prev, precio_unitario: precio, monto_total: Number(precio) * cantidad };
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

  const validarPaso1 = () => {
    if (!form.paciente) {
      setError('Seleccioná un paciente.');
      return false;
    }
    if (!form.fecha) {
      setError('Seleccioná una fecha.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tratamiento || !form.monto_total) {
      setError('Completá tratamiento y monto.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await pagosAPI.create({
        paciente: Number(form.paciente),
        fecha: form.fecha,
        monto_total: form.monto_total,
        medio: form.medio,
        notas: form.notas,
        items: [{
          tratamiento: Number(form.tratamiento),
          cantidad: Number(form.cantidad) || 1,
          precio_unitario: Number(form.precio_unitario) || 0,
          subtotal: Number(form.monto_total) || 0,
        }],
      });
      showToast('Cobro registrado', 'success');
      await cargarPagos(filtros);
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
      setPaso(1);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo registrar el pago.'));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Card><Spinner /></Card>;

  return (
    <Card>
      <PageHeader title="Caja" subtitle="Registrar cobros y ver pagos" />

      {error && <div className="error-box">{error}</div>}

      <div className="caja-steps">
        <div className={`caja-step${paso === 1 ? ' active' : ''}`}>1. Paciente y fecha</div>
        <div className={`caja-step${paso === 2 ? ' active' : ''}`}>2. Detalle del cobro</div>
      </div>

      <form onSubmit={handleSubmit} className="form-grid">
        {paso === 1 && (
          <>
            <div className="form-field">
              <label className="form-label">Paciente</label>
              <select name="paciente" className="form-select" value={form.paciente} onChange={handleChange} required>
                <option value="">Seleccionar...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Fecha</label>
              <input type="date" name="fecha" className="form-input" value={form.fecha} onChange={handleChange} required />
            </div>
            <Button type="button" variant="primary" onClick={() => validarPaso1() && setPaso(2)}>
              Siguiente
            </Button>
          </>
        )}

        {paso === 2 && (
          <>
            <div className="form-row-2">
              <div className="form-field">
                <label className="form-label">Tratamiento</label>
                <select name="tratamiento" className="form-select" value={form.tratamiento} onChange={handleChange} required>
                  <option value="">Seleccionar...</option>
                  {tratamientos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} (${Number(t.precio_base).toLocaleString('es-AR')})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Cantidad</label>
                <input type="number" name="cantidad" className="form-input" value={form.cantidad} onChange={handleChange} min="1" />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-field">
                <label className="form-label">Precio unitario</label>
                <input type="number" name="precio_unitario" className="form-input" value={form.precio_unitario} onChange={handleChange} min="0" step="50" />
              </div>
              <div className="form-field">
                <label className="form-label">Medio de pago</label>
                <select name="medio" className="form-select" value={form.medio} onChange={handleChange}>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                </select>
              </div>
            </div>
            <div className="caja-total-box">
              <div className="caja-total-label">Total a cobrar</div>
              <div className="caja-total-value">
                ${Number(form.monto_total || 0).toLocaleString('es-AR')}
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Notas</label>
              <textarea name="notas" className="form-textarea" value={form.notas} onChange={handleChange} rows={2} />
            </div>
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => setPaso(1)}>Atrás</Button>
              <Button type="submit" variant="primary" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Registrar cobro'}
              </Button>
            </div>
          </>
        )}
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h3 className="page-header-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Pagos recientes</h3>
        {errorPagos && <div className="error-box">{errorPagos}</div>}

        <div className="filters-bar">
          <div className="form-field" style={{ flex: '0 0 160px' }}>
            <label className="form-label">Fecha</label>
            <input type="date" className="form-input" value={filtros.fecha} onChange={(e) => setFiltros((p) => ({ ...p, fecha: e.target.value }))} />
          </div>
          <div className="form-field" style={{ flex: '1 1 200px' }}>
            <label className="form-label">Paciente</label>
            <select className="form-select" value={filtros.paciente} onChange={(e) => setFiltros((p) => ({ ...p, paciente: e.target.value }))}>
              <option value="">Todos</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {cargandoPagos ? (
          <Spinner label="Cargando pagos..." />
        ) : pagos.length === 0 ? (
          <EmptyState icon="💰" title="Sin pagos" description="No hay pagos para esos filtros." />
        ) : (
          pagos.map((p) => (
            <div key={p.id} className="data-card">
              <div className="data-card-header">
                <div>
                  <Link to={`/pacientes/${p.paciente}`} className="data-card-title">
                    {p.paciente_nombre_completo}
                  </Link>
                  <div className="data-card-meta">{p.fecha} · {p.medio}</div>
                </div>
                <strong style={{ color: 'var(--color-principal)', fontSize: '1.1rem' }}>
                  ${Number(p.monto_total).toLocaleString('es-AR')}
                </strong>
              </div>
              <div className="data-card-meta">
                {p.items?.[0]?.tratamiento_nombre || '-'}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

export default CajaPage;
