export interface HeaderProps {
  title: string;
  subtitle: string;
  isViable: boolean;
  minCash: number;
}

export function renderHeader(props: HeaderProps): string {
  const viabilityPill = props.isViable
    ? `<span class="kpi-pill badge-success" style="font-size: 12px; padding: 4px 10px;">🛡️ Caja Segura (Mín: $${props.minCash.toFixed(0)})</span>`
    : `<span class="kpi-pill badge-danger" style="font-size: 12px; padding: 4px 10px;">⚠️ Alerta: Rompe Piso ($${props.minCash.toFixed(0)})</span>`;

  return `
    <header class="top-bar">
      <div class="top-bar-left">
        <div class="page-heading">
          <h1>${props.title}</h1>
          <p>${props.subtitle}</p>
        </div>
      </div>

      <div class="top-bar-right">
        ${viabilityPill}

        <div class="export-dropdown-wrapper">
          <button id="btn-export-menu" class="btn btn-primary btn-sm" type="button" aria-haspopup="true" aria-expanded="false" style="display: flex; align-items: center; gap: 6px;">
            <span>📥</span> <span>Exportar</span> <span style="font-size: 10px;">▼</span>
          </button>
          <div id="export-dropdown" class="export-dropdown-menu" style="display: none;">
            <button id="export-excel-btn" class="btn btn-secondary btn-sm" type="button">
              <span>📊</span> <span>Exportar Excel (.xlsx)</span>
            </button>
            <button id="export-pdf-btn" class="btn btn-secondary btn-sm" type="button">
              <span>📄</span> <span>Exportar PDF Ejecutivo</span>
            </button>
            <button id="export-csv-btn" class="btn btn-secondary btn-sm" type="button">
              <span>📈</span> <span>Exportar Simulación (.csv)</span>
            </button>
            <button id="export-json-btn" class="btn btn-secondary btn-sm" type="button">
              <span>📦</span> <span>Exportar Escenario (.json)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `;
}
