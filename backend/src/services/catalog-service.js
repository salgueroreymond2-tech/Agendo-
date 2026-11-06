import { sequelize } from '../config/database.js';
import { BusinessHour, OnboardingEvent, Service } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';
import { getOwnedBusiness } from './business-service.js';

const numericId = (value, code = 'INVALID_ID') => {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) throw new ApiError(400, code, 'El identificador no es válido.');
  return id;
};

export async function listServices(user, businessId) {
  const business = await getOwnedBusiness(user, numericId(businessId));
  return Service.findAll({ where: { businessId: business.id }, order: [['is_active', 'DESC'], ['name', 'ASC']] });
}

export async function createService(user, businessId, input) {
  const business = await getOwnedBusiness(user, numericId(businessId));
  return sequelize.transaction(async (transaction) => {
    const service = await Service.create({ ...input, businessId: business.id }, { transaction });
    await OnboardingEvent.create({ businessId: business.id, userId: user.id, eventName: 'services_configured', eventTimestamp: new Date(), eventOrigin: 'server', isSimulated: false }, { transaction });
    return service;
  });
}

async function getOwnedService(user, serviceId) {
  const service = await Service.findByPk(numericId(serviceId));
  if (!service) throw new ApiError(404, 'SERVICE_NOT_FOUND', 'El servicio no existe.');
  await getOwnedBusiness(user, service.businessId);
  return service;
}

export async function updateService(user, serviceId, input) { const service = await getOwnedService(user, serviceId); await service.update(input); return service; }
export async function deactivateService(user, serviceId) { const service = await getOwnedService(user, serviceId); await service.update({ isActive: false }); }

function validateHours(hours) {
  const intervals = new Map();
  for (const hour of hours) {
    if (!hour.isClosed && (!hour.openingTime || !hour.closingTime || hour.openingTime >= hour.closingTime)) throw new ApiError(422, 'INVALID_HOURS', 'Cada intervalo abierto debe tener una hora de apertura anterior al cierre.');
    const group = intervals.get(hour.dayOfWeek) ?? [];
    group.push(hour); intervals.set(hour.dayOfWeek, group);
  }
  for (const dayIntervals of intervals.values()) {
    if (dayIntervals.some((item) => item.isClosed) && dayIntervals.length > 1) throw new ApiError(422, 'INVALID_HOURS', 'Un día cerrado no puede incluir intervalos abiertos.');
    const openIntervals = dayIntervals.filter((item) => !item.isClosed).sort((a, b) => a.openingTime.localeCompare(b.openingTime));
    for (let index = 1; index < openIntervals.length; index += 1) if (openIntervals[index].openingTime < openIntervals[index - 1].closingTime) throw new ApiError(422, 'OVERLAPPING_HOURS', 'Los intervalos del mismo día no pueden superponerse.');
  }
}

export async function replaceHours(user, businessId, hours) {
  const business = await getOwnedBusiness(user, numericId(businessId));
  validateHours(hours);
  return sequelize.transaction(async (transaction) => {
    await BusinessHour.destroy({ where: { businessId: business.id }, transaction });
    const saved = await BusinessHour.bulkCreate(hours.map((hour) => ({ ...hour, businessId: business.id })), { transaction });
    await OnboardingEvent.create({ businessId: business.id, userId: user.id, eventName: 'schedule_configured', eventTimestamp: new Date(), eventOrigin: 'server', isSimulated: false }, { transaction });
    return saved;
  });
}

export async function listHours(user, businessId) { const business = await getOwnedBusiness(user, numericId(businessId)); return BusinessHour.findAll({ where: { businessId: business.id }, order: [['day_of_week', 'ASC'], ['opening_time', 'ASC']] }); }
