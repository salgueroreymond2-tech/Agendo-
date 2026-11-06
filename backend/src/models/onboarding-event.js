import { DataTypes } from 'sequelize';

export function defineOnboardingEvent(sequelize) {
  return sequelize.define('OnboardingEvent', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, businessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'business_id' },
    userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'user_id' }, eventName: { type: DataTypes.STRING(100), allowNull: false, field: 'event_name' },
    eventTimestamp: { type: DataTypes.DATE, allowNull: false, field: 'event_timestamp' }, eventOrigin: { type: DataTypes.ENUM('server', 'client_reported', 'simulated'), allowNull: false, defaultValue: 'server', field: 'event_origin' },
    isSimulated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_simulated' }, metadata: { type: DataTypes.JSON, allowNull: true }
  }, { tableName: 'onboarding_events' });
}
