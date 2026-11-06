import { DataTypes } from 'sequelize';
import { auditColumns, foreignKey, primaryId } from './helpers.js';

export async function up(queryInterface, { transaction }) {
  await queryInterface.createTable('booking_slots', {
    id: primaryId(), booking_id: foreignKey('bookings', 'CASCADE'), business_id: foreignKey('businesses'),
    slot_start: { type: DataTypes.DATE, allowNull: false }, ...auditColumns()
  }, { transaction });
  await queryInterface.addIndex('booking_slots', ['business_id', 'slot_start'], { unique: true, name: 'booking_slots_business_start_unique', transaction });
  await queryInterface.addIndex('booking_slots', ['booking_id'], { name: 'booking_slots_booking_id_index', transaction });
}
export async function down(queryInterface, { transaction }) { await queryInterface.dropTable('booking_slots', { transaction }); }
