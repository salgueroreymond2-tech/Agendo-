import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('services', {
    id: primaryId(), business_id: foreignKey('businesses'), name: { type: DataTypes.STRING(160), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true }, duration_minutes: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('services', ['business_id', 'is_active'], { name: 'services_business_active_index', transaction });
  await queryInterface.sequelize.query('ALTER TABLE services ADD CONSTRAINT services_valid_price_duration CHECK (price >= 0 AND duration_minutes > 0)', { transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('services', { transaction }); }
