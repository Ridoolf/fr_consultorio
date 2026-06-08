import { useState } from 'react';
import { normalizarHora } from '../../utils/hora';

function TimeInput24({ value, onChange, name, id, label = 'Hora inicio', required }) {
  const [errorLocal, setErrorLocal] = useState('');

  const handleChange = (e) => {
    setErrorLocal('');
    let v = e.target.value.replace(/[^\d:]/g, '');
    if (/^\d{4}$/.test(v)) {
      v = `${v.slice(0, 2)}:${v.slice(2)}`;
    }
    onChange(v);
  };

  const handleBlur = () => {
    if (!value.trim()) {
      setErrorLocal(required ? 'Ingresá una hora.' : '');
      return;
    }
    const normalizada = normalizarHora(value);
    if (normalizada === null) {
      setErrorLocal('Hora inválida. Usá formato 24 h (ej: 17:30 o 1730).');
      return;
    }
    setErrorLocal('');
    if (normalizada !== value) {
      onChange(normalizada);
    }
  };

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id || name}>
        {label} <span className="form-hint-inline">(24 h)</span>
      </label>
      <input
        id={id || name}
        name={name}
        type="text"
        inputMode="numeric"
        className={`form-input${errorLocal ? ' form-input-error' : ''}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="17:30"
        autoComplete="off"
        maxLength={5}
        required={required}
        aria-invalid={Boolean(errorLocal)}
      />
      {errorLocal ? (
        <span className="form-field-error">{errorLocal}</span>
      ) : (
        <span className="form-hint">Ej: 17:30 o 1730</span>
      )}
    </div>
  );
}

export default TimeInput24;
