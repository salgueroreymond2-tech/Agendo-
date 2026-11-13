# ADR-0002: Los cálculos automatizados asesoran; las personas deciden y autorizan

- Estado: Aceptado
- Fecha: 2026-11-13
- Decide: Equipo responsable de AGENDO, rol de mantenimiento del producto; nombre individual pendiente de confirmar

## Contexto

AGENDO no integra un modelo de IA. El dashboard financiero ejecuta cálculos deterministas de CAC, LTV, flujo de caja y optimización de escenarios, mientras que el backend valida entradas, aplica reglas de autorización y gestiona reservas. La interfaz de reservas públicas crea una solicitud en estado `pending`; la persona propietaria del negocio administra posteriormente el estado de la reserva mediante una ruta autenticada.

## Problema

Los cálculos del asesor financiero, la disponibilidad de agenda y las validaciones de reservas pueden influir en decisiones de negocio. Sin límites claros, una persona podría tomar una recomendación automática como un mandato, o una futura integración de IA podría obtener permisos indebidos para publicar, cobrar, modificar datos o decidir sobre usuarios.

## Principio de supervisión humana

Toda salida automatizada es una recomendación o una aplicación de reglas verificables, no una decisión de alto impacto. Las personas responsables revisan supuestos, aprueban cambios de negocio y autorizan acciones irreversibles. Ningún agente, modelo o regla obtiene permisos adicionales por iniciativa propia, ni puede revelar información confidencial.

## Decisiones permitidas para la IA

No hay IA integrada a la que se le deleguen decisiones. La automatización determinista puede calcular métricas y escenarios, validar formatos, comprobar disponibilidad, generar slots de reserva y devolver recomendaciones de estrategia. Estas operaciones no pueden iniciar campañas, realizar pagos, publicar datos sensibles, cambiar permisos ni modificar registros críticos fuera de las rutas autorizadas.

## Decisiones reservadas a personas

Una persona propietaria autenticada decide los servicios, horarios y publicación de su negocio. La persona responsable del negocio confirma, completa o cancela una reserva. El equipo autorizado decide cambios de precios, inversión publicitaria, presupuestos, usuarios, roles, configuración de producción y adopción de IA. Las decisiones financieras que afecten gasto real requieren evaluación humana independiente del dashboard.

## Matriz de responsabilidades

| Acción | IA o automatización | Persona | Requiere aprobación | Justificación |
| --- | --- | --- | --- | --- |
| Calcular CAC, LTV, flujo de caja y recomendación | Motor determinista local | Revisa supuestos y usa o descarta el resultado | Sí, para decisiones de negocio | Los cálculos dependen de supuestos y no ejecutan acciones externas |
| Proponer presupuesto óptimo en un escenario | Optimizador determinista | Autoriza presupuesto real y campañas | Sí | No existe integración con plataformas publicitarias ni autorización automática de gasto |
| Validar una reserva pública y crearla como `pending` | API aplica validaciones, horario y conflictos | Gestiona el estado posterior de la reserva | Sí, para confirmar o cancelar | Evita doble reserva, pero la operación comercial requiere intervención del negocio |
| Publicar una página de reservas | API exige sesión y propiedad del negocio | Propietario autenticado solicita la publicación | Sí | La publicación cambia la exposición pública del negocio |
| Cambiar roles, permisos, secretos o configuración | No permitido | Administrador autorizado | Sí | Son cambios de seguridad de alto impacto |
| Cobrar, emitir factura, efectuar pago o reembolso | No implementado ni permitido | Persona y sistema de pagos que se apruebe en el futuro | Sí | El repositorio declara que no hay pagos ni facturación implementados |
| Tomar decisiones sobre personas con IA | No implementado ni permitido | Persona responsable, conforme a una política futura | Sí | No debe automatizarse una decisión de alto impacto sin evaluación y controles específicos |

## Acciones que requieren aprobación

Requieren aprobación humana previa: aceptar recomendaciones financieras para gasto real, cambiar precios, publicar un negocio, confirmar o cancelar reservas, eliminar servicios o registros, modificar roles, alterar secretos, ejecutar migraciones en producción, integrar un proveedor externo y desplegar cambios. Las respuestas automáticas no sustituyen dicha aprobación.

## Manejo de errores e incertidumbre

Las entradas de API se validan con Zod, las rutas privadas verifican sesión y propiedad, y las reservas en conflicto responden `409`. Cuando una recomendación financiera no tenga datos suficientes o una afirmación no pueda verificarse, se debe mostrar o registrar como supuesto o pendiente, no como verdad. Si una futura IA falla, devuelve una salida incierta o recibe instrucciones maliciosas, no debe ejecutar acciones ni ampliar su acceso.

## Auditoría y trazabilidad

Las tablas incluyen marcas de creación y actualización; `onboarding_events` registra eventos con origen y los cambios quedan en el historial Git. Las sesiones se pueden revocar y las operaciones privadas se asocian al usuario autenticado. No se identificó un registro de auditoría inmutable y completo para todos los cambios administrativos, por lo que esa capacidad queda pendiente para una evolución de producción.

## Decisión

Los cálculos y recomendaciones automatizados se mantienen como asesoramiento determinista. El backend puede ejecutar validaciones operativas y crear reservas pendientes, pero no puede decidir inversiones, realizar pagos, aprobar cambios críticos ni tomar decisiones de alto impacto sobre personas. Una persona autenticada y autorizada conserva la aprobación final. Cualquier modelo de IA futuro deberá limitarse inicialmente a sugerencias y requerirá un ADR nuevo, evaluación de riesgos y revisión humana antes de ejecutar efectos.

## Alternativas descartadas

- Ejecutar automáticamente el presupuesto recomendado en plataformas de anuncios: descartado porque no hay integración, control de gasto ni aprobación humana.
- Confirmar reservas públicas de forma definitiva al enviarse el formulario: descartado porque el flujo implementado crea reservas `pending` y el negocio debe gestionar su estado.
- Permitir que un modelo o agente cambie datos, permisos o secretos: descartado por los riesgos de errores, instrucciones maliciosas y acciones irreversibles.

## Consecuencias

Mantener una persona en el ciclo exige revisión operativa, pero evita que supuestos financieros o una automatización imperfecta produzcan gastos, publicaciones o cambios sensibles sin control. La experiencia conserva validaciones y disponibilidad automática, sin confundirlas con autonomía de IA.

## Riesgos y mitigaciones

Persisten riesgos de recomendaciones financieras incorrectas, datos de entrada erróneos, doble reserva y futuras integraciones no autorizadas. Se mitigan con funciones y pruebas deterministas, validación de entradas, transacciones e índices únicos para reservas, control de acceso por servidor y las reglas de `AGENTS.md`.

## Cómo se verifica

`src/engine/advisor.ts`, `src/engine/optimizer.ts` y sus pruebas muestran los cálculos deterministas. `backend/src/routes/index.js` protege rutas privadas con `requireAuth`, restringe analítica de plataforma con `requirePlatformAdmin` y crea reservas públicas usando `bookingSchema`. `backend/src/services/booking-service.js` y las migraciones de `booking_slots` implementan el control de conflictos.

## Evidencia y pendientes

La evidencia corresponde al código actual. Deben confirmarse los roles y responsables operativos de producción, y diseñarse auditoría administrativa adicional si AGENDO se despliega con más administradores, pagos, notificaciones o IA generativa.
