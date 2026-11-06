import { getOnboardingStatus, recordOnboardingEvent } from '../services/onboarding-service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const status = asyncHandler(async (request, response) => { response.status(200).json({ data: await getOnboardingStatus(request.auth.user, request.query.businessId) }); });
export const createEvent = asyncHandler(async (request, response) => { response.status(201).json({ data: { event: await recordOnboardingEvent(request.auth.user, request.validatedBody) } }); });
