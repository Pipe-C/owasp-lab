import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import Layout from '../components/Layout.jsx';
import DataTable from '../components/DataTable.jsx';
import '../styles/Webhooks.css';

export default function Webhooks() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [calls, setCalls] = useState([]);

  function refreshCalls() {
    api.webhookCalls().then((d) => setCalls(d.calls));
  }

  useEffect(refreshCalls, []);

  async function handleFetch(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    try {
      const data = await api.fetchLogo(url);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      refreshCalls();
    }
  }

  const columns = [
    { key: 'target_url', header: 'URL solicitada' },
    { key: 'status_code', header: 'Estado HTTP' },
    { key: 'created_at', header: 'Fecha' },
  ];

  return (
    <Layout title="Logo de proveedor">
      <p className="webhooks__intro">
        Pega la URL del logo del proveedor; el servidor la descarga para
        validarla antes de guardarla en la ficha del cliente.
      </p>

      <form onSubmit={handleFetch} className="webhooks__form">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://proveedor.test/logo.png"
        />
        <button className="btn btn-primary">Previsualizar</button>
      </form>

      {error && <div className="error-banner">{error}</div>}
      {result && (
        <pre className="webhooks__result">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}

      <h3 className="webhooks__history-title">Historial de llamadas salientes</h3>
      <DataTable columns={columns} rows={calls} emptyMessage="Aún no se ha hecho ninguna llamada." />
    </Layout>
  );
}
