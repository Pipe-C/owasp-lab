-- Esquema de Fintrace. Diseñado para soportar los 6 vectores del laboratorio:
-- users: JWT/CSRF/Mass Assignment (columna role autovinculable)
-- customers + invoices: IDOR, SQLi (búsqueda/login)
-- invoice_notes: XSS (almacenado y reflejado)
-- webhook_calls: SSRF (el servidor llama a la URL que el usuario entrega)

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,                     -- hash scrypt real, usado por el login parcheado
  password_plain TEXT NOT NULL,               -- SOLO para el Vector 4 (SQLi) en modo vulnerable
  role TEXT NOT NULL DEFAULT 'auditor',       -- 'auditor' | 'admin'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  nit TEXT NOT NULL,
  email TEXT NOT NULL,
  logo_url TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  number TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  status TEXT NOT NULL DEFAULT 'pendiente',   -- 'pendiente' | 'aprobada' | 'observada'
  issued_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoice_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  author_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS webhook_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requested_by INTEGER NOT NULL REFERENCES users(id),
  target_url TEXT NOT NULL,
  status_code INTEGER,
  response_snippet TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
