import { DataTypes } from 'sequelize';

export function defineSubscription(sequelize) {
  return sequelize.define('Subscription', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, businessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'business_id' },
    planType: { type: DataTypes.ENUM('monthly', 'annual'), allowNull: false, defaultValue: 'monthly', field: 'plan_type' }, status: { type: DataTypes.ENUM('trialing', 'active', 'past_due', 'cancelled', 'expired'), allowNull: false, defaultValue: 'trialing' },
    trialStartAt: { type: DataTypes.DATE, allowNull: true, field: 'trial_start_at' }, trialEndAt: { type: DataTypes.DATE, allowNull: true, field: 'trial_end_at' },
    currentPeriodStart: { type: DataTypes.DATE, allowNull: true, field: 'current_period_start' }, currentPeriodEnd: { type: DataTypes.DATE, allowNull: true, field: 'current_period_end' },
    isSimulated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_simulated' }
  }, { tableName: 'subscriptions' });
}
