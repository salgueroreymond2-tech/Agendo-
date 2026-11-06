import { DataTypes } from 'sequelize';
import { auditColumns, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('users', {
    id: primaryId(),
    first_name: { type: DataTypes.STRING(80), allowNull: false },
    last_name: { type: DataTypes.STRING(80), allowNull: false },
    email: { type: DataTypes.STRING(254), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('owner', 'platform_admin'), allowNull: false, defaultValue: 'owner' },
    status: { type: DataTypes.ENUM('active', 'disabled'), allowNull: false, defaultValue: 'active' },
    is_demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('users', ['email'], { unique: true, name: 'users_email_unique', transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('users', { transaction }); }
