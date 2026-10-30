import { describe, it, expect } from 'vitest';
import {
  calculateLTV24Iterative,
  calculateLTV24ClosedForm,
  calculateLTVInfinite,
  calculateLTVMetrics,
} from '../src/engine/ltv';
import { calculateMonthlyContribution } from '../src/engine/unitEconomics';

describe('Unit Economics y LTV', () => {
  const price = 25;
  const margin = 0.78;
  const churn = 0.06;
  const monthlyContribution = calculateMonthlyContribution(price, margin); // $19.50

  it('Verifica el margen unitario mensual ($19.50)', () => {
    expect(monthlyContribution).toBe(19.50);
  });

  it('Verifica concordancia entre el cálculo iterativo y la fórmula cerrada de LTV a 24 meses', () => {
    const ltvIterative = calculateLTV24Iterative(monthlyContribution, churn, 24);
    const ltvClosed = calculateLTV24ClosedForm(monthlyContribution, churn, 24);

    // Sumatoria de (1 - 0.06)^(m-1) para m=1..24 = (1 - 0.94^24) / 0.06 = 12.891666...
    // LTV24 = 19.50 * 12.891666 = 251.3875...
    expect(ltvIterative).toBeCloseTo(251.39, 2);
    expect(ltvClosed).toBeCloseTo(ltvIterative, 4);
  });

  it('Verifica LTV infinito (perpetuo)', () => {
    const ltvInf = calculateLTVInfinite(monthlyContribution, churn);
    // 19.50 / 0.06 = 325.00
    expect(ltvInf).toBe(325.00);
  });

  it('Verifica los ratios LTV:CAC en el escenario base', () => {
    const cacPaid = 180;
    const cacBlended = 105;

    const metrics = calculateLTVMetrics(monthlyContribution, churn, cacPaid, cacBlended, 24);

    // LTV:CAC Paid = 251.3875 / 180 = 1.3966 -> ~1.40
    expect(metrics.ltvCacPaid).toBeCloseTo(1.40, 2);

    // LTV:CAC Blended = 251.3875 / 105 = 2.3941 -> ~2.39 (aprox 2.4 de la lámina de Valeria)
    expect(metrics.ltvCacBlended).toBeCloseTo(2.39, 2);

    // Salud financiera
    expect(metrics.paidHealth.status).toBe('high_risk'); // 1.40x está en riesgo alto
  });
});
