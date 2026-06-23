import { useMemo, useState } from 'react';
import {
  PIEZAS_INFERIOR_DERECHA,
  PIEZAS_INFERIOR_IZQUIERDA,
  PIEZAS_PRIM_INF_DERECHA,
  PIEZAS_PRIM_INF_IZQUIERDA,
  PIEZAS_PRIM_SUP_DERECHA,
  PIEZAS_PRIM_SUP_IZQUIERDA,
  PIEZAS_SUPERIOR_DERECHA,
  PIEZAS_SUPERIOR_IZQUIERDA,
  TODAS_LAS_PIEZAS,
  colorPieza,
  esAusente,
  labelEstado,
  piezaTieneHallazgos,
  piezaVacia,
} from '../utils/odontograma';

const CUADRANTES = [
  {
    id: 'sup-der',
    label: 'Sup. der.',
    filas: [
      { label: 'Permanente', numeros: PIEZAS_SUPERIOR_DERECHA },
      { label: 'Primaria', numeros: PIEZAS_PRIM_SUP_DERECHA },
    ],
  },
  {
    id: 'sup-izq',
    label: 'Sup. izq.',
    filas: [
      { label: 'Permanente', numeros: PIEZAS_SUPERIOR_IZQUIERDA },
      { label: 'Primaria', numeros: PIEZAS_PRIM_SUP_IZQUIERDA },
    ],
  },
  {
    id: 'inf-der',
    label: 'Inf. der.',
    filas: [
      { label: 'Primaria', numeros: PIEZAS_PRIM_INF_DERECHA },
      { label: 'Permanente', numeros: PIEZAS_INFERIOR_DERECHA },
    ],
  },
  {
    id: 'inf-izq',
    label: 'Inf. izq.',
    filas: [
      { label: 'Primaria', numeros: PIEZAS_PRIM_INF_IZQUIERDA },
      { label: 'Permanente', numeros: PIEZAS_INFERIOR_IZQUIERDA },
    ],
  },
];

function resumenPieza(numero, piezas) {
  const datos = piezas[numero] || piezaVacia();
  if (!piezaTieneHallazgos(datos)) return null;
  const estado = labelEstado(datos.estado);
  const caras = Object.entries(datos.superficies || {})
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ');
  const partes = [estado !== 'Sano' ? estado : null, caras ? `caras ${caras}` : null].filter(Boolean);
  return partes.length ? partes.join(' · ') : 'Marcada';
}

function PiezaBtn({ num, piezas, piezaSeleccionada, onSelectPieza }) {
  const datos = piezas[num] || piezaVacia();
  const ausente = esAusente(datos.estado);
  const marcada = piezaTieneHallazgos(datos);

  return (
    <button
      type="button"
      className={[
        'odontograma-lista-pieza',
        piezaSeleccionada === num ? 'selected' : '',
        marcada ? 'marcada' : '',
        ausente ? 'ausente' : '',
      ].filter(Boolean).join(' ')}
      style={{ '--pieza-estado-color': colorPieza(datos) }}
      onClick={() => onSelectPieza(num)}
      aria-pressed={piezaSeleccionada === num}
      aria-label={`Pieza ${num}`}
    >
      <span className="odontograma-lista-pieza-num">{num}</span>
    </button>
  );
}

function OdontogramaPiezaPicker({ piezas, piezaSeleccionada, onSelectPieza }) {
  const [cuadranteActivo, setCuadranteActivo] = useState('sup-der');
  const [busqueda, setBusqueda] = useState('');

  const hallazgos = useMemo(
    () => TODAS_LAS_PIEZAS
      .filter((num) => piezaTieneHallazgos(piezas[num]))
      .map((num) => ({ num, resumen: resumenPieza(num, piezas) })),
    [piezas],
  );

  const cuadrante = CUADRANTES.find((c) => c.id === cuadranteActivo) || CUADRANTES[0];

  const sugerencias = useMemo(() => {
    const q = busqueda.trim();
    if (!q) return [];
    return TODAS_LAS_PIEZAS.filter((n) => n.startsWith(q)).slice(0, 8);
  }, [busqueda]);

  const aplicarBusqueda = () => {
    const q = busqueda.trim();
    if (!q) return;
    const exacta = TODAS_LAS_PIEZAS.find((n) => n === q);
    const match = exacta || sugerencias[0];
    if (match) {
      onSelectPieza(match);
      const cuad = CUADRANTES.find((c) => c.filas.some((f) => f.numeros.includes(match)));
      if (cuad) setCuadranteActivo(cuad.id);
      setBusqueda('');
    }
  };

  return (
    <div className="odontograma-lista">
      <div className="odontograma-lista-busqueda">
        <label className="form-label" htmlFor="odontograma-buscar-pieza">
          Buscar pieza
        </label>
        <div className="odontograma-lista-busqueda-row">
          <input
            id="odontograma-buscar-pieza"
            type="text"
            inputMode="numeric"
            className="form-input"
            placeholder="Ej. 36, 51..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value.replace(/\D/g, '').slice(0, 2))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                aplicarBusqueda();
              }
            }}
          />
          <button type="button" className="btn btn-secondary" onClick={aplicarBusqueda}>
            Ir
          </button>
        </div>
        {sugerencias.length > 0 && busqueda && (
          <div className="odontograma-lista-sugerencias">
            {sugerencias.map((num) => (
              <button
                key={num}
                type="button"
                className="odontograma-lista-sugerencia"
                onClick={() => {
                  onSelectPieza(num);
                  const cuad = CUADRANTES.find((c) => c.filas.some((f) => f.numeros.includes(num)));
                  if (cuad) setCuadranteActivo(cuad.id);
                  setBusqueda('');
                }}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </div>

      {hallazgos.length > 0 && (
        <div className="odontograma-lista-hallazgos">
          <span className="odontograma-lista-hallazgos-titulo">Con registro</span>
          <div className="odontograma-lista-chips">
            {hallazgos.map(({ num, resumen }) => (
              <button
                key={num}
                type="button"
                className={`odontograma-lista-chip${piezaSeleccionada === num ? ' active' : ''}`}
                onClick={() => {
                  onSelectPieza(num);
                  const cuad = CUADRANTES.find((c) => c.filas.some((f) => f.numeros.includes(num)));
                  if (cuad) setCuadranteActivo(cuad.id);
                }}
              >
                <span className="odontograma-lista-chip-num">{num}</span>
                <span className="odontograma-lista-chip-resumen">{resumen}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="odontograma-lista-tabs" role="tablist" aria-label="Cuadrante">
        {CUADRANTES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={cuadranteActivo === c.id}
            className={`odontograma-lista-tab${cuadranteActivo === c.id ? ' active' : ''}`}
            onClick={() => setCuadranteActivo(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="odontograma-lista-cuadrante" role="tabpanel">
        {cuadrante.filas.map((fila) => (
          <div key={fila.label} className="odontograma-lista-fila">
            <span className="odontograma-lista-fila-label">{fila.label}</span>
            <div className="odontograma-lista-grid odontograma-lista-grid--fila">
              {fila.numeros.map((num) => (
                <PiezaBtn
                  key={num}
                  num={num}
                  piezas={piezas}
                  piezaSeleccionada={piezaSeleccionada}
                  onSelectPieza={onSelectPieza}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OdontogramaPiezaPicker;
