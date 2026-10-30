import { ModelAssumptions } from '../data/defaultAssumptions';

export interface UnitEconomicsSummary {
  monthlyPrice: number;
  annualPrice: number;
  grossMargin: number;
  monthlyContribution: number;
  annualContribution: number;
  monthlyDirectCost: number;
  annualDirectCost: number;
}

/**
 * Margen de contribución mensual por cliente
 * monthlyContribution = monthlyPrice * grossMargin
 */
export function calculateMonthlyContribution(monthlyPrice: number, grossMargin: number): number {
  return monthlyPrice * grossMargin;
}

/**
 * Margen de contribución anual por cliente prepagado
 * annualContribution = annualPrice * grossMargin
 */
export function calculateAnnualContribution(annualPrice: number, grossMargin: number): number {
  return annualPrice * grossMargin;
}

/**
 * Calcula el resumen completo de unit economics
 */
export function calculateUnitEconomics(assumptions: ModelAssumptions): UnitEconomicsSummary {
  const monthlyContribution = calculateMonthlyContribution(
    assumptions.monthlyPrice,
    assumptions.grossMargin
  );
  const annualContribution = calculateAnnualContribution(
    assumptions.annualPrice,
    assumptions.grossMargin
  );

  return {
    monthlyPrice: assumptions.monthlyPrice,
    annualPrice: assumptions.annualPrice,
    grossMargin: assumptions.grossMargin,
    monthlyContribution,
    annualContribution,
    monthlyDirectCost: assumptions.monthlyPrice - monthlyContribution,
    annualDirectCost: assumptions.annualPrice - annualContribution,
  };
}
