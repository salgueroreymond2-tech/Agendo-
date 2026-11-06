import { createPublicBooking, getBusinessBooking, listBusinessBookings, publicAvailability, updateBookingStatus } from '../services/booking-service.js';
import { asyncHandler } from '../utils/async-handler.js';

export const createPublic = asyncHandler(async (request, response) => { response.status(201).json({ data: { booking: await createPublicBooking(request.params.slug, request.validatedBody) } }); });
export const listPrivate = asyncHandler(async (request, response) => { response.status(200).json({ data: { bookings: await listBusinessBookings(request.auth.user, request.params.id) } }); });
export const getPrivate = asyncHandler(async (request, response) => { response.status(200).json({ data: { booking: await getBusinessBooking(request.auth.user, request.params.id) } }); });
export const updateStatus = asyncHandler(async (request, response) => { response.status(200).json({ data: { booking: await updateBookingStatus(request.auth.user, request.params.id, request.validatedBody.status) } }); });
export const availability = asyncHandler(async (request, response) => { response.status(200).json({ data: await publicAvailability(request.params.slug) }); });
