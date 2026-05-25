import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/pacientes', label: 'Pacientes' },
  { path: '/turnos', label: 'Turnos' },
  { path: '/tratamientos', label: 'Tratamientos' },
  { path: '/caja', label: 'Caja / Pagos' },
];

function Layout({ children }) {
  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-header-title">Consultorio Odontológico</div>
        <div className="app-header-subtitle">
          Panel interno · Gestión de pacientes, turnos y caja
        </div>
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
                      'app-sidebar-link' + (isActive ? ' active' : '')
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>
          <section className="app-main">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Layout;
