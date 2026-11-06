import { ApiError } from '../utils/api-error.js';

export function validateBody(schema) {
  return (request, response, next) => {
    const parsed = schema.safeParse(request.body);
    if (!parsed.success) return next(new ApiError(422, 'VALIDATION_ERROR', 'La solicitud contiene datos inválidos.', parsed.error.flatten()));
    request.validatedBody = parsed.data;
    next();
  };
}
