import { ModelAssumptions } from '../data/defaultAssumptions';
import { interpolateTrials } from './interpolation';

export interface AcquisitionMetrics {
  adInvestment: number;
  trials: number;
  trialConversionRate: number;
  paidCustomers: number;
  organicCustomers: number;
  totalNewCustomers: number;
  salespeople: number;
  salesSalary: number;
  salesCommission: number;
  totalAcquisitionCost: number;
  cacPaid: number | null;
  cacBlended: number | null;
  costPerRegistration: number | null; // Ad cost per trial
}

/**
 * Calcula la cantidad de vendedoras necesarias según la capacidad
 * Regla: 0 trials -> 0 vendedoras. Para > 0 se redondea hacia arriba en bloques de 500.
 */
export function calculateSalespeople(trials: number, capacity: number = 500): number {
  if (trials <= 0) return 0;
  return Math.ceil(trials / capacity);
}

/**
 * Calcula el sueldo total del equipo comercial
 */
export function calculateSalesSalary(salespeople: number, salaryPerPerson: number = 1200): number {
  return salespeople * salaryPerPerson;
}

/**
 * Calcula comisiones comerciales. Solo aplica a clientes pagados que llegaron por anuncios.
 */
export function calculateSalesCommission(
  paidCustomers: number,
  commissionPerCustomer: number = 20
): number {
  return paidCustomers * commissionPerCustomer;
}

/**
 * Calcula clientes pagados provenientes de anuncios (conserva decimales para precisión)
 */
export function calculatePaidCustomers(trials: number, conversionRate: number): number {
  return trials * conversionRate;
}

/**
 * Calcula clientes nuevos totales (pagados + orgánicos)
 */
export function calculateTotalNewCustomers(paidCustomers: number, organicCustomers: number): number {
  return paidCustomers + organicCustomers;
}

/**
 * CAC Paid: Todo lo que cuesta conseguir clientes por anuncios dividido entre clientes de anuncios
 */
export function calculateCACPaid(
  totalAcquisitionCost: number,
  paidCustomers: number
): number | null {
  if (paidCustomers <= 0) return null;
  return totalAcquisitionCost / paidCustomers;
}

/**
 * CAC Blended: Mismos costos divididos entre todos los clientes nuevos (incluyendo orgánicos)
 */
export function calculateCACBlended(
  totalAcquisitionCost: number,
  totalNewCustomers: number
): number | null {
  if (totalNewCustomers <= 0) return null;
  return totalAcquisitionCost / totalNewCustomers;
}

/**
 * Ejecuta el cálculo completo de adquisición para un nivel de inversión dado y supuestos
 */
export function calculateAcquisitionMetrics(
  adInvestment: number,
  assumptions: ModelAssumptions
): AcquisitionMetrics {
  const trials = interpolateTrials(adInvestment);
  const paidCustomers = calculatePaidCustomers(trials, assumptions.trialConversionRate);
  const organicCustomers = assumptions.organicCustomersMonthly;
  const totalNewCustomers = calculateTotalNewCustomers(paidCustomers, organicCustomers);

  const salespeople = calculateSalespeople(trials, assumptions.salespersonCapacity);
  const salesSalary = calculateSalesSalary(salespeople, assumptions.salespersonSalary);
  const salesCommission = calculateSalesCommission(
    paidCustomers,
    assumptions.commissionPerPaidCustomer
  );

  const totalAcquisitionCost = adInvestment + salesSalary + salesCommission;
  const cacPaid = calculateCACPaid(totalAcquisitionCost, paidCustomers);
  const cacBlended = calculateCACBlended(totalAcquisitionCost, totalNewCustomers);
  const costPerRegistration = trials > 0 ? adInvestment / trials : null;

  return {
    adInvestment,
    trials,
    trialConversionRate: assumptions.trialConversionRate,
    paidCustomers,
    organicCustomers,
    totalNewCustomers,
    salespeople,
    salesSalary,
    salesCommission,
    totalAcquisitionCost,
    cacPaid,
    cacBlended,
    costPerRegistration,
  };
}

/**
 * CAC Marginal: Incremento de costo total entre dos escenarios dividido entre incremento de clientes pagados de anuncios
 */
export function calculateMarginalCAC(
  base: AcquisitionMetrics,
  comparison: AcquisitionMetrics
): number | null {
  const deltaCost = comparison.totalAcquisitionCost - base.totalAcquisitionCost;
  const deltaPaidCustomers = comparison.paidCustomers - base.paidCustomers;

  if (deltaPaidCustomers <= 0) {
    return null;
  }

  return deltaCost / deltaPaidCustomers;
}
