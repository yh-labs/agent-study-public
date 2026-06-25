import express from 'express';
import authRouter from './api/auth/index.js';
import petsRouter from './api/pets/index.js';
import notifRouter from './api/notifications/index.js';
import cronRouter from './cron/generate-reports.js';

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/pets', petsRouter);
app.use('/api/notifications', notifRouter);
app.use('/api/cron', cronRouter);

app.get('/api/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

export default app;
