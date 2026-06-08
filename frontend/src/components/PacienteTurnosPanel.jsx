import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { turnosAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import Badge from './ui/Badge';
import Spinner from './ui/Spinner';
import EmptyState from './ui/EmptyState';
import Button from './ui/Button';

function PacienteTurnosPanel({ pacienteId }) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pacienteId) return;
    setCargando(true);
    turnosAPI
      .getAll({ paciente: pacienteId })
      .then((res) => setTurnos(res.data))
      .catch((err) => setError(getErrorMessage(err, 'No se pudieron cargar los turnos.')))
      .finally(() => setCargando(false));
  }, [pacienteId]);

  if (cargando) return <Spinner />;
  if (error) return <div className="error-box">{error}</div>;

  if (turnos.length === 0) {
    return (
      <EmptyState
        icon="📅"
        title="Sin turnos"
        description="Este paciente no tiene turnos registrados."
        action={
          <Link to={`/turnos/nuevo?paciente=${pacienteId}`}>
            <Button variant="primary">+ Nuevo turno</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      {turnos.map((t) => (
        <div key={t.id} className="data-card">
          <div className="data-card-header">
            <div>
              <div className="data-card-title">{t.fecha} · {t.hora_inicio?.slice(0, 5)}</div>
              <div className="data-card-meta">{t.motivo || 'Sin motivo'}</div>
            </div>
            <Badge estado={t.estado} />
          </div>
          <Link to={`/turnos/${t.id}/editar`}>
            <Button size="sm" variant="ghost">Editar</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default PacienteTurnosPanel;
