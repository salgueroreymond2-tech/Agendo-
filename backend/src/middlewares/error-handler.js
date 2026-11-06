import { ZodError } from 'zod';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import { ApiError } from '../utils/api-error.js';
import { logger } from '../config/logger.js';

export function notFoundHandler(request, response) {
  response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Recurso no encontrado.' } });
}

export function errorHandler(error, request, response, next) { // eslint-disable-line no-unused-vars
  const isApiError = error instanceof ApiError;
  const isValidationError = error instanceof ZodError;
  const isDatabaseValidation = error instanceof ValidationError;
  const isUnique = error instanceof UniqueConstraintError;
  const status = isApiError ? error.status : (isValidationError || isDatabaseValidation) ? 422 : isUnique ? 409 : 500;
  const code = isApiError ? error.code : (isValidationError || isDatabaseValidation) ? 'VALIDATION_ERROR' : isUnique ? 'DUPLICATE_RESOURCE' : 'INTERNAL_ERROR';
  const message = isApiError ? error.message : (isValidationError || isDatabaseValidation) ? 'La solicitud contiene datos inválidos.' : isUnique ? 'El recurso ya existe.' : 'Ocurrió un error interno.';
  const details = isApiError ? error.details : isValidationError ? error.flatten() : isDatabaseValidation ? error.errors.map(({ path, message }) => ({ path, message })) : undefined;

  if (status >= 500) logger.error({ err: error, requestId: request.id }, 'Error no controlado');
  response.status(status).json({ error: { code, message, details, requestId: request.id } });
}
