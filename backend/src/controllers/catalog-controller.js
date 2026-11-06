import { createService, deactivateService, listHours, listServices, replaceHours, updateService } from '../services/catalog-service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const createServiceHandler = asyncHandler(async (request, response) => { response.status(201).json({ data: { service: await createService(request.auth.user, request.params.id, request.validatedBody) } }); });
export const listServicesHandler = asyncHandler(async (request, response) => { response.status(200).json({ data: { services: await listServices(request.auth.user, request.params.id) } }); });
export const updateServiceHandler = asyncHandler(async (request, response) => { response.status(200).json({ data: { service: await updateService(request.auth.user, request.params.id, request.validatedBody) } }); });
export const removeServiceHandler = asyncHandler(async (request, response) => { await deactivateService(request.auth.user, request.params.id); response.status(204).send(); });
export const getHoursHandler = asyncHandler(async (request, response) => { response.status(200).json({ data: { hours: await listHours(request.auth.user, request.params.id) } }); });
export const putHoursHandler = asyncHandler(async (request, response) => { response.status(200).json({ data: { hours: await replaceHours(request.auth.user, request.params.id, request.validatedBody.hours) } }); });
