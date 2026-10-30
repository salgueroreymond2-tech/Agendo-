# AGENDO FINANCIAL INTELLIGENCE
### CFO Dashboard & Financial Growth Simulator · SaaS B2B

Plataforma de inteligencia financiera y simulación matemática para el caso empresarial **Agendo** (software SaaS de agenda y cobros para barberías y salones).

Desarrollada para responder de forma determinista y visual las preguntas clave del inversionista ángel **Ricardo Méndez** y la CEO **Valeria Ortiz**:
1. ¿Es rentable adquirir clientes mediante publicidad?
2. ¿Cuánto cuesta realmente adquirir un cliente (CAC Paid vs CAC Blended vs CAC Marginal)?
3. ¿Cuánto dinero genera cada cliente en 24 meses (LTV a 24 meses vs LTV Infinito)?
4. ¿Cuándo se recupera la inversión de adquisición (Payback y Curva J)?
5. ¿Qué sucede si se triplica la inversión en publicidad ($30.000/mes)?
6. ¿Cuántas vendedoras se necesitan según la capacidad de trials?
7. ¿Cuándo se agota la liquidez y en qué mes se vulnera el piso de caja ($10.000)?
8. ¿Cuál es el presupuesto publicitario óptimo que maximiza clientes activos al mes 24 sin romper el piso de caja?

---

## 🏛️ Arquitectura Modular del Sistema

El motor financiero está estrictamente desacoplado de la interfaz de usuario en funciones puras de TypeScript:

```text
agendo-financial-intelligence/
├── src/
│   ├── data/
│   │   ├── defaultAssumptions.ts    # Supuestos base del caso Agendo
│   │   └── historicalAds.ts         # Historial de pauta y canales de septiembre
│   ├── engine/
│   │   ├── interpolation.ts         # Interpolación lineal de inversión y trials
│   │   ├── acquisition.ts           # CAC Paid, CAC Blended, CAC Marginal y vendedoras
│   │   ├── unitEconomics.ts         # Márgenes unitarios mensuales y anuales
│   │   ├── ltv.ts                   # LTV24 (iterativo y cerrado), LTV infinito y semáforo
│   │   ├── payback.ts               # Curvas de caja J-Curve y breakeven de clientes
│   │   ├── cohorts.ts               # Cohortes anuales prepagadas y renovación en mes 13
│   │   ├── cashFlow.ts              # Tipos y resúmenes contables
│   │   ├── simulator.ts             # Simulación maestra de caja mes a mes (24 meses)
│   │   ├── optimizer.ts             # Solver de presupuesto fijo y bifásico
│   │   └── advisor.ts               # Inteligencia determinista del CFO y pitch
│   ├── components/
│   │   ├── Sidebar.ts               # Navegación y estructura de módulos
│   │   ├── Header.ts                # Barra superior con estado de caja y exportaciones
│   │   ├── KPI.ts                   # Tarjetas de indicadores financieros con tooltips
│   │   ├── Charts.ts                # Visualizaciones con Chart.js
│   │   └── Controls.ts              # Palancas interactivas en tiempo real
│   ├── pages/
│   │   ├── Dashboard.ts             # Executive Dashboard para Ricardo
│   │   ├── UnitEconomics.ts         # Desglose de unit economics y fórmulas
│   │   ├── Acquisition.ts           # Funnel, canales y rendimientos decrecientes
│   │   ├── PaybackPage.ts           # Curvas J mensual vs anual y devengo contable
│   │   ├── CashSimulator.ts         # Tabla interactiva de 24 meses y verificación mes 1
│   │   ├── Scenarios.ts             # Comparador de 4 escenarios lado a lado
│   │   ├── Strategy.ts              # Optimizador automático de presupuesto
│   │   ├── AdvisorPage.ts           # AI Financial Advisor y consultorio del CFO
│   │   └── CaseDataPage.ts          # Datos originales y desglose de costos fijos
│   ├── utils/
│   │   ├── formatters.ts            # Formateo monetario en USD, porcentajes y ratios
│   │   ├── storage.ts               # Persistencia local con localStorage y reseteo
│   │   └── exports.ts               # Exportación a CSV, JSON y reporte imprimible/PDF
│   ├── styles/
│   │   └── main.css                 # Diseño FinTech, temas oscuro/claro y print stylesheet
│   ├── main.ts
│   └── app.ts
├── tests/
│   ├── interpolation.test.ts        # Pruebas de interpolación lineal
│   ├── acquisition.test.ts          # Pruebas de capacidad comercial y CAC
│   ├── ltv.test.ts                  # Pruebas de LTV y verificación geométrica
│   ├── cashFlow.test.ts             # Validación manual exacta del Mes 1
│   └── simulator.test.ts            # Pruebas de cohortes anuales y continuidad contable
├── index.html
├── package.json
└── vite.config.ts
```

---

## ⚡ Comandos de Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo local
```bash
npm run dev
```
La aplicación abrirá en: **`http://localhost:5173/`**

### 3. Ejecutar pruebas unitarias automatizadas
```bash
npm test
```
Ejecuta la suite completa de 14 pruebas con Vitest.

### 4. Compilar para producción
```bash
npm run build
```

---

## 🕵️‍♂️ La Trampa del Caso Identificada y Resuelta

### La Trampa del CAC Blended ($105 vs $180)
Valeria presentó en su lámina un **CAC de $105** y un **LTV:CAC de 2,4x**:
- $10.000 de ads generan 500 trials -> 70 clientes pagados (conversión 14%).
- 1 vendedora (Mariela): $1.200/mes.
- Comisiones: 70 * $20 = $1.400.
- Costo total de adquisición: $10.000 + $1.200 + $1.400 = **$12.600**.
- Valeria dividió $12.600 entre 120 clientes totales = **$105 (CAC Blended)**.
- **El error:** 50 de esos clientes llegaron gratis por boca a boca.
- **El CAC Paid real:** $12.600 / 70 = **$180,00**.
- **El ratio real:** $251,39 (LTV24) / $180 = **1,40x** (Zona de Riesgo Alto, lejos del 2,4x).

### La Trampa de la Agencia de Anuncios y Rendimientos Decrecientes
El freelancer prometió: *"Con $30.000 tendríamos 1.500 registros al mes"*.
- El historial demuestra rendimientos fuertemente decrecientes:
  - $0 = 0 trials
  - $5.000 = 290 trials
  - $10.000 = 500 trials
  - $15.000 = 650 trials
  - $20.000 = 760 trials
  - $30.000 = **900 trials** (NO 1.500).
- Con 900 trials se necesitan **2 vendedoras** ($2.400) y se pagan $2.520 en comisiones.
- Costo total a $30k: **$34.920**.
- **CAC Marginal al triplicar:** ($34.920 - $12.600) / (126 - 70) = **$398,57 por cliente adicional**.
- Como el cliente solo deja $251,39 en 24 meses, **cada cliente extra destruye -$147,18 de valor neto**.

### La Quiebra de Liquidez
- Con $30.000 de inversión fija, Agendo genera un déficit de -$25.384 en el Mes 1.
- La caja de $60.000 **vulnera el piso de $10.000 en el Mes 3** y entra en **quiebra total en el Mes 4**.

---

## 🎯 Solución Estratégica Recomendada

El simulador y el motor de optimización determinan que la estrategia óptima para Agendo es **OPTIMIZAR**:
1. **Activar el Plan Anual al 20%:** Prepago de $240 con $187,20 de margen neto. Payback inmediato (Mes 0) y entrada de liquidez anticipada.
2. **Mejorar onboarding para subir conversión al 16%:** Reduce el CAC Paid a $157.
3. **Reducir Churn mensual al 4,5%:** Eleva la retención esperada y el LTV24 a $292.
4. **Subir precio mensual a $29:** Sigue siendo competitivo frente a CitaYa ($35).
5. **Inversión publicitaria controlada de $12.500:** Maximiza clientes activos sin poner en riesgo el piso de seguridad de $10.000.

---

## 📊 Verificación Manual del Mes 1 ($10.000 Fijos)

| Métrica | Valor Manual Teórico | Valor en Motor Agendo | Estado |
|---|---|---|---|
| Trials de anuncios | 500 | 500,0 | ✅ Exacto |
| Vendedoras requeridas | 1 | 1 | ✅ Exacto |
| Clientes pagados de ads | 70 | 70,0 | ✅ Exacto |
| Clientes orgánicos | 50 | 50 | ✅ Exacto |
| Clientes nuevos totales | 120 | 120,0 | ✅ Exacto |
| Clientes activos mes 1 | 1.201 | 1.201,0 | ✅ Exacto |
| Entradas por margen | $23.419,50 | $23.419,50 | ✅ Exacto |
| Salidas totales | $26.600,00 | $26.600,00 | ✅ Exacto |
| Caja final Mes 1 | $56.819,50 | $56.819,50 | ✅ Exacto |
