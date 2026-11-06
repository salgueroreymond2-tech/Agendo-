import { Business, BusinessHour, OnboardingEvent, Service } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { getOwnedBusiness } from './business-service.js';

export async function recordOnboardingEvent(user, input) {
  const business = await getOwnedBusiness(user, input.businessId);
  if (input.eventName === 'booking_page_published') throw new ApiError(422, 'USE_PUBLISH_ACTION', 'Usa la acción de publicación para registrar este evento.');
  const eventOrigin = input.eventName === 'booking_link_shared' ? 'client_reported' : 'server';
  return OnboardingEvent.create({ businessId: business.id, userId: user.id, eventName: input.eventName, eventTimestamp: new Date(), eventOrigin, isSimulated: false, metadata: input.metadata ?? null });
}

export async function getOnboardingStatus(user, businessId) {
  const business = await getOwnedBusiness(user, businessId);
  const [services, openHours, events] = await Promise.all([
    Service.count({ where: { businessId: business.id, isActive: true } }),
    BusinessHour.count({ where: { businessId: business.id, isClosed: false } }),
    OnboardingEvent.findAll({ where: { businessId: business.id, isSimulated: false }, attributes: ['eventName', 'eventTimestamp', 'eventOrigin'], order: [['event_timestamp', 'ASC']] })
  ]);
  return { businessId: business.id, status: business.status, hasServices: services > 0, hasSchedule: openHours > 0, events };
}
