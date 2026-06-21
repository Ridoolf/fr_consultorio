import PiezaCaraSchematic from './PiezaCaraSchematic';
import {
  ARCOS_ODONTOGRAMA,
  ESTADOS_PIEZA,
  SUPERFICIES,
  esAusente,
} from '../utils/odontograma';

function LeyendaSwatch({ estado }) {
  if (estado.value === 'ausente_patologica') {
    return <span className="odontograma-leyenda-marca odontograma-leyenda-marca--cruz" aria-hidden />;
  }
  if (estado.value === 'ausente_fisiologica') {
    return <span className="odontograma-leyenda-marca odontograma-leyenda-marca--paralelas" aria-hidden />;
  }
  return <span className="odontograma-leyenda-color" style={{ backgroundColor: estado.color }} />;
}

function Cuadrante({ fila, piezas, piezaSeleccionada, onSelectPieza, onToggleSuperficie }) {
  const alinearClass =
    fila.alinear === 'midline-end'
      ? ' alinear-midline-end'
      : fila.alinear === 'midline-start'
        ? ' alinear-midline-start'
        : ' alinear-stretch';
  const tipoClass = fila.tipo === 'primaria' ? ' cuadrante-primaria' : ' cuadrante-permanente';

  return (
    <div className={`odontograma-cuadrante${fila.invertir ? ' invertido' : ''}${alinearClass}${tipoClass}`}>
      {fila.numeros.map((num) => (
        <PiezaCaraSchematic
          key={num}
          numero={num}
          pieza={piezas[num]}
          tipo={fila.tipo}
          seleccionada={piezaSeleccionada === num}
          onSelectPieza={onSelectPieza}
          onToggleSuperficie={onToggleSuperficie}
        />
      ))}
    </div>
  );
}

function MitadBoca({ mitad, piezas, piezaSeleccionada, onSelectPieza, onToggleSuperficie }) {
  return (
    <div className="odontograma-mitad">
      {mitad.filas.map((fila) => (
        <Cuadrante
          key={fila.numeros.join('-')}
          fila={fila}
          piezas={piezas}
          piezaSeleccionada={piezaSeleccionada}
          onSelectPieza={onSelectPieza}
          onToggleSuperficie={onToggleSuperficie}
        />
      ))}
    </div>
  );
}

function OdontogramaChart({ piezas, piezaSeleccionada, onSelectPieza, onToggleSuperficie }) {
  return (
    <div className="odontograma-chart">
      <p className="odontograma-toolbar-hint">
        Dentición mixta: permanente y primaria. Clic en la pieza o en una cara para seleccionarla; en una cara también se marca la superficie.
      </p>

      <div className="odontograma-chart-body">
        <div className="odontograma-boca">
          {ARCOS_ODONTOGRAMA.map((arco, idx) => (
            <div key={arco.id} className={`odontograma-arco odontograma-arco--${arco.id}`}>
              {idx > 0 && <div className="odontograma-divisor horizontal" aria-hidden />}
              <div className="odontograma-fila">
                <MitadBoca
                  mitad={arco.mitades[0]}
                  piezas={piezas}
                  piezaSeleccionada={piezaSeleccionada}
                  onSelectPieza={onSelectPieza}
                  onToggleSuperficie={onToggleSuperficie}
                />
                <div className="odontograma-divisor vertical" aria-hidden />
                <MitadBoca
                  mitad={arco.mitades[1]}
                  piezas={piezas}
                  piezaSeleccionada={piezaSeleccionada}
                  onSelectPieza={onSelectPieza}
                  onToggleSuperficie={onToggleSuperficie}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="odontograma-leyenda">
        <span className="odontograma-leyenda-titulo">Referencias</span>
        <div className="odontograma-leyenda-grupos">
          <div className="odontograma-leyenda-grupo">
            <span className="odontograma-leyenda-grupo-titulo odontograma-leyenda-grupo-titulo--patologia">
              Patología (rojo)
            </span>
            <div className="odontograma-leyenda-grid">
              {ESTADOS_PIEZA.filter((e) => e.tipo === 'patologia').map((e) => (
                <span key={e.value} className="odontograma-leyenda-item">
                  <LeyendaSwatch estado={e} />
                  {e.label}
                </span>
              ))}
            </div>
          </div>
          <div className="odontograma-leyenda-grupo">
            <span className="odontograma-leyenda-grupo-titulo odontograma-leyenda-grupo-titulo--fisiologia">
              Fisiología (azul)
            </span>
            <div className="odontograma-leyenda-grid">
              {ESTADOS_PIEZA.filter((e) => e.tipo === 'fisiologia').map((e) => (
                <span key={e.value} className="odontograma-leyenda-item">
                  <LeyendaSwatch estado={e} />
                  {e.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OdontogramaPiezaEditor({ pieza, onChange, onCerrar }) {
  if (!pieza) return null;

  const ausente = esAusente(pieza.estado);

  const actualizar = (campo, valor) => {
    onChange({ ...pieza, [campo]: valor });
  };

  const toggleSuperficie = (key) => {
    onChange({
      ...pieza,
      superficies: {
        ...pieza.superficies,
        [key]: !pieza.superficies?.[key],
      },
    });
  };

  return (
    <div className="odontograma-editor">
      <div className="odontograma-editor-header">
        <h4 className="odontograma-editor-title">Pieza {pieza.numero}</h4>
        <button type="button" className="odontograma-editor-cerrar" onClick={onCerrar} aria-label="Cerrar">×</button>
      </div>
      <div className="odontograma-editor-fields">
        <div className="form-field">
          <label className="form-label">Estado general</label>
          <select
            className="form-select"
            value={pieza.estado || 'sano'}
            onChange={(e) => actualizar('estado', e.target.value)}
          >
            <option value="sano">Sano</option>
            <optgroup label="Patología (rojo)">
              {ESTADOS_PIEZA.filter((e) => e.tipo === 'patologia').map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </optgroup>
            <optgroup label="Fisiología (azul)">
              {ESTADOS_PIEZA.filter((e) => e.tipo === 'fisiologia').map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Superficies</label>
          <div className={`odontograma-superficies-toggles${ausente ? ' disabled' : ''}`}>
            {SUPERFICIES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`odontograma-sup-toggle${pieza.superficies?.[s.key] ? ' active' : ''}`}
                onClick={() => toggleSuperficie(s.key)}
                disabled={ausente}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-field">
          <label className="form-label">Nota de la pieza</label>
          <textarea
            className="form-textarea"
            value={pieza.nota || ''}
            onChange={(e) => actualizar('nota', e.target.value)}
            rows={2}
            placeholder="Observaciones sobre esta pieza..."
          />
        </div>
      </div>
    </div>
  );
}

export default OdontogramaChart;
