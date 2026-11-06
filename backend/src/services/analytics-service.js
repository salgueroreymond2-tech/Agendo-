import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import { AcquisitionSource, Booking, Business, OnboardingEvent, Subscription } from '../models/index.js';

const realEvents = (eventName) => ({ eventName, isSimulated: false });
const distinctBusinessesWithEvent = (eventName) => OnboardingEvent.count({ where: realEvents(eventName), distinct: true, col: 'business_id' });

export async function funnelAnalytics() {
  const [started, configured, published, shared, firstBookings, totalBusinesses] = await Promise.all([
    distinctBusinessesWithEvent('onboarding_started'),
    distinctBusinessesWithEvent('onboarding_completed'),
    distinctBusinessesWithEvent('booking_page_published'),
    distinctBusinessesWithEvent('booking_link_shared'),
    Booking.count({ where: { isSimulated: false }, distinct: true, col: 'business_id' }),
    Business.count({ where: { isDemo: false } })
  ]);
  return { dataClassification: 'real_persisted_data', totalBusinesses, metrics: { onboardingStarted: started, onboardingCompleted: configured, bookingPagesPublished: published, linksSharedReported: shared, businessesWithFirstBooking: firstBookings }, notes: { linksSharedReported: 'Es una acción reportada por el cliente; no confirma que el mensaje haya sido enviado.' } };
}

export async function activationAnalytics() {
  const [firstBookings, habitualRows] = await Promise.all([
    Booking.count({ where: { isSimulated: false }, distinct: true, col: 'business_id' }),
    sequelize.query(`SELECT COUNT(*) AS count FROM (
      SELECT s.business_id
      FROM subscriptions s
      JOIN bookings b ON b.business_id = s.business_id
      WHERE s.trial_start_at IS NOT NULL
        AND b.is_simulated = false
        AND b.status IN ('pending', 'confirmed', 'completed')
        AND b.appointment_start >= s.trial_start_at
        AND b.appointment_start < DATE_ADD(s.trial_start_at, INTERVAL 14 DAY)
      GROUP BY s.business_id
      HAVING COUNT(b.id) >= 20
    ) habitual_businesses`, { type: QueryTypes.SELECT })
  ]);
  return { dataClassification: 'real_persisted_data', businessesWithFirstBooking: firstBookings, businessesWithHabit: Number(habitualRows[0]?.count ?? 0), habitDefinition: '20 o más reservas no simuladas dentro de los 14 días desde el inicio del trial.' };
}

export async function acquisitionAnalytics() {
  const sources = await AcquisitionSource.findAll({ where: { isSimulated: false }, attributes: ['source', [sequelize.fn('COUNT', sequelize.col('business_id')), 'businesses']], group: ['source'], raw: true });
  return { dataClassification: 'real_persisted_data', sources, note: 'No se calcula CAC operativo sin gastos publicitarios, salarios y comisiones persistidos.' };
}
