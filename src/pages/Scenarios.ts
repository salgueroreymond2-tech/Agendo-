import {
  ModelAssumptions,
  DEFAULT_ASSUMPTIONS,
  VALERIA_ASSUMPTIONS,
  OPTIMIZED_SUGGESTION_ASSUMPTIONS,
} from '../data/defaultAssumptions';
import { calculateAcquisitionMetrics } from '../engine/acquisition';
import { calculateUnitEconomics } from '../engine/unitEconomics';
import { calculateLTVMetrics } from '../engine/ltv';
import { calculateMonthlyCustomerCashCurve } from '../engine/payback';
import { simulateCashFlow } from '../engine/simulator';
import { renderControlsPanel } from '../components/Controls';
import { renderScenarioBarChart } from '../components/Charts';
import { formatCurrency, formatNumber, formatRatio } from '../utils/formatters';

export interface ScenarioDefinition {
  id: string;
  name: string;
  badge: string;
  badgeClass: string;
  description: string;
  assumptions: ModelAssumptions;
}

export function renderScenariosPage(currentAssumptions: ModelAssumptions): string {
  const scenarios: ScenarioDefinition[] = [
    {
      id: 'base',
      name: 'Escenario A: Situación Actual',
      badge: 'Base $10k',
      badgeClass: 'badge-primary',
      description: 'Inversión de $10.000/mes, plan 100% mensual, 14% conversión de trial y 6% churn.',
      assumptions: { ...DEFAULT_ASSUMPTIONS },
    },
    {
      id: 'valeria',
      name: 'Escenario B: Propuesta Valeria',
      badge: 'Valeria $30k',
      badgeClass: 'badge-danger',
      description: 'Triplicar anuncios a $30.000/mes sin optimizar funnel ni retención. 2 vendedoras.',
      assumptions: { ...VALERIA_ASSUMPTIONS },
    },
    {
      id: 'optimized',
      name: 'Escenario C: Propuesta Optimizada',
      badge: 'Recomendado',
      badgeClass: 'badge-success',
      description: 'Ads a $12.500, 20% plan anual, conversión al 16%, churn al 4.5% y precio $29.',
      assumptions: { ...OPTIMIZED_SUGGESTION_ASSUMPTIONS },
    },
    {
      id: 'custom',
      name: 'Escenario D: Configuración Activa',
      badge: 'En Vivo',
      badgeClass: 'badge-caution',
      description: 'Resultados derivados de los controles interactivos seleccionados en este momento.',
      assumptions: currentAssumptions,
    },
  ];

  const analyzed = scenarios.map((sc) => {
    const acq = calculateAcquisitionMetrics(sc.assumptions.adInvestment, sc.assumptions);
    const ue = calculateUnitEconomics(sc.assumptions);
    const ltv = calculateLTVMetrics(
      ue.monthlyContribution,
      sc.assumptions.monthlyChurn,
      acq.cacPaid,
      acq.cacBlended,
      sc.assumptions.simulationMonths
    );
    const payback = calculateMonthlyCustomerCashCurve(
      acq.cacPaid || 180,
      ue.monthlyContribution,
      sc.assumptions.monthlyChurn,
      sc.assumptions.simulationMonths
    );
    const sim = simulateCashFlow(sc.assumptions);

    return {
      ...sc,
      acq,
      ue,
      ltv,
      payback,
      sim,
    };
  });

  return `
    <div class="scenarios-page">
      ${renderControlsPanel(currentAssumptions, true)}

      <!-- Gráfico Comparativo -->
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">📊 Comparativa Visual de Rendimiento y Seguridad Financiera</h3>
            <p class="card-subtitle">Clientes activos conseguidos al Mes 24 vs Caja Mínima (umbral $10.000).</p>
          </div>
        </div>
        <div class="chart-box" style="height: 360px;">
          <canvas id="scenario-comparison-chart"></canvas>
        </div>
      </div>

      <!-- Tarjetas de Escenarios Lado a Lado -->
      <div class="dashboard-grid-2" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));">
        ${analyzed
          .map((item) => {
            const isViable = item.sim.isViable;
            return `
            <div class="card" style="border-top: 4px solid ${isViable ? '#10b981' : '#ef4444'};">
              <div class="card-header" style="margin-bottom: 12px;">
                <div>
                  <span class="kpi-pill ${item.badgeClass}">${item.badge}</span>
                  <h3 class="card-title" style="margin-top: 6px;">${item.name}</h3>
                </div>
                <span class="kpi-pill ${isViable ? 'badge-success' : 'badge-danger'}">
                  ${isViable ? '🛡️ Viable' : '☠️ Quiebra Piso'}
                </span>
              </div>
              <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 16px;">
                ${item.description}
              </p>

              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 13px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">Inversión Publicitaria:</span>
                  <strong>${formatCurrency(item.assumptions.adInvestment)}/mes</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">Trials Generados:</span>
                  <strong>${formatNumber(item.acq.trials, 1)} trials</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">Vendedoras Necesarias:</span>
                  <strong>${item.acq.salespeople}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">CAC Paid (Real Ads):</span>
                  <strong style="color: #b45309;">${formatCurrency(item.acq.cacPaid, 2)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">CAC Blended:</span>
                  <strong>${formatCurrency(item.acq.cacBlended, 2)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">LTV a 24 Meses:</span>
                  <strong>${formatCurrency(item.ltv.ltv24, 2)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">LTV : CAC Paid:</span>
                  <strong style="color: ${item.ltv.paidHealth.color};">${formatRatio(item.ltv.ltvCacPaid)} (${item.ltv.paidHealth.label})</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">Payback Cliente Mensual:</span>
                  <strong>${item.payback.exactPaybackMonth ? `${item.payback.exactPaybackMonth.toFixed(1)} meses` : '> 24 meses'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">Caja Mínima:</span>
                  <strong style="color: ${item.sim.minCash < item.assumptions.cashFloor ? '#b91c1c' : '#1b6338'};">
                    ${formatCurrency(item.sim.minCash)} (Mes ${item.sim.monthOfMinCash})
                  </strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <span style="color: var(--text-dim);">Caja Final Mes 24:</span>
                  <strong style="color: ${item.sim.finalCash > item.assumptions.initialCash ? '#1b6338' : '#b45309'};">
                    ${formatCurrency(item.sim.finalCash)}
                  </strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 4px;">
                  <span style="color: var(--text-dim);">Clientes Activos Mes 24:</span>
                  <strong style="font-size: 15px; color: #1c4d2d;">${formatNumber(item.sim.finalActiveCustomers)}</strong>
                </div>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    </div>
  `;
}

export function initScenariosCharts(currentAssumptions: ModelAssumptions): void {
  const scA = simulateCashFlow(DEFAULT_ASSUMPTIONS);
  const scB = simulateCashFlow(VALERIA_ASSUMPTIONS);
  const scC = simulateCashFlow(OPTIMIZED_SUGGESTION_ASSUMPTIONS);
  const scD = simulateCashFlow(currentAssumptions);

  renderScenarioBarChart(
    'scenario-comparison-chart',
    ['A: Base $10k', 'B: Valeria $30k', 'C: Optimizada', 'D: Configuración'],
    [
      scA.finalActiveCustomers,
      scB.finalActiveCustomers,
      scC.finalActiveCustomers,
      scD.finalActiveCustomers,
    ],
    [scA.minCash, scB.minCash, scC.minCash, scD.minCash]
  );
}
