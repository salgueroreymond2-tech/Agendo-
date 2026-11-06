import { createBusiness, getOwnedBusiness, listOwnedBusinesses, publishBusiness, updateOwnedBusiness } from '../services/business-service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const create = asyncHandler(async (request, response) => { const business = await createBusiness(request.auth.user.id, request.validatedBody); response.status(201).json({ data: { business } }); });
export const mine = asyncHandler(async (request, response) => { response.status(200).json({ data: { businesses: await listOwnedBusinesses(request.auth.user) } }); });
export const getOne = asyncHandler(async (request, response) => { response.status(200).json({ data: { business: await getOwnedBusiness(request.auth.user, request.params.id) } }); });
export const update = asyncHandler(async (request, response) => { response.status(200).json({ data: { business: await updateOwnedBusiness(request.auth.user, request.params.id, request.validatedBody) } }); });
export const publish = asyncHandler(async (request, response) => { response.status(200).json({ data: { business: await publishBusiness(request.auth.user, request.params.id) } }); });
