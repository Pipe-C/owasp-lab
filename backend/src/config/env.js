import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 4000),
  securityMode: process.env.SECURITY_MODE === 'patched' ? 'patched' : 'vulnerable',
  jwtSecret: process.env.JWT_SECRET || 'fintrace-dev-secret-cambia-esto',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  dbPath: process.env.DB_PATH || './data/fintrace.db',
};

export const isVulnerable = () => env.securityMode === 'vulnerable';
export const isPatched = () => env.securityMode === 'patched';
