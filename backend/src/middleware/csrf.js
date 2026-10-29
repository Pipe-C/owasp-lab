import { isVulnerable } from '../config/env.js';

/**
 * Vector 3 — CSRF, RIESGO ALTO.
 *
 * VULNERABLE: este middleware simplemente deja pasar la petición. El
 * endpoint protegido (ver users.routes.js) confía solo en la cookie de
 * sesión httpOnly para autenticar el PUT, así que una petición forjada
 * desde otro origen (o reproducida con ZAP usando la cookie capturada,
 * sin encabezados adicionales) se procesa igual que una legítima.
 *
 * PARCHEADA: patrón "double-submit cookie". El login entrega un token CSRF
 * en una cookie NO httpOnly (fintrace_csrf) y el cliente debe repetirlo en
 * el encabezado X-CSRF-Token. Un atacante cross-origin no puede leer esa
 * cookie (la protege el same-origin policy del navegador), así que no
 * puede construir el encabezado correcto.
 */
export function requireCsrf(req, res, next) {
  if (isVulnerable()) return next();

  const cookieToken = req.cookies?.fintrace_csrf;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ error: 'Token CSRF ausente o inválido.' });
  }
  next();
}
