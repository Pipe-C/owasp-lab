import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Layout from '../components/Layout.jsx';
import StatusStamp from '../components/StatusStamp.jsx';
import '../styles/DiagnosticPanel.css';

const VECTORS = [
  { id: 'jwt', name: 'JWT — Autenticación rota', route: 'GET /api/auth/me' },
  { id: 'ssrf', name: 'SSRF', route: 'POST /api/webhooks/fetch-logo' },
  { id: 'csrf', name: 'CSRF', route: 'PUT /api/users/profile' },
  { id: 'sqli', name: 'Inyección SQL', route: 'POST /api/auth/login' },
  { id: 'xss', name: 'XSS (almacenado y reflejado)', route: 'POST /api/invoices/:id/notes, GET /api/search' },
  { id: 'idor', name: 'IDOR / Mass Assignment', route: 'GET /api/invoices/:id, PUT /api/users/profile' },
];

export default function DiagnosticPanel() {
  const [mode, setMode] = useState(null);

  useEffect(() => {
    api.health().then((d) => setMode(d.securityMode));
  }, []);

  return (
    <Layout title="Diagnóstico de auditoría">
      <p className="diagnostic__intro">
        Los 6 vectores obligatorios del laboratorio. El estado refleja el{' '}
        <code>SECURITY_MODE</code> actual del servidor — cámbialo en{' '}
        <code>backend/.env</code> y reinicia para pasar de fallo a corrección.
        El detalle de cada uno está en <code>backend/VULNERABILITIES.md</code>.
      </p>

      <div className="diagnostic__grid">
        {VECTORS.map((v) => (
          <div key={v.id} className="diagnostic__row">
            <div>
              <strong>{v.name}</strong>
              <div className="diagnostic__route">{v.route}</div>
            </div>
            {mode && <StatusStamp status={mode === 'vulnerable' ? 'vulnerable' : 'corregida'} />}
          </div>
        ))}
      </div>
    </Layout>
  );
}
