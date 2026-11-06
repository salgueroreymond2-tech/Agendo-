import { getPublicBusiness, getPublicServices } from '../services/business-service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const business = asyncHandler(async (request, response) => { response.status(200).json({ data: { business: await getPublicBusiness(request.params.slug) } }); });
export const services = asyncHandler(async (request, response) => { const result = await getPublicServices(request.params.slug); response.status(200).json({ data: { business: result.business, services: result.services } }); });
