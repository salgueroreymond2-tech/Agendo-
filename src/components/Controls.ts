import { ModelAssumptions } from '../data/defaultAssumptions';

export interface ControlsCallbacks {
  onUpdate: (updated: Partial<ModelAssumptions>) => void;
  onReset: () => void;
}

export function renderControlsPanel(
  assumptions: ModelAssumptions,
  showAll: boolean = false
): string {
  return `
    <div class="control-panel">
      <div class="card-header" style="margin-bottom: 16px;">
        <div>
          <h3 class="card-title">🎛️ Palancas Financieras Interactivas</h3>
          <p class="card-subtitle">Modifica supuestos en tiempo real y observa el impacto inmediato en unit economics y caja.</p>
        </div>
        <button id="btn-reset-assumptions" class="btn btn-secondary btn-sm" title="Restaurar valores del PDF original">
          ↺ Restaurar Caso Original
        </button>
      </div>

      <div class="controls-grid">
        <!-- Inversión Publicitaria -->
        <div class="control-group">
          <div class="control-label-wrapper">
            <span class="control-label">Inversión Publicitaria (Ads)</span>
            <span class="control-current-val" id="val-adInvestment">$${assumptions.adInvestment.toLocaleString()}</span>
          </div>
          <input
            type="range"
            id="input-adInvestment"
            min="0"
            max="30000"
            step="500"
            value="${assumptions.adInvestment}"
          />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
            <span>$0</span>
            <span>$10k (Base)</span>
            <span>$20k</span>
            <span>$30k (Valeria)</span>
          </div>
        </div>

        <!-- Conversión Trial a Pago -->
        <div class="control-group">
          <div class="control-label-wrapper">
            <span class="control-label">Conversión Trial a Pago</span>
            <span class="control-current-val" id="val-trialConversion">${(assumptions.trialConversionRate * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            id="input-trialConversion"
            min="5"
            max="30"
            step="0.5"
            value="${assumptions.trialConversionRate * 100}"
          />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
            <span>5%</span>
            <span>14% (Base)</span>
            <span>20%</span>
            <span>30%</span>
          </div>
        </div>

        <!-- Churn Mensual -->
        <div class="control-group">
          <div class="control-label-wrapper">
            <span class="control-label">Cancelación Mensual (Churn)</span>
            <span class="control-current-val" id="val-monthlyChurn">${(assumptions.monthlyChurn * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            id="input-monthlyChurn"
            min="1"
            max="15"
            step="0.5"
            value="${assumptions.monthlyChurn * 100}"
          />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
            <span>1% (Excelente)</span>
            <span>6% (Base)</span>
            <span>10%</span>
            <span>15%</span>
          </div>
        </div>

        <!-- Participación Plan Anual -->
        <div class="control-group">
          <div class="control-label-wrapper">
            <span class="control-label">Adopción Plan Anual ($240 prepago)</span>
            <span class="control-current-val" id="val-annualPlanShare">${(assumptions.annualPlanShare * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            id="input-annualPlanShare"
            min="0"
            max="50"
            step="5"
            value="${assumptions.annualPlanShare * 100}"
          />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
            <span>0% (Base Nivel 1)</span>
            <span>10% (Caso)</span>
            <span>25%</span>
            <span>50%</span>
          </div>
        </div>

        ${
          showAll
            ? `
        <!-- Precio Mensual -->
        <div class="control-group">
          <div class="control-label-wrapper">
            <span class="control-label">Precio Mensual ($)</span>
            <span class="control-current-val" id="val-monthlyPrice">$${assumptions.monthlyPrice}</span>
          </div>
          <input
            type="range"
            id="input-monthlyPrice"
            min="15"
            max="45"
            step="1"
            value="${assumptions.monthlyPrice}"
          />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
            <span>$15</span>
            <span>$25 (Base)</span>
            <span>$35 (CitaYa)</span>
            <span>$45</span>
          </div>
        </div>

        <!-- Margen Bruto -->
        <div class="control-group">
          <div class="control-label-wrapper">
            <span class="control-label">Margen Bruto (%)</span>
            <span class="control-current-val" id="val-grossMargin">${(assumptions.grossMargin * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            id="input-grossMargin"
            min="50"
            max="95"
            step="1"
            value="${assumptions.grossMargin * 100}"
          />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
            <span>50%</span>
            <span>78% (Base)</span>
            <span>85%</span>
            <span>95%</span>
          </div>
        </div>

        <!-- Clientes Orgánicos Mensuales -->
        <div class="control-group">
          <div class="control-label-wrapper">
            <span class="control-label">Clientes Orgánicos / Mes</span>
            <span class="control-current-val" id="val-organicCustomers">${assumptions.organicCustomersMonthly}</span>
          </div>
          <input
            type="range"
            id="input-organicCustomers"
            min="0"
            max="150"
            step="5"
            value="${assumptions.organicCustomersMonthly}"
          />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
            <span>0</span>
            <span>50 (Base)</span>
            <span>100</span>
            <span>150</span>
          </div>
        </div>

        <!-- Capacidad por Vendedora -->
        <div class="control-group">
          <div class="control-label-wrapper">
            <span class="control-label">Capacidad por Vendedora (trials)</span>
            <span class="control-current-val" id="val-salesCapacity">${assumptions.salespersonCapacity}</span>
          </div>
          <input
            type="range"
            id="input-salesCapacity"
            min="250"
            max="800"
            step="50"
            value="${assumptions.salespersonCapacity}"
          />
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-dim);">
            <span>250</span>
            <span>500 (Base)</span>
            <span>650</span>
            <span>800</span>
          </div>
        </div>
        `
            : ''
        }
      </div>
    </div>
  `;
}

export function attachControlsListeners(callbacks: ControlsCallbacks): void {
  const listen = (id: string, cb: (val: number) => void) => {
    const el = document.getElementById(id) as HTMLInputElement;
    if (el) {
      el.addEventListener('input', () => cb(parseFloat(el.value)));
    }
  };

  listen('input-adInvestment', (val) => callbacks.onUpdate({ adInvestment: val }));
  listen('input-trialConversion', (val) =>
    callbacks.onUpdate({ trialConversionRate: val / 100 })
  );
  listen('input-monthlyChurn', (val) => callbacks.onUpdate({ monthlyChurn: val / 100 }));
  listen('input-annualPlanShare', (val) =>
    callbacks.onUpdate({ annualPlanShare: val / 100 })
  );

  listen('input-monthlyPrice', (val) => callbacks.onUpdate({ monthlyPrice: val }));
  listen('input-grossMargin', (val) => callbacks.onUpdate({ grossMargin: val / 100 }));
  listen('input-organicCustomers', (val) =>
    callbacks.onUpdate({ organicCustomersMonthly: val })
  );
  listen('input-salesCapacity', (val) =>
    callbacks.onUpdate({ salespersonCapacity: val })
  );

  const resetBtn = document.getElementById('btn-reset-assumptions');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => callbacks.onReset());
  }
}
