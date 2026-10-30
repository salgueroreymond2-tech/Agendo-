import { describe, it, expect } from 'vitest';
import { simulateCashFlow } from '../src/engine/simulator';
import { DEFAULT_ASSUMPTIONS, VALERIA_ASSUMPTIONS } from '../src/data/defaultAssumptions';

describe('Simulador de flujo de caja y validación manual del Mes 1', () => {
  it('Revisión manual obligatoria del Mes 1 en el plan de $10.000 fijos', () => {
    const sim = simulateCashFlow(DEFAULT_ASSUMPTIONS);
    const m1 = sim.rows[1];

    // Valores exactos estipulados en el caso Agendo
    expect(m1.month).toBe(1);
    expect(m1.adInvestment).toBe(10000);
    expect(m1.trials).toBe(500);
    expect(m1.salespeople).toBe(1);
    expect(m1.newPaidCustomers).toBe(70);
    expect(m1.newOrganicCustomers).toBe(50);
    expect(m1.totalNewCustomers).toBe(120);

    // Clientes activos esperados: 1.150 * 0.94 + 120 = 1.081 + 120 = 1.201
    expect(m1.activeMonthlyCustomers).toBe(1201);
    expect(m1.totalActiveCustomers).toBe(1201);

    // Entradas del mes: 1.201 * $19.50 = $23.419,50
    expect(m1.monthlyMarginCashIn).toBeCloseTo(23419.50, 2);
    expect(m1.totalCashIn).toBeCloseTo(23419.50, 2);

    // Salidas: $10.000 ads + $1.200 vendedora + $1.400 comisiones + $14.000 fijos = $26.600
    expect(m1.salesSalary).toBe(1200);
    expect(m1.salesCommission).toBe(1400);
    expect(m1.fixedCosts).toBe(14000);
    expect(m1.totalCashOut).toBe(26600);

    // Flujo neto: $23.419,50 - $26.600 = -$3.180,50
    expect(m1.netCashFlow).toBeCloseTo(-3180.50, 2);

    // Caja inicial: $60.000 -> Caja final Mes 1: $56.819,50
    expect(m1.beginningCash).toBe(60000);
    expect(m1.endingCash).toBeCloseTo(56819.50, 2);
  });

  it('Verifica detección de quiebra de liquidez en la propuesta de Valeria ($30.000 fijos)', () => {
    const simValeria = simulateCashFlow(VALERIA_ASSUMPTIONS);

    // Con $30k, la caja debe romper el piso de $10.000 muy rápidamente
    expect(simValeria.isViable).toBe(false);
    expect(simValeria.firstBreachMonth).not.toBeNull();
    expect(simValeria.firstBreachMonth).toBeLessThanOrEqual(4);
    expect(simValeria.firstBankruptcyMonth).not.toBeNull();
  });
});
