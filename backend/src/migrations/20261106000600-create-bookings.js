import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('bookings', {
    id: primaryId(), business_id: foreignKey('businesses'), service_id: foreignKey('services'),
    customer_name: { type: DataTypes.STRING(160), allowNull: false }, customer_email: { type: DataTypes.STRING(254), allowNull: true },
    customer_phone: { type: DataTypes.STRING(32), allowNull: true }, appointment_start: { type: DataTypes.DATE, allowNull: false },
    appointment_end: { type: DataTypes.DATE, allowNull: false }, status: { type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT, allowNull: true }, is_simulated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('bookings', ['business_id', 'appointment_start', 'status'], { name: 'bookings_business_time_status_index', transaction });
  await queryInterface.addIndex('bookings', ['service_id'], { name: 'bookings_service_id_index', transaction });
  await queryInterface.sequelize.query('ALTER TABLE bookings ADD CONSTRAINT bookings_valid_period CHECK (appointment_end > appointment_start)', { transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('bookings', { transaction }); }
