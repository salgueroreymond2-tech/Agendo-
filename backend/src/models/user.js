import { DataTypes } from 'sequelize';

export function defineUser(sequelize) {
  return sequelize.define('User', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true },
    firstName: { type: DataTypes.STRING(80), allowNull: false, field: 'first_name' },
    lastName: { type: DataTypes.STRING(80), allowNull: false, field: 'last_name' },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    role: { type: DataTypes.ENUM('owner', 'platform_admin'), allowNull: false, defaultValue: 'owner' },
    status: { type: DataTypes.ENUM('active', 'disabled'), allowNull: false, defaultValue: 'active' },
    isDemo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_demo' }
  }, { tableName: 'users', defaultScope: { attributes: { exclude: ['passwordHash'] } }, scopes: { withPassword: { attributes: {} } } });
}
