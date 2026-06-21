import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pacientesAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const initialFilters = {
  incluirInactivos: false,
  search: '',
  ordering: 'apellido',
};

function PacientesList() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [accionId, setAccionId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const cargarPacientes = async (f = filters) => {
    setCargando(true);
    setError(null);
    try {
      const params = {};
      if (f.incluirInactivos) params.activos = 'false';
      if (f.search?.trim()) params.search = f.search.trim();
      if (f.ordering) params.ordering = f.ordering;
      const res = await pacientesAPI.getAll(params);
      setPacientes(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los pacientes.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPacientes(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.incluirInactivos, filters.ordering]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    cargarPacientes(filters);
  };

  const handleToggleActivo = async (p) => {
    setAccionId(p.id);
    try {
      if (p.activo) {
        await pacientesAPI.desactivar(p.id);
        showToast('Paciente desactivado', 'success');
      } else {
        await pacientesAPI.activar(p.id);
        showToast('Paciente activado', 'success');
      }
      await cargarPacientes(filters);
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo actualizar el paciente.'), 'error');
    } finally {
      setAccionId(null);
      setConfirm(null);
    }
  };

  return (
    <div className="page">
      <PageHeader
        title="Pacientes"
        subtitle={`${pacientes.length} registro${pacientes.length !== 1 ? 's' : ''}`}
        action={
          <Button variant="primary" onClick={() => navigate('/pacientes/nuevo')}>
            + Nuevo paciente
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSearchSubmit} className="filters-bar">
        <div className="form-field" style={{ flex: '1 1 200px' }}>
          <label className="form-label">Buscar</label>
          <input
            type="search"
            className="form-input"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            placeholder="Nombre, apellido, DNI..."
          />
        </div>
        <div className="form-field" style={{ flex: '0 0 180px' }}>
          <label className="form-label">Ordenar</label>
          <select
            className="form-select"
            value={filters.ordering}
            onChange={(e) => setFilters((p) => ({ ...p, ordering: e.target.value }))}
          >
            <option value="apellido">Apellido A-Z</option>
            <option value="-apellido">Apellido Z-A</option>
            <option value="-fecha_registro">Más nuevo</option>
            <option value="fecha_registro">Más antiguo</option>
          </select>
        </div>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minHeight: 44 }}>
          <input
            type="checkbox"
            checked={filters.incluirInactivos}
            onChange={(e) => setFilters((p) => ({ ...p, incluirInactivos: e.target.checked }))}
          />
          Incluir inactivos
        </label>
        <Button type="submit" variant="primary">Buscar</Button>
        </form>
      </Card>

      {error && <div className="error-box">{error}</div>}

      <Card>
        <div className={`loading-overlay${cargando ? ' is-loading' : ''}`}>
        {cargando && pacientes.length === 0 ? (
          <Spinner />
        ) : pacientes.length === 0 ? (
          <EmptyState
            icon="👤"
            title="Sin pacientes"
            description="No hay pacientes con esos filtros."
            action={
              <Button variant="primary" onClick={() => navigate('/pacientes/nuevo')}>
                Crear primer paciente
              </Button>
            }
          />
        ) : (
          <div>
            {pacientes.map((p, i) => (
              <motion.div
                key={p.id}
                className="data-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="data-card-header">
                  <div>
                    <div className="data-card-title">
                      {p.apellido}, {p.nombre}
                    </div>
                    <div className="data-card-meta">
                      DNI {p.dni}
                      {p.telefono && ` · ${p.telefono}`}
                      {p.edad != null && ` · ${p.edad} años`}
                    </div>
                  </div>
                  <Badge variant={p.activo ? 'activo' : 'inactivo'}>
                    {p.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="data-card-actions">
                  <Button variant="primary" size="sm" onClick={() => navigate(`/pacientes/${p.id}`)}>
                    Ver ficha
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={accionId === p.id}
                    onClick={() =>
                      setConfirm({
                        paciente: p,
                        title: p.activo ? 'Desactivar paciente' : 'Activar paciente',
                        message: `¿${p.activo ? 'Desactivar' : 'Activar'} a ${p.apellido}, ${p.nombre}?`,
                      })
                    }
                  >
                    {p.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {cargando && pacientes.length > 0 && (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <Spinner label="" />
          </div>
        )}
      </div>
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.paciente?.activo ? 'Desactivar' : 'Activar'}
        danger={confirm?.paciente?.activo}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && handleToggleActivo(confirm.paciente)}
      />
    </div>
  );
}

export default PacientesList;
