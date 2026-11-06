# Backend de AGENDO

API REST para el onboarding, las reservas y la analítica persistida de AGENDO. Usa Express, Sequelize y MySQL 8; sirve el frontend de Parte 2 desde el mismo origen.

## Requisitos

- Node.js 22 LTS o compatible.
- MySQL 8 con la base `agendo_db` creada.
- Un usuario MySQL con permisos sobre `agendo_db`.

## Configuración local

1. Copia `.env.example` como `.env` dentro de `backend/`.
2. Completa `DB_HOST`, `DB_PORT`, `DB_NAME=agendo_db`, `DB_USER` y `DB_PASSWORD`.
3. Genera un secreto de sesiones, por ejemplo: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`, y colócalo en `SESSION_SECRET`.
4. Instala paquetes con `npm install`.
5. Ejecuta las migraciones: `npm run migrate`.
6. Inicia la aplicación: `npm run dev`.

La aplicación queda disponible en `http://localhost:3000/` y sus rutas públicas de reserva usan `http://localhost:3000/reservas/:slug`.

## Seeder de desarrollo

Después de migrar, define temporalmente `DEMO_OWNER_PASSWORD` con al menos 12 caracteres y ejecuta `npm run seed:dev`. El seeder se bloquea en producción y crea datos con indicadores `is_demo` o `is_simulated`; nunca se ejecuta automáticamente.

## Rutas principales

| Grupo | Ruta |
|---|---|
| Salud | `GET /api/v1/health` |
| Sesión | `/api/v1/auth/register`, `/login`, `/logout`, `/me` |
| Negocios | `/api/v1/businesses` y `/api/v1/businesses/:id` |
| Catálogo | `/api/v1/businesses/:id/services`, `/hours`, `/services/:id` |
| Reservas privadas | `/api/v1/businesses/:id/bookings`, `/api/v1/bookings/:id` |
| Reservas públicas | `/api/v1/public/businesses/:slug/*` |
| Onboarding | `/api/v1/onboarding/status`, `/events` |
| Suscripción | `GET /api/v1/subscriptions/me` |
| Analítica de plataforma | `/api/v1/admin/analytics/*` |

Consulta [docs/api.md](docs/api.md), [docs/base-datos.md](docs/base-datos.md) y [docs/arquitectura.md](docs/arquitectura.md) para el detalle.

## Seguridad y límites

- Contraseñas: bcrypt, sin almacenamiento en texto plano.
- Sesiones: token aleatorio en cookie `HttpOnly`, token cifrado con HMAC en la base y revocación al cerrar sesión.
- Aislamiento: todas las operaciones privadas verifican propietario o rol `platform_admin` en servidor.
- Reservas: transacción + slots de 5 minutos con índice único por negocio/hora; un conflicto responde `409`.
- Datos fiscales: modelo privado sin endpoints públicos y fuera del onboarding mínimo.
- No hay pagos ni facturación implementados. Una suscripción `trialing` no confirma cobros.

## Pruebas

Ejecuta `npm test`. Las pruebas unitarias de validadores se ejecutaron correctamente. Las pruebas de migración e integración con MySQL necesitan un `.env` local y no se han marcado como ejecutadas en este entorno; consulta [tests/README.md](tests/README.md).

## Dependencia pendiente

`npm audit --omit=dev` informa una vulnerabilidad moderada transitiva en `uuid@8.3.2`, introducida por `sequelize@6.37.8`. npm no ofrece una corrección compatible para esta rama; no se aplicó `audit fix --force`. Debe reevaluarse al migrar a una versión de Sequelize que elimine esa dependencia.
