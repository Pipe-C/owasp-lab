import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// El manejo de contraseñas no es uno de los 6 vectores del laboratorio,
// así que se implementa correctamente en ambos SECURITY_MODE.

export function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(plain, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(plain, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
