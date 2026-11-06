import { DataTypes, Sequelize } from 'sequelize';

export const primaryId = () => ({
  type: DataTypes.BIGINT.UNSIGNED,
  autoIncrement: true,
  primaryKey: true,
  allowNull: false
});

export const auditColumns = () => ({
  created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
  updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
});

export const foreignKey = (table, onDelete = 'RESTRICT') => ({
  type: DataTypes.BIGINT.UNSIGNED,
  allowNull: false,
  references: { model: table, key: 'id' },
  onUpdate: 'CASCADE',
  onDelete
});
