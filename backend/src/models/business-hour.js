import { DataTypes } from 'sequelize';

export function defineBusinessHour(sequelize) {
  return sequelize.define('BusinessHour', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, businessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'business_id' },
    dayOfWeek: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, field: 'day_of_week', validate: { min: 0, max: 6 } }, openingTime: { type: DataTypes.TIME, allowNull: true, field: 'opening_time' },
    closingTime: { type: DataTypes.TIME, allowNull: true, field: 'closing_time' }, isClosed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_closed' }
  }, { tableName: 'business_hours' });
}
