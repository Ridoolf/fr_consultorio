import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pacientesAPI } from "../services/api";

const initialFilters = {
  incluirInactivos: false,
  search: "",
  ordering: "apellido", // valor por defecto
};

function PacientesList() {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const navigate = useNavigate();

  // 👇 Función única para pedir al backend con filtros
  const cargarPacientes = async (f = filters) => {
    setCargando(true);
    setError(null);

    try {
      const params = {};

      // Estado activo/inactivo
      if (f.incluirInactivos) {
        params.activos = "false"; // backend: muestra todos
      }

      // Búsqueda
      if (f.search && f.search.trim() !== "") {
        params.search = f.search.trim();
      }

      // Orden
      if (f.ordering) {
        params.ordering = f.ordering;
      }

      const res = await pacientesAPI.getAll(params);
      setPacientes(res.data);
    } catch {
      setError("No se pudieron cargar los pacientes.");
    } finally {
      setCargando(false);
    }
  };

  // Efecto: cargar cuando cambian filtros
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPacientes(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.incluirInactivos, filters.ordering]);

  // Búsqueda: la hacemos manual al presionar Enter o botón “Buscar”
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    cargarPacientes(filters);
  };

  const handleChangeFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (cargando) return <div>Cargando pacientes...</div>;
  if (error) return <div style={{ color: "var(--color-error)" }}>{error}</div>;

  return (
    <div className="card">
      {/* Header: título + botón nuevo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
        }}
      >
        <div className="card-title">Pacientes</div>
        <button
          onClick={() => navigate("/pacientes/nuevo")}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "var(--color-secundario)",
            color: "var(--color-texto)",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          + Nuevo paciente
        </button>
      </div>

      {/* Filtros */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginBottom: "0.75rem",
          alignItems: "center",
          backgroundColor: "#f7ede4",
          padding: "0.75rem",
          borderRadius: "8px",
        }}
      >
        {/* Búsqueda */}
        <div style={{ flex: "1 1 200px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              marginBottom: "0.25rem",
              color: "var(--color-texto-claro)",
            }}
          >
            Buscar (nombre, apellido, DNI, teléfono)
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChangeFilter("search", e.target.value)}
            placeholder="Ej: Pérez, 12345678..."
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.85rem",
            }}
          />
        </div>

        {/* Orden */}
        <div style={{ flex: "0 0 200px" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.8rem",
              marginBottom: "0.25rem",
              color: "var(--color-texto-claro)",
            }}
          >
            Ordenar por
          </label>
          <select
            value={filters.ordering}
            onChange={(e) => handleChangeFilter("ordering", e.target.value)}
            style={{
              width: "100%",
              padding: "0.4rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              fontSize: "0.85rem",
              backgroundColor: "white",
            }}
          >
            <option value="apellido">Apellido (A-Z)</option>
            <option value="-apellido">Apellido (Z-A)</option>
            <option value="-fecha_registro">Más nuevo primero</option>
            <option value="fecha_registro">Más antiguo primero</option>
          </select>
        </div>

        {/* Activos / inactivos */}
        <div style={{ flex: "0 0 auto" }}>
          <label
            style={{
              fontSize: "0.8rem",
              color: "var(--color-texto-claro)",
            }}
          >
            <input
              type="checkbox"
              checked={filters.incluirInactivos}
              onChange={(e) =>
                handleChangeFilter("incluirInactivos", e.target.checked)
              }
              style={{ marginRight: "0.3rem" }}
            />
            Incluir inactivos
          </label>
        </div>

        {/* Botón buscar (ejecuta el submit del form) */}
        <div style={{ flex: "0 0 auto", marginLeft: "auto" }}>
          <button
            type="submit"
            style={{
              padding: "0.45rem 1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "var(--color-principal)",
              color: "white",
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Tabla */}
      {pacientes.length === 0 ? (
        <p>No se encontraron pacientes con esos filtros.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Apellido y nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Obra social</th>
              <th>Estado</th>
              <th style={{ width: "210px" }}></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p) => (
              <tr key={p.id}>
                <td>
                  {p.apellido}, {p.nombre}
                </td>
                <td>{p.dni}</td>
                <td>{p.telefono || "-"}</td>
                <td>{p.obra_social || "-"}</td>
                <td>
                  <span
                    className={`badge ${p.activo ? "badge-activo" : "badge-inactivo"}`}
                  >
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td style={{ display: "flex", gap: "0.3rem" }}>
                  <button
                    onClick={() => navigate(`/pacientes/${p.id}`)}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      backgroundColor: "white",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap"
                    }}
                  >
                    Ver / editar
                  </button>
                  <button
                    onClick={async () => {
                      const confirmar = window.confirm(
                        `¿Seguro que querés ${p.activo ? "desactivar" : "activar"} a este paciente?`,
                      );
                      if (!confirmar) return;
                      if (p.activo) {
                        await pacientesAPI.desactivar(p.id);
                      } else {
                        await pacientesAPI.activar(p.id);
                      }
                      await cargarPacientes(filters);
                    }}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      backgroundColor: "#fdf5f3",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    {p.activo ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    onClick={async () => {
                      const confirmar = window.confirm(
                        "¿Seguro que querés eliminar este paciente?",
                      );
                      if (!confirmar) return;
                      await pacientesAPI.delete(p.id);
                      setPacientes((prev) => prev.filter((x) => x.id !== p.id));
                    }}
                    style={{
                      padding: "0.25rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid #d9534f",
                      backgroundColor: "#ffeceb",
                      color: "#a13835",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PacientesList;
