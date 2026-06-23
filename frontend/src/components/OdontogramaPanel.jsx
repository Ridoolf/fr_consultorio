import { useEffect, useState } from 'react';
import { odontogramaAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import { normalizarPiezas, piezaConNumero, piezaVacia } from '../utils/odontograma';
import Button from './ui/Button';
import Spinner from './ui/Spinner';
import OdontogramaChart, { OdontogramaPiezaEditor } from './OdontogramaChart';

function OdontogramaPanel({ pacienteId }) {
  const [odontogramaId, setOdontogramaId] = useState(null);
  const [piezas, setPiezas] = useState(normalizarPiezas({}));
  const [piezaSeleccionada, setPiezaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const cargarOdontograma = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await odontogramaAPI.getByPaciente(pacienteId);
      const data = res.data;
      setOdontogramaId(data.id);
      setPiezas(normalizarPiezas(data.piezas));
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo cargar el odontograma.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (pacienteId) cargarOdontograma();
  }, [pacienteId]);

  const handleCambioPieza = (piezaActualizada) => {
    const { numero, ...datos } = piezaActualizada;
    setPiezas((prev) => ({ ...prev, [numero]: datos }));
  };

  const handleToggleSuperficie = (numero, cara) => {
    setPiezas((prev) => {
      const datos = prev[numero] || piezaVacia();
      return {
        ...prev,
        [numero]: {
          ...datos,
          superficies: {
            ...datos.superficies,
            [cara]: !datos.superficies?.[cara],
          },
        },
      };
    });
  };

  const handleGuardar = async () => {
    if (!odontogramaId) return;
    setGuardando(true);
    setError(null);
    try {
      await odontogramaAPI.update(odontogramaId, { piezas });
      showToast('Odontograma guardado', 'success');
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudo guardar el odontograma.'));
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Spinner label="Cargando odontograma..." />;

  return (
    <div className="ficha-subpanel odontograma-panel">
      <div className="odontograma-panel-header">
        <div>
          <h3 className="ficha-subpanel-title">Odontograma</h3>
          <p className="ficha-subpanel-desc">
            Clic en una cara del gráfico para marcarla y abrir el editor de la pieza.
          </p>
        </div>
        <Button type="button" variant="primary" disabled={guardando} onClick={handleGuardar}>
          {guardando ? 'Guardando...' : 'Guardar odontograma'}
        </Button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="odontograma-layout">
        <div className="odontograma-chart-card">
          <p className="odontograma-chart-scroll-hint" aria-hidden="true">
            Deslizá horizontalmente para ver todo el odontograma
          </p>
          <OdontogramaChart
            piezas={piezas}
            piezaSeleccionada={piezaSeleccionada}
            onSelectPieza={setPiezaSeleccionada}
            onToggleSuperficie={handleToggleSuperficie}
          />
        </div>

        <div className="odontograma-editor-card">
          {piezaSeleccionada ? (
            <OdontogramaPiezaEditor
              pieza={piezaConNumero(piezaSeleccionada, piezas)}
              onChange={handleCambioPieza}
              onCerrar={() => setPiezaSeleccionada(null)}
            />
          ) : (
            <div className="odontograma-editor-placeholder">
              <span className="odontograma-editor-placeholder-icon">🦷</span>
              <p>
                Seleccioná una cara en el gráfico para editar la pieza (estado general, superficies y nota).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OdontogramaPanel;
