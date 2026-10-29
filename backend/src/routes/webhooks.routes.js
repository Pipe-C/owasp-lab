import { Router } from 'express';
import { db } from '../db/connection.js';
import { requireAuth } from '../middleware/auth.js';
import { isVulnerable } from '../config/env.js';
import { isUrlAllowed } from '../utils/ssrfGuard.js';

export const webhooksRouter = Router();

/**
 * Vector 2 — Server-Side Request Forgery (SSRF), RIESGO ALTO.
 *
 * Caso de uso legítimo: al registrar un cliente, Fintrace permite
 * "previsualizar" el logo del proveedor pegando una URL; el backend la
 * descarga para validarla antes de guardarla. Payload de la guía:
 *   POST /api/webhooks/fetch-logo  {"url":"http://169.254.169.254/latest/meta-data/"}
 *
 * VULNERABLE: la URL del usuario se pasa directo a fetch() sin validar el
 * destino, así que el servidor puede ser forzado a consultar su propia red
 * interna o el endpoint de metadatos de la nube.
 *
 * PARCHEADA: isUrlAllowed() exige http(s) y bloquea rangos privados /
 * metadatos antes de hacer cualquier petición saliente.
 */
webhooksRouter.post('/fetch-logo', requireAuth, async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'La URL es obligatoria.' });

  if (!isVulnerable()) {
    const check = isUrlAllowed(url);
    if (!check.ok) {
      logCall(req.user.id, url, null, `Bloqueada: ${check.reason}`);
      return res.status(400).json({ error: `Solicitud bloqueada: ${check.reason}` });
    }
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, { signal: controller.signal, redirect: 'manual' });
    clearTimeout(timeout);

    const text = await response.text().catch(() => '');
    const snippet = text.slice(0, 300);

    logCall(req.user.id, url, response.status, snippet);
    res.json({ status: response.status, snippet });
  } catch (err) {
    logCall(req.user.id, url, null, String(err.message));
    res.status(502).json({ error: 'No se pudo contactar la URL.', detail: String(err.message) });
  }
});

webhooksRouter.get('/calls', requireAuth, (req, res) => {
  const calls = db
    .prepare('SELECT * FROM webhook_calls WHERE requested_by = ? ORDER BY created_at DESC LIMIT 20')
    .all(req.user.id);
  res.json({ calls });
});

function logCall(userId, targetUrl, statusCode, snippet) {
  db.prepare(
    'INSERT INTO webhook_calls (requested_by, target_url, status_code, response_snippet) VALUES (?, ?, ?, ?)'
  ).run(userId, targetUrl, statusCode, snippet);
}
