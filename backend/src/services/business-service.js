import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { AcquisitionSource, Business, BusinessHour, OnboardingEvent, Service, Subscription } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';

const slugBase = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 150) || 'negocio';

async function uniqueSlug(name, transaction) {
  const base = slugBase(name);
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const suffix = attempt ? `-${attempt + 1}` : '';
    const slug = `${base}${suffix}`;
    const existing = await Business.findOne({ where: { slug }, transaction, lock: transaction?.LOCK?.UPDATE });
    if (!existing) return slug;
  }
  throw new ApiError(409, 'SLUG_UNAVAILABLE', 'No se pudo generar un enlace único para el negocio.');
}

export async function createBusiness(ownerId, input) {
  return sequelize.transaction(async (transaction) => {
    const now = new Date();
    const business = await Business.create({ ownerId, name: input.name, slug: await uniqueSlug(input.name, transaction), phone: input.phone, address: input.address, description: input.description, timezone: input.timezone }, { transaction });
    await Subscription.create({ businessId: business.id, planType: 'monthly', status: 'trialing', trialStartAt: now, trialEndAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) }, { transaction });
    await OnboardingEvent.create({ businessId: business.id, userId: ownerId, eventName: 'business_created', eventTimestamp: now, eventOrigin: 'server', isSimulated: false }, { transaction });
    if (input.acquisition) await AcquisitionSource.create({ businessId: business.id, source: input.acquisition.source, medium: input.acquisition.medium, campaign: input.acquisition.campaign, referralBusinessId: input.acquisition.referralBusinessId, recordedAt: now, isSimulated: false }, { transaction });
    return business;
  });
}

export async function getOwnedBusiness(user, businessId) {
  const business = await Business.findByPk(businessId);
  if (!business) throw new ApiError(404, 'BUSINESS_NOT_FOUND', 'La barbería no existe.');
  if (user.role !== 'platform_admin' && String(business.ownerId) !== String(user.id)) throw new ApiError(403, 'TENANT_FORBIDDEN', 'No puedes acceder a información de otra barbería.');
  return business;
}

export async function listOwnedBusinesses(user) {
  const where = user.role === 'platform_admin' ? {} : { ownerId: user.id };
  return Business.findAll({ where, include: [{ model: Subscription, as: 'subscriptions', separate: true, limit: 1, order: [['created_at', 'DESC']] }], order: [['created_at', 'DESC']] });
}

export async function updateOwnedBusiness(user, id, input) {
  const business = await getOwnedBusiness(user, id);
  if (input.name && input.name !== business.name) input.slug = await uniqueSlug(input.name);
  await business.update(input);
  return business;
}

export async function publishBusiness(user, id) {
  return sequelize.transaction(async (transaction) => {
    const business = await getOwnedBusiness(user, id);
    const [services, hours] = await Promise.all([
      Service.count({ where: { businessId: business.id, isActive: true }, transaction }),
      BusinessHour.count({ where: { businessId: business.id, isClosed: false }, transaction })
    ]);
    if (!services || !hours) throw new ApiError(422, 'PUBLISHING_INCOMPLETE', 'Configura al menos un servicio activo y un horario disponible antes de publicar.');
    await business.update({ status: 'active' }, { transaction });
    await OnboardingEvent.create({ businessId: business.id, userId: user.id, eventName: 'booking_page_published', eventTimestamp: new Date(), eventOrigin: 'server', isSimulated: false }, { transaction });
    return business;
  });
}

export async function getPublicBusiness(slug) {
  const business = await Business.findOne({ where: { slug, status: 'active' }, attributes: ['id', 'name', 'slug', 'phone', 'address', 'description', 'logoUrl', 'timezone'] });
  if (!business) throw new ApiError(404, 'PUBLIC_BUSINESS_NOT_FOUND', 'La página de reservas no está disponible.');
  return business;
}

export async function getPublicServices(slug) {
  const business = await getPublicBusiness(slug);
  const services = await Service.findAll({ where: { businessId: business.id, isActive: true }, attributes: ['id', 'name', 'description', 'durationMinutes', 'price'], order: [['name', 'ASC']] });
  return { business, services };
}

export async function getPublicAvailability(slug) {
  const business = await getPublicBusiness(slug);
  const hours = await BusinessHour.findAll({ where: { businessId: business.id }, attributes: ['dayOfWeek', 'openingTime', 'closingTime', 'isClosed'], order: [['day_of_week', 'ASC'], ['opening_time', 'ASC']] });
  return { business, hours };
}

export function hasBookingConflictError(error) {
  return error?.name === 'SequelizeUniqueConstraintError' || error?.original?.code === 'ER_DUP_ENTRY';
}
