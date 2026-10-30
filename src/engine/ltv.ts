export type HealthStatus = 'destructive' | 'high_risk' | 'tight' | 'healthy' | 'strong';

export interface HealthInterpretation {
  status: HealthStatus;
  label: string;
  badgeClass: string;
  color: string;
  description: string;
}

export interface LTVMetrics {
  monthlyContribution: number;
  monthlyChurn: number;
  ltv24: number;
  ltv24ClosedForm: number;
  ltvInfinite: number;
  expectedRetentionMonths24: number;
  expectedRetentionMonthsInfinite: number;
  ltvCacPaid: number | null;
  ltvCacBlended: number | null;
  paidHealth: HealthInterpretation;
  blendedHealth: HealthInterpretation;
}

/**
 * Calcula el LTV a 24 meses sobre margen sumando mes a mes
 * sum_{m=1}^{24} (1 - churn)^(m-1) * monthlyContribution
 */
export function calculateLTV24Iterative(
  monthlyContribution: number,
  monthlyChurn: number,
  months: number = 24
): number {
  if (monthlyChurn >= 1) return monthlyContribution;
  let total = 0;
  for (let m = 1; m <= months; m++) {
    total += Math.pow(1 - monthlyChurn, m - 1);
  }
  return monthlyContribution * total;
}

/**
 * Método independiente de verificación: Fórmula cerrada de serie geométrica
 * Sum = (1 - (1 - churn)^N) / churn
 */
export function calculateLTV24ClosedForm(
  monthlyContribution: number,
  monthlyChurn: number,
  months: number = 24
): number {
  if (monthlyChurn <= 0) return monthlyContribution * months;
  if (monthlyChurn >= 1) return monthlyContribution;
  const retentionFactor = 1 - monthlyChurn;
  const geometricSum = (1 - Math.pow(retentionFactor, months)) / monthlyChurn;
  return monthlyContribution * geometricSum;
}

/**
 * Calcula el LTV sin límite de tiempo (perpetuo)
 * ltvInfinite = monthlyContribution / monthlyChurn
 */
export function calculateLTVInfinite(
  monthlyContribution: number,
  monthlyChurn: number
): number {
  if (monthlyChurn <= 0) return Infinity;
  return monthlyContribution / monthlyChurn;
}

/**
 * Evalúa el semáforo financiero según el ratio LTV:CAC
 */
export function interpretLTVCAC(ratio: number | null): HealthInterpretation {
  if (ratio === null || isNaN(ratio)) {
    return {
      status: 'destructive',
      label: 'Sin datos',
      badgeClass: 'badge-gray',
      color: '#6b7280',
      description: 'No hay suficientes clientes pagados para calcular la relación LTV:CAC.',
    };
  }

  if (ratio < 1) {
    return {
      status: 'destructive',
      label: 'Destructivo (< 1x)',
      badgeClass: 'badge-danger',
      color: '#b91c1c',
      description:
        'Cada cliente adquirido destruye valor neto: el margen generado en 24 meses no cubre el costo de adquisición.',
    };
  }

  if (ratio < 2) {
    return {
      status: 'high_risk',
      label: 'Riesgo alto (1x - 2x)',
      badgeClass: 'badge-warning',
      color: '#c2410c',
      description:
        'Retorno muy frágil. La adquisición consume casi todo el margen del cliente, dejando poco margen para absorber costos fijos.',
    };
  }

  if (ratio < 3) {
    return {
      status: 'tight',
      label: 'Ajustado / Insuficiente (2x - 3x)',
      badgeClass: 'badge-caution',
      color: '#b45309',
      description:
        'Recuperación lenta. Permite operar pero limita la velocidad de reinversión y aumenta la vulnerabilidad ante variaciones de churn.',
    };
  }

  if (ratio < 4) {
    return {
      status: 'healthy',
      label: 'Saludable (3x - 4x)',
      badgeClass: 'badge-success',
      color: '#1b6338',
      description:
        'Zona de referencia para SaaS B2B. Equilibrio adecuado entre costo de adquisición y retorno de flujo operativo.',
    };
  }

  return {
    status: 'strong',
    label: 'Fuerte eficiencia (> 4x)',
    badgeClass: 'badge-emerald',
    color: '#0f5940',
    description:
      'Excelente eficiencia de captación. Cada dólar invertido genera un retorno sustancialmente superior al costo total de adquisición.',
  };
}

/**
 * Calcula todas las métricas de LTV y evalúa los ratios frente a CAC Paid y Blended
 */
export function calculateLTVMetrics(
  monthlyContribution: number,
  monthlyChurn: number,
  cacPaid: number | null,
  cacBlended: number | null,
  months: number = 24
): LTVMetrics {
  const ltv24 = calculateLTV24Iterative(monthlyContribution, monthlyChurn, months);
  const ltv24ClosedForm = calculateLTV24ClosedForm(monthlyContribution, monthlyChurn, months);
  const ltvInfinite = calculateLTVInfinite(monthlyContribution, monthlyChurn);

  const retentionSum = monthlyContribution > 0 ? ltv24 / monthlyContribution : 0;
  const expectedRetentionMonthsInfinite = monthlyChurn > 0 ? 1 / monthlyChurn : Infinity;

  const ltvCacPaid = cacPaid && cacPaid > 0 ? ltv24 / cacPaid : null;
  const ltvCacBlended = cacBlended && cacBlended > 0 ? ltv24 / cacBlended : null;

  return {
    monthlyContribution,
    monthlyChurn,
    ltv24,
    ltv24ClosedForm,
    ltvInfinite,
    expectedRetentionMonths24: retentionSum,
    expectedRetentionMonthsInfinite,
    ltvCacPaid,
    ltvCacBlended,
    paidHealth: interpretLTVCAC(ltvCacPaid),
    blendedHealth: interpretLTVCAC(ltvCacBlended),
  };
}
