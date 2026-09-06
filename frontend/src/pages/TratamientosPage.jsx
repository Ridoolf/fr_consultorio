import { useCallback, useEffect, useState } from 'react';
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
import DuplicateTratamientoDialog from '../components/ui/DuplicateTratamientoDialog';
import TratamientoEditDialog from '../components/ui/TratamientoEditDialog';

const emptyCreateForm = () => ({ nombre: '', precio_base: '' });

function normalizeNombre(nombre) {
  return nombre.trim().toLowerCase();
}

function findDuplicate(tratamientos, nombre, excludeId = null) {
  const key = normalizeNombre(nombre);
  return tratamientos.find(
    (t) => normalizeNombre(t.nombre) === key && t.id !== excludeId,
  ) || null;
}

function extractDuplicateExisting(err) {
  const data = err?.response?.data;
  if (!data) return null;
  if (data.code === 'duplicate_name' && data.existing) {
    return {
      ...data.existing,
      id: Number(data.existing.id),
      precio_base: data.existing.precio_base,
    };
  }
  return null;
}

function TratamientosPage() {
  const [tratamientos, setTratamientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyCreateForm());
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [duplicateDialog, setDuplicateDialog] = useState(null);
  const [incluirInactivos, setIncluirInactivos] = useState(false);
  const { showToast } = useToast();

  const cargarTratamientos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = incluirInactivos ? { activos: 'false' } : {};
      const res = await tratamientosAPI.getAll(params);
      setTratamientos(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los tratamientos.'));
    } finally {
      setCargando(false);
    }
  }, [incluirInactivos]);

  useEffect(() => { cargarTratamientos(); }, [cargarTratamientos]);

  const resetCreateForm = () => setForm(emptyCreateForm());

  const guardarTratamiento = async (payload, id = null) => {
    setGuardando(true);
    setError(null);
    setEditError(null);
    try {
      if (id) {
        await tratamientosAPI.update(id, payload);
        showToast('Tratamiento actualizado', 'success');
      } else {
        await tratamientosAPI.create(payload);
        showToast('Tratamiento creado', 'success');
      }
      resetCreateForm();
      setEditForm(null);
      await cargarTratamientos();
      return true;
    } catch (err) {
      const existing = extractDuplicateExisting(err);
      if (existing && !id) {
        setDuplicateDialog({
          existing,
          nuevoPrecio: payload.precio_base,
        });
        return false;
      }
      const msg = getErrorMessage(err, 'No se pudo guardar.');
      if (id) {
        setEditError(msg);
      } else {
        setError(msg);
      }
      return false;
    } finally {
      setGuardando(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.precio_base) {
      setError('Completá nombre y precio.');
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      precio_base: form.precio_base,
      activo: true,
    };

    const dup = findDuplicate(tratamientos, form.nombre);
    if (dup) {
      setDuplicateDialog({ existing: dup, nuevoPrecio: form.precio_base });
      return;
    }

    await guardarTratamiento(payload);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm?.nombre?.trim() || !editForm?.precio_base) {
      setEditError('Completá nombre y precio.');
      return;
    }

    const dup = findDuplicate(tratamientos, editForm.nombre, editForm.id);
    if (dup) {
      setEditError(`Ya existe "${dup.nombre}". Elegí otro nombre.`);
      return;
    }

    await guardarTratamiento(
      {
        nombre: editForm.nombre.trim(),
        precio_base: editForm.precio_base,
        activo: true,
      },
      editForm.id,
    );
  };

  const abrirEditar = (t) => {
    setEditError(null);
    setEditForm({
      id: t.id,
      nombre: t.nombre,
      precio_base: String(t.precio_base),
    });
  };

  const handleUpdatePriceFromDialog = async () => {
    if (!duplicateDialog?.existing) return;
    const { existing, nuevoPrecio } = duplicateDialog;
    setDuplicateDialog(null);
    await guardarTratamiento(
      {
        nombre: existing.nombre,
        precio_base: nuevoPrecio,
        activo: true,
      },
      existing.id,
    );
  };

  const handleEditFromDuplicateDialog = () => {
    if (!duplicateDialog?.existing) return;
    const { existing } = duplicateDialog;
    setDuplicateDialog(null);
    abrirEditar(existing);
  };

  const handleDelete = async (t) => {
    try {
      await tratamientosAPI.delete(t.id);
      showToast('Tratamiento eliminado', 'success');
      if (editForm?.id === t.id) setEditForm(null);
      await cargarTratamientos();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo eliminar (puede estar en uso).'), 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleToggleActivo = async (t) => {
    try {
      await tratamientosAPI.update(t.id, {
        nombre: t.nombre,
        precio_base: t.precio_base,
        activo: !t.activo,
      });
      showToast(t.activo ? 'Tratamiento desactivado' : 'Tratamiento activado', 'success');
      if (editForm?.id === t.id && t.activo) setEditForm(null);
      await cargarTratamientos();
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo actualizar el tratamiento.'), 'error');
    } finally {
      setConfirmToggle(null);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Tratamientos" subtitle="Catálogo de prestaciones" />

      {error && <div className="error-box">{error}</div>}

      <Card>
        <h3 className="page-header-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
          Nuevo tratamiento
        </h3>
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                className="form-input"
                value={form.nombre}
                onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                placeholder="Ej: Limpieza, Blanqueamiento..."
              />
            </div>
            <div className="form-field">
              <label className="form-label">Precio base</label>
              <input
                type="number"
                name="precio_base"
                className="form-input"
                value={form.precio_base}
                onChange={(e) => setForm((p) => ({ ...p, precio_base: e.target.value }))}
                min="0"
                step="50"
              />
            </div>
          </div>
          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={guardando}>
              {guardando && !editForm ? 'Guardando...' : 'Agregar'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <label className="form-checkbox" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={incluirInactivos}
            onChange={(e) => setIncluirInactivos(e.target.checked)}
          />
          Incluir inactivos
        </label>

        {cargando ? (
          <Spinner />
        ) : tratamientos.length === 0 ? (
          <EmptyState icon="🦷" title="Sin tratamientos" description="Agregá el primero con el formulario de arriba." />
        ) : (
          tratamientos.map((t, i) => (
            <motion.div
              key={t.id}
              className="data-card"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="data-card-header">
                <div>
                  <div className="data-card-title">{t.nombre}</div>
                  <div
                    className="data-card-meta"
                    style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-principal)', marginTop: '0.25rem' }}
                  >
                    ${Number(t.precio_base).toLocaleString('es-AR')}
                  </div>
                  {t.en_uso && (
                    <div className="form-hint" style={{ marginTop: '0.35rem' }}>
                      Tiene cobros registrados. Desactivá en lugar de eliminar.
                    </div>
                  )}
                </div>
                {!t.activo && <Badge variant="warning">Inactivo</Badge>}
              </div>
              <div className="data-card-actions">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => abrirEditar(t)}
                >
                  Editar
                </Button>
                {t.en_uso ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setConfirmToggle({
                        tratamiento: t,
                        title: t.activo ? 'Desactivar tratamiento' : 'Activar tratamiento',
                        message: t.activo
                          ? `¿Desactivar "${t.nombre}"? No aparecerá en nuevos cobros.`
                          : `¿Activar "${t.nombre}"?`,
                      })
                    }
                  >
                    {t.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                ) : (
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(t)}>
                    Eliminar
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </Card>

      <TratamientoEditDialog
        open={Boolean(editForm)}
        form={editForm || { nombre: '', precio_base: '' }}
        guardando={guardando}
        error={editError}
        onChange={handleEditChange}
        onCancel={() => { setEditForm(null); setEditError(null); }}
        onSubmit={handleEditSubmit}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Eliminar tratamiento"
        message={`¿Eliminar "${confirmDelete?.nombre}"?`}
        danger
        confirmLabel="Eliminar"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
      />

      <ConfirmDialog
        open={Boolean(confirmToggle)}
        title={confirmToggle?.title}
        message={confirmToggle?.message}
        confirmLabel={confirmToggle?.tratamiento?.activo ? 'Desactivar' : 'Activar'}
        danger={confirmToggle?.tratamiento?.activo}
        onCancel={() => setConfirmToggle(null)}
        onConfirm={() => confirmToggle && handleToggleActivo(confirmToggle.tratamiento)}
      />

      <DuplicateTratamientoDialog
        open={Boolean(duplicateDialog)}
        existing={duplicateDialog?.existing}
        nuevoPrecio={duplicateDialog?.nuevoPrecio}
        onCancel={() => setDuplicateDialog(null)}
        onUpdatePrice={handleUpdatePriceFromDialog}
        onEditInForm={handleEditFromDuplicateDialog}
      />
    </div>
  );
}

export default TratamientosPage;
