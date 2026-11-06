import { DataTypes } from 'sequelize';

export function defineBookingSlot(sequelize) {
  return sequelize.define('BookingSlot', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, bookingId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'booking_id' },
    businessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'business_id' }, slotStart: { type: DataTypes.DATE, allowNull: false, field: 'slot_start' }
  }, { tableName: 'booking_slots' });
}
