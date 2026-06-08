import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/pacientes', label: 'Pacientes', icon: '👤' },
  { path: '/turnos', label: 'Turnos', icon: '📅' },
  { path: '/tratamientos', label: 'Tratamientos', icon: '🦷' },
  { path: '/caja', label: 'Caja', icon: '💰' },
];

function getSectionTitle(pathname) {
  if (pathname.startsWith('/pacientes')) return 'Pacientes';
  if (pathname.startsWith('/turnos')) return 'Turnos';
  if (pathname.startsWith('/tratamientos')) return 'Tratamientos';
  if (pathname.startsWith('/caja')) return 'Caja / Pagos';
  return 'Consultorio';
}

function Layout({ children }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const title = getSectionTitle(location.pathname);

  return (
    <div className="app-root">
      <header className="app-header">
        <div>
          <div className="app-header-title">{title}</div>
          <div className="app-header-subtitle">
            Consultorio Odontológico
            {user?.username && ` · ${user.username}`}
          </div>
        </div>
        <button type="button" className="app-header-logout" onClick={logout}>
          Salir
        </button>
      </header>

      <main className="app-content">
        <div className="app-body">
          <aside className="app-sidebar">
            <div className="app-sidebar-title">Secciones</div>
            <ul className="app-sidebar-nav">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `app-sidebar-link${isActive ? ' active' : ''}`
                    }
                  >
                    {item.icon} {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>
          <section className="app-main">{children}</section>
        </div>
      </main>

      <nav className="bottom-nav" aria-label="Navegación principal">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `bottom-nav-link${isActive ? ' active' : ''}`
            }
          >
            <span className="bottom-nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Layout;
