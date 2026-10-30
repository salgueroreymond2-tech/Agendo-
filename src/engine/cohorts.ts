export interface AnnualCohort {
  birthMonth: number;
  initialSize: number;
  renewedSize: number;
  churnedSize: number;
  renewalMonth: number; // birthMonth + 12
}

export interface AnnualMonthSummary {
  month: number;
  newAnnualCustomers: number;
  renewingAnnualCustomers: number;
  churnedAnnualCustomers: number;
  activeAnnualCustomers: number;
  annualCashIn: number;
}

export class AnnualCohortTracker {
  private cohorts: AnnualCohort[] = [];
  private annualContribution: number;
  private renewalRate: number;

  constructor(annualContribution: number, renewalRate: number = 0.70) {
    this.annualContribution = annualContribution;
    this.renewalRate = renewalRate;
  }

  /**
   * Registra una nueva cohorte anual adquirida en un mes específico
   */
  public addCohort(birthMonth: number, size: number): void {
    const renewedSize = size * this.renewalRate;
    const churnedSize = size * (1 - this.renewalRate);
    this.cohorts.push({
      birthMonth,
      initialSize: size,
      renewedSize,
      churnedSize,
      renewalMonth: birthMonth + 12,
    });
  }

  /**
   * Obtiene las métricas de clientes anuales y flujo de caja para un mes t (1 a 24)
   */
  public getMonthSummary(currentMonth: number): AnnualMonthSummary {
    let activeAnnualCustomers = 0;
    let newAnnualCustomers = 0;
    let renewingAnnualCustomers = 0;
    let churnedAnnualCustomers = 0;

    for (const cohort of this.cohorts) {
      if (cohort.birthMonth === currentMonth) {
        newAnnualCustomers += cohort.initialSize;
      }

      if (cohort.renewalMonth === currentMonth) {
        renewingAnnualCustomers += cohort.renewedSize;
        churnedAnnualCustomers += cohort.churnedSize;
      }

      // Determinar si la cohorte está activa en currentMonth
      const ageInMonths = currentMonth - cohort.birthMonth;
      if (ageInMonths >= 0 && ageInMonths < 12) {
        // En su primer año de vigencia
        activeAnnualCustomers += cohort.initialSize;
      } else if (ageInMonths >= 12 && ageInMonths < 24) {
        // En su segundo año (solo los que renovaron en birthMonth + 12)
        activeAnnualCustomers += cohort.renewedSize;
      }
    }

    const annualCashIn = (newAnnualCustomers + renewingAnnualCustomers) * this.annualContribution;

    return {
      month: currentMonth,
      newAnnualCustomers,
      renewingAnnualCustomers,
      churnedAnnualCustomers,
      activeAnnualCustomers,
      annualCashIn,
    };
  }

  public reset(): void {
    this.cohorts = [];
  }
}
