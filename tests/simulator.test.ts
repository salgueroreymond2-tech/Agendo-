import { describe, it, expect } from 'vitest';
import { simulateCashFlow } from '../src/engine/simulator';
import { AnnualCohortTracker } from '../src/engine/cohorts';
import { DEFAULT_ASSUMPTIONS } from '../src/data/defaultAssumptions';

describe('Seguimiento de cohortes anuales y consistencia de simulación', () => {
  it('Comprueba el comportamiento de cohortes anuales y renovación en mes 13', () => {
    const annualContribution = 187.20; // $240 * 0.78
    const tracker = new AnnualCohortTracker(annualContribution, 0.70);

    // Registramos 100 clientes anuales en el Mes 1
    tracker.addCohort(1, 100);

    // En el Mes 1: 100 nuevos clientes, $18.720 de margen inmediato
    const m1 = tracker.getMonthSummary(1);
    expect(m1.newAnnualCustomers).toBe(100);
    expect(m1.activeAnnualCustomers).toBe(100);
    expect(m1.annualCashIn).toBeCloseTo(18720, 2);

    // En el Mes 2: 0 nuevos, activos siguen siendo 100, pero cash in es 0 (no pagan mes a mes)
    const m2 = tracker.getMonthSummary(2);
    expect(m2.newAnnualCustomers).toBe(0);
    expect(m2.activeAnnualCustomers).toBe(100);
    expect(m2.annualCashIn).toBe(0);

    // En el Mes 12: siguen activos los 100
    const m12 = tracker.getMonthSummary(12);
    expect(m12.activeAnnualCustomers).toBe(100);
    expect(m12.annualCashIn).toBe(0);

    // En el Mes 13: renovación esperada del 70% (70 clientes renuevan, 30 churn)
    const m13 = tracker.getMonthSummary(13);
    expect(m13.renewingAnnualCustomers).toBeCloseTo(70, 4);
    expect(m13.churnedAnnualCustomers).toBeCloseTo(30, 4);
    expect(m13.activeAnnualCustomers).toBeCloseTo(70, 4);
    // Caja generada: 70 * $187.20 = $13.104
    expect(m13.annualCashIn).toBeCloseTo(13104, 2);
  });

  it('Verifica continuidad contable: Caja final = Caja inicial + Entradas - Salidas', () => {
    const sim = simulateCashFlow({
      ...DEFAULT_ASSUMPTIONS,
      annualPlanShare: 0.15, // Con clientes anuales activos
    });

    for (let i = 1; i <= 24; i++) {
      const row = sim.rows[i];
      const prevRow = sim.rows[i - 1];

      expect(row.beginningCash).toBe(prevRow.endingCash);
      expect(row.netCashFlow).toBeCloseTo(row.totalCashIn - row.totalCashOut, 4);
      expect(row.endingCash).toBeCloseTo(row.beginningCash + row.netCashFlow, 4);
    }
  });
});
