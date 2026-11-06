import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('subscriptions', {
    id: primaryId(), business_id: foreignKey('businesses'), plan_type: { type: DataTypes.ENUM('monthly', 'annual'), allowNull: false, defaultValue: 'monthly' },
    status: { type: DataTypes.ENUM('trialing', 'active', 'past_due', 'cancelled', 'expired'), allowNull: false, defaultValue: 'trialing' },
    trial_start_at: { type: DataTypes.DATE, allowNull: true }, trial_end_at: { type: DataTypes.DATE, allowNull: true },
    current_period_start: { type: DataTypes.DATE, allowNull: true }, current_period_end: { type: DataTypes.DATE, allowNull: true },
    is_simulated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('subscriptions', ['business_id', 'status'], { name: 'subscriptions_business_status_index', transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('subscriptions', { transaction }); }
