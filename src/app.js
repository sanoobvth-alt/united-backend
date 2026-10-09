import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes/index.js';
import { notFound } from './middlewares/not-found.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
