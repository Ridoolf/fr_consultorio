import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { tratamientosAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ id: null, nombre: '', precio_base: '' });
  const [guardando, setGuardando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { showToast } = useToast();

  const cargarTratamientos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await tratamientosAPI.getAll();
      setTratamientos(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los tratamientos.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargarTratamientos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio_base) {
      setError('Completá nombre y precio.');
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const payload = { nombre: form.nombre.trim(), precio_base: form.precio_base, activo: true };
      if (form.id) {
        await tratamientosAPI.update(form.id, payload);
        showToast('Tratamiento actualizado', 'success');
      } else {
        await tratamientosAPI.create(payload);
        showToast('Tratamiento creado', 'success');
      }
      setForm({ id: null, nombre: '', precio_base: '' });
      await cargarTratamientos();
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  const handleDelete = async (t) => {
    try {
      await tratamientosAPI.delete(t.id);
      showToast('Tratamiento eliminado', 'success');
      if (form.id === t.id) setForm({ id: null, nombre: '', precio_base: '' });
      await cargarTratamientos();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo eliminar (puede estar en uso).'), 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <Card>
      <PageHeader title="Tratamientos" subtitle="Catálogo de prestaciones" />

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="form-row-2">
          <div className="form-field">
            <label className="form-label">Nombre</label>
            <input type="text" name="nombre" className="form-input" value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Limpieza, Blanqueamiento..." />
          </div>
          <div className="form-field">
            <label className="form-label">Precio base</label>
            <input type="number" name="precio_base" className="form-input" value={form.precio_base} onChange={(e) => setForm((p) => ({ ...p, precio_base: e.target.value }))} min="0" step="50" />
          </div>
        </div>
        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={guardando}>
            {guardando ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Agregar'}
          </Button>
          {form.id && (
            <Button type="button" variant="secondary" onClick={() => setForm({ id: null, nombre: '', precio_base: '' })}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {cargando ? (
        <Spinner />
      ) : tratamientos.length === 0 ? (
        <EmptyState icon="🦷" title="Sin tratamientos" description="Agregá el primero con el formulario de arriba." />
      ) : (
        tratamientos.map((t, i) => (
          <motion.div key={t.id} className="data-card" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <div className="data-card-header">
              <div>
                <div className="data-card-title">{t.nombre}</div>
                <div className="data-card-meta" style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-principal)', marginTop: '0.25rem' }}>
                  ${Number(t.precio_base).toLocaleString('es-AR')}
                </div>
              </div>
              {!t.activo && <Badge variant="warning">Inactivo</Badge>}
            </div>
            <div className="data-card-actions">
              <Button size="sm" variant="secondary" onClick={() => setForm({ id: t.id, nombre: t.nombre, precio_base: String(t.precio_base) })}>
                Editar
              </Button>
              <Button size="sm" variant="danger" onClick={() => setConfirmDelete(t)}>
                Eliminar
              </Button>
            </div>
          </motion.div>
        ))
      )}

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar tratamiento"
        message={`¿Eliminar "${confirmDelete?.nombre}"?`}
        danger
        confirmLabel="Eliminar"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
      />
    </Card>
  );
}

export default TratamientosPage;
