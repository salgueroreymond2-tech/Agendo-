# Estado de pruebas

| Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|
| Validadores de registro, servicios, horarios y reservas | Rechazar entradas inválidas y aceptar entradas correctas | 5 pruebas unitarias aprobadas con Vitest | SUPERADA |
| Sintaxis de backend y frontend | Código JavaScript analizable | 54 archivos backend y 2 scripts frontend válidos | SUPERADA |
| Migraciones MySQL | Crear esquema con claves e índices | 11 migraciones aplicadas y registradas en `agendo_db` | SUPERADA |
| Conexión MySQL y health | Conectarse a MySQL y devolver HTTP 200 | Consulta a `schema_migrations` correcta; `/api/v1/health` devolvió 200 | SUPERADA |
| Registro, sesión y aislamiento tenant | Persistencia y autorización reales | Requiere MySQL configurado | NO EJECUTADA |
| Conflicto concurrente de reservas | Una solicitud `201`, otra `409` | Requiere MySQL configurado | NO EJECUTADA |

Las pruebas pendientes no se declaran aprobadas. Una vez creado `backend/.env`, ejecuta `npm run migrate`, inicia el servidor y usa una base de pruebas aislada para las pruebas de integración.
