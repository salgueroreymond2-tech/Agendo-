import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('business_fiscal_profiles', {
    id: primaryId(), business_id: { ...foreignKey('businesses'), unique: true }, legal_name: { type: DataTypes.STRING(200), allowNull: false },
    legal_identifier: { type: DataTypes.STRING(100), allowNull: false }, tax_regime: { type: DataTypes.STRING(120), allowNull: true },
    fiscal_address: { type: DataTypes.STRING(500), allowNull: true }, ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('business_fiscal_profiles', ['business_id'], { unique: true, name: 'business_fiscal_profiles_business_unique', transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('business_fiscal_profiles', { transaction }); }
