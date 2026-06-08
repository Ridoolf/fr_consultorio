import { useEffect, useId, useRef, useState } from 'react';

function etiquetaPaciente(p) {
  return `${p.apellido}, ${p.nombre} (DNI ${p.dni})`;
}

function PacienteCombobox({ pacientes, value, onChange, required, label = 'Paciente' }) {
  const listId = useId();
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const [abierto, setAbierto] = useState(false);
  const [query, setQuery] = useState('');

  const seleccionado = pacientes.find((p) => String(p.id) === String(value));

  useEffect(() => {
    if (!abierto && seleccionado) {
      setQuery(etiquetaPaciente(seleccionado));
    }
    if (!value) {
      setQuery('');
    }
  }, [seleccionado, value, abierto]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAbierto(false);
        if (seleccionado) {
          setQuery(etiquetaPaciente(seleccionado));
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [seleccionado]);

  const filtrados = pacientes.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const texto = `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase();
    return texto.includes(q);
  });

  const abrir = () => {
    setAbierto(true);
    if (seleccionado) {
      setQuery('');
    }
  };

  const elegir = (p) => {
    onChange(String(p.id));
    setQuery(etiquetaPaciente(p));
    setAbierto(false);
    inputRef.current?.blur();
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setAbierto(true);
    if (value) {
      onChange('');
    }
  };

  const handleFocus = () => {
    abrir();
  };

  return (
    <div className="form-field combobox" ref={containerRef}>
      <label className="form-label" htmlFor={listId}>
        {label}
      </label>
      <div className="combobox-control">
        <input
          ref={inputRef}
          id={listId}
          type="text"
          className="form-input combobox-input"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder="Buscar o elegir paciente..."
          autoComplete="off"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={`${listId}-listbox`}
          aria-autocomplete="list"
        />
        <button
          type="button"
          className="combobox-toggle"
          aria-label={abierto ? 'Cerrar lista' : 'Ver todos los pacientes'}
          onClick={() => {
            if (abierto) {
              setAbierto(false);
              if (seleccionado) setQuery(etiquetaPaciente(seleccionado));
            } else {
              abrir();
              inputRef.current?.focus();
            }
          }}
        >
          {abierto ? '▲' : '▼'}
        </button>
      </div>

      {abierto && (
        <ul
          id={`${listId}-listbox`}
          className="combobox-list"
          role="listbox"
        >
          {filtrados.length === 0 ? (
            <li className="combobox-empty">No hay pacientes con ese criterio</li>
          ) : (
            filtrados.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={String(p.id) === String(value)}
                  className={`combobox-option${String(p.id) === String(value) ? ' selected' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => elegir(p)}
                >
                  <span className="combobox-option-name">
                    {p.apellido}, {p.nombre}
                  </span>
                  <span className="combobox-option-meta">DNI {p.dni}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}

    </div>
  );
}

export default PacienteCombobox;
