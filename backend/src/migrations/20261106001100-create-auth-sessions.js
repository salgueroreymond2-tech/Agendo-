import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('auth_sessions', {
    id: primaryId(), user_id: foreignKey('users', 'CASCADE'), token_digest: { type: DataTypes.CHAR(64), allowNull: false, unique: true },
    expires_at: { type: DataTypes.DATE, allowNull: false }, revoked_at: { type: DataTypes.DATE, allowNull: true },
    user_agent: { type: DataTypes.STRING(500), allowNull: true }, ip_hash: { type: DataTypes.CHAR(64), allowNull: true }, ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('auth_sessions', ['token_digest'], { unique: true, name: 'auth_sessions_token_digest_unique', transaction });
  await queryInterface.addIndex('auth_sessions', ['user_id', 'expires_at'], { name: 'auth_sessions_user_expiry_index', transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('auth_sessions', { transaction }); }
