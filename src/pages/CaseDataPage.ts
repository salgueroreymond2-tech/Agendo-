import { ModelAssumptions } from '../data/defaultAssumptions';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

export function renderCaseDataPage(currentAssumptions: ModelAssumptions): string {
  return `
    <div class="case-data-page">
      <!-- Tarjeta de Acciones y Reseteo -->
      <div class="card" style="margin-bottom: 24px;">
        <div class="card-header">
          <div>
            <h3 class="card-title">📁 Configuración Base del Caso Empresarial Agendo</h3>
            <p class="card-subtitle">Parámetros originales extraídos del documento oficial de FC Studio (Isidro Fernández C.).</p>
          </div>
          <button id="btn-reset-case-page" class="btn btn-secondary btn-sm">
            ↺ Restaurar Supuestos del Caso Original
          </button>
        </div>
      </div>

      <!-- Cuadrícula de Supuestos Principales -->
      <div class="dashboard-grid-2">
        <!-- Tabla de Variables Base -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">🏢 Datos Generales de la Empresa</h3>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  <th>Valor en Caso Original</th>
                  <th>Valor Activo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Clientes activos iniciales</td>
                  <td>1.150</td>
                  <td>${formatNumber(currentAssumptions.initialActiveCustomers)}</td>
                </tr>
                <tr>
                  <td>Caja inicial en banco</td>
                  <td>$60.000</td>
                  <td>${formatCurrency(currentAssumptions.initialCash)}</td>
                </tr>
                <tr>
                  <td>Piso mínimo de seguridad (Ricardo)</td>
                  <td>$10.000</td>
                  <td>${formatCurrency(currentAssumptions.cashFloor)}</td>
                </tr>
                <tr>
                  <td>Costos fijos mensuales</td>
                  <td>$14.000</td>
                  <td>${formatCurrency(currentAssumptions.fixedCosts)}</td>
                </tr>
                <tr>
                  <td>Inversión publicitaria base</td>
                  <td>$10.000</td>
                  <td>${formatCurrency(currentAssumptions.adInvestment)}</td>
                </tr>
                <tr>
                  <td>Precio suscripción mensual</td>
                  <td>$25 / mes</td>
                  <td>${formatCurrency(currentAssumptions.monthlyPrice)}</td>
                </tr>
                <tr>
                  <td>Precio suscripción anual (prepago)</td>
                  <td>$240 / año ($20/mes)</td>
                  <td>${formatCurrency(currentAssumptions.annualPrice)}</td>
                </tr>
                <tr>
                  <td>Margen bruto</td>
                  <td>78%</td>
                  <td>${formatPercent(currentAssumptions.grossMargin, 0)}</td>
                </tr>
                <tr>
                  <td>Conversión Trial a Pago</td>
                  <td>14%</td>
                  <td>${formatPercent(currentAssumptions.trialConversionRate)}</td>
                </tr>
                <tr>
                  <td>Churn mensual</td>
                  <td>6%</td>
                  <td>${formatPercent(currentAssumptions.monthlyChurn)}</td>
                </tr>
                <tr>
                  <td>Renovación anual (Mes 13)</td>
                  <td>70%</td>
                  <td>${formatPercent(currentAssumptions.annualRenewalRate)}</td>
                </tr>
                <tr>
                  <td>Clientes orgánicos / mes</td>
                  <td>50</td>
                  <td>${currentAssumptions.organicCustomersMonthly}</td>
                </tr>
                <tr>
                  <td>Sueldo por vendedora (Mariela)</td>
                  <td>$1.200 / mes</td>
                  <td>${formatCurrency(currentAssumptions.salespersonSalary)}</td>
                </tr>
                <tr>
                  <td>Capacidad de atención vendedora</td>
                  <td>500 trials</td>
                  <td>${currentAssumptions.salespersonCapacity}</td>
                </tr>
                <tr>
                  <td>Comisión por cliente pagado de ads</td>
                  <td>$20</td>
                  <td>${formatCurrency(currentAssumptions.commissionPerPaidCustomer)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Desglose de Costos Fijos y Contexto -->
        <div style="display: flex; flex-direction: column; gap: 24px;">
          <!-- Desglose Costos Fijos -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">💼 Desglose de Costos Fijos Mensuales ($14.000)</h3>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Monto Mensual</th>
                    <th>% del Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Valeria (CEO) y 2 Desarrolladores</td>
                    <td><strong>$11.000</strong></td>
                    <td>78,6%</td>
                  </tr>
                  <tr>
                    <td>Coworking</td>
                    <td><strong>$900</strong></td>
                    <td>6,4%</td>
                  </tr>
                  <tr>
                    <td>Herramientas de software</td>
                    <td><strong>$600</strong></td>
                    <td>4,3%</td>
                  </tr>
                  <tr>
                    <td>Contador y Abogado</td>
                    <td><strong>$500</strong></td>
                    <td>3,6%</td>
                  </tr>
                  <tr>
                    <td>Otros gastos operativos</td>
                    <td><strong>$1.000</strong></td>
                    <td>7,1%</td>
                  </tr>
                  <tr class="highlight-row">
                    <td><strong>Total Costos Fijos</strong></td>
                    <td><strong>$14.000</strong></td>
                    <td><strong>100%</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p style="font-size: 11.5px; color: var(--text-dim); margin-top: 10px;">
              *Nota: El sueldo de Mariela no está aquí (se computa en el CAC). El soporte técnico está absorbido dentro del costo directo del margen bruto (22%).
            </p>
          </div>

          <!-- Datos de Mercado y Cualitativos -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">💈 Inteligencia de Mercado y Contexto Agendo</h3>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px;">
              <div style="padding: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md);">
                <span style="font-size: 11px; color: var(--text-dim); display: block;">NPS (SATISFACCIÓN)</span>
                <strong style="font-size: 18px; color: #1c4d2d;">NPS 61</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Excelente retención cualitativa y lealtad.</p>
              </div>
              <div style="padding: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md);">
                <span style="font-size: 11px; color: var(--text-dim); display: block;">COMPETIDOR PRINCIPAL</span>
                <strong style="font-size: 18px; color: #b45309;">CitaYa ($35/m)</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Margen de precio para subir Agendo a $29.</p>
              </div>
              <div style="padding: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md);">
                <span style="font-size: 11px; color: var(--text-dim); display: block;">TAMAÑO CLIENTE PROMEDIO</span>
                <strong style="font-size: 18px; color: #3a6b4c;">2,3 Sillas</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Barberías y salones de barrio.</p>
              </div>
              <div style="padding: 12px; background: var(--bg-card-subtle); border-radius: var(--radius-md);">
                <span style="font-size: 11px; color: var(--text-dim); display: block;">INSTAGRAM</span>
                <strong style="font-size: 18px; color: #6d5438;">4.000 seguidores</strong>
                <p style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Comunidad activa en redes sociales.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
