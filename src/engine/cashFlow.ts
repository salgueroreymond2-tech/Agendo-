export interface MonthlySimulationRow {
  month: number;
  adInvestment: number;
  trials: number;
  salespeople: number;
  salesSalary: number;
  salesCommission: number;
  newPaidCustomers: number;
  newOrganicCustomers: number;
  totalNewCustomers: number;
  newMonthlyCustomers: number;
  newAnnualCustomers: number;
  renewingAnnualCustomers: number;
  churnedMonthlyCustomers: number;
  activeMonthlyCustomers: number;
  activeAnnualCustomers: number;
  totalActiveCustomers: number;
  monthlyMarginCashIn: number;
  annualMarginCashIn: number;
  totalCashIn: number;
  adCost: number;
  fixedCosts: number;
  totalCashOut: number;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  isLiquidityBreached: boolean; // endingCash < 10000
  isBankrupt: boolean; // endingCash <= 0
}

export interface SimulationSummary {
  startingCash: number;
  cashFloor: number;
  minCash: number;
  monthOfMinCash: number;
  firstBreachMonth: number | null;
  firstBankruptcyMonth: number | null;
  finalCash: number;
  finalActiveCustomers: number;
  totalAdInvestment: number;
  totalAcquisitionCost: number;
  totalRevenueContribution: number;
  totalNewCustomersAcquired: number;
  isViable: boolean;
  rows: MonthlySimulationRow[];
}
