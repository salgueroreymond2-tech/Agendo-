# Reporte de pruebas — AGENDO Parte 2

| Prueba | Resultado esperado | Resultado obtenido | Estado | Corrección |
|---|---|---|---|---|
| Conversión por paso del embudo | 74 %, 94,6 %, 92,9 %, 95,4 % y 48,4 % | Coincide mediante cálculo independiente | SUPERADA | No aplica |
| Segmentos mutuamente excluyentes | Suman 100 trials | 38 + 24 + 16 + 22 = 100 | SUPERADA | No aplica |
| Conversión a pago implícita | Aproximadamente 14 % | 13,88 %; diferencia de 0,12 pp | SUPERADA | Se documentó el redondeo/agregación |
| Escenario de meta | Conservar 100 trials y recalcular CAC paid | 14,68 %, 73,4 paid, CAC USD 172,59 | SUPERADA | Se corrigió manejo de porcentajes, ver E-02 |
| Nombre obligatorio | No avanzar sin nombre de negocio | Muestra mensaje de validación | SUPERADA | No aplica |
| Flujo del barbero | Servicios → horarios → publicación → reserva simulada | Recorrido ejecutado con una simulación local del DOM | SUPERADA | No aplica |
| Etiqueta de reserva | Distinguirla como simulada | Se renderiza `RESERVA SIMULADA` | SUPERADA | No aplica |
| Panel de Valeria | Abrir y separar caso, meta y demo | Renderizado y validaciones matemáticas comprobadas | SUPERADA | No aplica |
| Sintaxis JavaScript | No contener errores de análisis | `new Function` validó el script embebido | SUPERADA | No aplica |
| Vista de 390 px | Sin desbordamiento y controles táctiles | No se ejecutó inspección visual en navegador | NO EJECUTADA | Requiere prueba manual en navegador |
| Vista de 768 px | Diseño adaptable | No se ejecutó inspección visual en navegador | NO EJECUTADA | Requiere prueba manual en navegador |
| Vista de 1280 px | Diseño adaptable | No se ejecutó inspección visual en navegador | NO EJECUTADA | Requiere prueba manual en navegador |
| Navegación completa con teclado | Foco y activación coherentes | No se ejecutó prueba interactiva en navegador | NO EJECUTADA | Requiere prueba manual en navegador |

Las pruebas ejecutadas usan una simulación local del DOM y no sustituyen una revisión visual en un navegador real.
