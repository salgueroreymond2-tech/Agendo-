import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('business_hours', {
    id: primaryId(), business_id: foreignKey('businesses'), day_of_week: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
    opening_time: { type: DataTypes.TIME, allowNull: true }, closing_time: { type: DataTypes.TIME, allowNull: true },
    is_closed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('business_hours', ['business_id', 'day_of_week', 'opening_time'], { unique: true, name: 'business_hours_interval_unique', transaction });
  await queryInterface.sequelize.query('ALTER TABLE business_hours ADD CONSTRAINT business_hours_valid_interval CHECK (day_of_week BETWEEN 0 AND 6 AND (is_closed = 1 OR (opening_time IS NOT NULL AND closing_time IS NOT NULL AND opening_time < closing_time)))', { transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('business_hours', { transaction }); }
