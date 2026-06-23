import {
  PIEZAS_INFERIOR_DERECHA,
  PIEZAS_INFERIOR_IZQUIERDA,
  PIEZAS_PRIM_INF_DERECHA,
  PIEZAS_PRIM_INF_IZQUIERDA,
  PIEZAS_PRIM_SUP_DERECHA,
  PIEZAS_PRIM_SUP_IZQUIERDA,
  PIEZAS_SUPERIOR_DERECHA,
  PIEZAS_SUPERIOR_IZQUIERDA,
  colorPieza,
  esAusente,
  labelEstado,
  piezaVacia,
} from '../utils/odontograma';

const GRUPOS = [
  { id: 'sup-der-p', label: 'Superior derecha · permanente', numeros: PIEZAS_SUPERIOR_DERECHA },
  { id: 'sup-der-r', label: 'Superior derecha · primaria', numeros: PIEZAS_PRIM_SUP_DERECHA },
  { id: 'sup-izq-p', label: 'Superior izquierda · permanente', numeros: PIEZAS_SUPERIOR_IZQUIERDA },
  { id: 'sup-izq-r', label: 'Superior izquierda · primaria', numeros: PIEZAS_PRIM_SUP_IZQUIERDA },
  { id: 'inf-der-r', label: 'Inferior derecha · primaria', numeros: PIEZAS_PRIM_INF_DERECHA },
  { id: 'inf-der-p', label: 'Inferior derecha · permanente', numeros: PIEZAS_INFERIOR_DERECHA },
  { id: 'inf-izq-r', label: 'Inferior izquierda · primaria', numeros: PIEZAS_PRIM_INF_IZQUIERDA },
  { id: 'inf-izq-p', label: 'Inferior izquierda · permanente', numeros: PIEZAS_INFERIOR_IZQUIERDA },
];

function piezaTieneHallazgos(pieza) {
  const datos = pieza || piezaVacia();
  if (datos.estado && datos.estado !== 'sano') return true;
  if (datos.nota?.trim()) return true;
  return Object.values(datos.superficies || {}).some(Boolean);
}

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

function OdontogramaPiezaPicker({ piezas, piezaSeleccionada, onSelectPieza }) {
  const hallazgos = GRUPOS.flatMap((g) => g.numeros)
    .filter((num) => piezaTieneHallazgos(piezas[num]))
    .map((num) => ({ num, resumen: resumenPieza(num, piezas) }));

  return (
    <div className="odontograma-lista">
      {hallazgos.length > 0 && (
        <div className="odontograma-lista-hallazgos">
          <span className="odontograma-lista-hallazgos-titulo">Piezas con registro</span>
          <div className="odontograma-lista-chips">
            {hallazgos.map(({ num, resumen }) => (
              <button
                key={num}
                type="button"
                className={`odontograma-lista-chip${piezaSeleccionada === num ? ' active' : ''}`}
                onClick={() => onSelectPieza(num)}
              >
                <span className="odontograma-lista-chip-num">{num}</span>
                <span className="odontograma-lista-chip-resumen">{resumen}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="odontograma-lista-grupos">
        {GRUPOS.map((grupo) => (
          <section key={grupo.id} className="odontograma-lista-grupo">
            <h4 className="odontograma-lista-grupo-titulo">{grupo.label}</h4>
            <div className="odontograma-lista-grid">
              {grupo.numeros.map((num) => {
                const datos = piezas[num] || piezaVacia();
                const ausente = esAusente(datos.estado);
                const marcada = piezaTieneHallazgos(datos);
                return (
                  <button
                    key={num}
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
                  >
                    <span className="odontograma-lista-pieza-num">{num}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default OdontogramaPiezaPicker;
