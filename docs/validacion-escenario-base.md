# Validación financiera — Etapa 1

## Alcance y estado

Este documento valida el escenario académico base: clientes exclusivamente mensuales, inversión publicitaria constante de USD 10.000 por mes y horizonte de 24 meses. No introduce escenarios optimizados ni modifica los supuestos del caso.

Los cálculos usan precisión completa; el redondeo se aplica solamente para presentar resultados. Los clientes derivados de una tasa de conversión se tratan como valores esperados decimales y las vendedoras como unidades enteras mediante `ceil`.

## Especificación matemática común

| Indicador | Definición y fórmula | Valores base |
|---|---|---|
| Trials | Curva histórica del caso; en USD 10.000 el punto observado es 500. | USD 10.000 → 500 trials |
| Clientes paid | `trials × conversión` | `500 × 0,14 = 70` clientes |
| Vendedoras | `ceil(trials / capacidad)` | `ceil(500 / 500) = 1` vendedora |
| Costo de adquisición | `inversión + salarios ventas + comisiones` | `10.000 + (1 × 1.200) + (70 × 20) = USD 12.600` |
| CAC paid | `costo de adquisición / clientes paid` | `12.600 / 70 = USD 180 por cliente paid` |
| CAC blended | `costo de adquisición / (clientes paid + orgánicos)` | `12.600 / (70 + 50) = USD 105 por cliente nuevo` |
| Margen mensual | `precio mensual × margen bruto` | `25 × 0,78 = USD 19,50 por cliente·mes` |
| LTV a 24 meses | `margen mensual × Σ(1 − churn)^k`, con `k = 0…23` | `19,50 × Σ(0,94)^k = USD 251,3874525` |
| LTV cerrado | `margen mensual × (1 − (1 − churn)^24) / churn` | `19,50 × (1 − 0,94^24) / 0,06 = USD 251,3874525` |
| LTV infinito | `margen mensual / churn` | `19,50 / 0,06 = USD 325` |
| LTV:CAC paid | `LTV_24 / CAC_paid` | `251,3874525 / 180 = 1,39659696x` |
| LTV:CAC blended | `LTV_24 / CAC_blended` | `251,3874525 / 105 = 2,39416621x` |
| Payback mensual | Primer mes donde `−CAC + Σ margen esperado ≥ 0` | Cruza en mes 14; estimación lineal: mes 13,0451 |

## Validación manual del mes 1

Las fórmulas aplican el churn sobre los 1.150 clientes existentes y añaden los clientes nuevos del mes:

```text
Clientes activos M1 = 1.150 × (1 − 0,06) + 70 + 50 = 1.201 clientes
Entradas por margen M1 = 1.201 × 25 × 0,78 = USD 23.419,50
Salidas M1 = 10.000 + 1.200 + (70 × 20) + 14.000 = USD 26.600,00
Flujo neto M1 = 23.419,50 − 26.600,00 = −USD 3.180,50
Caja final M1 = 60.000 − 3.180,50 = USD 56.819,50
```

| ID | Indicador | Esperado por el caso | Resultado independiente | Resultado del motor | Diferencia | Estado |
|---|---|---:|---:|---:|---:|---|
| V-01 | Margen mensual | USD 19,50 | USD 19,50 | USD 19,50 | USD 0,00 | COINCIDE |
| V-02 | Clientes paid con USD 10.000 | 70 | 70 | 70 | 0 | COINCIDE |
| V-03 | Costo de adquisición | USD 12.600,00 | USD 12.600,00 | USD 12.600,00 | USD 0,00 | COINCIDE |
| V-04 | CAC paid | USD 180,00 | USD 180,00 | USD 180,00 | USD 0,00 | COINCIDE |
| V-05 | CAC blended | USD 105,00 | USD 105,00 | USD 105,00 | USD 0,00 | COINCIDE |
| V-06 | LTV a 24 meses | ≈ USD 251 | USD 251,3875 | USD 251,3875 | USD 0,00 | COINCIDE |
| V-07 | LTV infinito | USD 325,00 | USD 325,00 | USD 325,00 | USD 0,00 | COINCIDE |
| V-08 | LTV:CAC paid | ≈ 1,4x | 1,3966x | 1,3966x | 0,0000x | COINCIDE |
| V-09 | LTV:CAC blended | ≈ 2,4x | 2,3942x | 2,3942x | 0,0000x | COINCIDE |
| V-10 | Trials con USD 30.000 | 900 | 900 | 900 | 0 | COINCIDE |
| V-11 | CAC marginal de USD 10.000 a USD 30.000 | ≈ USD 398,57 | USD 398,5714 | USD 398,5714 | USD 0,00 | COINCIDE |
| V-12 | Activos al cierre del mes 1 | 1.201 | 1.201 | 1.201 | 0 | COINCIDE |
| V-13 | Entradas por margen del mes 1 | USD 23.419,50 | USD 23.419,50 | USD 23.419,50 | USD 0,00 | COINCIDE |
| V-14 | Salidas del mes 1 | USD 26.600,00 | USD 26.600,00 | USD 26.600,00 | USD 0,00 | COINCIDE |
| V-15 | Caja final del mes 1 | USD 56.819,50 | USD 56.819,50 | USD 56.819,50 | USD 0,00 | COINCIDE |

## Doble verificación ejecutada

1. Se recalcularon las métricas en una rutina aritmética independiente del motor TypeScript. La suma explícita de los 24 márgenes esperados y la fórmula geométrica cerrada del LTV dan el mismo resultado: USD 251,3874525.
2. Se ejecutó `npm test`: 14 pruebas aprobadas en 5 archivos, incluyendo interpolación, adquisición, LTV, flujo de caja, cohortes anuales y la validación exacta del mes 1.

## Dónde puede engañar este resultado

El CAC blended de USD 105 reparte el costo de publicidad y ventas entre 50 clientes orgánicos que no fueron obtenidos por anuncios. Es útil para describir la mezcla total del mes, pero no mide correctamente el costo de escalar la pauta. El indicador relevante para esa decisión es el CAC paid de USD 180, además del CAC marginal al aumentar inversión. El resultado tampoco garantiza que la conversión de 14 % se conserve al escalar.

## Errores o dudas de la IA

- **E-01 — Transcripción de V-14:** durante la elaboración de este documento se anotó inicialmente `USD 0,00` como resultado del motor para las salidas del mes 1. No provenía del motor ni del recálculo; fue un error de transcripción. Se corrigió a `USD 26.600,00` antes del commit y no afectó cálculos ni código.
- No se ha identificado un error matemático en las validaciones de esta etapa. La extracción automática de texto del PDF incluido no está disponible en este entorno; por ello, las referencias se contrastaron contra los datos transcritos por el usuario y los valores del repositorio. Antes de la entrega final se debe confirmar la paginación exacta contra el PDF.

## Estado de requisitos de la etapa

- Fórmulas fundamentales: validadas.
- Escenario base de USD 10.000: validado.
- Doble verificación: completada y coincidente.
- Implementación de Google Sheets, dashboard y simulador: pendiente de autorización explícita para la siguiente etapa.
