import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string(),
  DB_LOGGING: z.enum(['true', 'false']).default('false'),
  SESSION_COOKIE_NAME: z.string().min(1).default('agendo_session'),
  SESSION_TTL_HOURS: z.coerce.number().int().min(1).max(720).default(24),
  SESSION_SECRET: z.string().min(32),
  FRONTEND_URL: z.string().url().default('http://localhost:3000')
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Configuración de entorno inválida. Revisa backend/.env. ${issues.join('; ')}`);
}

export const env = parsed.data;
