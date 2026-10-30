import { ModelAssumptions } from '../data/defaultAssumptions';
import { calculateAcquisitionMetrics } from '../engine/acquisition';
import { calculateUnitEconomics } from '../engine/unitEconomics';
import { calculateLTVMetrics } from '../engine/ltv';
import { calculateMonthlyCustomerCashCurve } from '../engine/payback';
import { simulateCashFlow } from '../engine/simulator';
import { generateAdvisorAnalysis } from '../engine/advisor';
import { renderKPICard } from '../components/KPI';
import { renderControlsPanel } from '../components/Controls';
import { renderCashFlowChart, renderLTVvsCACBarChart } from '../components/Charts';
import { formatCurrency, formatNumber, formatPercent, formatRatio } from '../utils/formatters';

export function renderDashboardPage(assumptions: ModelAssumptions): string {
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const ue = calculateUnitEconomics(assumptions);
  const ltv = calculateLTVMetrics(
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    acq.cacPaid,
    acq.cacBlended,
    assumptions.simulationMonths
  );
  const paybackCurve = calculateMonthlyCustomerCashCurve(
    acq.cacPaid || 180,
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    assumptions.simulationMonths
  );
  const sim = simulateCashFlow(assumptions);
  const advisor = generateAdvisorAnalysis(assumptions);

  const recomClass =
    advisor.recommendation === 'ESCALAR'
      ? 'recom-escalar'
      : advisor.recommendation === 'PAUSAR'
      ? 'recom-pausar'
      : 'recom-optimizar';

  const paybackText =
    paybackCurve.exactPaybackMonth !== null
      ? `${paybackCurve.exactPaybackMonth.toFixed(1)} meses`
      : '> 24 meses';

  return `
    <div class="dashboard-page">
      <!-- Banner de Recomendación Ejecutiva -->
      <div class="recommendation-banner ${recomClass}">
        <div class="recom-badge-large">${advisor.recommendation}</div>
        <div class="recom-content">
          <div class="recom-title">${advisor.recommendationSubtitle}</div>
          <div class="recom-desc">${advisor.recommendationExplanation}</div>
        </div>
      </div>

      <!-- Palancas Rápidas -->
      ${renderControlsPanel(assumptions, false)}

      <!-- Cuadrícula de KPIs Ejecutivos -->
      <div class="kpi-grid">
        ${renderKPICard({
          label: 'Caja Disponible Actual',
          value: formatCurrency(assumptions.initialCash),
          subtext: `Piso innegociable: ${formatCurrency(assumptions.cashFloor)}`,
          pillText: sim.minCash >= assumptions.cashFloor ? 'Caja Segura' : 'Alerta Riesgo',
          pillClass: sim.minCash >= assumptions.cashFloor ? 'badge-success' : 'badge-danger',
          tooltip: 'Saldo en banco al inicio de la simulación. El piso de $10.000 no puede ser vulnerado.',
        })}

        ${renderKPICard({
          label: 'Clientes Activos Actuales',
          value: formatNumber(assumptions.initialActiveCustomers),
          subtext: `Proyectados M24: ${formatNumber(sim.finalActiveCustomers)}`,
          pillText: `${sim.finalActiveCustomers >= assumptions.initialActiveCustomers ? '▲ Creciendo' : '▼ Decreciendo'}`,
          pillClass: sim.finalActiveCustomers >= assumptions.initialActiveCustomers ? 'badge-success' : 'badge-danger',
          tooltip: 'Base de clientes inicial (1.150) y total de clientes proyectados al mes 24.',
        })}

        ${renderKPICard({
          label: 'Inversión Publicitaria',
          value: formatCurrency(assumptions.adInvestment),
          subtext: `${formatNumber(acq.trials, 0)} trials (${acq.salespeople} vendedora)`,
          pillText: assumptions.adInvestment === 10000 ? 'Base $10k' : assumptions.adInvestment === 30000 ? 'Valeria $30k' : 'Personalizado',
          pillClass: 'badge-primary',
          tooltip: 'Presupuesto mensual en anuncios y cantidad de trials generados por interpolación lineal.',
        })}

        ${renderKPICard({
          label: 'Clientes Nuevos / Mes',
          value: formatNumber(acq.totalNewCustomers, 1),
          subtext: `${formatNumber(acq.paidCustomers, 1)} ads + ${acq.organicCustomers} orgánicos`,
          pillText: `Conv: ${formatPercent(assumptions.trialConversionRate)}`,
          pillClass: 'badge-emerald',
          tooltip: 'Suma de clientes que convierten desde la prueba gratis (14%) más 50 clientes orgánicos mensuales.',
        })}

        ${renderKPICard({
          label: 'CAC Paid (Real Anuncios)',
          value: formatCurrency(acq.cacPaid, 2),
          subtext: 'Incluye ads + vendedora + comisiones',
          pillText: 'Métrica Real',
          pillClass: 'badge-warning',
          tooltip: 'Costo total de adquisición dividido exclusivamente entre los clientes traídos por anuncios.',
        })}

        ${renderKPICard({
          label: 'CAC Blended (Con Orgánicos)',
          value: formatCurrency(acq.cacBlended, 2),
          subtext: 'Lámina de Valeria ($105)',
          pillText: 'Ojo: Mezcla Orgánicos',
          pillClass: 'badge-caution',
          tooltip: 'Costo total dividido entre todos los clientes nuevos. Puede engañar si se confunde con el costo de comprar clientes.',
        })}

        ${renderKPICard({
          label: 'LTV a 24 Meses (Margen)',
          value: formatCurrency(ltv.ltv24, 2),
          subtext: `Retención media: ${ltv.expectedRetentionMonths24.toFixed(1)} meses`,
          pillText: `Margen: ${formatCurrency(ue.monthlyContribution, 2)}/m`,
          pillClass: 'badge-primary',
          tooltip: 'Margen acumulado esperado por cliente en 24 meses considerando el 6% de churn mensual.',
        })}

        ${renderKPICard({
          label: 'LTV : CAC Paid (Real)',
          value: formatRatio(ltv.ltvCacPaid),
          subtext: ltv.paidHealth.label,
          pillText: ltv.paidHealth.status.toUpperCase(),
          pillClass: ltv.paidHealth.badgeClass,
          tooltip: 'Relación real entre el margen generado en 24 meses y el costo real de comprar cada cliente.',
        })}

        ${renderKPICard({
          label: 'Payback Cliente Mensual',
          value: paybackText,
          subtext: 'Meses para recuperar el CAC',
          pillText: paybackCurve.exactPaybackMonth && paybackCurve.exactPaybackMonth <= 12 ? 'Rápido' : 'Lento (>12m)',
          pillClass: paybackCurve.exactPaybackMonth && paybackCurve.exactPaybackMonth <= 12 ? 'badge-success' : 'badge-caution',
          tooltip: 'Tiempo transcurrido hasta que el margen acumulado cubre exactamente el costo de adquisición.',
        })}

        ${renderKPICard({
          label: 'Caja al Mes 24',
          value: formatCurrency(sim.finalCash),
          subtext: `Mínima: ${formatCurrency(sim.minCash)} (Mes ${sim.monthOfMinCash})`,
          pillText: sim.isViable ? 'Viable' : 'Insolvente',
          pillClass: sim.isViable ? 'badge-success' : 'badge-danger',
          tooltip: 'Saldo de caja proyectado al final del horizonte de 24 meses.',
        })}
      </div>

      <!-- Gráficos Principales -->
      <div class="dashboard-grid-2">
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">📈 Pista de Caja a 24 Meses (Runway)</h3>
              <p class="card-subtitle">Evolución del saldo en banco mes a mes frente al piso crítico de $10.000.</p>
            </div>
          </div>
          <div class="chart-box">
            <canvas id="dashboard-cash-chart"></canvas>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">⚖️ LTV vs CAC: La Verdad del Caso</h3>
              <p class="card-subtitle">Comparación de CAC Paid real ($180) vs CAC Blended ($105) frente al LTV24.</p>
            </div>
          </div>
          <div class="chart-box">
            <canvas id="dashboard-ltv-chart"></canvas>
          </div>
        </div>
      </div>

      <!-- Alerta Explicativa: La Trampa de Valeria -->
      <div class="card" style="border-left: 4px solid #b45309; background: linear-gradient(90deg, rgba(180, 83, 9, 0.06), transparent);">
        <div class="card-header" style="margin-bottom: 8px;">
          <h3 class="card-title" style="color: #b45309;">⚠️ Alerta para Ricardo: La Trampa de la Lámina Trimestral</h3>
        </div>
        <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.6;">
          Valeria presentó un <strong>CAC de $105</strong> y un ratio <strong>LTV:CAC de 2,4x</strong>, concluyendo que <em>«cada dólar en marketing vuelve 2,4 veces y hay que triplicar anuncios a $30.000»</em>. 
          <br/><br/>
          <strong>¿Dónde está el error de Valeria?</strong> 
          El costo de $105 es un <strong>CAC Blended</strong>: divide el costo total de captación ($12.600) entre 120 clientes totales. Pero 50 de esos clientes llegaron por vía orgánica (boca a boca) a costo cero. 
          El costo real por cada cliente de anuncios fue de <strong>$180</strong> ($12.600 / 70 clientes). Por lo tanto, el retorno real de los anuncios es de apenas <strong>1,40x</strong>. 
          Triplicar los anuncios a $30.000 generará un <strong>CAC Marginal de casi $400</strong> por cliente y consumirá los $60.000 de caja en los primeros meses.
        </p>
      </div>
    </div>
  `;
}

export function initDashboardCharts(assumptions: ModelAssumptions): void {
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const ue = calculateUnitEconomics(assumptions);
  const ltv = calculateLTVMetrics(
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    acq.cacPaid,
    acq.cacBlended,
    assumptions.simulationMonths
  );
  const sim = simulateCashFlow(assumptions);

  renderCashFlowChart('dashboard-cash-chart', sim.rows, assumptions.cashFloor);
  renderLTVvsCACBarChart(
    'dashboard-ltv-chart',
    acq.cacPaid || 180,
    acq.cacBlended || 105,
    ltv.ltv24
  );
}
