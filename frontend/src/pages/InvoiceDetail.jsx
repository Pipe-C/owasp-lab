import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import Layout from '../components/Layout.jsx';
import StatusStamp from '../components/StatusStamp.jsx';
import '../styles/InvoiceDetail.css';

export default function InvoiceDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [note, setNote] = useState('');

  function load() {
    setError(null);
    api
      .invoice(id)
      .then(setData)
      .catch((e) => setError(e.message));
  }

  useEffect(load, [id]);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    await api.addNote(id, note);
    setNote('');
    load();
  }

  if (error) {
    return (
      <Layout title="Factura">
        <div className="error-banner">{error}</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout title="Factura">
        <p>Cargando…</p>
      </Layout>
    );
  }

  const { invoice, notes } = data;

  return (
    <Layout title={`Factura ${invoice.number}`}>
      <section className="invoice-card">
        <div className="invoice-card__head">
          <div>
            <h2>{invoice.customer_name}</h2>
            <p className="invoice-card__email">{invoice.customer_email}</p>
          </div>
          <StatusStamp status={invoice.status} />
        </div>
        <p className="invoice-card__amount">
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: invoice.currency }).format(
            invoice.amount_cents / 100
          )}
        </p>
      </section>

      <section className="notes">
        <h3>Notas de auditoría</h3>
        {/*
          Las notas se renderizan con dangerouslySetInnerHTML a propósito:
          es la superficie del Vector 5 (XSS almacenado). En
          SECURITY_MODE=vulnerable el backend guarda el HTML tal cual; en
          SECURITY_MODE=patched lo escapa antes de guardarlo (ver
          backend/src/utils/sanitize.js), así que esta misma vista queda
          segura sin cambiar una línea de frontend.
        */}
        {notes.length === 0 && <p className="notes__empty">Sin notas todavía.</p>}
        <ul className="notes__list">
          {notes.map((n) => (
            <li key={n.id} className="notes__item">
              <div className="notes__meta">
                <strong>{n.author_name}</strong>
                <span>{n.created_at}</span>
              </div>
              <div
                className="notes__body"
                dangerouslySetInnerHTML={{ __html: n.body }}
              />
            </li>
          ))}
        </ul>

        <form onSubmit={handleAddNote} className="notes__form">
          <textarea
            placeholder="Agregar una nota de auditoría…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
          <button className="btn btn-primary">Guardar nota</button>
        </form>
      </section>
    </Layout>
  );
}
