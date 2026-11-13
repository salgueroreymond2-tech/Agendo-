# Registro de riesgos

## Introducción

Este registro cubre el dashboard financiero, el frontend de onboarding, la API Express, MySQL y los flujos de reservas de AGENDO. Se basa en controles que aparecen en el repositorio; donde una configuración de producción no es verificable se marca como pendiente. Los riesgos de IA se tratan como potenciales porque el “AI Financial Advisor” es determinista y no utiliza un LLM o proveedor externo.

## Escalas de evaluación

- **Probabilidad:** B = baja = 1, M = media = 2, A = alta = 3.
- **Impacto:** B = bajo = 1, M = medio = 2, A = alto = 3.
- **Nivel de riesgo:** probabilidad por impacto. Un resultado de 1 a 2 es bajo, de 3 a 4 es medio y de 6 a 9 es alto.

| # | Riesgo | Quién sale afectado | Probabilidad (B/M/A) | Impacto (B/M/A) | Mitigación | Estado | Responsable |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R1 | Acceso indebido a datos de cuentas, negocios o reservas por una sesión comprometida, permisos de MySQL excesivos o un error de aislamiento entre negocios. | Propietarios, personas que reservan y AGENDO. | M | A | Sesión en cookie `HttpOnly`, HMAC del token, bcrypt, autorización por servidor y validación de propiedad del negocio. Falta confirmar mínimos privilegios y controles de infraestructura MySQL. | En curso | Equipo de backend y responsable de infraestructura |
| R2 | Notas de reserva o `metadata` de onboarding reciben datos sensibles o instrucciones maliciosas sin una política de contenido, retención o revisión. | Personas que reservan, propietarios y operadores de AGENDO. | M | A | Límites de longitud y validación estructural existentes; se debe minimizar el contenido, definir esquema permitido para metadatos, advertir a usuarios y aplicar retención o filtrado. | Pendiente | Equipo de producto y backend |
| R3 | Pérdida o indisponibilidad de cuentas, negocios, reservas y sesiones por no existir en el repositorio una política comprobable de backup, restauración o recuperación de MySQL. | Propietarios, personas que reservan y operación de AGENDO. | M | A | Migraciones reproducen el esquema, pero no los datos. Definir backups cifrados, restauraciones probadas, objetivos de recuperación y responsables antes de producción. | Pendiente | Responsable de infraestructura |
| R4 | Una persona interpreta el “AI Financial Advisor” o el optimizador como una decisión automática y ejecuta una inversión publicitaria o cambio de precio con supuestos incorrectos. | Dirección, inversionistas y negocios que usen el análisis. | M | M | ADR-0001 y ADR-0002 establecen que son cálculos deterministas y recomendaciones; la decisión de gasto o precio requiere revisión humana. Mantener visibles los supuestos y pruebas de cálculo. | En curso | Responsable financiero o de producto |
| R5 | Una reserva pública simultánea genera un horario duplicado o inconsistente. | Personas que reservan y propietarios de negocios. | B | M | Transacción InnoDB, bloqueo de negocio, slots de cinco minutos e índice único por negocio y hora; los conflictos devuelven `409`. Ejecutar pruebas de integración con MySQL en un entorno configurado. | En curso | Equipo de backend |
| R6 | Sesiones, correos, nombres o notas se exponen en logs, exportaciones locales o archivos compartidos sin necesidad. | Personas titulares de datos y operadores de AGENDO. | M | M | Pino redacta campos sensibles configurados; las exportaciones se generan localmente. Definir retención de logs, control de acceso y advertencias de manejo de archivos exportados. | En curso | Equipo de backend y operaciones |
| R7 | La vulnerabilidad moderada transitiva de `uuid@8.3.2` reportada por `npm audit --omit=dev` permanece al depender de Sequelize 6. | Operación de AGENDO y personas cuyos datos procesa. | M | M | Documentar el hallazgo, vigilar actualizaciones compatibles de Sequelize y probar una actualización antes de aplicarla. No usar `audit fix --force` sin evaluación. | Pendiente | Equipo de backend |
| R8 | Una integración futura de LLM, pagos, notificaciones o analítica externa transmite datos sin actualizar inventario, ADRs, contratos y controles. | Personas usuarias, propietarios y AGENDO. | M | A | `AGENTS.md` exige actualizar gobernanza y obtener aprobación humana antes de añadir terceros, IA, pagos o almacenamiento externo. | En curso | Equipo responsable de AGENDO |

## Plan de mitigación para riesgos altos

### R1: acceso indebido a datos operativos

- **Acción preventiva:** aplicar mínimos privilegios de MySQL, conservar validación de propiedad en cada consulta y proteger secretos en variables de entorno.
- **Control de detección:** revisar eventos de autenticación, errores de autorización y cambios de permisos; definir monitoreo de MySQL y alertas de actividad anómala.
- **Respuesta ante incidente:** revocar sesiones afectadas, rotar secretos, investigar accesos, contener el entorno y notificar según las obligaciones aplicables.
- **Criterio de mitigación:** accesos de base de datos por rol, revisión de autorización, monitoreo configurado y procedimiento de respuesta probado.

### R2: contenido sensible o malicioso en campos libres

- **Acción preventiva:** pedir solo datos necesarios, limitar `metadata`, etiquetar notas como no aptas para datos sensibles y tratar su contenido como no confiable.
- **Control de detección:** revisar muestras no productivas, validaciones de esquema y registros de errores sin exponer contenido personal.
- **Respuesta ante incidente:** restringir la entrada afectada, eliminar o anonimizar el contenido con autorización, evaluar exposición y actualizar controles.
- **Criterio de mitigación:** política de campos libres, esquema de metadatos, plazos de retención y procedimientos de eliminación aprobados.

### R3: pérdida de datos MySQL

- **Acción preventiva:** implementar backups cifrados y automatizados, con acceso mínimo y almacenamiento separado.
- **Control de detección:** monitorear éxito de backups y realizar restauraciones de prueba periódicas.
- **Respuesta ante incidente:** activar el procedimiento de recuperación, restaurar al punto acordado, validar integridad y comunicar el impacto.
- **Criterio de mitigación:** restauración probada, objetivos de recuperación definidos y evidencia de backups recientes.

### R8: incorporación no gobernada de terceros o IA

- **Acción preventiva:** exigir ADR, actualización de inventario y aprobación humana en el PR de integración.
- **Control de detección:** revisión de dependencias, variables de entorno, llamadas de red y cambios de CI antes de fusionar.
- **Respuesta ante incidente:** detener el envío de datos, revocar credenciales, evaluar exposición y documentar la decisión correcta antes de reanudar.
- **Criterio de mitigación:** proveedor, flujo de datos, controles, costos y responsabilidades documentados y verificados.

## Riesgos residuales

Incluso con controles de sesión y concurrencia, el sistema conserva riesgo de errores de implementación, credenciales comprometidas, disponibilidad de MySQL y uso inadecuado de exportaciones locales. Los cálculos financieros pueden conducir a decisiones equivocadas si los supuestos son erróneos. La mitigación reduce la probabilidad o impacto, pero no sustituye respaldos, revisión humana, pruebas de integración ni una configuración de producción segura.
