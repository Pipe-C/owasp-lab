import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { db } from '../db/connection.js';
import { signToken } from '../utils/jwt.js';
import { verifyPassword } from '../utils/password.js';
import { isVulnerable } from '../config/env.js';
import { requireAuth } from '../middleware/auth.js';

export const authRouter = Router();

/**
 * Vector 4 — Inyección SQL (SQLi), RIESGO CRÍTICO.
 *
 * VULNERABLE: el correo y la contraseña se concatenan directamente dentro
 * de la sentencia SQL. Payload de la guía:
 *   email    = admin@fintrace.test' OR '1'='1' --
 *   password = cualquier-cosa
 * así ' OR '1'='1' -- neutraliza el resto de la condición y el comentario
 * SQL (--) descarta la comprobación de password_plain.
 *
 * PARCHEADA: consulta parametrizada (placeholders ?), y la contraseña se
 * compara con scrypt sobre el hash, nunca en SQL ni en texto plano.
 */
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
  }

  let user;

  if (isVulnerable()) {
    const sql = `SELECT * FROM users WHERE email = '${email}' AND password_plain = '${password}'`;
    try {
      user = db.prepare(sql).get();
    } catch (err) {
      return res.status(400).json({ error: 'Error de sintaxis SQL.', detail: String(err.message) });
    }
  } else {
    const candidate = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (candidate && verifyPassword(password, candidate.password)) {
      user = candidate;
    }
  }

  if (!user) return res.status(401).json({ error: 'Credenciales inválidas.' });

  const token = signToken(user);
  const csrfToken = randomBytes(16).toString('hex');

  res.cookie('fintrace_token', token, { httpOnly: true, sameSite: 'lax' });
  // Ver middleware/csrf.js: esta cookie SÍ debe ser legible por JS (no httpOnly)
  // para que el patrón double-submit funcione en modo parcheado.
  res.cookie('fintrace_csrf', csrfToken, { httpOnly: false, sameSite: 'lax' });

  res.json({
    token,
    csrfToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('fintrace_token');
  res.json({ ok: true });
});
