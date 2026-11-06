import { Sequelize } from 'sequelize';
import { env } from './environment.js';
import { logger } from './logger.js';

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  logging: env.DB_LOGGING === 'true' ? (message) => logger.debug({ sql: message }, 'Consulta SQL') : false,
  timezone: '+00:00',
  define: {
    underscored: true,
    timestamps: true
  },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
});
