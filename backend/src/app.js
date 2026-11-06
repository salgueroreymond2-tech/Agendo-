import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { env } from './config/environment.js';
import { logger } from './config/logger.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';

export const app = express();

app.disable('x-powered-by');
app.use(pinoHttp({ logger, genReqId: () => randomUUID() }));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/v1', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
