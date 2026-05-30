import { useEffect, useState } from 'react';
import { pagosAPI } from '../services/api';

function PacientePagosPanel({ pacienteId }) {
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarPagos = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await pagosAPI.getAll({ paciente: pacienteId });
      setPagos(res.data);
    } catch {
      setError('No se pudieron cargar los pagos de este paciente.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!pacienteId) return;
    cargarPagos();
  }, [pacienteId]);

  if (cargando) return <div>Cargando pagos del paciente...</div>;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3
        style={{
          fontSize: '1rem',
          marginBottom: '0.5rem',
          color: 'var(--color-principal)',
        }}
      >
        Pagos del paciente
      </h3>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '0.5rem' }}>
          {error}
        </div>
      )}

      {pagos.length === 0 ? (
        <p>Este paciente aún no tiene pagos registrados.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Tratamiento</th>
              <th>Monto</th>
              <th>Medio</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((p) => (
              <tr key={p.id}>
                <td>{p.fecha}</td>
                <td>
                  {p.items && p.items.length > 0
                    ? p.items[0].tratamiento_nombre
                    : '-'}
                </td>
                <td>${Number(p.monto_total).toLocaleString('es-AR')}</td>
                <td>{p.medio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PacientePagosPanel;
