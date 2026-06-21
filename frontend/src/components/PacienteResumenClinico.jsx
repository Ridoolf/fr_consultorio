import { useEffect, useState } from 'react';
import { alertasAPI } from '../services/api';
import Spinner from './ui/Spinner';

const RESUMEN_CONFIG = [
  { key: 'alergia', titulo: 'Alertas médicas', vacio: 'No tiene' },
  { key: 'enfermedad', titulo: 'Enfermedades', vacio: 'No tiene' },
  { key: 'medicacion', titulo: 'Medicamentos', vacio: 'No tiene' },
];

function ResumenCard({ config, items, onClick }) {
  const tiene = items.length > 0;

  return (
    <button type="button" className="resumen-clinico-card" onClick={onClick}>
      <div className="resumen-clinico-body">
        <span className="resumen-clinico-titulo">{config.titulo}</span>
        {tiene ? (
          <ul className="resumen-clinico-lista">
            {items.slice(0, 3).map((a) => (
              <li key={a.id}>{a.descripcion}</li>
            ))}
            {items.length > 3 && (
              <li className="resumen-clinico-mas">+{items.length - 3} más</li>
            )}
          </ul>
        ) : (
          <span className="resumen-clinico-vacio">{config.vacio}</span>
        )}
      </div>
    </button>
  );
}

function PacienteResumenClinico({ pacienteId, onIrAAlertas }) {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!pacienteId) return;
    let cancelado = false;
    alertasAPI
      .getByPaciente(pacienteId)
      .then((res) => {
        if (!cancelado) setAlertas((res.data || []).filter((a) => a.activa !== false));
      })
      .catch(() => {
        if (!cancelado) setAlertas([]);
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => { cancelado = true; };
  }, [pacienteId]);

  if (cargando) {
    return (
      <div className="resumen-clinico resumen-clinico--loading">
        <Spinner label="Cargando resumen clínico..." />
      </div>
    );
  }

  const porTipo = RESUMEN_CONFIG.reduce((acc, cfg) => {
    acc[cfg.key] = alertas.filter((a) => a.tipo === cfg.key);
    return acc;
  }, {});

  return (
    <div className="resumen-clinico">
      {RESUMEN_CONFIG.map((cfg) => (
        <ResumenCard
          key={cfg.key}
          config={cfg}
          items={porTipo[cfg.key]}
          onClick={() => onIrAAlertas?.()}
        />
      ))}
    </div>
  );
}

export default PacienteResumenClinico;
