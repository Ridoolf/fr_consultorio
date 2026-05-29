import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { pacientesAPI, turnosAPI, tratamientosAPI } from "../services/api";

const initialForm = {
  paciente: "",
  fecha: "",
  hora_inicio: "",
  duracion_minutos: 30,
  motivo: "",
  notas_internas: "",
};

function formatoFechaInput(fecha) {
  return fecha.toISOString().slice(0, 10); // YYYY-MM-DD
}

function TurnoForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // leer fecha de la URL si viene: /turnos/nuevo?fecha=2026-05-25
  const params = new URLSearchParams(location.search);
  const fechaInicial = params.get("fecha") || formatoFechaInput(new Date());

  const [form, setForm] = useState(() => ({
    ...initialForm,
    fecha: fechaInicial,
  }));

  const [pacientes, setPacientes] = useState([]);
  const [cargandoPacientes, setCargandoPacientes] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [busquedaPaciente, setBusquedaPaciente] = useState("");
  const [tratamientos, setTratamientos] = useState([]);
  const [cargandoTratamientos, setCargandoTratamientos] = useState(true);


  // Cargar pacientes para el selector
  useEffect(() => {
    const cargar = async () => {
      try {
        // incluimos inactivos = false para ver solo activos
        const res = await pacientesAPI.getAll({ activos: "false" });
        setPacientes(res.data);
      } catch {
        setError("No se pudieron cargar los pacientes.");
      } finally {
        setCargandoPacientes(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    const cargarTratamientos = async () => {
      try {
        const res = await tratamientosAPI.getAll({ activos: 'true' });
        setTratamientos(res.data);
      } catch {
        // si falla, igual dejamos que pueda escribir a mano más adelante si quisieras
      } finally {
        setCargandoTratamientos(false);
      }
    };
    cargarTratamientos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "duracion_minutos" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      await turnosAPI.create(form);
      navigate("/turnos");
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el turno. Revisá los datos.");
    } finally {
      setGuardando(false);
    }
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    const texto = `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase();
    return texto.includes(busquedaPaciente.toLowerCase());
  });

  return (
    <div className="card">
      <div className="card-title">Nuevo turno</div>

      {error && (
        <div style={{ color: "var(--color-error)", marginBottom: "0.5rem" }}>
          {error}
        </div>
      )}

      {cargandoPacientes ? (
        <div>Cargando pacientes...</div>
      ) : (
        <form onSubmit={handleSubmit} className="form-grid">
          {/* Paciente */}
          <div className="form-field">
            <label className="form-label">Paciente</label>
            <input
              type="text"
              value={busquedaPaciente}
              onChange={(e) => setBusquedaPaciente(e.target.value)}
              placeholder="Buscar por nombre o DNI..."
              className="form-input"
              style={{ marginBottom: "0.4rem" }}
            />
            <select
              name="paciente"
              value={form.paciente}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">Seleccionar paciente...</option>
              {pacientesFiltrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.apellido}, {p.nombre} (DNI {p.dni})
                </option>
              ))}
            </select>
          </div>

          {/* Fecha + hora */}
          <div className="form-row-2">
            <div className="form-field">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label">Hora inicio</label>
              <input
                type="time"
                name="hora_inicio"
                value={form.hora_inicio}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Duración */}
          <div className="form-field">
            <label className="form-label">Duración (minutos)</label>
            <input
              type="number"
              name="duracion_minutos"
              value={form.duracion_minutos}
              onChange={handleChange}
              min={5}
              step={5}
              className="form-input"
            />
          </div>

          {/* Motivo */}
          <div className="form-field">
            <label className="form-label">Motivo (tratamiento)</label>
            {cargandoTratamientos ? (
              <div>Cargando tratamientos...</div>
            ) : (
              <select
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">Seleccionar tratamiento...</option>
                {tratamientos.map((t) => (
                  <option key={t.id} value={t.nombre}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>


          {/* Notas internas */}
          <div className="form-field">
            <label className="form-label">Notas internas</label>
            <textarea
              name="notas_internas"
              value={form.notas_internas}
              onChange={handleChange}
              rows={2}
              className="form-textarea"
            />
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={guardando}
              className="btn btn-primary"
            >
              {guardando ? "Guardando..." : "Guardar turno"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/turnos")}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default TurnoForm;
