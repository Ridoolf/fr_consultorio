import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { turnosAPI } from "../services/api";

function formatoFechaInput(fecha) {
  return fecha.toISOString().slice(0, 10); // YYYY-MM-DD
}

function formatoFechaLindo(yyyymmdd) {
  const [year, month, day] = yyyymmdd.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  const opciones = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return fecha.toLocaleDateString("es-AR", opciones);
}

function TurnosPage() {
  const hoy = new Date();
  const [fecha, setFecha] = useState(formatoFechaInput(hoy));
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const cargarTurnos = async (f) => {
    setCargando(true);
    setError(null);
    try {
      const res = await turnosAPI.getAll({ fecha: f });
      setTurnos(res.data);
    } catch {
      setError("No se pudieron cargar los turnos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarTurnos(fecha);
  }, [fecha]);

  const cambiarEstado = async (id, accion) => {
    if (accion === "realizado") {
      const ok = window.confirm("¿Marcar este turno como realizado?");
      if (!ok) return;
      await turnosAPI.marcarRealizado(id);
    } else if (accion === "cancelar") {
      const ok = window.confirm("¿Cancelar este turno?");
      if (!ok) return;
      await turnosAPI.cancelar(id);
    }
    await cargarTurnos(fecha);
  };

  const irADia = (delta) => {
    const d = new Date(fecha);
    d.setDate(d.getDate() + delta);
    setFecha(formatoFechaInput(d));
  };

  const badgeStyles = (estado) => {
    if (estado === "pendiente") {
      return {
        bg: "rgba(255, 193, 7, 0.15)",
        color: "#856404",
        texto: "Pendiente",
      };
    }
    if (estado === "confirmado") {
      return {
        bg: "rgba(0, 123, 255, 0.15)",
        color: "#004085",
        texto: "Confirmado",
      };
    }
    if (estado === "realizado") {
      return {
        bg: "rgba(40, 167, 69, 0.15)",
        color: "#155724",
        texto: "Realizado",
      };
    }
    return {
      bg: "rgba(220, 53, 69, 0.15)",
      texto: "Cancelado",
      color: "#721c24",
    };
  };

  return (
    <div className="card">
      {/* Línea principal: Día + selector de fecha */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "0.75rem",
        }}
      >
        <div>
          <div className="card-title">Turnos</div>
          <div
            style={{ fontSize: "0.9rem", color: "var(--color-texto-claro)" }}
          >
            Día: {formatoFechaLindo(fecha)}
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/turnos/nuevo?fecha=${fecha}`)}
          className="btn btn-primary"
          style={{ fontSize: "0.85rem" }}
        >
          + Nuevo turno
        </button>
      </div>

      {/* Flechas de navegación de día */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "0.9rem",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => irADia(-1)}
          className="btn btn-secondary"
          style={{ padding: "0.35rem 0.9rem" }}
        >
          ◀ Día anterior
        </button>
        <button
          type="button"
          onClick={() => irADia(1)}
          className="btn btn-secondary"
          style={{ padding: "0.35rem 0.9rem" }}
        >
          Día siguiente ▶
        </button>
      </div>

      {/* Leyenda simple de estados */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "0.75rem",
          fontSize: "0.8rem",
        }}
      >
        <span>Estados:</span>
        <span
          className="badge"
          style={{
            backgroundColor: "rgba(255, 193, 7, 0.15)",
            color: "#856404",
          }}
        >
          Pendiente
        </span>
        <span
          className="badge"
          style={{
            backgroundColor: "rgba(0, 123, 255, 0.15)",
            color: "#004085",
          }}
        >
          Confirmado
        </span>
        <span
          className="badge"
          style={{
            backgroundColor: "rgba(40, 167, 69, 0.15)",
            color: "#155724",
          }}
        >
          Realizado
        </span>
        <span
          className="badge"
          style={{
            backgroundColor: "rgba(220, 53, 69, 0.15)",
            color: "#721c24",
          }}
        >
          Cancelado
        </span>
      </div>

      {cargando && <div>Cargando turnos...</div>}
      {error && <div style={{ color: "var(--color-error)" }}>{error}</div>}

      {!cargando && !error && (
        <>
          {turnos.length === 0 ? (
            <p>No hay turnos para esta fecha.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {turnos.map((t) => {
                  const est = badgeStyles(t.estado);
                  return (
                    <tr key={t.id}>
                      <td>
                        {t.hora_inicio.slice(0, 5)} - {t.hora_fin.slice(0, 5)}
                      </td>
                      <td>{t.paciente_nombre_completo}</td>
                      <td>{t.motivo || "-"}</td>
                      <td>
                        <span
                          className="badge"
                          style={{
                            backgroundColor: est.bg,
                            color: est.color,
                          }}
                        >
                          {est.texto}
                        </span>
                      </td>
                      <td
                        style={{
                          display: "flex",
                          gap: "0.4rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => cambiarEstado(t.id, "realizado")}
                          className="btn btn-secondary"
                          disabled={t.estado === "realizado"}
                          style={{
                            padding: "0.25rem 0.7rem",
                            fontSize: "0.8rem",
                            opacity: t.estado === "realizado" ? 0.6 : 1,
                          }}
                        >
                          Marcar realizado
                        </button>
                        <button
                          type="button"
                          onClick={() => cambiarEstado(t.id, "cancelar")}
                          className="btn btn-secondary"
                          disabled={t.estado === "cancelado"}
                          style={{
                            padding: "0.25rem 0.7rem",
                            fontSize: "0.8rem",
                            opacity: t.estado === "cancelado" ? 0.6 : 1,
                          }}
                        >
                          Cancelar turno
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

export default TurnosPage;
