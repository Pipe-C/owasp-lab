import { db } from './connection.js';
import { hashPassword } from '../utils/password.js';

const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;

if (userCount === 0) {
  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password, password_plain, role) VALUES (?, ?, ?, ?, ?)'
  );
  const admin = insertUser.run(
    'Marcela Ríos',
    'admin@fintrace.test',
    hashPassword('Audit0r!2026'),
    'Audit0r!2026',
    'admin'
  );
  const auditor = insertUser.run(
    'Felipe Londoño',
    'auditor@fintrace.test',
    hashPassword('Contable123'),
    'Contable123',
    'auditor'
  );

  const insertCustomer = db.prepare(
    'INSERT INTO customers (owner_id, name, nit, email, logo_url) VALUES (?, ?, ?, ?, ?)'
  );
  const c1 = insertCustomer.run(
    admin.lastInsertRowid,
    'Distribuidora Andina S.A.S.',
    '900.123.456-7',
    'compras@andina.test',
    null
  );
  const c2 = insertCustomer.run(
    auditor.lastInsertRowid,
    'Taller Pascual Bravo',
    '890.654.321-2',
    'contacto@tallerpb.test',
    null
  );

  const insertInvoice = db.prepare(
    `INSERT INTO invoices (owner_id, customer_id, number, amount_cents, currency, status)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const inv1 = insertInvoice.run(admin.lastInsertRowid, c1.lastInsertRowid, 'FV-0001', 482000000, 'COP', 'aprobada');
  const inv2 = insertInvoice.run(admin.lastInsertRowid, c1.lastInsertRowid, 'FV-0002', 125000000, 'COP', 'pendiente');
  const inv3 = insertInvoice.run(auditor.lastInsertRowid, c2.lastInsertRowid, 'FV-0003', 63500000, 'COP', 'observada');

  const insertNote = db.prepare(
    'INSERT INTO invoice_notes (invoice_id, author_id, body) VALUES (?, ?, ?)'
  );
  insertNote.run(inv1.lastInsertRowid, admin.lastInsertRowid, 'Pago confirmado por transferencia Bancolombia.');
  insertNote.run(inv3.lastInsertRowid, auditor.lastInsertRowid, 'Pendiente de soporte físico del taller.');

  console.log('Semilla aplicada: 2 usuarios, 2 clientes, 3 facturas.');
  console.log('  admin@fintrace.test / Audit0r!2026 (role: admin)');
  console.log('  auditor@fintrace.test / Contable123 (role: auditor)');
} else {
  console.log('La base de datos ya tiene datos; no se vuelve a sembrar.');
}
