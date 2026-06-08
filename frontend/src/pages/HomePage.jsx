import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hoyLocal, formatoFechaLindo } from '../utils/fechas';
import { nombreParaSaludo, fraseDelDia } from '../utils/frasesMotivacionales';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';

function HomePage() {
  const hoy = hoyLocal();
  const navigate = useNavigate();
  const { user } = useAuth();
  const nombre = nombreParaSaludo(user?.username);

  return (
    <Card>
      <PageHeader title="Inicio" />

      <div className="home-welcome">
        <p className="home-fecha">{formatoFechaLindo(hoy)}</p>
        {nombre && <p className="home-greeting">Hola, {nombre}</p>}
        <p className="home-frase">{fraseDelDia()}</p>
      </div>

      <div className="home-quick-actions">
        <button
          type="button"
          className="home-quick-action"
          onClick={() => navigate(`/turnos/nuevo?fecha=${hoy}`)}
        >
          <span className="home-quick-action-icon">+</span>
          <span className="home-quick-action-label">Nuevo turno</span>
        </button>
        <button
          type="button"
          className="home-quick-action"
          onClick={() => navigate('/caja')}
        >
          <span className="home-quick-action-icon">💰</span>
          <span className="home-quick-action-label">Registrar cobro</span>
        </button>
        <button
          type="button"
          className="home-quick-action"
          onClick={() => navigate('/pacientes')}
        >
          <span className="home-quick-action-icon">👤</span>
          <span className="home-quick-action-label">Pacientes</span>
        </button>
        <button
          type="button"
          className="home-quick-action"
          onClick={() => navigate('/turnos')}
        >
          <span className="home-quick-action-icon">📅</span>
          <span className="home-quick-action-label">Ver agenda</span>
        </button>
      </div>
    </Card>
  );
}

export default HomePage;
