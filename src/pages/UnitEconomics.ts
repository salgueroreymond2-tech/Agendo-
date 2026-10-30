import { ModelAssumptions } from '../data/defaultAssumptions';
import { calculateAcquisitionMetrics, calculateMarginalCAC } from '../engine/acquisition';
import { calculateUnitEconomics } from '../engine/unitEconomics';
import { calculateLTVMetrics } from '../engine/ltv';
import { renderKPICard } from '../components/KPI';
import { renderControlsPanel } from '../components/Controls';
import { formatCurrency, formatPercent, formatRatio, formatNumber } from '../utils/formatters';

export function renderUnitEconomicsPage(assumptions: ModelAssumptions): string {
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const ue = calculateUnitEconomics(assumptions);
  const ltv = calculateLTVMetrics(
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    acq.cacPaid,
    acq.cacBlended,
    assumptions.simulationMonths
  );

  // Marginal CAC al subir $5.000 de ads
  const acqNext = calculateAcquisitionMetrics(
    Math.min(assumptions.adInvestment + 5000, 30000),
    assumptions
  );
  const marginalCAC = calculateMarginalCAC(acq, acqNext);

  return `
    <div class="unit-economics-page">
      ${renderControlsPanel(assumptions, true)}

      <!-- Resumen de Unit Economics -->
      <div class="kpi-grid">
        ${renderKPICard({
          label: 'Precio Mensual Suscripción',
          value: formatCurrency(assumptions.monthlyPrice),
          subtext: `Plan Anual: ${formatCurrency(assumptions.annualPrice)}/año ($20/mes)`,
          pillText: '90% eligen mensual',
          pillClass: 'badge-primary',
          tooltip: 'Precio mensual cobrado a las barberías. Competidor principal CitaYa cobra $35.',
        })}

        ${renderKPICard({
          label: 'Margen Bruto (%)',
          value: formatPercent(assumptions.grossMargin, 0),
          subtext: `Costo Directo: ${formatCurrency(ue.monthlyDirectCost, 2)}/mes`,
          pillText: 'Costos directos 22%',
          pillClass: 'badge-emerald',
          tooltip: 'Incluye WhatsApp, servidores, procesador de pagos y persona de soporte.',
        })}

        ${renderKPICard({
          label: 'Margen de Contribución Unitario',
          value: formatCurrency(ue.monthlyContribution, 2),
          subtext: `Anual: ${formatCurrency(ue.annualContribution, 2)} prepagado`,
          pillText: 'Flujo recurrente/mes',
          pillClass: 'badge-success',
          tooltip: 'Precio mensual ($25) * Margen bruto (78%) = $19.50.',
        })}

        ${renderKPICard({
          label: 'CAC Paid (Anuncios)',
          value: formatCurrency(acq.cacPaid, 2),
          subtext: 'Solo clientes de publicidad',
          pillText: 'Costo Real',
          pillClass: 'badge-warning',
          tooltip: 'Todo lo que cuesta adquirir vía anuncios dividido entre los clientes que llegaron por anuncios.',
        })}

        ${renderKPICard({
          label: 'CAC Blended (Mezclado)',
          value: formatCurrency(acq.cacBlended, 2),
          subtext: 'Divide entre todos los clientes nuevos',
          pillText: 'Lámina de Valeria',
          pillClass: 'badge-caution',
          tooltip: 'Total de costos comerciales dividido entre (clientes de anuncios + orgánicos).',
        })}

        ${renderKPICard({
          label: 'CAC Marginal (Siguiente Escalón)',
          value: marginalCAC ? formatCurrency(marginalCAC, 2) : 'N/A',
          subtext: `Al subir a ${formatCurrency(acqNext.adInvestment)}`,
          pillText: 'Costo marginal creciente',
          pillClass: 'badge-danger',
          tooltip: 'Costo de conseguir un cliente pagado adicional por encima del nivel actual.',
        })}

        ${renderKPICard({
          label: 'LTV a 24 Meses (Tope)',
          value: formatCurrency(ltv.ltv24, 2),
          subtext: `Método cerrado: ${formatCurrency(ltv.ltv24ClosedForm, 2)}`,
          pillText: 'Horizonte Ricardo',
          pillClass: 'badge-primary',
          tooltip: 'Suma mes a mes del margen esperado durante 24 meses considerando 6% de churn.',
        })}

        ${renderKPICard({
          label: 'LTV Infinito (Sin Tope)',
          value: formatCurrency(ltv.ltvInfinite, 2),
          subtext: `Retención infinita: ${ltv.expectedRetentionMonthsInfinite.toFixed(1)} meses`,
          pillText: 'Modelo Teórico',
          pillClass: 'badge-gray',
          tooltip: 'Margen mensual / Churn = $19.50 / 0.06 = $325.00.',
        })}

        ${renderKPICard({
          label: 'LTV : CAC Paid (Real)',
          value: formatRatio(ltv.ltvCacPaid),
          subtext: ltv.paidHealth.label,
          pillText: ltv.paidHealth.status.toUpperCase(),
          pillClass: ltv.paidHealth.badgeClass,
          tooltip: 'Relación real entre LTV a 24 meses y CAC Paid. < 2x es frágil.',
        })}

        ${renderKPICard({
          label: 'LTV : CAC Blended',
          value: formatRatio(ltv.ltvCacBlended),
          subtext: ltv.blendedHealth.label,
          pillText: '2.4x en caso base',
          pillClass: ltv.blendedHealth.badgeClass,
          tooltip: 'Relación LTV a 24 meses / CAC Blended. Es la cifra que confunde a Valeria.',
        })}
      </div>

      <!-- Semáforo Financiero Detallado -->
      <div class="card" style="margin-bottom: 28px;">
        <div class="card-header">
          <h3 class="card-title">🚥 Semáforo Financiero de Ratios LTV:CAC</h3>
          <span class="badge-primary kpi-pill">Umbrales de Referencia SaaS</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; font-size: 13px;">
          <div style="padding: 12px; border-radius: var(--radius-md); background: rgba(185, 28, 28, 0.08); border: 1px solid rgba(185, 28, 28, 0.25);">
            <strong style="color: #b91c1c;">&lt; 1.0x · Destructivo</strong>
            <p style="color: var(--text-muted); font-size: 11.5px; margin-top: 4px;">El margen no cubre la adquisición. Quema neta de capital.</p>
          </div>
          <div style="padding: 12px; border-radius: var(--radius-md); background: rgba(194, 65, 12, 0.08); border: 1px solid rgba(194, 65, 12, 0.25);">
            <strong style="color: #c2410c;">1.0x - 2.0x · Riesgo Alto</strong>
            <p style="color: var(--text-muted); font-size: 11.5px; margin-top: 4px;">Aquí está Agendo hoy (${formatRatio(ltv.ltvCacPaid)}). Margen insuficiente para costos fijos.</p>
          </div>
          <div style="padding: 12px; border-radius: var(--radius-md); background: rgba(180, 83, 9, 0.08); border: 1px solid rgba(180, 83, 9, 0.25);">
            <strong style="color: #b45309;">2.0x - 3.0x · Ajustado</strong>
            <p style="color: var(--text-muted); font-size: 11.5px; margin-top: 4px;">Recuperación lenta. Requiere optimizar retención o precios.</p>
          </div>
          <div style="padding: 12px; border-radius: var(--radius-md); background: rgba(27, 99, 56, 0.08); border: 1px solid rgba(27, 99, 56, 0.25);">
            <strong style="color: #1b6338;">3.0x - 4.0x · Saludable</strong>
            <p style="color: var(--text-muted); font-size: 11.5px; margin-top: 4px;">Zona ideal de escalamiento eficiente y retorno predecible.</p>
          </div>
          <div style="padding: 12px; border-radius: var(--radius-md); background: rgba(15, 89, 64, 0.08); border: 1px solid rgba(15, 89, 64, 0.25);">
            <strong style="color: #0f5940;">&gt; 4.0x · Fuerte Eficiencia</strong>
            <p style="color: var(--text-muted); font-size: 11.5px; margin-top: 4px;">Alta productividad de capital. Recomendación de aceleración agresiva.</p>
          </div>
        </div>
      </div>

      <!-- Desglose de Fórmulas y Trazabilidad Numérica -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📖 Trazabilidad Matemática y Fórmulas del Motor</h3>
          <span style="font-size: 12px; color: var(--text-dim);">100% Determinista · Sin Supuestos Ocultos</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Métrica</th>
                <th>Fórmula Teórica</th>
                <th>Cálculo con Datos Actuales</th>
                <th>Resultado</th>
                <th>Sección PDF</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Margen Mensual</strong></td>
                <td><code>Precio * Margen Bruto</code></td>
                <td>$25 * 78%</td>
                <td><strong>$19,50</strong></td>
                <td>Sección 1 y 2</td>
              </tr>
              <tr>
                <td><strong>Trials por Pauta</strong></td>
                <td><code>Interpolación Lineal(Inversión)</code></td>
                <td>Interpolación entre $0 y $30.000</td>
                <td><strong>${formatNumber(acq.trials, 1)} trials</strong></td>
                <td>Sección 5</td>
              </tr>
              <tr>
                <td><strong>Clientes Pagados Ads</strong></td>
                <td><code>Trials * Conversión (14%)</code></td>
                <td>${formatNumber(acq.trials, 1)} * 14%</td>
                <td><strong>${formatNumber(acq.paidCustomers, 2)} clientes</strong></td>
                <td>Sección 3 y 4</td>
              </tr>
              <tr>
                <td><strong>Vendedoras</strong></td>
                <td><code>Math.ceil(Trials / 500)</code></td>
                <td>Math.ceil(${formatNumber(acq.trials, 1)} / 500)</td>
                <td><strong>${acq.salespeople} vendedora(s)</strong> ($${acq.salesSalary})</td>
                <td>Sección 3 y 7</td>
              </tr>
              <tr>
                <td><strong>Comisiones Comerciales</strong></td>
                <td><code>Clientes Ads * $20</code></td>
                <td>${formatNumber(acq.paidCustomers, 2)} * $20</td>
                <td><strong>$${acq.salesCommission.toFixed(2)}</strong></td>
                <td>Sección 3</td>
              </tr>
              <tr>
                <td><strong>CAC Paid (Anuncios)</strong></td>
                <td><code>(Ads + Sueldo + Comis.) / Clientes Ads</code></td>
                <td>($${assumptions.adInvestment} + $${acq.salesSalary} + $${acq.salesCommission.toFixed(0)}) / ${formatNumber(acq.paidCustomers, 2)}</td>
                <td><strong style="color: #b45309;">$${(acq.cacPaid || 0).toFixed(2)}</strong></td>
                <td>Sección 3 y 6</td>
              </tr>
              <tr>
                <td><strong>CAC Blended (Mezclado)</strong></td>
                <td><code>Costo Total / (Clientes Ads + Orgánicos)</code></td>
                <td>$${acq.totalAcquisitionCost.toFixed(0)} / (${formatNumber(acq.paidCustomers, 2)} + 50)</td>
                <td><strong style="color: #3a6b4c;">$${(acq.cacBlended || 0).toFixed(2)}</strong></td>
                <td>Sección 3 y 6</td>
              </tr>
              <tr>
                <td><strong>LTV a 24 Meses</strong></td>
                <td><code>Margen * Sum_{m=1}^{24} (1 - Churn)^(m-1)</code></td>
                <td>$19,50 * 12,8917 meses de retención</td>
                <td><strong>$${ltv.ltv24.toFixed(2)}</strong></td>
                <td>Sección 2 y 4</td>
              </tr>
              <tr>
                <td><strong>LTV Infinito (Perpetuo)</strong></td>
                <td><code>Margen / Churn</code></td>
                <td>$19,50 / 0,06</td>
                <td><strong>$325,00</strong></td>
                <td>Sección 2 y 4</td>
              </tr>
              <tr>
                <td><strong>LTV : CAC Paid</strong></td>
                <td><code>LTV24 / CAC Paid</code></td>
                <td>$${ltv.ltv24.toFixed(2)} / $${(acq.cacPaid || 180).toFixed(2)}</td>
                <td><strong style="color: ${ltv.paidHealth.color};">${formatRatio(ltv.ltvCacPaid)}</strong></td>
                <td>Sección 4</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
