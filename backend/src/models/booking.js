import { DataTypes } from 'sequelize';

export function defineBooking(sequelize) {
  return sequelize.define('Booking', {
    id: { type: DataTypes.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true }, businessId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'business_id' }, serviceId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: 'service_id' },
    customerName: { type: DataTypes.STRING(160), allowNull: false, field: 'customer_name' }, customerEmail: { type: DataTypes.STRING(254), allowNull: true, field: 'customer_email', validate: { isEmail: true } },
    customerPhone: { type: DataTypes.STRING(32), allowNull: true, field: 'customer_phone' }, appointmentStart: { type: DataTypes.DATE, allowNull: false, field: 'appointment_start' },
    appointmentEnd: { type: DataTypes.DATE, allowNull: false, field: 'appointment_end' }, status: { type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    notes: { type: DataTypes.TEXT, allowNull: true }, isSimulated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'is_simulated' }
  }, { tableName: 'bookings' });
}
