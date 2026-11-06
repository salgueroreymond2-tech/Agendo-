import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('onboarding_events', {
    id: primaryId(), business_id: foreignKey('businesses'),
    user_id: { ...foreignKey('users', 'SET NULL'), allowNull: true }, event_name: { type: DataTypes.STRING(100), allowNull: false },
    event_timestamp: { type: DataTypes.DATE, allowNull: false }, event_origin: { type: DataTypes.ENUM('server', 'client_reported', 'simulated'), allowNull: false, defaultValue: 'server' },
    is_simulated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, metadata: { type: DataTypes.JSON, allowNull: true }, ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('onboarding_events', ['business_id', 'event_name', 'event_timestamp'], { name: 'onboarding_events_funnel_index', transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('onboarding_events', { transaction }); }
