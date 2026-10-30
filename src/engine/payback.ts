export interface PaybackPoint {
  month: number;
  monthlyCash: number;
  cumulativeCash: number;
  retentionProbability: number;
}

export interface CustomerCashCurve {
  type: 'monthly' | 'annual' | 'hybrid';
  initialCAC: number;
  paybackMonth: number | null; // Entero del mes donde cruza 0
  exactPaybackMonth: number | null; // Con interpolación fraccional
  points: PaybackPoint[]; // Mes 0 al 24
  netCashAtMonth12: number;
  netCashAtMonth24: number;
}

/**
 * Calcula la curva de caja acumulada (J-Curve) para un cliente mensual
 */
export function calculateMonthlyCustomerCashCurve(
  cac: number,
  monthlyContribution: number,
  monthlyChurn: number,
  horizonMonths: number = 24
): CustomerCashCurve {
  const points: PaybackPoint[] = [];

  // Mes 0: Desembolso del CAC
  points.push({
    month: 0,
    monthlyCash: -cac,
    cumulativeCash: -cac,
    retentionProbability: 1.0,
  });

  let cumulative = -cac;
  let paybackMonth: number | null = null;
  let exactPaybackMonth: number | null = null;

  for (let m = 1; m <= horizonMonths; m++) {
    // La probabilidad de que el cliente siga activo en el mes m es (1 - churn)^(m - 1)
    const probActive = Math.pow(1 - monthlyChurn, m - 1);
    const expectedMargin = monthlyContribution * probActive;
    const prevCumulative = cumulative;
    cumulative += expectedMargin;

    if (paybackMonth === null && cumulative >= 0) {
      paybackMonth = m;
      if (cumulative - prevCumulative > 0) {
        const fraction = -prevCumulative / (cumulative - prevCumulative);
        exactPaybackMonth = m - 1 + Math.min(Math.max(fraction, 0), 1);
      } else {
        exactPaybackMonth = m;
      }
    }

    points.push({
      month: m,
      monthlyCash: expectedMargin,
      cumulativeCash: cumulative,
      retentionProbability: probActive,
    });
  }

  return {
    type: 'monthly',
    initialCAC: cac,
    paybackMonth,
    exactPaybackMonth,
    points,
    netCashAtMonth12: points[12] ? points[12].cumulativeCash : cumulative,
    netCashAtMonth24: points[horizonMonths] ? points[horizonMonths].cumulativeCash : cumulative,
  };
}

/**
 * Calcula la curva de caja acumulada para un cliente del plan anual
 * Reglas:
 * - Prepago $240 con 78% de margen ($187.20) recibido al inicio.
 * - Mes 0: Flujo neto = -CAC + margen anual.
 * - Meses 1 a 12: Cliente ya pagó, flujo adicional = 0.
 * - Mes 13: Renovación esperada 70% -> genera 70% * margen anual ($131.04).
 * - Meses 14 a 24: Flujo adicional = 0.
 */
export function calculateAnnualCustomerCashCurve(
  cac: number,
  annualContribution: number,
  renewalRate: number = 0.70,
  horizonMonths: number = 24
): CustomerCashCurve {
  const points: PaybackPoint[] = [];

  // Mes 0: entra el prepago completo menos el CAC
  const initialNetCash = annualContribution - cac;
  points.push({
    month: 0,
    monthlyCash: initialNetCash,
    cumulativeCash: initialNetCash,
    retentionProbability: 1.0,
  });

  let cumulative = initialNetCash;
  let paybackMonth: number | null = initialNetCash >= 0 ? 0 : null;
  let exactPaybackMonth: number | null = initialNetCash >= 0 ? 0 : null;

  for (let m = 1; m <= horizonMonths; m++) {
    let monthlyCash = 0;
    let probActive = 1.0;

    if (m <= 12) {
      monthlyCash = 0;
      probActive = 1.0;
    } else if (m === 13) {
      // Mes 13: renovación esperada
      monthlyCash = annualContribution * renewalRate;
      probActive = renewalRate;
    } else {
      // Mes 14 al 24: prepago ya realizado en mes 13
      monthlyCash = 0;
      probActive = renewalRate;
    }

    const prevCumulative = cumulative;
    cumulative += monthlyCash;

    if (paybackMonth === null && cumulative >= 0) {
      paybackMonth = m;
      if (cumulative - prevCumulative > 0) {
        const fraction = -prevCumulative / (cumulative - prevCumulative);
        exactPaybackMonth = m - 1 + Math.min(Math.max(fraction, 0), 1);
      } else {
        exactPaybackMonth = m;
      }
    }

    points.push({
      month: m,
      monthlyCash,
      cumulativeCash: cumulative,
      retentionProbability: probActive,
    });
  }

  return {
    type: 'annual',
    initialCAC: cac,
    paybackMonth,
    exactPaybackMonth,
    points,
    netCashAtMonth12: points[12] ? points[12].cumulativeCash : cumulative,
    netCashAtMonth24: points[horizonMonths] ? points[horizonMonths].cumulativeCash : cumulative,
  };
}

/**
 * Curva para un cliente promedio según la combinación ponderada de plan mensual y plan anual
 */
export function calculateWeightedCustomerCashCurve(
  monthlyCurve: CustomerCashCurve,
  annualCurve: CustomerCashCurve,
  annualShare: number
): CustomerCashCurve {
  const points: PaybackPoint[] = [];
  const monthlyShare = 1 - annualShare;
  const horizon = Math.min(monthlyCurve.points.length, annualCurve.points.length) - 1;

  let paybackMonth: number | null = null;
  let exactPaybackMonth: number | null = null;

  for (let m = 0; m <= horizon; m++) {
    const pM = monthlyCurve.points[m];
    const pA = annualCurve.points[m];

    const monthlyCash = pM.monthlyCash * monthlyShare + pA.monthlyCash * annualShare;
    const cumulativeCash = pM.cumulativeCash * monthlyShare + pA.cumulativeCash * annualShare;
    const retentionProbability =
      pM.retentionProbability * monthlyShare + pA.retentionProbability * annualShare;

    if (paybackMonth === null && cumulativeCash >= 0) {
      paybackMonth = m;
      if (m > 0 && points[m - 1]) {
        const prev = points[m - 1].cumulativeCash;
        if (cumulativeCash - prev > 0) {
          exactPaybackMonth = m - 1 + -prev / (cumulativeCash - prev);
        } else {
          exactPaybackMonth = m;
        }
      } else {
        exactPaybackMonth = 0;
      }
    }

    points.push({
      month: m,
      monthlyCash,
      cumulativeCash,
      retentionProbability,
    });
  }

  return {
    type: 'hybrid',
    initialCAC: monthlyCurve.initialCAC,
    paybackMonth,
    exactPaybackMonth,
    points,
    netCashAtMonth12: points[12] ? points[12].cumulativeCash : 0,
    netCashAtMonth24: points[horizon] ? points[horizon].cumulativeCash : 0,
  };
}
