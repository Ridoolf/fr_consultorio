import { useEffect, useState } from 'react';
import { pagosAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';

function PacientePagosPanel({ pacienteId }) {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pacienteId) return;
    setCargando(true);
    pagosAPI
      .getAll({ paciente: pacienteId })
      .then((res) => setPagos(res.data))
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar los pagos.')))
      .finally(() => setCargando(false));
  }, [pacienteId]);

  if (cargando) return <Spinner />;
  if (error) return <div className="error-box">{error}</div>;
  if (pagos.length === 0) {
    return <EmptyState icon="💰" title="Sin pagos" description="Este paciente no tiene pagos registrados." />;
  }

  return (
    <div>
      {pagos.map((p) => (
        <div key={p.id} className="data-card">
          <div className="data-card-header">
            <div>
              <div className="data-card-title">{p.fecha}</div>
              <div className="data-card-meta">
                {p.items?.[0]?.tratamiento_nombre || '-'} · {p.medio}
              </div>
            </div>
            <strong style={{ color: 'var(--color-principal)' }}>
              ${Number(p.monto_total).toLocaleString('es-AR')}
            </strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PacientePagosPanel;
