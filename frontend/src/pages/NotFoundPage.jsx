import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

function NotFoundPage() {
  return (
    <Card>
      <div className="not-found">
        <h1>404</h1>
        <h2 className="page-header-title">Página no encontrada</h2>
        <p className="empty-state-desc" style={{ marginBottom: '1.5rem' }}>
          La ruta que buscás no existe en el sistema.
        </p>
        <Link to="/pacientes">
          <Button variant="primary" size="lg">
            Volver a Pacientes
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default NotFoundPage;
