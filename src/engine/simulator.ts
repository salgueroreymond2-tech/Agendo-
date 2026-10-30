import { ModelAssumptions } from '../data/defaultAssumptions';
import { interpolateTrials } from './interpolation';
import { calculateSalespeople, calculateSalesSalary, calculateSalesCommission } from './acquisition';
import { calculateMonthlyContribution, calculateAnnualContribution } from './unitEconomics';
import { AnnualCohortTracker } from './cohorts';
import { MonthlySimulationRow, SimulationSummary } from './cashFlow';

/**
 * Motor central de simulación de caja a 24 meses
 * Soporta presupuestos fijos y curvas de inversión variable mes a mes
 */
export function simulateCashFlow(
  assumptions: ModelAssumptions,
  monthlyBudgets?: number[]
): SimulationSummary {
  const monthsCount = assumptions.simulationMonths || 24;
  const monthlyContribution = calculateMonthlyContribution(
    assumptions.monthlyPrice,
    assumptions.grossMargin
  );
  const annualContribution = calculateAnnualContribution(
    assumptions.annualPrice,
    assumptions.grossMargin
  );

  const cohortTracker = new AnnualCohortTracker(
    annualContribution,
    assumptions.annualRenewalRate
  );

  const rows: MonthlySimulationRow[] = [];

  let currentCash = assumptions.initialCash;
  let currentMonthlyActive = assumptions.initialActiveCustomers;
  let minCash = currentCash;
  let monthOfMinCash = 0;
  let firstBreachMonth: number | null = null;
  let firstBankruptcyMonth: number | null = null;

  let totalAdInvestment = 0;
  let totalAcquisitionCost = 0;
  let totalRevenueContribution = 0;
  let totalNewCustomersAcquired = 0;

  // Fila Mes 0 (Estado Inicial)
  rows.push({
    month: 0,
    adInvestment: 0,
    trials: 0,
    salespeople: 0,
    salesSalary: 0,
    salesCommission: 0,
    newPaidCustomers: 0,
    newOrganicCustomers: 0,
    totalNewCustomers: 0,
    newMonthlyCustomers: 0,
    newAnnualCustomers: 0,
    renewingAnnualCustomers: 0,
    churnedMonthlyCustomers: 0,
    activeMonthlyCustomers: currentMonthlyActive,
    activeAnnualCustomers: 0,
    totalActiveCustomers: currentMonthlyActive,
    monthlyMarginCashIn: 0,
    annualMarginCashIn: 0,
    totalCashIn: 0,
    adCost: 0,
    fixedCosts: 0,
    totalCashOut: 0,
    netCashFlow: 0,
    beginningCash: currentCash,
    endingCash: currentCash,
    isLiquidityBreached: false,
    isBankrupt: false,
  });

  for (let m = 1; m <= monthsCount; m++) {
    const budget =
      monthlyBudgets && monthlyBudgets.length >= m
        ? monthlyBudgets[m - 1]
        : assumptions.adInvestment;

    const trials = interpolateTrials(budget);
    const newPaid = trials * assumptions.trialConversionRate;
    const newOrganic = assumptions.organicCustomersMonthly;
    const totalNew = newPaid + newOrganic;

    const newAnnual = totalNew * assumptions.annualPlanShare;
    const newMonthly = totalNew * (1 - assumptions.annualPlanShare);

    const salespeople = calculateSalespeople(trials, assumptions.salespersonCapacity);
    const salesSalary = calculateSalesSalary(salespeople, assumptions.salespersonSalary);
    const salesCommission = calculateSalesCommission(
      newPaid,
      assumptions.commissionPerPaidCustomer
    );

    // Registrar nueva cohorte anual si aplica
    if (newAnnual > 0) {
      cohortTracker.addCohort(m, newAnnual);
    }
    const annualSummary = cohortTracker.getMonthSummary(m);

    // Calcular retención mensual: clientes activos mes anterior menos churn + nuevos mensuales
    const prevActiveMonthly = currentMonthlyActive;
    const churnedMonthly = prevActiveMonthly * assumptions.monthlyChurn;
    currentMonthlyActive = prevActiveMonthly - churnedMonthly + newMonthly;

    const activeAnnual = annualSummary.activeAnnualCustomers;
    const totalActive = currentMonthlyActive + activeAnnual;

    const monthlyMarginCashIn = currentMonthlyActive * monthlyContribution;
    const annualMarginCashIn = annualSummary.annualCashIn;
    const totalCashIn = monthlyMarginCashIn + annualMarginCashIn;

    const fixedCosts = assumptions.fixedCosts;
    const totalCashOut = budget + salesSalary + salesCommission + fixedCosts;
    const netCashFlow = totalCashIn - totalCashOut;

    const beginningCash = currentCash;
    currentCash = beginningCash + netCashFlow;

    if (currentCash < minCash) {
      minCash = currentCash;
      monthOfMinCash = m;
    }

    const isLiquidityBreached = currentCash < assumptions.cashFloor;
    const isBankrupt = currentCash <= 0;

    if (isLiquidityBreached && firstBreachMonth === null) {
      firstBreachMonth = m;
    }
    if (isBankrupt && firstBankruptcyMonth === null) {
      firstBankruptcyMonth = m;
    }

    totalAdInvestment += budget;
    totalAcquisitionCost += budget + salesSalary + salesCommission;
    totalRevenueContribution += totalCashIn;
    totalNewCustomersAcquired += totalNew;

    rows.push({
      month: m,
      adInvestment: budget,
      trials,
      salespeople,
      salesSalary,
      salesCommission,
      newPaidCustomers: newPaid,
      newOrganicCustomers: newOrganic,
      totalNewCustomers: totalNew,
      newMonthlyCustomers: newMonthly,
      newAnnualCustomers: newAnnual,
      renewingAnnualCustomers: annualSummary.renewingAnnualCustomers,
      churnedMonthlyCustomers: churnedMonthly,
      activeMonthlyCustomers: currentMonthlyActive,
      activeAnnualCustomers: activeAnnual,
      totalActiveCustomers: totalActive,
      monthlyMarginCashIn,
      annualMarginCashIn,
      totalCashIn,
      adCost: budget,
      fixedCosts,
      totalCashOut,
      netCashFlow,
      beginningCash,
      endingCash: currentCash,
      isLiquidityBreached,
      isBankrupt,
    });
  }

  const finalRow = rows[rows.length - 1];

  return {
    startingCash: assumptions.initialCash,
    cashFloor: assumptions.cashFloor,
    minCash,
    monthOfMinCash,
    firstBreachMonth,
    firstBankruptcyMonth,
    finalCash: finalRow ? finalRow.endingCash : currentCash,
    finalActiveCustomers: finalRow ? finalRow.totalActiveCustomers : currentMonthlyActive,
    totalAdInvestment,
    totalAcquisitionCost,
    totalRevenueContribution,
    totalNewCustomersAcquired,
    isViable: minCash >= assumptions.cashFloor,
    rows,
  };
}
