import { DataTypes } from 'sequelize';

export function defineAcquisitionSource(sequelize) {
  return sequelize.define('AcquisitionSource', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, businessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'business_id' },
    source: { type: DataTypes.ENUM('meta_ads', 'google_ads', 'organic', 'agendo_badge', 'referral', 'unknown'), allowNull: false, defaultValue: 'unknown' },
    medium: { type: DataTypes.STRING(100), allowNull: true }, campaign: { type: DataTypes.STRING(160), allowNull: true }, referralBusinessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: 'referral_business_id' },
    recordedAt: { type: DataTypes.DATE, allowNull: false, field: 'recorded_at' }, isSimulated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_simulated' }
  }, { tableName: 'acquisition_sources' });
}
