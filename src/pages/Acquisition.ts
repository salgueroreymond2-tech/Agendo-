import { ModelAssumptions } from '../data/defaultAssumptions';
import { SEPTEMBER_CHANNELS, HISTORICAL_ADS } from '../data/historicalAds';
import { calculateAcquisitionMetrics, calculateMarginalCAC } from '../engine/acquisition';
import { renderKPICard } from '../components/KPI';
import { renderControlsPanel } from '../components/Controls';
import { renderAcquisitionCurveChart } from '../components/Charts';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatters';

export function renderAcquisitionPage(assumptions: ModelAssumptions): string {
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const acq30k = calculateAcquisitionMetrics(30000, assumptions);
  const marginal30k = calculateMarginalCAC(acq, acq30k);

  const metaData = SEPTEMBER_CHANNELS.find((c) => c.platform === 'Meta')!;
  const googleData = SEPTEMBER_CHANNELS.find((c) => c.platform === 'Google')!;

  return `
    <div class="acquisition-page">
      ${renderControlsPanel(assumptions, false)}

      <!-- KPIs de Adquisición -->
      <div class="kpi-grid">
        ${renderKPICard({
          label: 'Inversión Publicitaria',
          value: formatCurrency(assumptions.adInvestment),
          subtext: `Histórico calibrado hasta $30k`,
          pillText: 'Pauta Activa',
          pillClass: 'badge-primary',
          tooltip: 'Monto destinado mensualmente a pauta publicitaria en Meta y Google.',
        })}

        ${renderKPICard({
          label: 'Registros / Trials Generados',
          value: formatNumber(acq.trials, 1),
          subtext: `Costo por registro (CPR): ${formatCurrency(acq.costPerRegistration, 2)}`,
          pillText: 'Prueba 14 días',
          pillClass: 'badge-emerald',
          tooltip: 'Pruebas gratis de 14 días sin tarjeta de crédito creadas por la pauta.',
        })}

        ${renderKPICard({
          label: 'Conversión Trial a Pago',
          value: formatPercent(assumptions.trialConversionRate),
          subtext: `${formatNumber(acq.paidCustomers, 2)} clientes pagados de ads`,
          pillText: 'Tasa CRM',
          pillClass: 'badge-caution',
          tooltip: 'Porcentaje de barberías en prueba gratis que terminan convirtiéndose en clientes de pago.',
        })}

        ${renderKPICard({
          label: 'Clientes Orgánicos Mensuales',
          value: formatNumber(assumptions.organicCustomersMonthly),
          subtext: 'Boca a boca e insignia',
          pillText: 'Sin costo publicitario',
          pillClass: 'badge-success',
          tooltip: 'Clientes que llegan naturalmente por recomendación entre barberos y la insignia "Reservado con Agendo".',
        })}

        ${renderKPICard({
          label: 'Equipo Comercial Requerido',
          value: `${acq.salespeople} Vendedora(s)`,
          subtext: `Sueldo: ${formatCurrency(acq.salesSalary)} + Comis: ${formatCurrency(acq.salesCommission)}`,
          pillText: `Capacidad: ${assumptions.salespersonCapacity} trials/c.u.`,
          pillClass: acq.salespeople > 1 ? 'badge-warning' : 'badge-primary',
          tooltip: 'Mariela atiende hasta 500 trials. Superar los 500 trials obliga a contratar otra vendedora a $1.200/mes.',
        })}

        ${renderKPICard({
          label: 'CAC Marginal al Triplicar ($30k)',
          value: marginal30k ? formatCurrency(marginal30k, 2) : 'N/A',
          subtext: 'Por cada cliente pagado adicional',
          pillText: 'Rendimientos decrecientes',
          pillClass: 'badge-danger',
          tooltip: 'El incremento de costo total dividido entre los 56 clientes adicionales conseguidos al pasar de $10k a $30k.',
        })}
      </div>

      <!-- Gráfico de Rendimientos Decrecientes vs Fantasía del Freelancer -->
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">📉 Curva de Rendimientos Decrecientes en Publicidad</h3>
            <p class="card-subtitle">Trials reales según historial e interpolación vs la hipótesis lineal del freelancer ($20/registro).</p>
          </div>
        </div>
        <div class="chart-box" style="height: 360px;">
          <canvas id="acquisition-curve-chart"></canvas>
        </div>
      </div>

      <!-- Canales Históricos de Septiembre y Funnel -->
      <div class="dashboard-grid-2">
        <!-- Canales Meta vs Google -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">📱 Rendimiento por Canal (Datos de Septiembre)</h3>
              <p class="card-subtitle">Desglose de inversión, clics, conversiones y CPR reportado por plataforma.</p>
            </div>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Plataforma</th>
                  <th>Inversión</th>
                  <th>Impresiones</th>
                  <th>Clics</th>
                  <th>CTR</th>
                  <th>Trials</th>
                  <th>Costo / Trial</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Meta Ads</strong></td>
                  <td>${formatCurrency(metaData.investment)}</td>
                  <td>${formatNumber(metaData.impressions)}</td>
                  <td>${formatNumber(metaData.clicks)}</td>
                  <td>${metaData.ctr}%</td>
                  <td><strong>${metaData.trials}</strong></td>
                  <td style="color: #10b981; font-weight: 700;">${formatCurrency(metaData.cpr, 2)}</td>
                </tr>
                <tr>
                  <td><strong>Google Ads</strong></td>
                  <td>${formatCurrency(googleData.investment)}</td>
                  <td>${formatNumber(googleData.impressions)}</td>
                  <td>${formatNumber(googleData.clicks)}</td>
                  <td>${googleData.ctr}%</td>
                  <td><strong>${googleData.trials}</strong></td>
                  <td style="color: #ef4444; font-weight: 700;">${formatCurrency(googleData.cpr, 2)}</td>
                </tr>
                <tr class="highlight-row">
                  <td><strong>Total Pauta</strong></td>
                  <td><strong>$10.000</strong></td>
                  <td><strong>853.000</strong></td>
                  <td><strong>11.230</strong></td>
                  <td><strong>1,3%</strong></td>
                  <td><strong>500</strong></td>
                  <td><strong>$20,00</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style="font-size: 12px; color: var(--text-dim); margin-top: 12px;">
            💡 <em>Nota crítica:</em> Google tiene un costo por registro ($52,24) 3,5 veces más caro que Meta ($15,01). Reasignar pauta hacia Meta optimizaría el CPR promedio.
          </p>
        </div>

        <!-- Funnel de Conversión -->
        <div class="card">
          <div class="card-header">
            <div>
              <h3 class="card-title">🌪️ Funnel de Conversión a Cliente Pagado</h3>
              <p class="card-subtitle">Paso a paso desde la inversión publicitaria hasta el cobro recurrente.</p>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 13px;">
            <div style="padding: 12px 16px; border-radius: var(--radius-md); background: rgba(28, 77, 45, 0.08); border: 1px solid rgba(28, 77, 45, 0.25); display: flex; justify-content: space-between; align-items: center;">
              <span><strong>1. Inversión en Pauta</strong></span>
              <span style="font-weight: 700; color: #1c4d2d;">${formatCurrency(assumptions.adInvestment)}</span>
            </div>
            <div style="padding: 12px 16px; border-radius: var(--radius-md); background: rgba(58, 107, 76, 0.08); border: 1px solid rgba(58, 107, 76, 0.25); display: flex; justify-content: space-between; align-items: center;">
              <span><strong>2. Trials Generados (Pruebas 14 días)</strong></span>
              <span style="font-weight: 700; color: #3a6b4c;">${formatNumber(acq.trials, 1)} trials (CPR: ${formatCurrency(acq.costPerRegistration, 2)})</span>
            </div>
            <div style="padding: 12px 16px; border-radius: var(--radius-md); background: rgba(180, 83, 9, 0.08); border: 1px solid rgba(180, 83, 9, 0.25); display: flex; justify-content: space-between; align-items: center;">
              <span><strong>3. Clientes Pagados de Ads (Conversión ${(assumptions.trialConversionRate * 100).toFixed(0)}%)</strong></span>
              <span style="font-weight: 700; color: #b45309;">${formatNumber(acq.paidCustomers, 2)} clientes</span>
            </div>
            <div style="padding: 12px 16px; border-radius: var(--radius-md); background: rgba(27, 99, 56, 0.08); border: 1px solid rgba(27, 99, 56, 0.25); display: flex; justify-content: space-between; align-items: center;">
              <span><strong>4. Clientes Nuevos Totales (+50 Orgánicos)</strong></span>
              <span style="font-weight: 700; color: #1b6338;">${formatNumber(acq.totalNewCustomers, 2)} clientes</span>
            </div>
            <div style="padding: 12px 16px; border-radius: var(--radius-md); background: var(--bg-card-subtle); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
              <span><strong>5. Costo Total de Adquisición (Ads + Vendedora + Comisiones)</strong></span>
              <span style="font-weight: 700; color: var(--text-main);">${formatCurrency(acq.totalAcquisitionCost)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de Datos Históricos de Anuncios -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📊 Histórico Real de Anuncios y Rendimiento de Pauta</h3>
          <span style="font-size: 12px; color: var(--text-muted);">Fuente: Sección 5 del Caso Agendo</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Inversión en Anuncios</th>
                <th>Trials Generados</th>
                <th>Costo Medio por Trial (CPR)</th>
                <th>Trials Marginales</th>
                <th>Inversión Marginal</th>
                <th>Costo Marginal por Trial</th>
                <th>Referencia Temporal</th>
              </tr>
            </thead>
            <tbody>
              ${HISTORICAL_ADS.map((pt, idx) => {
                const prev = idx > 0 ? HISTORICAL_ADS[idx - 1] : null;
                const dInv = prev ? pt.investment - prev.investment : pt.investment;
                const dTrials = prev ? pt.trials - prev.trials : pt.trials;
                const cpr = pt.trials > 0 ? pt.investment / pt.trials : 0;
                const marginalCpr = dTrials > 0 ? dInv / dTrials : 0;
                const isSelected = Math.abs(pt.investment - assumptions.adInvestment) < 100;
                return `
                  <tr class="${isSelected ? 'highlight-row' : ''}">
                    <td><strong>${formatCurrency(pt.investment)}</strong></td>
                    <td><strong>${pt.trials}</strong></td>
                    <td>${pt.trials > 0 ? formatCurrency(cpr, 2) : 'N/A'}</td>
                    <td>${prev ? `+${dTrials}` : pt.trials}</td>
                    <td>${prev ? `+${formatCurrency(dInv)}` : formatCurrency(dInv)}</td>
                    <td style="font-weight: 700; color: ${marginalCpr > 50 ? '#ef4444' : '#10b981'};">
                      ${dTrials > 0 ? formatCurrency(marginalCpr, 2) : 'N/A'}
                    </td>
                    <td>${pt.label || ''}</td>
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

export function initAcquisitionCharts(assumptions: ModelAssumptions): void {
  renderAcquisitionCurveChart('acquisition-curve-chart', assumptions.adInvestment);
}
