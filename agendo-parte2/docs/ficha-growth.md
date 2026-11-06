# Ficha de Growth — AGENDO Parte 2

## Problema y solución

La mayor pérdida de configuración ocurre al pedir datos fiscales: 26 de 100 trials abandonan allí. La mayor fricción de activación aparece después: solo 30 de los 62 negocios configurados comparten el enlace en 24 horas. El nuevo onboarding pospone datos fiscales, usa plantillas de servicios y horarios, y convierte publicar/compartir en la acción principal.

## AHA, hábito y KPI semanal

- **Momento AHA:** primera reserva mediante la página de reservas.
- **Hábito:** 20 o más citas en los primeros 14 días.
- **KPI semanal recomendado:** porcentaje de negocios que reciben primera reserva en los 14 días posteriores a completar setup. Mide valor recibido, no solo clics ni formularios completados.

## Meta y efecto financiero condicionado

| Métrica | Base | Meta hipotética | Tipo |
|---|---:|---:|---|
| Primera reserva entre configurados | 38/62 = 61,29 % | 46/62 = 74,19 % | Meta, no resultado |
| Conversión a pago por segmentos | 13,88 % | 14,68 % | Escenario |
| Clientes paid con 500 trials | 70 | 73,4 | Escenario |
| CAC paid | USD 180,00 | USD 172,59 | Escenario |

El cálculo conserva USD 10.000 de pauta, USD 1.200 de una vendedora y USD 20 de comisión por cliente. La meta no confirma un cambio comercial: debe medirse con un experimento.

## Ciclo de crecimiento y canales

```text
Barbería activa → página de reservas → visitas de clientes
→ insignia de AGENDO → nuevo barbero interesado → prueba gratis
→ activación → nueva barbería activa
```

Las 250 visitas por página y 8 registros mensuales por insignia son datos del caso, pero no permiten calcular atribución a pago ni una tasa de referidos. La activación es una palanca de conversión, no un canal de adquisición independiente.

| Período | Objetivo | Acción | Métrica | Criterio de continuación | Riesgo |
|---|---|---|---|---|---|
| Días 1–30 | Medir línea base | Instrumentar pasos y primera reserva | Primera reserva / setup completo | Denominadores completos y comparables | Datos incompletos |
| Días 31–60 | Probar onboarding | A/B 50/50 si es viable | Primera reserva en 14 días | Sin deterioro de calidad de setup | Muestra limitada |
| Días 61–90 | Decidir escalamiento | Revisar efecto en pago y CAC | Conversión a pago, CAC paid | Evidencia suficiente y contramétrica estable | Confundir asociación con causalidad |

## Experimento A/B

**Hipótesis:** «Si reemplazamos el onboarding administrativo por un setup mínimo con publicación y compartir visibles, entonces la primera reserva entre negocios que completan setup pasa de 61,29 % a 74,19 %, y vigilamos que la calidad de la configuración y la conversión a pago no empeoren».

- Grupo A: onboarding actual. Grupo B: nuevo onboarding.
- Asignación: 50/50 cuando sea viable; medición durante los 14 días de prueba.
- Métrica primaria: primera reserva en 14 días entre negocios con setup completo.
- Contramétrica: configuración válida y conversión a pago.
- Criterio: no se declarará éxito por una diferencia visual; con 500 trials/mes divididos en dos grupos, la evidencia puede ser insuficiente y debe revisarse antes de escalar pauta.

## Recompensas y errores de IA

No se proponen recompensas monetarias porque el caso no define un límite autorizado. Las correcciones reales se registran en `errores-ia.md`.
