import { DataTypes } from 'sequelize';

export function defineAuthSession(sequelize) {
  return sequelize.define('AuthSession', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, userId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'user_id' },
    tokenDigest: { type: DataTypes.CHAR(64), allowNull: false, unique: true, field: 'token_digest' }, expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
    revokedAt: { type: DataTypes.DATE, allowNull: true, field: 'revoked_at' }, userAgent: { type: DataTypes.STRING(500), allowNull: true, field: 'user_agent' }, ipHash: { type: DataTypes.CHAR(64), allowNull: true, field: 'ip_hash' }
  }, { tableName: 'auth_sessions' });
}
