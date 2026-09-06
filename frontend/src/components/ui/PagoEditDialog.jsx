import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

function PagoEditDialog({
  open,
  form,
  pacientes,
  tratamientos,
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
            className="dialog dialog-wide"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="dialog-title">Editar cobro</h3>
            {error && <div className="error-box" style={{ marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={onSubmit} className="form-grid">
              <div className="form-field">
                <label className="form-label">Paciente</label>
                <select
                  name="paciente"
                  className="form-select"
                  value={form.paciente}
                  onChange={onChange}
                  required
                >
                  <option value="">Seleccionar...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>{p.apellido}, {p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  className="form-input"
                  value={form.fecha}
                  onChange={onChange}
                  required
                />
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Tratamiento</label>
                  <select
                    name="tratamiento"
                    className="form-select"
                    value={form.tratamiento}
                    onChange={onChange}
                    required
                  >
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
                  <input
                    type="number"
                    name="cantidad"
                    className="form-input"
                    value={form.cantidad}
                    onChange={onChange}
                    min="1"
                  />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-field">
                  <label className="form-label">Precio unitario</label>
                  <input
                    type="number"
                    name="precio_unitario"
                    className="form-input"
                    value={form.precio_unitario}
                    onChange={onChange}
                    min="0"
                    step="50"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Medio de pago</label>
                  <select name="medio" className="form-select" value={form.medio} onChange={onChange}>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
              </div>
              <div className="caja-total-box">
                <div className="caja-total-label">Total</div>
                <div className="caja-total-value">
                  ${Number(form.monto_total || 0).toLocaleString('es-AR')}
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Notas</label>
                <textarea
                  name="notas"
                  className="form-textarea"
                  value={form.notas}
                  onChange={onChange}
                  rows={2}
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

export default PagoEditDialog;
