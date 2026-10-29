import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import './db/connection.js';
import { authRouter } from './routes/auth.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { invoicesRouter } from './routes/invoices.routes.js';
import { commentsRouter } from './routes/comments.routes.js';
import { webhooksRouter } from './routes/webhooks.routes.js';
import { searchRouter } from './routes/search.routes.js';

const app = express();

app.use(cors({ origin: env.frontendOrigin, credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, securityMode: env.securityMode });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api', commentsRouter); // expone /api/invoices/:id/notes
app.use('/api/webhooks', webhooksRouter);
app.use('/api/search', searchRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(env.port, () => {
  console.log(`Fintrace API escuchando en http://localhost:${env.port}`);
  console.log(`SECURITY_MODE=${env.securityMode}`);
});
