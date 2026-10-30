/**
 * Formateador de moneda en USD
 */
export function formatCurrency(
  value: number | null | undefined,
  decimals: number = 0,
  fallback: string = 'N/A'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formateador de porcentajes (ej: 0.14 -> 14.0%)
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 1,
  fallback: string = 'N/A'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Formateador de números decimales con separador de miles
 */
export function formatNumber(
  value: number | null | undefined,
  decimals: number = 0,
  fallback: string = '0'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formateador de ratios (ej: 2.4x)
 */
export function formatRatio(
  value: number | null | undefined,
  decimals: number = 2,
  fallback: string = 'N/A'
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  return `${value.toFixed(decimals)}x`;
}
