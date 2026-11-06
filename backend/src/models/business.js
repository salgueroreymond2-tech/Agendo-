import { DataTypes } from 'sequelize';

export function defineBusiness(sequelize) {
  return sequelize.define('Business', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    ownerId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'owner_id' }, name: { type: DataTypes.STRING(160), allowNull: false },
    slug: { type: DataTypes.STRING(180), allowNull: false, unique: true }, phone: { type: DataTypes.STRING(32), allowNull: true },
    address: { type: DataTypes.STRING(500), allowNull: true }, description: { type: DataTypes.TEXT, allowNull: true }, logoUrl: { type: DataTypes.STRING(2048), allowNull: true, field: 'logo_url' },
    timezone: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'America/Costa_Rica' }, status: { type: DataTypes.ENUM('draft', 'active', 'disabled'), allowNull: false, defaultValue: 'draft' },
    isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_demo' }
  }, { tableName: 'businesses' });
}
