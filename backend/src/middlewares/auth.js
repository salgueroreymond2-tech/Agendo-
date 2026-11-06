import { env } from '../config/environment.js';
import { getSessionUser } from '../services/auth-service.js';
import { ApiError } from '../utils/api-error.js';

function readCookie(request, name) {
  const cookies = request.headers.cookie?.split(';') ?? [];
  const found = cookies.map((item) => item.trim().split('=')).find(([key]) => key === name);
  return found ? decodeURIComponent(found.slice(1).join('=')) : null;
}

export async function requireAuth(request, response, next) {
  try {
    const identity = await getSessionUser(readCookie(request, env.SESSION_COOKIE_NAME));
    if (!identity) throw new ApiError(401, 'AUTH_REQUIRED', 'Debes iniciar sesión para realizar esta acción.');
    request.auth = identity;
    next();
  } catch (error) { next(error); }
}

export function requirePlatformAdmin(request, response, next) {
  if (request.auth.user.role !== 'platform_admin') return next(new ApiError(403, 'FORBIDDEN', 'Esta función requiere permisos de administración de plataforma.'));
  next();
}
