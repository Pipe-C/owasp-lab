import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// La emisión del token es siempre correcta (HS256, con exp): el login nunca
// entrega un token débil. La falla del Vector 1 vive en la VERIFICACIÓN,
// que es lo que el endpoint protegido hace con el token que el cliente envía.
export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { algorithm: 'HS256', expiresIn: '2h' }
  );
}

/**
 * VULNERABLE — Vector 1: Autenticación rota en JWT.
 * jwt.decode() lee el payload sin comprobar la firma ni el algoritmo.
 * Un atacante puede fabricar un token con header {"alg":"none"} y un payload
 * {"sub":1,"role":"admin"} codificado en base64url, sin conocer JWT_SECRET,
 * y esta función lo acepta igual.
 */
export function verifyTokenVulnerable(token) {
  const decoded = jwt.decode(token, { json: true });
  if (!decoded || typeof decoded.sub === 'undefined') return null;
  return decoded;
}

/**
 * PARCHEADO — Vector 1: exige HS256, verifica la firma contra JWT_SECRET
 * y hace cumplir la expiración (jwt.verify ya lo hace por defecto).
 */
export function verifyTokenPatched(token) {
  try {
    return jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}
