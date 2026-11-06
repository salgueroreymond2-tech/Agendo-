import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('acquisition_sources', {
    id: primaryId(), business_id: foreignKey('businesses'),
    source: { type: DataTypes.ENUM('meta_ads', 'google_ads', 'organic', 'agendo_badge', 'referral', 'unknown'), allowNull: false, defaultValue: 'unknown' },
    medium: { type: DataTypes.STRING(100), allowNull: true }, campaign: { type: DataTypes.STRING(160), allowNull: true },
    referral_business_id: { ...foreignKey('businesses', 'SET NULL'), allowNull: true }, recorded_at: { type: DataTypes.DATE, allowNull: false },
    is_simulated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('acquisition_sources', ['business_id', 'recorded_at'], { name: 'acquisition_sources_business_date_index', transaction });
  await queryInterface.addIndex('acquisition_sources', ['source'], { name: 'acquisition_sources_source_index', transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('acquisition_sources', { transaction }); }
