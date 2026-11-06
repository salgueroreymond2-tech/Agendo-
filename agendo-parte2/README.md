# AGENDO — Parte 2

Prototipo local del nuevo onboarding para barberías. Está diseñado para demostrar cómo reducir la fricción entre la creación de cuenta y la primera reserva; no es un sistema de producción.

## Abrir el prototipo

Para el recorrido visual simulado, puedes abrir `index.html` directamente. Para registro, persistencia, URL pública y reservas reales, configura e inicia `backend/` y abre `http://localhost:3000/`; el modo `file://` no puede ofrecer autenticación ni datos persistidos.

## Recorrido de demostración

1. Escribe el nombre de una barbería.
2. Edita los servicios iniciales, identificados como **SIMULADO**.
3. Ajusta y aplica el horario semanal simulado.
4. Revisa el enlace local de demostración y las alternativas de compartir.
5. Muestra la página de reservas y la primera reserva simulada.
6. Abre el Panel de Valeria para distinguir datos del caso, metas hipotéticas y eventos locales.

## Límites conocidos

- Sin backend, el enlace mostrado representa una publicación local. Con el backend iniciado y la barbería publicada, el enlace utiliza `/reservas/:slug` en el origen real.
- WhatsApp puede abrir su compartidor cuando el navegador lo permita. Instagram requiere copiar y pegar el texto manualmente.
- La reserva, los servicios, los horarios y la barbería de ejemplo son datos simulados y se etiquetan en la interfaz.
- El backend guarda usuarios, negocios, servicios, horarios y reservas reales; no procesa pagos ni realiza notificaciones reales.
- El PDF de la Parte 2 no estaba disponible en el repositorio importado; las cifras provienen del prompt recibido.

## Archivos

- `index.html`: prototipo navegable de un solo archivo.
- `docs/analisis-embudo.md`: cálculos, escenario financiero y riesgos.
- `docs/supuestos.md`: trazabilidad de datos y supuestos.
- `docs/ficha-growth.md`: ficha ejecutiva de Growth.
- `docs/guion-demo.md`: demostración de tres minutos.
- `docs/errores-ia.md`: registro de dudas y correcciones.
- `tests/pruebas.md`: resultados de calidad ejecutados y pendientes.
