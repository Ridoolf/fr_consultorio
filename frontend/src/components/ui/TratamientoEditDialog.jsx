import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

function TratamientoEditDialog({
  open,
  form,
  guardando,
  error,
  onChange,
  onCancel,
  onSubmit,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="dialog-overlay" onClick={onCancel} role="presentation">
          <motion.div
            className="dialog"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="dialog-title">Editar tratamiento</h3>
            {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={onSubmit} className="form-grid">
              <div className="form-field">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-input"
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Ej: Limpieza, Blanqueamiento..."
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">Precio base</label>
                <input
                  type="number"
                  name="precio_base"
                  className="form-input"
                  value={form.precio_base}
                  onChange={onChange}
                  min="0"
                  step="50"
                  required
                />
              </div>
              <div className="dialog-actions">
                <Button type="button" variant="secondary" size="lg" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="lg" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default TratamientoEditDialog;
