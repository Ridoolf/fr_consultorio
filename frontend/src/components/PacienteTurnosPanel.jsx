import { useEffect, useState } from 'react';
import { turnosAPI } from '../services/api';

function PacienteTurnosPanel({ pacienteId }) {
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarTurnos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await turnosAPI.getAll({ paciente: pacienteId });
      setTurnos(res.data);
    } catch {
      setError('No se pudieron cargar los turnos de este paciente.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!pacienteId) return;
    cargarTurnos();
  }, [pacienteId]);

  const colorEstado = (estado) => {
    if (estado === 'pendiente') return '#856404';
    if (estado === 'confirmado') return '#004085';
    if (estado === 'realizado') return '#155724';
    return '#721c24'; // cancelado
  };

  if (cargando) return <div>Cargando turnos del paciente...</div>;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3
        style={{
          fontSize: '1rem',
          marginBottom: '0.5rem',
          color: 'var(--color-principal)',
        }}
      >
        Turnos del paciente
      </h3>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      {turnos.length === 0 ? (
        <p>Este paciente aún no tiene turnos registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Motivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.fecha}</td>
                <td>{t.hora_inicio.slice(0, 5)}</td>
                <td>{t.motivo}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.03)',
                      color: colorEstado(t.estado),
                    }}
                  >
                    {t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PacienteTurnosPanel;
