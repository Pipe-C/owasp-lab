import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import '../styles/SecurityModeBadge.css';

export default function SecurityModeBadge() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    let active = true;
    const poll = () => api.health().then((d) => active && setMode(d.securityMode)).catch(() => {});
    poll();
    const id = setInterval(poll, 8000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!mode) return null;

  return (
    <span className={`security-mode security-mode--${mode}`}>
      <span className="security-mode__dot" aria-hidden="true" />
      Servidor en modo {mode === 'vulnerable' ? 'vulnerable' : 'corregido'}
    </span>
  );
}
