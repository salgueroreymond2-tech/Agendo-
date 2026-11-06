import { describe, expect, it } from 'vitest';
import { bookingSchema, hoursSchema, registerSchema, serviceCreateSchema } from '../../src/validators/schemas.js';

describe('validadores de la API', () => {
  it('acepta el registro con una contraseña segura', () => {
    const result = registerSchema.safeParse({ firstName: 'Ana', lastName: 'Pérez', email: 'ANA@EXAMPLE.COM', password: 'contraseña-segura-123' });
    expect(result.success).toBe(true);
    expect(result.data.email).toBe('ana@example.com');
  });

  it('rechaza contraseñas menores de 12 caracteres', () => {
    expect(registerSchema.safeParse({ firstName: 'Ana', lastName: 'Pérez', email: 'ana@example.com', password: 'corta' }).success).toBe(false);
  });

  it('acepta servicios con precio no negativo y duración positiva', () => {
    expect(serviceCreateSchema.safeParse({ name: 'Corte', price: 12, durationMinutes: 30 }).success).toBe(true);
    expect(serviceCreateSchema.safeParse({ name: 'Corte', price: -1, durationMinutes: 30 }).success).toBe(false);
  });

  it('requiere una fecha con zona horaria para reservas públicas', () => {
    expect(bookingSchema.safeParse({ serviceId: 1, customerName: 'Luis', appointmentStart: '2030-05-20T10:00:00-06:00' }).success).toBe(true);
    expect(bookingSchema.safeParse({ serviceId: 1, customerName: 'Luis', appointmentStart: '2030-05-20T10:00:00' }).success).toBe(false);
  });

  it('admite días cerrados y horarios con formato válido', () => {
    const result = hoursSchema.safeParse({ hours: [{ dayOfWeek: 1, openingTime: '09:00', closingTime: '18:00', isClosed: false }, { dayOfWeek: 0, isClosed: true }] });
    expect(result.success).toBe(true);
  });
});
