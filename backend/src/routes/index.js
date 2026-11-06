import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth-controller.js';
import * as businesses from '../controllers/business-controller.js';
import * as catalog from '../controllers/catalog-controller.js';
import * as bookings from '../controllers/booking-controller.js';
import * as publicPages from '../controllers/public-controller.js';
import * as onboarding from '../controllers/onboarding-controller.js';
import * as analytics from '../controllers/analytics-controller.js';
import * as subscriptions from '../controllers/subscription-controller.js';
import { requireAuth, requirePlatformAdmin } from '../middlewares/auth.js';
import { validateBody } from '../validators/validate.js';
import { bookingSchema, businessCreateSchema, businessUpdateSchema, hoursSchema, loginSchema, onboardingEventSchema, registerSchema, serviceCreateSchema, serviceUpdateSchema, bookingStatusSchema } from '../validators/schemas.js';

export const apiRouter = Router();

apiRouter.get('/health', (request, response) => {
  response.status(200).json({ data: { status: 'ok', timestamp: new Date().toISOString() } });
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Intenta nuevamente más tarde.' } } });

apiRouter.post('/auth/register', authLimiter, validateBody(registerSchema), auth.register);
apiRouter.post('/auth/login', authLimiter, validateBody(loginSchema), auth.login);
apiRouter.post('/auth/logout', requireAuth, auth.logout);
apiRouter.get('/auth/me', requireAuth, auth.me);

apiRouter.post('/businesses', requireAuth, validateBody(businessCreateSchema), businesses.create);
apiRouter.get('/businesses/me', requireAuth, businesses.mine);
apiRouter.get('/businesses/:id', requireAuth, businesses.getOne);
apiRouter.patch('/businesses/:id', requireAuth, validateBody(businessUpdateSchema), businesses.update);
apiRouter.post('/businesses/:id/publish', requireAuth, businesses.publish);
apiRouter.post('/businesses/:id/services', requireAuth, validateBody(serviceCreateSchema), catalog.createServiceHandler);
apiRouter.get('/businesses/:id/services', requireAuth, catalog.listServicesHandler);
apiRouter.get('/businesses/:id/hours', requireAuth, catalog.getHoursHandler);
apiRouter.put('/businesses/:id/hours', requireAuth, validateBody(hoursSchema), catalog.putHoursHandler);
apiRouter.patch('/services/:id', requireAuth, validateBody(serviceUpdateSchema), catalog.updateServiceHandler);
apiRouter.delete('/services/:id', requireAuth, catalog.removeServiceHandler);
apiRouter.get('/businesses/:id/bookings', requireAuth, bookings.listPrivate);
apiRouter.get('/bookings/:id', requireAuth, bookings.getPrivate);
apiRouter.patch('/bookings/:id/status', requireAuth, validateBody(bookingStatusSchema), bookings.updateStatus);
apiRouter.get('/onboarding/status', requireAuth, onboarding.status);
apiRouter.post('/onboarding/events', requireAuth, validateBody(onboardingEventSchema), onboarding.createEvent);
apiRouter.get('/subscriptions/me', requireAuth, subscriptions.mine);
apiRouter.get('/admin/analytics/funnel', requireAuth, requirePlatformAdmin, analytics.funnel);
apiRouter.get('/admin/analytics/activation', requireAuth, requirePlatformAdmin, analytics.activation);
apiRouter.get('/admin/analytics/acquisition', requireAuth, requirePlatformAdmin, analytics.acquisition);

apiRouter.get('/public/businesses/:slug', publicPages.business);
apiRouter.get('/public/businesses/:slug/services', publicPages.services);
apiRouter.get('/public/businesses/:slug/availability', bookings.availability);
apiRouter.post('/public/businesses/:slug/bookings', validateBody(bookingSchema), bookings.createPublic);
