export interface FixedCostsBreakdown {
  ceoAndDevs: number;
  coworking: number;
  tools: number;
  legalAndAccounting: number;
  others: number;
}

export interface ModelAssumptions {
  // Clientes y Caja
  initialActiveCustomers: number;
  initialCash: number;
  cashFloor: number;
  
  // Costos Fijos
  fixedCosts: number;
  fixedCostsBreakdown: FixedCostsBreakdown;
  
  // Adquisición & Marketing
  adInvestment: number;
  trialConversionRate: number; // e.g., 0.14 = 14%
  organicCustomersMonthly: number;
  
  // Precios y Márgenes
  monthlyPrice: number;
  annualPrice: number;
  grossMargin: number; // e.g., 0.78 = 78%
  
  // Retención y Planes
  monthlyChurn: number; // e.g., 0.06 = 6%
  annualRenewalRate: number; // e.g., 0.70 = 70%
  annualPlanShare: number; // e.g., 0.10 = 10% (0.0 in base level 1, 0.10 when annual activated)
  
  // Fuerza Comercial
  salespersonSalary: number; // $1,200/mo
  salespersonCapacity: number; // 500 trials
  commissionPerPaidCustomer: number; // $20/paid customer
  
  // Horizonte
  simulationMonths: number; // 24
}

export const DEFAULT_ASSUMPTIONS: ModelAssumptions = {
  initialActiveCustomers: 1150,
  initialCash: 60000,
  cashFloor: 10000,
  
  fixedCosts: 14000,
  fixedCostsBreakdown: {
    ceoAndDevs: 11000,
    coworking: 900,
    tools: 600,
    legalAndAccounting: 500,
    others: 1000,
  },
  
  adInvestment: 10000,
  trialConversionRate: 0.14,
  organicCustomersMonthly: 50,
  
  monthlyPrice: 25,
  annualPrice: 240,
  grossMargin: 0.78,
  
  monthlyChurn: 0.06,
  annualRenewalRate: 0.70,
  annualPlanShare: 0.0, // Base level 1 assumption: 0% annual (all monthly)
  
  salespersonSalary: 1200,
  salespersonCapacity: 500,
  commissionPerPaidCustomer: 20,
  
  simulationMonths: 24,
};

export const VALERIA_ASSUMPTIONS: ModelAssumptions = {
  ...DEFAULT_ASSUMPTIONS,
  adInvestment: 30000,
};

export const OPTIMIZED_SUGGESTION_ASSUMPTIONS: ModelAssumptions = {
  ...DEFAULT_ASSUMPTIONS,
  adInvestment: 12500,
  trialConversionRate: 0.16, // +2% en conversión gracias a mejor onboarding
  monthlyChurn: 0.045, // -1.5% churn reteniendo con WhatsApp y cobro automático
  annualPlanShare: 0.20, // 20% en plan anual para inyección de liquidez inmediata
  monthlyPrice: 29, // Incremento moderado ($29/mes vs competidor $35)
};
