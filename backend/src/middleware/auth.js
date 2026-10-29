import { isVulnerable } from '../config/env.js';
import { verifyTokenPatched, verifyTokenVulnerable } from '../utils/jwt.js';
import { db } from '../db/connection.js';

function extractToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (req.cookies?.fintrace_token) return req.cookies.fintrace_token;
  return null;
}

export function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'No autenticado.' });

  const payload = isVulnerable() ? verifyTokenVulnerable(token) : verifyTokenPatched(token);
  if (!payload) return res.status(401).json({ error: 'Token inválido o expirado.' });

  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(payload.sub);
  if (!user) return res.status(401).json({ error: 'Usuario no encontrado.' });

  // En modo vulnerable confiamos ciegamente en el "role" del propio token
  // decodificado (que el atacante controla); en modo parcheado usamos el
  // rol real guardado en la base de datos, no el que viaja en el JWT.
  req.user = isVulnerable() ? { ...user, role: payload.role ?? user.role } : user;
  next();
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Se requiere rol admin.' });
  }
  next();
}
