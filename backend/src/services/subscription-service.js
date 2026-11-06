import { Business, Subscription } from '../models/index.js';

export async function listMySubscriptions(user) {
  const where = user.role === 'platform_admin' ? {} : { ownerId: user.id };
  const businesses = await Business.findAll({ where, attributes: ['id', 'name', 'slug'], include: [{ model: Subscription, as: 'subscriptions', order: [['created_at', 'DESC']] }] });
  return businesses;
}
