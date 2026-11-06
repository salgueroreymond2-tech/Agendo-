import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('businesses', {
    id: primaryId(),
    owner_id: foreignKey('users'),
    name: { type: DataTypes.STRING(160), allowNull: false },
    slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(32), allowNull: true },
    address: { type: DataTypes.STRING(500), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    logo_url: { type: DataTypes.STRING(2048), allowNull: true },
    timezone: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'America/Costa_Rica' },
    status: { type: DataTypes.ENUM('draft', 'active', 'disabled'), allowNull: false, defaultValue: 'draft' },
    is_demo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('businesses', ['owner_id'], { name: 'businesses_owner_id_index', transaction });
  await queryInterface.addIndex('businesses', ['slug'], { unique: true, name: 'businesses_slug_unique', transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('businesses', { transaction }); }
