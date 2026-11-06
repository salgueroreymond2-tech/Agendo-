import bcrypt from 'bcrypt';
import { env } from '../src/config/environment.js';
import { sequelize } from '../src/config/database.js';
import { AcquisitionSource, Business, BusinessHour, OnboardingEvent, Service, Subscription, User } from '../src/models/index.js';

if (env.NODE_ENV === 'production') throw new Error('Los seeders de demostración no pueden ejecutarse en producción.');
const password = process.env.DEMO_OWNER_PASSWORD;
if (!password || password.length < 12) throw new Error('Define DEMO_OWNER_PASSWORD con al menos 12 caracteres para ejecutar el seeder.');

async function seed() {
  await sequelize.authenticate();
  await sequelize.transaction(async (transaction) => {
    const [owner] = await User.findOrCreate({ where: { email: 'demo-owner@agendo.local' }, defaults: { firstName: 'Propietaria', lastName: 'Demostración', email: 'demo-owner@agendo.local', passwordHash: await bcrypt.hash(password, 12), role: 'owner', status: 'active', isDemo: true }, transaction });
    const [business] = await Business.findOrCreate({ where: { slug: 'barberia-demo-agendo' }, defaults: { ownerId: owner.id, name: 'Barbería Demo AGENDO', slug: 'barberia-demo-agendo', timezone: 'America/Costa_Rica', status: 'active', isDemo: true }, transaction });
    await Subscription.findOrCreate({ where: { businessId: business.id, status: 'trialing' }, defaults: { businessId: business.id, planType: 'monthly', status: 'trialing', trialStartAt: new Date(), trialEndAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), isSimulated: true }, transaction });
    const services = [];
    for (const item of [{ name: 'Corte SIMULADO', price: 12, durationMinutes: 30 }, { name: 'Barba SIMULADO', price: 10, durationMinutes: 20 }, { name: 'Corte con barba SIMULADO', price: 15, durationMinutes: 45 }]) {
      const [service] = await Service.findOrCreate({ where: { businessId: business.id, name: item.name }, defaults: { ...item, businessId: business.id, isActive: true }, transaction });
      services.push(service);
    }
    if (!await BusinessHour.count({ where: { businessId: business.id }, transaction })) await BusinessHour.bulkCreate([1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ businessId: business.id, dayOfWeek, openingTime: '09:00', closingTime: '18:00', isClosed: false })), { transaction });
    await OnboardingEvent.findOrCreate({ where: { businessId: business.id, eventName: 'onboarding_completed', isSimulated: true }, defaults: { businessId: business.id, userId: owner.id, eventName: 'onboarding_completed', eventTimestamp: new Date(), eventOrigin: 'simulated', isSimulated: true }, transaction });
    await AcquisitionSource.findOrCreate({ where: { businessId: business.id, source: 'agendo_badge', isSimulated: true }, defaults: { businessId: business.id, source: 'agendo_badge', medium: 'seeder', recordedAt: new Date(), isSimulated: true }, transaction });
    console.log(`Seeder listo: negocio demo ${business.slug}; ${services.length} servicios simulados.`);
  });
}

seed().then(() => sequelize.close()).catch(async (error) => { console.error(error); await sequelize.close(); process.exit(1); });
