import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { DataTypes } from 'sequelize';
import { sequelize } from '../src/config/database.js';
import { logger } from '../src/config/logger.js';

const command = process.argv[2];
if (!['up', 'down'].includes(command)) throw new Error('Uso: npm run migrate -- up | down');

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(currentDirectory, '../src/migrations');

async function getMigrations() {
  const entries = await readdir(migrationsDirectory);
  const files = entries.filter((file) => /^\d{14}-.+\.js$/.test(file)).sort();
  return Promise.all(files.map(async (file) => ({
    name: file,
    module: await import(pathToFileURL(path.join(migrationsDirectory, file)).href)
  })));
}

async function ensureMigrationsTable(queryInterface) {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes('schema_migrations')) {
    await queryInterface.createTable('schema_migrations', {
      name: { type: DataTypes.STRING(255), allowNull: false, primaryKey: true },
      executed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
    });
  }
}

async function run() {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  await ensureMigrationsTable(queryInterface);
  const migrations = await getMigrations();
  const [executed] = await sequelize.query('SELECT name FROM schema_migrations ORDER BY name ASC');
  const executedNames = new Set(executed.map((row) => row.name));

  if (command === 'up') {
    for (const migration of migrations.filter(({ name }) => !executedNames.has(name))) {
      await sequelize.transaction(async (transaction) => {
        await migration.module.up(queryInterface, { transaction });
        await queryInterface.bulkInsert('schema_migrations', [{ name: migration.name, executed_at: new Date() }], { transaction });
      });
      logger.info({ migration: migration.name }, 'Migración aplicada');
    }
    return;
  }

  const lastName = [...executedNames].sort().at(-1);
  if (!lastName) return logger.info('No hay migraciones para revertir');
  const migration = migrations.find(({ name }) => name === lastName);
  if (!migration) throw new Error(`No se encontró el archivo de migración ${lastName}`);
  await sequelize.transaction(async (transaction) => {
    await migration.module.down(queryInterface, { transaction });
    await queryInterface.bulkDelete('schema_migrations', { name: lastName }, { transaction });
  });
  logger.info({ migration: lastName }, 'Migración revertida');
}

run().then(() => sequelize.close()).catch(async (error) => {
  logger.error({ err: error }, 'No se pudieron ejecutar las migraciones');
  await sequelize.close();
  process.exit(1);
});
