import { DataTypes } from 'sequelize';

export function defineBusinessFiscalProfile(sequelize) {
  return sequelize.define('BusinessFiscalProfile', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, businessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, unique: true, field: 'business_id' },
    legalName: { type: DataTypes.STRING(200), allowNull: false, field: 'legal_name' }, legalIdentifier: { type: DataTypes.STRING(100), allowNull: false, field: 'legal_identifier' },
    taxRegime: { type: DataTypes.STRING(120), allowNull: true, field: 'tax_regime' }, fiscalAddress: { type: DataTypes.STRING(500), allowNull: true, field: 'fiscal_address' }
  }, { tableName: 'business_fiscal_profiles' });
}
