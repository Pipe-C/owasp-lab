import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { isVulnerable } from '../config/env.js';

export const invoicesRouter = Router();

invoicesRouter.get('/', requireAuth, (req, res) => {
  const invoices = db
    .prepare(
      `SELECT invoices.*, customers.name AS customer_name
       FROM invoices JOIN customers ON customers.id = invoices.customer_id
       WHERE invoices.owner_id = ?
       ORDER BY invoices.issued_at DESC`
    )
    .all(req.user.id);
  res.json({ invoices });
});

/**
 * Vector 6 (parte IDOR), RIESGO ALTO.
 *
 * VULNERABLE: /api/invoices/:id devuelve cualquier factura por su ID
 * numérico consecutivo sin comprobar que pertenezca al usuario autenticado
 * (exactamente el ejemplo de la guía: GET /api/invoices/1042). Un usuario
 * autenticado cualquiera puede enumerar IDs y leer facturas ajenas.
 *
 * PARCHEADA: exige owner_id = req.user.id (o rol admin) antes de devolver
 * el recurso; de lo contrario responde 404 (no 403, para no confirmarle al
 * atacante que el ID existe).
 */
invoicesRouter.get('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id);

  let invoice;
  if (isVulnerable()) {
    invoice = db
      .prepare(
        `SELECT invoices.*, customers.name AS customer_name, customers.email AS customer_email
         FROM invoices JOIN customers ON customers.id = invoices.customer_id
         WHERE invoices.id = ?`
      )
      .get(id);
  } else {
    invoice = db
      .prepare(
        `SELECT invoices.*, customers.name AS customer_name, customers.email AS customer_email
         FROM invoices JOIN customers ON customers.id = invoices.customer_id
         WHERE invoices.id = @id AND (invoices.owner_id = @uid OR @role = 'admin')`
      )
      .get({ id, uid: req.user.id, role: req.user.role });
  }

  if (!invoice) return res.status(404).json({ error: 'Factura no encontrada.' });

  const notes = db
    .prepare(
      `SELECT invoice_notes.id, invoice_notes.body, invoice_notes.created_at, users.name AS author_name
       FROM invoice_notes JOIN users ON users.id = invoice_notes.author_id
       WHERE invoice_id = ? ORDER BY invoice_notes.created_at ASC`
    )
    .all(id);

  res.json({ invoice, notes });
});
