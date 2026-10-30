import { ModelAssumptions } from '../data/defaultAssumptions';
import { simulateCashFlow } from './simulator';
import { SimulationSummary } from './cashFlow';

export interface OptimizationResult {
  mode: 'fixed' | 'variable';
  optimalBudget: number; // For fixed mode
  monthlyBudgets?: number[]; // For variable mode
  simulation: SimulationSummary;
  activeCustomersM24: number;
  minCash: number;
  monthOfMinCash: number;
  finalCash: number;
  totalAdInvestment: number;
  isViable: boolean;
  algorithmNotes: string;
  risks: string[];
}

/**
 * Optimiza un presupuesto publicitario constante mensual (entre $0 y $30.000)
 * Busca el valor más alto que maximice los clientes al mes 24 sin romper el piso de $10.000.
 */
export function optimizeFixedBudget(
  assumptions: ModelAssumptions,
  minBudget: number = 0,
  maxBudget: number = 30000,
  step: number = 250
): OptimizationResult {
  let bestBudget = 0;
  let bestSimulation: SimulationSummary | null = null;
  let maxActiveCustomers = -1;

  for (let b = minBudget; b <= maxBudget; b += step) {
    const sim = simulateCashFlow({ ...assumptions, adInvestment: b });
    if (sim.isViable) {
      if (sim.finalActiveCustomers > maxActiveCustomers) {
        maxActiveCustomers = sim.finalActiveCustomers;
        bestBudget = b;
        bestSimulation = sim;
      }
    }
  }

  // Si no se encontró ninguno viable con pasos, chequear $0
  if (!bestSimulation) {
    bestSimulation = simulateCashFlow({ ...assumptions, adInvestment: 0 });
    bestBudget = 0;
  }

  const risks: string[] = [];
  if (bestSimulation.minCash < assumptions.cashFloor + 5000) {
    risks.push(
      `Colchón de seguridad estrecho: la caja mínima cae a $${bestSimulation.minCash.toFixed(
        0
      )}, a menos de $5.000 del piso crítico.`
    );
  }
  if (bestBudget > 15000) {
    risks.push(
      'Rendimientos decrecientes: a partir de $15.000 de ads, el costo por trial aumenta y el CAC marginal supera los $300.'
    );
  }
  if (assumptions.monthlyChurn >= 0.06) {
    risks.push(
      'Arrastre por churn: al 6% mensual, se pierden más de 70 clientes al mes cuando la base supera 1.200 usuarios.'
    );
  }

  return {
    mode: 'fixed',
    optimalBudget: bestBudget,
    simulation: bestSimulation,
    activeCustomersM24: bestSimulation.finalActiveCustomers,
    minCash: bestSimulation.minCash,
    monthOfMinCash: bestSimulation.monthOfMinCash,
    finalCash: bestSimulation.finalCash,
    totalAdInvestment: bestSimulation.totalAdInvestment,
    isViable: bestSimulation.isViable,
    algorithmNotes: `Búsqueda exhaustiva por barrido de cuadrícula (Grid Search) en el intervalo [$${minBudget}, $${maxBudget}] con incrementos deterministas de $${step}. Evalúa ${
      Math.floor((maxBudget - minBudget) / step) + 1
    } escenarios completos de 24 meses verificando la restricción estricta min(Caja_t) >= $${
      assumptions.cashFloor
    }.`,
    risks,
  };
}

/**
 * Optimiza una estrategia de inversión variable en 2 fases:
 * Fase 1 (Meses 1 a 6): Inversión moderada para acumular caja y consolidar base.
 * Fase 2 (Meses 7 a 24): Aceleración cuando el flujo recurrente de la base genera suficiente margen operativo.
 */
export function optimizeVariableBudget(
  assumptions: ModelAssumptions
): OptimizationResult {
  let bestPhase1 = 0;
  let bestPhase2 = 0;
  let bestSimulation: SimulationSummary | null = null;
  let maxActiveCustomers = -1;

  // Exploramos combinaciones realistas de 2 fases
  const phase1Candidates = [5000, 7500, 10000, 12500, 15000];
  const phase2Candidates = [10000, 12500, 15000, 17500, 20000, 25000, 30000];

  for (const p1 of phase1Candidates) {
    for (const p2 of phase2Candidates) {
      const monthlyBudgets: number[] = [];
      for (let m = 1; m <= (assumptions.simulationMonths || 24); m++) {
        monthlyBudgets.push(m <= 6 ? p1 : p2);
      }

      const sim = simulateCashFlow(assumptions, monthlyBudgets);
      if (sim.isViable) {
        if (sim.finalActiveCustomers > maxActiveCustomers) {
          maxActiveCustomers = sim.finalActiveCustomers;
          bestPhase1 = p1;
          bestPhase2 = p2;
          bestSimulation = sim;
        }
      }
    }
  }

  if (!bestSimulation) {
    return optimizeFixedBudget(assumptions);
  }

  const optimalBudgets: number[] = [];
  for (let m = 1; m <= (assumptions.simulationMonths || 24); m++) {
    optimalBudgets.push(m <= 6 ? bestPhase1 : bestPhase2);
  }

  const risks: string[] = [
    `Dependencia de la aceleración en Mes 7: se incrementa la inversión a $${bestPhase2} confiando en que el churn se mantenga en ${(
      assumptions.monthlyChurn * 100
    ).toFixed(1)}%.`,
    `Capacidad comercial: en la Fase 2 con $${bestPhase2} se requieren más vendedoras si los trials superan los 500 mensuales.`,
  ];

  return {
    mode: 'variable',
    optimalBudget: bestPhase2,
    monthlyBudgets: optimalBudgets,
    simulation: bestSimulation,
    activeCustomersM24: bestSimulation.finalActiveCustomers,
    minCash: bestSimulation.minCash,
    monthOfMinCash: bestSimulation.monthOfMinCash,
    finalCash: bestSimulation.finalCash,
    totalAdInvestment: bestSimulation.totalAdInvestment,
    isViable: bestSimulation.isViable,
    algorithmNotes: `Estrategia bifásica (Biphase Capital Allocation): Fase de Conservación y Consolidación (Meses 1-6 con $${bestPhase1}/mes) seguida de Fase de Aceleración Autofinanciada (Meses 7-24 con $${bestPhase2}/mes). Permite que la base inicial genere flujo de caja neto antes de asumir mayor riesgo publicitario.`,
    risks,
  };
}
