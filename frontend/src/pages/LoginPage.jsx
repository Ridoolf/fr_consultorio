import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errors';
import Button from '../components/ui/Button';

function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to="/inicio" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      navigate('/inicio', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Usuario o contraseña incorrectos.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="login-brand">
          <img
            src="/logo.jpeg"
            alt="Odontología & Ortodoncia"
            className="brand-logo brand-logo--lg"
          />
        </div>
        <p className="login-subtitle">Panel interno de gestión</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            style={{ width: '100%' }}
          >
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default LoginPage;
