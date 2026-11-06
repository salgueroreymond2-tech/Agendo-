import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Booking, BookingSlot, Business, BusinessHour, OnboardingEvent, Service } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { getOwnedBusiness, getPublicBusiness, hasBookingConflictError } from './business-service.js';

const blockingStatuses = ['pending', 'confirmed', 'completed'];
const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function getLocalParts(date, timezone) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  const pick = (type) => parts.find((part) => part.type === type)?.value;
  return { dayOfWeek: weekdayIndex[pick('weekday')], time: `${pick('hour')}:${pick('minute')}:${pick('second')}` };
}

function assertValidSlotStart(start) {
  if (start.getUTCMinutes() % 5 !== 0 || start.getUTCSeconds() !== 0 || start.getUTCMilliseconds() !== 0) throw new ApiError(422, 'INVALID_SLOT_INCREMENT', 'La hora de reserva debe comenzar en un intervalo de 5 minutos.');
}

async function assertWithinHours(business, start, end, transaction) {
  const localStart = getLocalParts(start, business.timezone);
  const localEnd = getLocalParts(new Date(end.getTime() - 1), business.timezone);
  if (localStart.dayOfWeek !== localEnd.dayOfWeek) throw new ApiError(422, 'OUTSIDE_BUSINESS_HOURS', 'La reserva no puede cruzar el cierre diario.');
  const intervals = await BusinessHour.findAll({ where: { businessId: business.id, dayOfWeek: localStart.dayOfWeek, isClosed: false }, transaction });
  const withinInterval = intervals.some((interval) => localStart.time >= interval.openingTime && localEnd.time <= interval.closingTime);
  if (!withinInterval) throw new ApiError(422, 'OUTSIDE_BUSINESS_HOURS', 'La hora solicitada no está dentro de la disponibilidad del negocio.');
}

function createSlotRows(bookingId, businessId, start, end) {
  const slots = [];
  for (let current = start.getTime(); current < end.getTime(); current += 5 * 60 * 1000) slots.push({ bookingId, businessId, slotStart: new Date(current) });
  return slots;
}

export async function createPublicBooking(slug, input) {
  try {
    return await sequelize.transaction(async (transaction) => {
      const business = await Business.findOne({ where: { slug, status: 'active' }, transaction, lock: transaction.LOCK.UPDATE });
      if (!business) throw new ApiError(404, 'PUBLIC_BUSINESS_NOT_FOUND', 'La página de reservas no está disponible.');
      const service = await Service.findOne({ where: { id: input.serviceId, businessId: business.id, isActive: true }, transaction });
      if (!service) throw new ApiError(422, 'INVALID_SERVICE', 'El servicio seleccionado no está disponible para esta barbería.');
      const start = new Date(input.appointmentStart);
      if (Number.isNaN(start.getTime()) || start <= new Date()) throw new ApiError(422, 'INVALID_APPOINTMENT_TIME', 'La reserva debe ser una fecha futura válida.');
      assertValidSlotStart(start);
      const end = new Date(start.getTime() + service.durationMinutes * 60 * 1000);
      await assertWithinHours(business, start, end, transaction);
      const previousBookings = await Booking.count({ where: { businessId: business.id, isSimulated: false, status: { [Op.in]: blockingStatuses } }, transaction });
      const booking = await Booking.create({ businessId: business.id, serviceId: service.id, customerName: input.customerName, customerEmail: input.customerEmail, customerPhone: input.customerPhone, appointmentStart: start, appointmentEnd: end, notes: input.notes, status: 'pending', isSimulated: false }, { transaction });
      await BookingSlot.bulkCreate(createSlotRows(booking.id, business.id, start, end), { transaction });
      if (previousBookings === 0) await OnboardingEvent.create({ businessId: business.id, eventName: 'first_booking_received', eventTimestamp: new Date(), eventOrigin: 'server', isSimulated: false, metadata: { bookingId: booking.id } }, { transaction });
      return booking;
    });
  } catch (error) {
    if (hasBookingConflictError(error)) throw new ApiError(409, 'BOOKING_CONFLICT', 'El horario acaba de ocuparse. Selecciona otro horario.');
    throw error;
  }
}

export async function listBusinessBookings(user, businessId) {
  const business = await getOwnedBusiness(user, businessId);
  return Booking.findAll({ where: { businessId: business.id }, include: [{ model: Service, as: 'service', attributes: ['id', 'name', 'durationMinutes'] }], order: [['appointment_start', 'ASC']] });
}

export async function getBusinessBooking(user, bookingId) {
  const booking = await Booking.findByPk(bookingId, { include: [{ model: Service, as: 'service' }] });
  if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'La reserva no existe.');
  await getOwnedBusiness(user, booking.businessId);
  return booking;
}

export async function updateBookingStatus(user, bookingId, status) {
  return sequelize.transaction(async (transaction) => {
    const booking = await Booking.findByPk(bookingId, { transaction, lock: transaction.LOCK.UPDATE });
    if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'La reserva no existe.');
    await getOwnedBusiness(user, booking.businessId);
    if (booking.status === 'cancelled' && status !== 'cancelled') throw new ApiError(422, 'INVALID_STATUS_TRANSITION', 'Una reserva cancelada no puede reactivarse.');
    await booking.update({ status }, { transaction });
    if (status === 'cancelled') await BookingSlot.destroy({ where: { bookingId: booking.id }, transaction });
    return booking;
  });
}

export async function publicAvailability(slug) {
  const business = await getPublicBusiness(slug);
  const [hours, occupiedIntervals] = await Promise.all([
    BusinessHour.findAll({ where: { businessId: business.id }, order: [['day_of_week', 'ASC'], ['opening_time', 'ASC']] }),
    Booking.findAll({ where: { businessId: business.id, isSimulated: false, status: { [Op.in]: blockingStatuses }, appointmentEnd: { [Op.gt]: new Date() } }, attributes: ['appointmentStart', 'appointmentEnd'], order: [['appointment_start', 'ASC']] })
  ]);
  return { business, hours, occupiedIntervals };
}
