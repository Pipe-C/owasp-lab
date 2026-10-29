// Vector 2 — SSRF, PARCHEADA. Lista blanca de esquema + bloqueo de rangos
// privados / metadatos de nube. Esto es una validación básica con fines
// didácticos (no resuelve DNS para detectar "DNS rebinding"); para un
// entorno real se recomienda además una lista blanca de dominios y
// resolución fuera de banda.

const BLOCKED_HOSTNAME_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./, // enlace local / metadatos de nube (AWS, GCP, Azure)
  /^0\.0\.0\.0$/,
  /^::1$/,
  /^localhost$/i,
];

export function isUrlAllowed(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { ok: false, reason: 'URL inválida.' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { ok: false, reason: `Esquema no permitido: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname;
  if (BLOCKED_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname))) {
    return { ok: false, reason: `Host en rango bloqueado: ${hostname}` };
  }

  return { ok: true };
}
