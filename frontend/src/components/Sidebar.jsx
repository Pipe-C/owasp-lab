import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const LINKS = [
  { to: '/', label: 'Facturas', end: true },
  { to: '/buscar', label: 'Buscar clientes' },
  { to: '/webhooks', label: 'Logos de proveedor' },
  { to: '/diagnostico', label: 'Diagnóstico de auditoría' },
  { to: '/perfil', label: 'Mi perfil' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark">F</span>
        <span className="sidebar__name">Fintrace</span>
      </div>
      <nav className="sidebar__nav">
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar__footer">
        Laboratorio de Seguridad en Aplicaciones Web
        <br />
        I.U. Pascual Bravo
      </div>
    </aside>
  );
}
