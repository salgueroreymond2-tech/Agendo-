import { DataTypes } from 'sequelize';

export function defineService(sequelize) {
  return sequelize.define('Service', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, businessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'business_id' },
    name: { type: DataTypes.STRING(160), allowNull: false }, description: { type: DataTypes.TEXT, allowNull: true }, durationMinutes: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, field: 'duration_minutes', validate: { min: 1 } },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false, validate: { min: 0 } }, isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' }
  }, { tableName: 'services' });
}
