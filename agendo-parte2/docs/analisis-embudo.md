# AGENDO — Parte 2: análisis de Growth (Etapa 1)

## A. Objetivo completado

Se analizó el recorrido actual desde que una cuenta ya fue creada hasta compartir el enlace de reservas. El objetivo es identificar fricciones de configuración, activación y adopción sin presentar metas o datos simulados como resultados observados.

## B. Fórmulas y resultados

### Embudo actual

Para cada paso de configuración:

```text
Conversión del paso = completan / llegan × 100
Abandono absoluto = llegan − completan
Abandono relativo = abandono absoluto / llegan × 100
Conversión acumulada = completan / 100 trials iniciales × 100
```

| Paso | Llegan | Completan | Conversión del paso | Abandono absoluto | Abandono relativo | Conversión acumulada | Tiempo conocido |
|---|---:|---:|---:|---:|---:|---:|---|
| Datos fiscales | 100 | 74 | 74,0 % | 26 | 26,0 % | 74,0 % | 4 min |
| Datos del negocio | 74 | 70 | 94,6 % | 4 | 5,4 % | 70,0 % | 3 min |
| Servicios | 70 | 65 | 92,9 % | 5 | 7,1 % | 65,0 % | 12 min |
| Horarios | 65 | 62 | 95,4 % | 3 | 4,6 % | 62,0 % | 9 min |
| Finalización | 62 | 62 | 100,0 % | 0 | 0,0 % | 62,0 % | Sin dato |
| Compartir enlace en 24 h* | 62 | 30 | 48,4 % | 32 | 51,6 % | 30,0 % | Sin dato |

\*Compartir es una acción posterior de activación, no una pantalla equivalente a las cuatro de configuración.

- La mayor pérdida dentro del setup es **datos fiscales**: 26 trials, 26,0 % relativo.
- La mayor pérdida de todo el recorrido es **compartir**: 32 de los 62 negocios elegibles, 51,6 % relativo.
- La tarea de configuración con más tiempo informado es **servicios**: 12 minutos.
- El recorrido completo de las cuatro tareas suma 28 minutos para quien las complete todas. No es el tiempo promedio de los 100 trials, porque una parte abandona antes.

### Primera reserva, AHA y hábito

```text
Tasa de primera reserva entre quienes compartieron = 27 / 30 = 90,0 %
Tasa de primera reserva entre quienes no compartieron = 11 / 32 = 34,375 %
Primera reserva observada en los 62 configurados = (27 + 11) / 62 = 61,29 %
```

- **AHA:** la primera reserva obtenida a través de la página de reservas.
- **Hábito:** registrar 20 o más citas durante los primeros 14 días; lo alcanzan 22 de 100 trials.
- **Fricción de configuración:** datos fiscales tempranos, nueve servicios promedio, y configuración de horarios que genera aproximadamente 40 consultas semanales.
- **Fricción de activación:** la pantalla de finalización no facilita compartir; el enlace está oculto en Configuración > Mi página.
- **Fricción de adopción:** llegar a una primera reserva no garantiza uso habitual durante los 14 días.

### Conversión a pago implícita

Los segmentos son mutuamente excluyentes y preservan 100 trials:

```text
Conversión implícita = (38 × 1 %) + (24 × 5 %) + (16 × 15 %) + (22 × 45 %)
                    = 0,38 % + 1,20 % + 2,40 % + 9,90 %
                    = 13,88 %
```

El 13,88 % queda a 0,12 puntos porcentuales del 14 % observado en la Parte 1. La diferencia es consistente con el redondeo o la agregación de los datos del caso; no se alteraron los segmentos para forzar una coincidencia exacta.

### Meta propuesta y efecto financiero condicionado

**MÍO — meta experimental, no resultado observado:** aumentar negocios con primera reserva dentro de los 14 días de 38 a 46 de los 62 que completan configuración (61,29 % a 74,19 %). El escenario mueve 8 trials desde «configuraron sin recibir reserva» hacia «recibieron reserva sin uso habitual»; mantiene 100 trials y no supone que esos negocios ya desarrollaron hábito.

```text
Nueva conversión a pago = (38 × 1 %) + (16 × 5 %) + (24 × 15 %) + (22 × 45 %)
                         = 14,68 %
Clientes paid esperados = 500 × 14,68 % = 73,4 clientes/mes
Costo de adquisición = 10.000 + 1.200 + (20 × 73,4) = USD 12.668,00/mes
CAC paid nuevo = 12.668 / 73,4 = USD 172,59/cliente paid
Ahorro de CAC = 180,00 − 172,59 = USD 7,41/cliente paid
```

| Métrica | Línea base observada | Meta / escenario | Unidad | Origen |
|---|---:|---:|---|---|
| Primera reserva entre 62 configurados | 38 / 62 = 61,29 % | 46 / 62 = 74,19 % | % | DEL CASO / MÍO — meta |
| Conversión a pago por segmentos | 13,88 % | 14,68 % | % | DEL CASO / derivado de meta |
| Clientes paid mensuales | 70 | 73,4 | clientes/mes | DEL CASO / escenario |
| CAC paid | USD 180,00 | USD 172,59 | USD/cliente paid | DEL CASO / escenario |

La meta primaria recomendada para Valeria es **negocios que reciben primera reserva en 14 días, entre quienes completan el setup**. Compartir en 24 horas es métrica de apoyo: es accionable antes, pero no equivale por sí misma al valor recibido.

### Por qué importa el segmento de origen

El impacto financiero depende de qué usuarios cambian, porque su probabilidad de pago inicial no es la misma. Como comprobación adicional, si 8 usuarios pasaran a hábito:

| Escenario ilustrativo, no meta seleccionada | Conversión a pago | Clientes paid con 500 trials | CAC paid |
|---|---:|---:|---:|
| Desde «primera reserva sin hábito» (16 → 8; hábito 22 → 30) | 16,28 % | 81,4 | USD 157,59 |
| Desde «configuraron sin reserva» (24 → 16; hábito 22 → 30) | 17,08 % | 85,4 | USD 151,15 |

Mover usuarios desde «sin reserva» parece mejor en el modelo porque cambia una probabilidad de pago del 5 % al 45 %, frente a 15 % a 45 %. Es matemáticamente más favorable, pero también exige una hipótesis de producto más fuerte y no debe tratarse como un resultado esperado.

### Setup mínimo propuesto

Para recibir una reserva se necesita: nombre del negocio, al menos un servicio con precio y duración, horarios disponibles y publicar la página. Los datos fiscales se deben posponer hasta el cobro al terminar la prueba. Los servicios y horarios iniciales del prototipo deberán aparecer como **SIMULADO** cuando el caso no indique sus valores exactos.

## C. Verificación

Los resultados se verificaron mediante una rutina aritmética independiente del motor de la Parte 1:

- Cada conversión del embudo coincide con `completan / llegan`.
- Los abandonos por paso suman los cambios entre los conteos consecutivos.
- Los cuatro segmentos suman exactamente 100 trials.
- La conversión implícita calculada por segmentos es 13,88 %, coherente con el 14 % histórico dentro de 0,12 puntos porcentuales.
- El escenario conserva 100 trials y recalcula tanto comisiones como CAC paid; no utiliza CAC blended.

## D. Tabla de métricas

| Métrica | Valor | Unidad | Origen |
|---|---:|---|---|
| Trials de anuncios | 500 | trials/mes | DEL CASO, Parte 1 |
| Conversión actual a pago | 14 % | % | DEL CASO, Parte 1 |
| CAC paid actual | USD 180,00 | USD/cliente paid | DEL CASO, Parte 1 |
| Margen mensual | USD 19,50 | USD/cliente·mes | DEL CASO, Parte 1 |
| Compartieron en 24 h | 30 de 62 | 48,4 % | DEL CASO, Parte 2 |
| Primera reserva, compartieron | 27 de 30 | 90,0 % | DEL CASO, Parte 2 |
| Primera reserva, no compartieron | 11 de 32 | 34,4 % | DEL CASO, Parte 2 |
| Uso habitual | 22 de 100 | 22,0 % | DEL CASO, Parte 2 |

## E. Dónde puede engañar el resultado

Los negocios que comparten tienen más primeras reservas observadas, pero el análisis no prueba que compartir sea la causa. Podrían ser negocios inicialmente más motivados o mejor preparados. Además, una meta de primera reserva no prueba todavía una mejora del hábito, la retención ni la conversión a pago; debe verificarse con un experimento controlado de 14 días.

## F. Errores o dudas de la IA

- **D-01 — Documento fuente:** el PDF de la Parte 2 no está disponible en el repositorio importado. Este análisis usa exclusivamente los datos transcritos por el usuario y debe contrastarse con el documento original cuando esté disponible.
- No se ha identificado un error matemático en esta etapa. La diferencia entre 13,88 % y 14 % se preserva como una diferencia de redondeo/agregación, no se corrige artificialmente.

## G. Próximo paso

La siguiente etapa, si se autoriza, es el diseño UX/UI: arquitectura mínima de pantallas, recorrido móvil y revisión de las cuatro preguntas del cliente. No se ha programado ninguna pantalla en esta etapa.
