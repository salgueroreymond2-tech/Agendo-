import { createHmac, randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { env } from '../config/environment.js';
import { sequelize } from '../config/database.js';
import { AuthSession, User } from '../models/index.js';
import { ApiError } from '../utils/api-error.js';

const digest = (value) => createHmac('sha256', env.SESSION_SECRET).update(value).digest('hex');
const expirationDate = () => new Date(Date.now() + env.SESSION_TTL_HOURS * 60 * 60 * 1000);

export async function registerUser(input, request) {
  return sequelize.transaction(async (transaction) => {
    const existing = await User.unscoped().findOne({ where: { email: input.email }, transaction });
    if (existing) throw new ApiError(409, 'EMAIL_IN_USE', 'No fue posible crear la cuenta con esos datos.');
    const user = await User.create({ firstName: input.firstName, lastName: input.lastName, email: input.email, passwordHash: await bcrypt.hash(input.password, 12) }, { transaction });
    const session = await createSession(user.id, request, transaction);
    return { user, session };
  });
}

export async function loginUser(input, request) {
  const user = await User.scope('withPassword').findOne({ where: { email: input.email } });
  const valid = user && user.status === 'active' && await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
  const session = await sequelize.transaction((transaction) => createSession(user.id, request, transaction));
  return { user, session };
}

export async function createSession(userId, request, transaction) {
  const rawToken = randomBytes(32).toString('base64url');
  const session = await AuthSession.create({ userId, tokenDigest: digest(rawToken), expiresAt: expirationDate(), userAgent: request.get('user-agent')?.slice(0, 500), ipHash: digest(request.ip || '') }, { transaction });
  return { id: session.id, token: rawToken, expiresAt: session.expiresAt };
}

export async function getSessionUser(rawToken) {
  if (!rawToken) return null;
  const session = await AuthSession.findOne({ where: { tokenDigest: digest(rawToken), revokedAt: null, expiresAt: { [Op.gt]: new Date() } }, include: [{ model: User, as: 'user' }] });
  if (!session || session.user.status !== 'active') return null;
  return { session, user: session.user };
}

export async function revokeSession(rawToken) {
  if (!rawToken) return;
  await AuthSession.update({ revokedAt: new Date() }, { where: { tokenDigest: digest(rawToken), revokedAt: null } });
}

export async function revokeSessionById(id) {
  await AuthSession.update({ revokedAt: new Date() }, { where: { id, revokedAt: null } });
}

export function sessionCookieOptions() {
  return { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', maxAge: env.SESSION_TTL_HOURS * 60 * 60 * 1000, path: '/' };
}
