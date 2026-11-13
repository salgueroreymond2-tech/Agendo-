# ADR 001: Selección del modelo y proveedor de IA — motor determinista local

- Estado: Aceptado
- Fecha: 2026-11-13
- Decide: Equipo responsable de AGENDO, rol de mantenimiento del producto; nombre individual pendiente de confirmar
- Responsables: Equipo responsable de AGENDO; asignación individual pendiente de confirmar

## Contexto

AGENDO contiene un dashboard financiero Vite y TypeScript, un prototipo de onboarding y un backend Express con MySQL. El módulo denominado “AI Financial Advisor” usa `src/engine/advisor.ts` y funciones matemáticas locales para calcular escenarios, indicadores y recomendaciones. No hay SDK, clave de API, variable de entorno, endpoint ni dependencia que demuestre uso de OpenAI, Anthropic, Google, Azure, AWS Bedrock u otro proveedor de modelos.

## Problema que se necesita resolver

El nombre de la interfaz podría inducir a creer que existe un LLM o un proveedor de IA externo. Es necesario documentar el mecanismo real y evitar que se transmitan datos de usuarios a terceros o que se presenten recomendaciones financieras como decisiones automatizadas de IA.

## Opciones consideradas

- Motor determinista local con funciones TypeScript y datos de escenario: opción adoptada porque es el comportamiento implementado y permite resultados reproducibles sin transmitir datos a terceros.
- Integrar un LLM o API de IA generativa: descartado porque no existe evidencia de una necesidad, proveedor seleccionado, evaluación de privacidad, presupuesto, control de calidad ni implementación en el repositorio.
- Eliminar toda recomendación del dashboard: descartado porque el proyecto ya ofrece cálculos y recomendaciones deterministas útiles para explorar el caso financiero.

## Alternativas descartadas

- Un LLM remoto como sustituto de las fórmulas: se descarta porque añadiría transferencia de datos, costos, respuestas no deterministas y dependencia de proveedor sin una necesidad demostrada.
- Un proveedor de IA declarado solo por el nombre de la pantalla: se descarta porque el repositorio no contiene cliente, configuración ni evidencia de esa integración.

## Criterios de evaluación

La elección se evaluó contra evidencia del repositorio: reproducibilidad de cálculos, latencia local, costo de operación, privacidad, ausencia de transferencia a terceros, mantenibilidad en TypeScript y coherencia con el caso financiero. Si se propone IA futura, deberán evaluarse además calidad de respuestas, control de alucinaciones, residencia de datos, contrato del proveedor, límites de costo y seguridad de credenciales.

## Decisión

El asesor financiero seguirá siendo una capa determinista local. Sus cálculos y recomendaciones se generan desde `src/engine/advisor.ts`, `src/engine/optimizer.ts` y las funciones de simulación relacionadas; no se envían entradas al backend ni a un proveedor de IA. No se incorporará un modelo, API de IA, clave ni dependencia nueva sin un ADR que reemplace esta decisión, actualización del inventario y límites de autonomía aprobados en ADR-0002.

## Justificación

La implementación actual calcula resultados a partir de supuestos financieros y datos estáticos o introducidos en el navegador. Este enfoque permite inspeccionar el código, ejecutar pruebas y exportar resultados sin exponer datos a un proveedor externo. Afirmar una integración de IA que no existe sería incorrecto y dificultaría la gobernanza de datos.

## Consecuencias positivas

- No hay costo por inferencia ni dependencia de disponibilidad de un proveedor de IA.
- El cálculo es reproducible a partir de sus entradas y funciones versionadas.
- El dashboard no transmite supuestos financieros ni datos de sesión a un proveedor de IA.
- No se requieren claves API de IA ni mecanismos adicionales para protegerlas.

## Consecuencias negativas

- Las recomendaciones están limitadas a las reglas y supuestos programados; no interpretan contexto nuevo ni lenguaje natural.
- El rótulo “AI Financial Advisor” puede ser confuso y debe entenderse como asesor determinista, no como modelo generativo.
- La calidad de una recomendación depende de la validez de los supuestos de entrada y no sustituye análisis financiero humano.

## Riesgos y mitigaciones

Una recomendación determinista puede ser incorrecta o malinterpretada si los supuestos son incompletos. Se mitiga mostrando escenarios, manteniendo la decisión final en una persona y documentando que los resultados son recomendaciones. El riesgo de añadir IA sin controles se mitiga exigiendo un ADR de reemplazo, evaluación de datos y aprobación humana antes de cualquier integración.

## Alternativas futuras

Si se requiere un modelo de IA, se deberá documentar proveedor y modelo específicos, propósito, datos mínimos enviados, ubicación de la llamada en servidor, gestión de errores, controles de costo, evaluación de calidad, retención y consentimiento. La alternativa de conservar reglas deterministas debe compararse explícitamente en esa decisión.

## Cómo se verifica

`src/engine/advisor.ts` y `src/engine/optimizer.ts` contienen las recomendaciones y cálculos. `package.json` y `backend/package.json` no declaran clientes de proveedores de IA, mientras que `backend/.env.example` no incluye variables de API de IA. Las pruebas de la raíz verifican cálculos financieros, no llamadas de inferencia.

## Referencias y evidencia del repositorio

- `README.md` describe el Advisor como inteligencia determinista del CFO.
- `src/pages/AdvisorPage.ts` y `src/engine/advisor.ts` implementan la interfaz y las reglas del asesor.
- `src/utils/storage.ts` y `src/utils/exports.ts` muestran persistencia y exportación locales del dashboard.
