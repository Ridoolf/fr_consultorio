import {
  COLOR_CARA_AFECTADA,
  colorPieza,
  esAusente,
  esAusenteFisiologica,
  esAusentePatologica,
  esCuadranteDerecho,
  piezaVacia,
} from '../utils/odontograma';

function CaraButton({ cara, activa, label, onClick, disabled }) {
  return (
    <button
      type="button"
      className={`pieza-cara pieza-cara-${cara}${activa ? ' activa' : ''}`}
      style={activa ? { backgroundColor: COLOR_CARA_AFECTADA } : undefined}
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
    />
  );
}

function PiezaCaraSchematic({
  numero,
  pieza,
  tipo = 'permanente',
  seleccionada,
  onSelectPieza,
  onToggleSuperficie,
}) {
  const datos = pieza || piezaVacia();
  const ausente = esAusente(datos.estado);
  const ausentePatologica = esAusentePatologica(datos.estado);
  const ausenteFisiologica = esAusenteFisiologica(datos.estado);
  const mesialDerecha = esCuadranteDerecho(numero);
  const estadoColor = colorPieza(datos);

  const selectPieza = () => onSelectPieza(numero);

  const toggle = (cara, e) => {
    e.stopPropagation();
    if (ausente) return;
    onSelectPieza(numero);
    onToggleSuperficie(numero, cara);
  };

  const superficies = datos.superficies || piezaVacia().superficies;

  const wrapClass = [
    'pieza-schematic-wrap',
    `pieza-schematic-wrap--${tipo}`,
    seleccionada ? 'selected' : '',
    ausentePatologica ? 'ausente-patologica' : '',
    ausenteFisiologica ? 'ausente-fisiologica' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapClass}
      style={{ '--pieza-estado-color': estadoColor }}
    >
      <div
        className="pieza-schematic"
        style={{ '--pieza-estado-color': estadoColor }}
        onClick={selectPieza}
        title={`Seleccionar pieza ${numero}`}
      >
        <CaraButton
          cara="V"
          activa={superficies.V}
          label="Vestibular"
          disabled={ausente}
          onClick={(e) => toggle('V', e)}
        />
        <div className="pieza-schematic-middle">
          {mesialDerecha ? (
            <>
              <CaraButton cara="D" activa={superficies.D} label="Distal" disabled={ausente} onClick={(e) => toggle('D', e)} />
              <CaraButton cara="O" activa={superficies.O} label="Oclusal" disabled={ausente} onClick={(e) => toggle('O', e)} />
              <CaraButton cara="M" activa={superficies.M} label="Mesial" disabled={ausente} onClick={(e) => toggle('M', e)} />
            </>
          ) : (
            <>
              <CaraButton cara="M" activa={superficies.M} label="Mesial" disabled={ausente} onClick={(e) => toggle('M', e)} />
              <CaraButton cara="O" activa={superficies.O} label="Oclusal" disabled={ausente} onClick={(e) => toggle('O', e)} />
              <CaraButton cara="D" activa={superficies.D} label="Distal" disabled={ausente} onClick={(e) => toggle('D', e)} />
            </>
          )}
        </div>
        <CaraButton
          cara="L"
          activa={superficies.L}
          label="Lingual"
          disabled={ausente}
          onClick={(e) => toggle('L', e)}
        />
      </div>
      <button
        type="button"
        className="pieza-schematic-num"
        onClick={() => onSelectPieza(numero)}
        title={`Pieza ${numero}`}
      >
        {numero}
      </button>
    </div>
  );
}

export default PiezaCaraSchematic;
