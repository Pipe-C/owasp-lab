import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { requireCsrf } from '../middleware/csrf.js';
import { isVulnerable } from '../config/env.js';

export const usersRouter = Router();

/**
 * Vector 3 (CSRF) + mitad del Vector 6 (Mass Assignment), RIESGO ALTO.
 *
 * VULNERABLE:
 *  - requireCsrf no exige token (ver middleware/csrf.js) → cualquier
 *    petición autenticada solo por cookie se procesa.
 *  - El cuerpo completo del JSON se mezcla en el UPDATE, así que un
 *    atacante puede enviar {"name":"...","email":"...","role":"admin"}
 *    y autoasignarse el rol de administrador.
 *
 * PARCHEADA:
 *  - requireCsrf exige el encabezado X-CSRF-Token (patrón double-submit).
 *  - Allowlist explícita de campos (DTO): solo name y email se aceptan;
 *    "role" del body se ignora siempre, el rol solo cambia por un endpoint
 *    de administración aparte (fuera del alcance de este laboratorio).
 */
usersRouter.put('/profile', requireAuth, requireCsrf, (req, res) => {
  const body = req.body || {};

  if (isVulnerable()) {
    const fields = Object.keys(body).filter((k) => ['name', 'email', 'role'].includes(k));
    if (fields.length === 0) return res.status(400).json({ error: 'Nada que actualizar.' });

    const setClause = fields.map((f) => `${f} = @${f}`).join(', ');
    db.prepare(`UPDATE users SET ${setClause} WHERE id = @id`).run({ ...body, id: req.user.id });
  } else {
    const { name, email } = body;
    if (!name && !email) return res.status(400).json({ error: 'Nada que actualizar.' });

    db.prepare('UPDATE users SET name = COALESCE(@name, name), email = COALESCE(@email, email) WHERE id = @id')
      .run({ name: name ?? null, email: email ?? null, id: req.user.id });
  }

  const updated = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: updated });
});
