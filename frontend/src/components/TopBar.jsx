import { useAuth } from '../AuthContext.jsx';
import SecurityModeBadge from './SecurityModeBadge.jsx';
import '../styles/TopBar.css';

export default function TopBar({ title }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__right">
        <SecurityModeBadge />
        {user && (
          <div className="topbar__user">
            <span>{user.name}</span>
            <span className="topbar__role">{user.role}</span>
            <button className="btn btn-ghost" onClick={logout}>
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
