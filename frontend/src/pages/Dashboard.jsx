import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import Layout from '../components/Layout.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusStamp from '../components/StatusStamp.jsx';
import '../styles/Dashboard.css';

function formatMoney(cents, currency) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency }).format(cents / 100);
}

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .invoices()
      .then((d) => setInvoices(d.invoices))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'number', header: 'Factura' },
    { key: 'customer_name', header: 'Cliente' },
    { key: 'amount', header: 'Monto', render: (r) => formatMoney(r.amount_cents, r.currency) },
    { key: 'status', header: 'Estado', render: (r) => <StatusStamp status={r.status} /> },
    { key: 'issued_at', header: 'Fecha' },
  ];

  return (
    <Layout title="Facturas">
      <div className="dashboard__intro">
        <p>
          Facturas registradas a tu nombre. Cada ID es consecutivo — pruébalo: en
          modo vulnerable puedes abrir <code>/factura/1</code> aunque no sea tuya.
        </p>
      </div>
      {loading ? (
        <p className="dashboard__loading">Cargando…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={invoices}
          emptyMessage="Aún no hay facturas — registra la primera."
          onRowClick={(row) => navigate(`/factura/${row.id}`)}
        />
      )}
    </Layout>
  );
}
