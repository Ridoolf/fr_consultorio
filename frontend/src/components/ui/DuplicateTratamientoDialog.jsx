import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

function DuplicateTratamientoDialog({
  open,
  existing,
  nuevoPrecio,
  onCancel,
  onUpdatePrice,
  onEditInForm,
}) {
  if (!existing) return null;

  const precioActual = Number(existing.precio_base).toLocaleString('es-AR');
  const precioNuevo = Number(nuevoPrecio || 0).toLocaleString('es-AR');

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
            role="alertdialog"
            aria-modal="true"
          >
            <h3 className="dialog-title">Tratamiento ya existente</h3>
            <p className="dialog-message">
              Ya existe <strong>{existing.nombre}</strong> con precio ${precioActual}.
              {nuevoPrecio ? (
                <> ¿Querés actualizar el precio a ${precioNuevo}?</>
              ) : (
                <> Podés editarlo en lugar de crear uno duplicado.</>
              )}
            </p>
            <div className="dialog-actions dialog-actions-stack">
              {nuevoPrecio && (
                <Button variant="primary" size="lg" onClick={onUpdatePrice}>
                  Actualizar precio
                </Button>
              )}
              <Button variant="secondary" size="lg" onClick={onEditInForm}>
                Editar tratamiento
              </Button>
              <Button variant="secondary" size="lg" onClick={onCancel}>
                Cancelar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DuplicateTratamientoDialog;
