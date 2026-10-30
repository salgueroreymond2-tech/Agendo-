import { describe, it, expect } from 'vitest';
import {
  calculateSalespeople,
  calculateAcquisitionMetrics,
  calculateMarginalCAC,
} from '../src/engine/acquisition';
import { DEFAULT_ASSUMPTIONS } from '../src/data/defaultAssumptions';

describe('Capacidad comercial y métricas de adquisición', () => {
  it('Verifica el dimensionamiento de vendedoras por bloques de capacidad (500)', () => {
    expect(calculateSalespeople(0, 500)).toBe(0);
    expect(calculateSalespeople(500, 500)).toBe(1);
    expect(calculateSalespeople(501, 500)).toBe(2);
    expect(calculateSalespeople(900, 500)).toBe(2);
    expect(calculateSalespeople(1000, 500)).toBe(2);
    expect(calculateSalespeople(1001, 500)).toBe(3);
  });

  it('Verifica unit economics de adquisición en el escenario base ($10.000)', () => {
    const acq = calculateAcquisitionMetrics(10000, DEFAULT_ASSUMPTIONS);

    expect(acq.trials).toBe(500);
    expect(acq.paidCustomers).toBe(70); // 500 * 14%
    expect(acq.organicCustomers).toBe(50);
    expect(acq.totalNewCustomers).toBe(120); // 70 + 50
    expect(acq.salespeople).toBe(1);
    expect(acq.salesSalary).toBe(1200);
    expect(acq.salesCommission).toBe(1400); // 70 * $20
    expect(acq.totalAcquisitionCost).toBe(12600); // 10000 + 1200 + 1400

    // CAC Paid = $12.600 / 70 = $180
    expect(acq.cacPaid).toBeCloseTo(180, 2);

    // CAC Blended = $12.600 / 120 = $105 (La cifra de la lámina de Valeria)
    expect(acq.cacBlended).toBeCloseTo(105, 2);
  });

  it('Verifica CAC marginal al pasar de $10.000 a $30.000', () => {
    const acq10k = calculateAcquisitionMetrics(10000, DEFAULT_ASSUMPTIONS);
    const acq30k = calculateAcquisitionMetrics(30000, DEFAULT_ASSUMPTIONS);

    // Con $30k: 900 trials -> 126 pagados -> 2 vendedoras ($2.400) -> comisiones $2.520
    // Costo total = $30.000 + $2.400 + $2.520 = $34.920
    expect(acq30k.trials).toBe(900);
    expect(acq30k.paidCustomers).toBeCloseTo(126, 4);
    expect(acq30k.salespeople).toBe(2);
    expect(acq30k.salesSalary).toBe(2400);
    expect(acq30k.salesCommission).toBeCloseTo(2520, 2);
    expect(acq30k.totalAcquisitionCost).toBeCloseTo(34920, 2);

    const marginalCAC = calculateMarginalCAC(acq10k, acq30k);
    // deltaCost = 34920 - 12600 = 22320
    // deltaPaid = 126 - 70 = 56
    // marginalCAC = 22320 / 56 = 398.5714...
    expect(marginalCAC).toBeCloseTo(398.57, 2);
  });
});
