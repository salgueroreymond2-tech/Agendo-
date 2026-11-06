import { z } from 'zod';

const trimmed = z.string().trim();
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, 'Hora inválida');
export const registerSchema = z.object({ firstName: trimmed.min(1).max(80), lastName: trimmed.min(1).max(80), email: trimmed.email().max(254).transform((value) => value.toLowerCase()), password: z.string().min(12).max(128) });
export const loginSchema = z.object({ email: trimmed.email().max(254).transform((value) => value.toLowerCase()), password: z.string().min(1).max(128) });
export const businessCreateSchema = z.object({ name: trimmed.min(2).max(160), phone: trimmed.max(32).optional(), address: trimmed.max(500).optional(), description: trimmed.max(5000).optional(), timezone: trimmed.min(1).max(64).default('America/Costa_Rica'), acquisition: z.object({ source: z.enum(['meta_ads', 'google_ads', 'organic', 'agendo_badge', 'referral', 'unknown']).default('unknown'), medium: trimmed.max(100).optional(), campaign: trimmed.max(160).optional(), referralBusinessId: z.coerce.number().int().positive().optional() }).optional() });
export const businessUpdateSchema = businessCreateSchema.pick({ name: true, phone: true, address: true, description: true, timezone: true }).partial();
export const serviceCreateSchema = z.object({ name: trimmed.min(1).max(160), description: trimmed.max(5000).optional(), durationMinutes: z.coerce.number().int().min(5).max(1440), price: z.coerce.number().min(0).max(999999.99) });
export const serviceUpdateSchema = serviceCreateSchema.partial().extend({ isActive: z.boolean().optional() });
export const hoursSchema = z.object({ hours: z.array(z.object({ dayOfWeek: z.coerce.number().int().min(0).max(6), openingTime: time.optional(), closingTime: time.optional(), isClosed: z.boolean().default(false) })).min(1).max(21) });
export const bookingSchema = z.object({ serviceId: z.coerce.number().int().positive(), customerName: trimmed.min(1).max(160), customerEmail: trimmed.email().max(254).optional(), customerPhone: trimmed.max(32).optional(), appointmentStart: z.string().datetime({ offset: true }), notes: trimmed.max(3000).optional() });
export const bookingStatusSchema = z.object({ status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']) });
export const onboardingEventSchema = z.object({ businessId: z.coerce.number().int().positive(), eventName: z.enum(['onboarding_started', 'business_created', 'services_configured', 'schedule_configured', 'booking_page_published', 'booking_link_shared', 'onboarding_completed']), metadata: z.record(z.string(), z.unknown()).optional() });
