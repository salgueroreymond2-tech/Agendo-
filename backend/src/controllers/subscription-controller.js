import { listMySubscriptions } from '../services/subscription-service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const mine = asyncHandler(async (request, response) => { response.status(200).json({ data: { businesses: await listMySubscriptions(request.auth.user) } }); });
