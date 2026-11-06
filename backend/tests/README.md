# Estado de pruebas

| Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|
| Validadores de registro, servicios, horarios y reservas | Rechazar entradas inválidas y aceptar entradas correctas | 5 pruebas unitarias aprobadas con Vitest | SUPERADA |
| Sintaxis de backend y frontend | Código JavaScript analizable | 54 archivos backend y 2 scripts frontend válidos | SUPERADA |
| Migraciones MySQL | Crear/volver a esquema con claves e índices | Requiere `backend/.env`; no se ejecutó aquí | NO EJECUTADA |
| Registro, sesión y aislamiento tenant | Persistencia y autorización reales | Requiere MySQL configurado | NO EJECUTADA |
| Conflicto concurrente de reservas | Una solicitud `201`, otra `409` | Requiere MySQL configurado | NO EJECUTADA |

Las pruebas pendientes no se declaran aprobadas. Una vez creado `backend/.env`, ejecuta `npm run migrate`, inicia el servidor y usa una base de pruebas aislada para las pruebas de integración.
