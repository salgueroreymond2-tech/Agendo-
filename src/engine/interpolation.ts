import { HISTORICAL_ADS, HistoricalAdPoint } from '../data/historicalAds';

/**
 * Realiza interpolación lineal entre los puntos históricos de inversión publicitaria y trials.
 * Reglas del caso:
 * - $0 produce 0 trials.
 * - $5.000 produce 290 trials.
 * - $10.000 produce 500 trials.
 * - $15.000 produce 650 trials.
 * - $20.000 produce 760 trials.
 * - $30.000 produce 900 trials.
 * - Rango permitido: [0, 30.000]. No se extrapola más allá de $30.000.
 */
export function interpolateTrials(
  investment: number,
  points: HistoricalAdPoint[] = HISTORICAL_ADS
): number {
  if (investment <= 0) {
    return 0;
  }

  // Ordenar puntos por inversión ascendente
  const sorted = [...points].sort((a, b) => a.investment - b.investment);

  // Si sobrepasa el punto máximo, limitar al máximo histórico
  const maxPoint = sorted[sorted.length - 1];
  if (investment >= maxPoint.investment) {
    return maxPoint.trials;
  }

  // Buscar segmento [p1, p2]
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];

    if (investment >= p1.investment && investment <= p2.investment) {
      if (p2.investment === p1.investment) {
        return p1.trials;
      }
      const fraction = (investment - p1.investment) / (p2.investment - p1.investment);
      return p1.trials + fraction * (p2.trials - p1.trials);
    }
  }

  return 0;
}

/**
 * Calcula la derivada / pendiente marginal de trials por cada $1 invertido en un punto dado
 */
export function getMarginalTrialsSlope(
  investment: number,
  points: HistoricalAdPoint[] = HISTORICAL_ADS
): number {
  const sorted = [...points].sort((a, b) => a.investment - b.investment);
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i + 1];
    if (investment >= p1.investment && investment <= p2.investment) {
      return (p2.trials - p1.trials) / (p2.investment - p1.investment);
    }
  }
  return 0;
}
