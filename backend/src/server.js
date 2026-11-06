import { app } from './app.js';
import { env } from './config/environment.js';
import { sequelize } from './config/database.js';
import { logger } from './config/logger.js';

async function start() {
  await sequelize.authenticate();
  app.listen(env.PORT, () => logger.info({ port: env.PORT }, 'API de AGENDO iniciada'));
}

start().catch((error) => {
  logger.fatal({ err: error }, 'No se pudo iniciar la API');
  process.exit(1);
});
