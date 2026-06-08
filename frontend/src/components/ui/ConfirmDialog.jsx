import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmar', danger, onConfirm, onCancel }) {
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
            <h3 className="dialog-title">{title}</h3>
            <p className="dialog-message">{message}</p>
            <div className="dialog-actions">
              <Button variant="secondary" size="lg" onClick={onCancel}>
                Cancelar
              </Button>
              <Button
                variant={danger ? 'danger' : 'primary'}
                size="lg"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
