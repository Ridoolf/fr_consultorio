import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PacientesList from './pages/PacientesList';
import PacienteForm from './pages/PacienteForm';
import TurnosPage from './pages/TurnosPage';
import TurnoForm from './pages/TurnoForm'; 
import TratamientosPage from './pages/TratamientosPage';
import CajaPage from './pages/CajaPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/pacientes" replace />} />

        <Route path="/pacientes" element={<PacientesList />} />
        <Route path="/pacientes/nuevo" element={<PacienteForm />} />
        <Route path="/pacientes/:id" element={<PacienteForm />} />

        <Route path="/turnos" element={<TurnosPage />} />
        <Route path="/turnos/nuevo" element={<TurnoForm />} />
        
        <Route path="/tratamientos" element={<TratamientosPage />} />
        <Route path="/caja" element={<CajaPage />} />

        <Route path="*" element={<div>Página no encontrada</div>} />
      </Routes>
    </Layout>
  );
}

export default App;
