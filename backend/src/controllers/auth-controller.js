import { env } from '../config/environment.js';
import { loginUser, registerUser, revokeSessionById, sessionCookieOptions } from '../services/auth-service.js';
import { asyncHandler } from '../utils/async-handler.js';

const userPayload = (user) => ({ id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role, status: user.status });
const writeSession = (response, session) => response.cookie(env.SESSION_COOKIE_NAME, session.token, sessionCookieOptions());

export const register = asyncHandler(async (request, response) => { const { user, session } = await registerUser(request.validatedBody, request); writeSession(response, session); response.status(201).json({ data: { user: userPayload(user) } }); });
export const login = asyncHandler(async (request, response) => { const { user, session } = await loginUser(request.validatedBody, request); writeSession(response, session); response.status(200).json({ data: { user: userPayload(user) } }); });
export const logout = asyncHandler(async (request, response) => { await revokeSessionById(request.auth.session.id); response.clearCookie(env.SESSION_COOKIE_NAME, { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/' }); response.status(204).send(); });
export const me = asyncHandler(async (request, response) => { response.status(200).json({ data: { user: userPayload(request.auth.user) } }); });
