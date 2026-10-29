import { useState } from 'react';
import { api } from '../api/client.js';
import Layout from '../components/Layout.jsx';
import DataTable from '../components/DataTable.jsx';
import '../styles/Search.css';

export default function Search() {
  const [q, setQ] = useState('');
  const [result, setResult] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    const data = await api.search(q);
    setResult(data);
  }

  const columns = [
    { key: 'name', header: 'Cliente' },
    { key: 'nit', header: 'NIT' },
    { key: 'email', header: 'Correo' },
  ];

  return (
    <Layout title="Buscar clientes">
      <form onSubmit={handleSearch} className="search__form">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre del cliente…"
        />
        <button className="btn btn-primary">Buscar</button>
      </form>

      {result && (
        <p className="search__echo">
          Resultados para:{' '}
          {/*
            Eco del término de búsqueda — superficie del Vector 5
            (XSS reflejado). En modo vulnerable el backend devuelve "q" sin
            escapar; en modo parcheado llega ya escapado desde
            search.routes.js, así que esta vista no necesita cambiar.
          */}
          <span dangerouslySetInnerHTML={{ __html: result.echo }} />
        </p>
      )}

      {result && (
        <DataTable columns={columns} rows={result.customers} emptyMessage="Sin clientes para ese término." />
      )}
    </Layout>
  );
}
