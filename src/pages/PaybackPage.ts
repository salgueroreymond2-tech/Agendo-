import { ModelAssumptions } from '../data/defaultAssumptions';
import { calculateAcquisitionMetrics } from '../engine/acquisition';
import { calculateUnitEconomics } from '../engine/unitEconomics';
import {
  calculateMonthlyCustomerCashCurve,
  calculateAnnualCustomerCashCurve,
  calculateWeightedCustomerCashCurve,
} from '../engine/payback';
import { renderKPICard } from '../components/KPI';
import { renderControlsPanel } from '../components/Controls';
import { renderPaybackChart } from '../components/Charts';
import { formatCurrency, formatPercent } from '../utils/formatters';

export function renderPaybackPage(assumptions: ModelAssumptions): string {
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const ue = calculateUnitEconomics(assumptions);
  const cac = acq.cacPaid || 180;

  const monthlyCurve = calculateMonthlyCustomerCashCurve(
    cac,
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    assumptions.simulationMonths
  );

  const annualCurve = calculateAnnualCustomerCashCurve(
    cac,
    ue.annualContribution,
    assumptions.annualRenewalRate,
    assumptions.simulationMonths
  );

  const hybridCurve = calculateWeightedCustomerCashCurve(
    monthlyCurve,
    annualCurve,
    assumptions.annualPlanShare
  );

  return `
    <div class="payback-page">
      ${renderControlsPanel(assumptions, false)}

      <!-- Resumen de Payback -->
      <div class="kpi-grid">
        ${renderKPICard({
          label: 'CAC del Cliente (Base)',
          value: formatCurrency(cac, 2),
          subtext: 'Inversión inicial por cliente (Mes 0)',
          pillText: 'Desembolso Mes 0',
          pillClass: 'badge-warning',
          tooltip: 'Costo de adquisición que la caja de Agendo debe financiar antes de que el cliente genere retorno.',
        })}

        ${renderKPICard({
          label: 'Payback Cliente Mensual',
          value: monthlyCurve.exactPaybackMonth !== null ? `${monthlyCurve.exactPaybackMonth.toFixed(1)} meses` : '> 24 meses',
          subtext: `Margen mensual: ${formatCurrency(ue.monthlyContribution, 2)}`,
          pillText: 'Recuperación Lenta',
          pillClass: 'badge-caution',
          tooltip: 'Número de meses necesarios para que la acumulación de margen mensual iguale el costo de adquisición.',
        })}

        ${renderKPICard({
          label: 'Payback Cliente Anual',
          value: '0 meses (Inmediato)',
          subtext: `Margen prepago: ${formatCurrency(ue.annualContribution, 2)}`,
          pillText: 'Autofinanciado',
          pillClass: 'badge-success',
          tooltip: 'Al pagar $240 por adelantado con margen de $187,20, el cliente cubre su propio CAC de $180 desde el primer día.',
        })}

        ${renderKPICard({
          label: 'Caja Neta Cliente Anual M12',
          value: formatCurrency(annualCurve.netCashAtMonth12, 2),
          subtext: 'Flujo neto tras amortizar el CAC',
          pillText: 'Superávit +$7,20',
          pillClass: 'badge-emerald',
          tooltip: 'El margen prepagado menos el CAC deja $7,20 netos en caja desde el mes de captación hasta el mes 12.',
        })}

        ${renderKPICard({
          label: 'Caja Neta Cliente Anual M24',
          value: formatCurrency(annualCurve.netCashAtMonth24, 2),
          subtext: 'Incluye 70% renovación en M13',
          pillText: 'Valor final',
          pillClass: 'badge-primary',
          tooltip: 'Margen inicial menos CAC más el margen de renovación esperado en el mes 13 ($131,04).',
        })}

        ${renderKPICard({
          label: 'Payback Propuesta Actual',
          value: hybridCurve.exactPaybackMonth !== null ? `${hybridCurve.exactPaybackMonth.toFixed(1)} meses` : '> 24 meses',
          subtext: `Con ${(assumptions.annualPlanShare * 100).toFixed(0)}% plan anual`,
          pillText: 'Mezcla Ponderada',
          pillClass: 'badge-primary',
          tooltip: 'Tiempo medio de recuperación combinando la proporción configurada de clientes mensuales y anuales.',
        })}
      </div>

      <!-- Gráfico de Curvas de Caja (J-Curve) -->
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">📉 Curvas de Recuperación de Caja del Cliente (J-Curve)</h3>
            <p class="card-subtitle">Evolución de la caja acumulada del cliente mes a mes frente a la línea de equilibrio ($0).</p>
          </div>
        </div>
        <div class="chart-box" style="height: 380px;">
          <canvas id="payback-curve-chart"></canvas>
        </div>
      </div>

      <!-- Aclaración Financiera Vital: Caja vs Devengo Contable -->
      <div class="card" style="border-left: 4px solid #1c4d2d; background: linear-gradient(90deg, rgba(28, 77, 45, 0.06), transparent); margin-bottom: 28px;">
        <div class="card-header" style="margin-bottom: 6px;">
          <h3 class="card-title" style="color: #1c4d2d;">💡 Concepto Contable Clave: Caja Recibida vs Ingreso Devengado</h3>
        </div>
        <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.6;">
          En el plan anual de $240, <strong>el 100% del efectivo ($240 cobrados con $187,20 de margen neto) entra al banco en el Mes 0</strong>. 
          Esto permite autofinanciar la adquisición de inmediato y blinda la liquidez de Agendo. 
          Sin embargo, contablemente bajo principios IFRS/US-GAAP, el ingreso se reconoce a razón de $20 al mes durante los 12 meses. 
          <strong>Para la supervivencia de la empresa lo que importa es la caja en el banco: los $187,20 están disponibles hoy para pagar nóminas y publicidad.</strong>
        </p>
      </div>

      <!-- Tabla Comparativa Mes a Mes -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📋 Tabla de Flujo Acumulado Mes a Mes por Tipo de Cliente</h3>
          <span style="font-size: 12px; color: var(--text-muted);">Comparación del Mes 0 al Mes 24</span>
        </div>
        <div class="table-container" style="max-height: 480px;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mes</th>
                <th>Prob. Retención Mensual</th>
                <th>Margen Mensual Unitario</th>
                <th>Caja Acum. Cliente Mensual</th>
                <th>Margen Anual Unitario</th>
                <th>Caja Acum. Cliente Anual</th>
                <th>Caja Acum. Propuesta Híbrida</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyCurve.points.map((pM, idx) => {
                const pA = annualCurve.points[idx];
                const pH = hybridCurve.points[idx];
                const isBreakevenM = pM.cumulativeCash >= 0 && (idx === 0 || monthlyCurve.points[idx - 1].cumulativeCash < 0);
                return `
                  <tr class="${isBreakevenM ? 'highlight-row' : ''}">
                    <td><strong>Mes ${pM.month}</strong></td>
                    <td>${formatPercent(pM.retentionProbability)}</td>
                    <td>${formatCurrency(pM.monthlyCash, 2)}</td>
                    <td style="font-weight: 700; color: ${pM.cumulativeCash >= 0 ? '#10b981' : '#ef4444'};">
                      ${formatCurrency(pM.cumulativeCash, 2)}
                    </td>
                    <td>${formatCurrency(pA.monthlyCash, 2)}</td>
                    <td style="font-weight: 700; color: ${pA.cumulativeCash >= 0 ? '#10b981' : '#ef4444'};">
                      ${formatCurrency(pA.cumulativeCash, 2)}
                    </td>
                    <td style="font-weight: 700; color: ${pH.cumulativeCash >= 0 ? '#10b981' : '#ef4444'};">
                      ${formatCurrency(pH.cumulativeCash, 2)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function initPaybackCharts(assumptions: ModelAssumptions): void {
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const ue = calculateUnitEconomics(assumptions);
  const cac = acq.cacPaid || 180;

  const monthlyCurve = calculateMonthlyCustomerCashCurve(
    cac,
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    assumptions.simulationMonths
  );
  const annualCurve = calculateAnnualCustomerCashCurve(
    cac,
    ue.annualContribution,
    assumptions.annualRenewalRate,
    assumptions.simulationMonths
  );
  const hybridCurve = calculateWeightedCustomerCashCurve(
    monthlyCurve,
    annualCurve,
    assumptions.annualPlanShare
  );

  renderPaybackChart('payback-curve-chart', monthlyCurve, annualCurve, hybridCurve);
}
