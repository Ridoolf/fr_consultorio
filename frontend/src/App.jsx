import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import PacientesList from './pages/PacientesList';
import PacienteForm from './pages/PacienteForm';
import TurnosPage from './pages/TurnosPage';
import TurnoForm from './pages/TurnoForm';
import TratamientosPage from './pages/TratamientosPage';
import CajaPage from './pages/CajaPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/*"
        element={
          <RequireAuth>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/pacientes" replace />} />
                <Route path="/pacientes" element={<PacientesList />} />
                <Route path="/pacientes/nuevo" element={<PacienteForm />} />
                <Route path="/pacientes/:id" element={<PacienteForm />} />
                <Route path="/turnos" element={<TurnosPage />} />
                <Route path="/turnos/nuevo" element={<TurnoForm />} />
                <Route path="/turnos/:id/editar" element={<TurnoForm />} />
                <Route path="/tratamientos" element={<TratamientosPage />} />
                <Route path="/caja" element={<CajaPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
