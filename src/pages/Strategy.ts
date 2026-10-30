import { ModelAssumptions } from '../data/defaultAssumptions';
import { optimizeFixedBudget, optimizeVariableBudget, OptimizationResult } from '../engine/optimizer';
import { renderKPICard } from '../components/KPI';
import { renderControlsPanel } from '../components/Controls';
import { renderCashFlowChart } from '../components/Charts';
import { formatCurrency, formatNumber } from '../utils/formatters';

export function renderStrategyPage(
  assumptions: ModelAssumptions,
  mode: 'fixed' | 'variable' = 'fixed'
): string {
  const result: OptimizationResult =
    mode === 'fixed'
      ? optimizeFixedBudget(assumptions)
      : optimizeVariableBudget(assumptions);

  return `
    <div class="strategy-page">
      ${renderControlsPanel(assumptions, true)}

      <!-- Selector de Modo del Optimizador -->
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">🎯 Optimizador Financiero de Presupuesto Publicitario</h3>
            <p class="card-subtitle">
              Resuelve matemáticamente el presupuesto que maximiza los clientes activos al mes 24 respetando estrictamente el piso de liquidez ($10.000).
            </p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-opt-mode-fixed" class="btn ${mode === 'fixed' ? 'btn-primary' : 'btn-secondary'} btn-sm">
              Presupuesto Fijo Constante
            </button>
            <button id="btn-opt-mode-variable" class="btn ${mode === 'variable' ? 'btn-primary' : 'btn-secondary'} btn-sm">
              Estrategia Variable por Fases
            </button>
          </div>
        </div>

        <div style="background: var(--bg-card-subtle); padding: 16px; border-radius: var(--radius-md); font-size: 13px; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
          <strong>Algoritmo implementado:</strong> ${result.algorithmNotes}
        </div>

        <button id="btn-apply-optimal-budget" class="btn btn-secondary btn-sm" data-budget="${result.optimalBudget}">
          ✨ Aplicar Presupuesto Óptimo ($${result.optimalBudget.toLocaleString()}) a la Configuración Activa
        </button>
      </div>

      <!-- Métricas del Resultado Óptimo Encontrado -->
      <div class="kpi-grid">
        ${renderKPICard({
          label: 'Presupuesto Publicitario Óptimo',
          value: formatCurrency(result.optimalBudget),
          subtext: mode === 'fixed' ? 'Constante durante 24 meses' : 'Fase de Aceleración (M7-24)',
          pillText: 'Solución Óptima',
          pillClass: 'badge-emerald',
          tooltip: 'Nivel de inversión que maximiza clientes sin violar jamás los $10.000 de caja.',
        })}

        ${renderKPICard({
          label: 'Clientes Activos al Mes 24',
          value: formatNumber(result.activeCustomersM24),
          subtext: `Frente a ${formatNumber(assumptions.initialActiveCustomers)} iniciales`,
          pillText: 'Máximo Seguro',
          pillClass: 'badge-success',
          tooltip: 'Capacidad máxima de clientes que la liquidez de Agendo permite sostener.',
        })}

        ${renderKPICard({
          label: 'Caja Mínima en el Horizonte',
          value: formatCurrency(result.minCash),
          subtext: `Ocurre en el Mes ${result.monthOfMinCash}`,
          pillText: result.minCash >= assumptions.cashFloor ? 'Seguro >= $10k' : 'Incumplimiento',
          pillClass: result.minCash >= assumptions.cashFloor ? 'badge-success' : 'badge-danger',
          tooltip: 'Piso más bajo de liquidez alcanzado en la trayectoria de 24 meses.',
        })}

        ${renderKPICard({
          label: 'Caja Final al Mes 24',
          value: formatCurrency(result.finalCash),
          subtext: `Inversión total ads: ${formatCurrency(result.totalAdInvestment)}`,
          pillText: 'Balance Final',
          pillClass: 'badge-primary',
          tooltip: 'Saldo en cuenta bancaria tras finalizar los 24 meses de operación.',
        })}
      </div>

      <!-- Gráfico de Caja con la Solución Óptima -->
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">📈 Trayectoria de Caja del Plan Óptimo Encontrado</h3>
            <p class="card-subtitle">Evolución mes a mes garantizando que la caja nunca descienda de $10.000.</p>
          </div>
        </div>
        <div class="chart-box" style="height: 360px;">
          <canvas id="strategy-optimal-cash-chart"></canvas>
        </div>
      </div>

      <!-- Riesgos y Consideraciones del Plan -->
      <div class="card" style="border-left: 4px solid #b45309;">
        <div class="card-header">
          <h3 class="card-title" style="color: #b45309;">⚠️ Matriz de Riesgos y Sensibilidad del Plan</h3>
        </div>
        <ul style="padding-left: 20px; font-size: 13.5px; color: var(--text-muted); line-height: 1.8;">
          ${result.risks
            .map((r) => `<li>${r}</li>`)
            .join('')}
          <li><strong>Sensibilidad a la conversión:</strong> Si la conversión de trials cae por debajo del ${(
            assumptions.trialConversionRate * 100
          ).toFixed(1)}%, el CAC aumentará y la caja mínima descenderá.</li>
          <li><strong>Capacidad de soporte y calidad de producto:</strong> Sumar más de 100 clientes mensuales exige mantener el NPS en 61 para evitar un repunte en el churn.</li>
        </ul>
      </div>
    </div>
  `;
}

export function initStrategyCharts(
  assumptions: ModelAssumptions,
  mode: 'fixed' | 'variable' = 'fixed'
): void {
  const result =
    mode === 'fixed'
      ? optimizeFixedBudget(assumptions)
      : optimizeVariableBudget(assumptions);

  renderCashFlowChart(
    'strategy-optimal-cash-chart',
    result.simulation.rows,
    assumptions.cashFloor
  );
}
