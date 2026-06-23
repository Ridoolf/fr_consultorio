import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from '../hooks/useMediaQuery';
import SidebarIcon from './ui/SidebarIcon';

const SIDEBAR_STORAGE_KEY = 'sidebar-expanded';
const MOBILE_NAV_QUERY = '(max-width: 767px)';
const STUDIO_NAME = 'Odontología & Ortodoncia';

const navItems = [
  { path: '/inicio', label: 'Inicio', icon: 'home', end: true },
  { path: '/pacientes', label: 'Pacientes', icon: 'pacientes' },
  { path: '/turnos', label: 'Turnos', icon: 'turnos' },
  { path: '/tratamientos', label: 'Tratamientos', icon: 'tratamientos' },
  { path: '/caja', label: 'Caja', icon: 'caja' },
];

function getSectionTitle(pathname) {
  if (pathname === '/inicio') return 'Inicio';
  if (pathname.startsWith('/pacientes')) return 'Pacientes';
  if (pathname.startsWith('/turnos')) return 'Turnos';
  if (pathname.startsWith('/tratamientos')) return 'Tratamientos';
  if (pathname.startsWith('/caja')) return 'Caja / Pagos';
  return 'Consultorio';
}

function readStoredExpanded() {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function Layout({ children }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const title = getSectionTitle(location.pathname);
  const mobileNav = useMediaQuery(MOBILE_NAV_QUERY);
  const [expanded, setExpanded] = useState(readStoredExpanded);

  useEffect(() => {
    if (mobileNav) return;
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(expanded));
    } catch {
      /* ignore */
    }
  }, [expanded, mobileNav]);

  const toggleSidebar = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (mobileNav) {
    return (
      <div className="app-root app-root--mobile-nav">
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

        <main className="app-content app-content--with-bottom-nav">
          <section className="app-main">{children}</section>
        </main>

        <nav className="bottom-nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `bottom-nav-link${isActive ? ' active' : ''}`
              }
            >
              <span className="bottom-nav-icon">
                <SidebarIcon name={item.icon} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className={`app-root${expanded ? ' app-root--sidebar-expanded' : ''}`}>
      <aside
        className={`sidebar${expanded ? ' sidebar--expanded' : ''}`}
        aria-label="Navegación principal"
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-row">
            <img
              src="/logo.jpeg"
              alt={STUDIO_NAME}
              className="sidebar-brand-logo"
            />
            <span className="sidebar-brand-name">{STUDIO_NAME}</span>
            <button
              type="button"
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={expanded ? 'Contraer menú' : 'Expandir menú'}
              aria-expanded={expanded}
            >
              <span className={`sidebar-toggle-icon${expanded ? ' sidebar-toggle-icon--expanded' : ''}`}>
                <SidebarIcon name="chevron" />
              </span>
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              title={expanded ? undefined : item.label}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
              }
            >
              <span className="sidebar-link-icon">
                <SidebarIcon name={item.icon} />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-link sidebar-link--logout"
            onClick={logout}
            title={expanded ? undefined : 'Salir'}
          >
            <span className="sidebar-link-icon">
              <SidebarIcon name="logout" />
            </span>
            <span className="sidebar-label">Salir</span>
          </button>
        </div>
      </aside>

      <div className="app-shell">
        <header className="app-header">
          <div>
            <div className="app-header-title">{title}</div>
            <div className="app-header-subtitle">
              Consultorio Odontológico
              {user?.username && ` · ${user.username}`}
            </div>
          </div>
        </header>

        <main className="app-content">
          <section className="app-main">{children}</section>
        </main>
      </div>
    </div>
  );
}

export default Layout;
