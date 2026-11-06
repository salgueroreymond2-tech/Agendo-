# Contrato de API

Todas las respuestas exitosas usan `{ "data": ... }`; los errores usan `{ "error": { "code", "message", "details?", "requestId?" } }`.

## Registro y sesión

```http
POST /api/v1/auth/register
Content-Type: application/json

{"firstName":"Ana","lastName":"Pérez","email":"ana@example.com","password":"contraseña-de-12-o-más"}
```

Respuesta `201`: crea el usuario y la cookie de sesión. `POST /auth/login` acepta `email` y `password`; `POST /auth/logout` revoca la sesión; `GET /auth/me` requiere sesión.

## Onboarding autenticado

```http
POST /api/v1/businesses
Cookie: agendo_session=...

{"name":"Barbería Central","timezone":"America/Costa_Rica"}
```

La creación inicia una suscripción `trialing` de 14 días. Luego se crean servicios con `POST /businesses/:id/services`, se reemplazan horarios con `PUT /businesses/:id/hours` y se publica con `POST /businesses/:id/publish`.

```json
{"hours":[{"dayOfWeek":1,"openingTime":"09:00","closingTime":"18:00","isClosed":false},{"dayOfWeek":0,"isClosed":true}]}
```

## Reserva pública

```http
POST /api/v1/public/businesses/barberia-central/bookings
Content-Type: application/json

{"serviceId":1,"customerName":"Luis Gómez","customerEmail":"luis@example.com","appointmentStart":"2030-05-20T10:00:00-06:00"}
```

La API no acepta duración enviada por el cliente: la obtiene del servicio persistido. Valida negocio activo, pertenencia del servicio, hora futura, horario y slots libres. Una colisión responde `409`.

## Analítica

`GET /api/v1/admin/analytics/funnel`, `/activation` y `/acquisition` requieren una sesión con rol de plataforma. Devuelven únicamente registros reales persistidos y aclaran cuando no hay costos operativos suficientes para calcular CAC real.
