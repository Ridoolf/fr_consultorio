import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { turnosAPI } from '../services/api';
import { getErrorMessage } from '../utils/errors';
import { useToast } from '../context/ToastContext';
import { hoyLocal, formatoFechaLindo, sumarDias } from '../utils/fechas';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';

function TurnosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fecha = searchParams.get('fecha') || hoyLocal();
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [accionId, setAccionId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const setFecha = (f) => setSearchParams({ fecha: f });

  const cargarTurnos = async (f) => {
    setCargando(true);
    setError(null);
    try {
      const res = await turnosAPI.getAll({ fecha: f });
      setTurnos(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'No se pudieron cargar los turnos.'));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTurnos(fecha);
  }, [fecha]);

  const ejecutarAccion = async (id, accion) => {
    setAccionId(id);
    try {
      if (accion === 'confirmar') await turnosAPI.confirmar(id);
      if (accion === 'realizado') await turnosAPI.marcarRealizado(id);
      if (accion === 'cancelar') await turnosAPI.cancelar(id);
      showToast('Turno actualizado', 'success');
      await cargarTurnos(fecha);
    } catch (err) {
      showToast(getErrorMessage(err, 'No se pudo actualizar el turno.'), 'error');
    } finally {
      setAccionId(null);
      setConfirm(null);
    }
  };

  return (
    <div className="page page--fab">
      <PageHeader
        title="Agenda"
        subtitle={formatoFechaLindo(fecha)}
      />

      {error && <div className="error-box">{error}</div>}

      <Card className="turnos-panel">
        <div className="date-nav">
          <input
            type="date"
            className="date-nav-input"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            aria-label="Seleccionar fecha"
          />
          <Button
            variant="secondary"
            aria-label="Día anterior"
            onClick={() => setFecha(sumarDias(fecha, -1))}
          >
            <span className="date-nav-label date-nav-label--long">◀ Anterior</span>
            <span className="date-nav-label date-nav-label--short" aria-hidden>◀</span>
          </Button>
          <Button variant="ghost" onClick={() => setFecha(hoyLocal())}>
            Hoy
          </Button>
          <Button
            variant="secondary"
            aria-label="Día siguiente"
            onClick={() => setFecha(sumarDias(fecha, 1))}
          >
            <span className="date-nav-label date-nav-label--long">Siguiente ▶</span>
            <span className="date-nav-label date-nav-label--short" aria-hidden>▶</span>
          </Button>
        </div>

        <div className="turnos-panel-body">
          {cargando ? (
            <Spinner label="Cargando turnos..." />
          ) : turnos.length === 0 ? (
            <EmptyState
              icon="📅"
              title="Sin turnos"
              description="No hay turnos para esta fecha."
              action={
                <Button variant="primary" onClick={() => navigate(`/turnos/nuevo?fecha=${fecha}`)}>
                  + Nuevo turno
                </Button>
              }
            />
          ) : (
            <div>
              {turnos.map((t, i) => (
                <motion.div
                  key={t.id}
                  className="turno-card"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="turno-hora">
                    <span>{t.hora_inicio?.slice(0, 5)}</span>
                    <span className="turno-hora-fin">{t.hora_fin?.slice(0, 5)}</span>
                  </div>
                  <div className="turno-card-body">
                    <div className="data-card-header">
                      <Link to={`/pacientes/${t.paciente}`} className="data-card-title">
                        {t.paciente_nombre_completo}
                      </Link>
                      <Badge estado={t.estado} />
                    </div>
                    <div className="data-card-meta">{t.motivo || 'Sin motivo'}</div>
                    <div className="data-card-actions">
                      {t.estado === 'pendiente' && (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={accionId === t.id}
                          onClick={() => ejecutarAccion(t.id, 'confirmar')}
                        >
                          Confirmar
                        </Button>
                      )}
                      {t.estado !== 'realizado' && t.estado !== 'cancelado' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={accionId === t.id}
                          onClick={() =>
                            setConfirm({
                              id: t.id,
                              accion: 'realizado',
                              title: 'Marcar realizado',
                              message: '¿Marcar este turno como realizado?',
                            })
                          }
                        >
                          Realizado
                        </Button>
                      )}
                      {t.estado !== 'cancelado' && t.estado !== 'realizado' && (
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={accionId === t.id}
                          onClick={() =>
                            setConfirm({
                              id: t.id,
                              accion: 'cancelar',
                              title: 'Cancelar turno',
                              message: '¿Cancelar este turno?',
                              danger: true,
                            })
                          }
                        >
                          Cancelar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/turnos/${t.id}/editar`)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <button
        type="button"
        className="btn-fab"
        aria-label="Nuevo turno"
        onClick={() => navigate(`/turnos/nuevo?fecha=${fecha}`)}
      >
        +
      </button>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title}
        message={confirm?.message}
        danger={confirm?.danger}
        onCancel={() => setConfirm(null)}
        onConfirm={() => confirm && ejecutarAccion(confirm.id, confirm.accion)}
      />
    </div>
  );
}

export default TurnosPage;
