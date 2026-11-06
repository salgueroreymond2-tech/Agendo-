import { acquisitionAnalytics, activationAnalytics, funnelAnalytics } from '../services/analytics-service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const funnel = asyncHandler(async (request, response) => { response.status(200).json({ data: await funnelAnalytics() }); });
export const activation = asyncHandler(async (request, response) => { response.status(200).json({ data: await activationAnalytics() }); });
export const acquisition = asyncHandler(async (request, response) => { response.status(200).json({ data: await acquisitionAnalytics() }); });
