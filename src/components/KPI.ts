export interface KPIOptions {
  label: string;
  value: string;
  subtext?: string;
  pillText?: string;
  pillClass?: string; // 'badge-success' | 'badge-danger' | 'badge-warning' | 'badge-caution' | 'badge-primary' | 'badge-gray'
  tooltip?: string;
  icon?: string;
}

export function renderKPICard(options: KPIOptions): string {
  const pillHtml = options.pillText
    ? `<span class="kpi-pill ${options.pillClass || 'badge-primary'}">${options.pillText}</span>`
    : '';

  const tooltipHtml = options.tooltip
    ? `<div class="kpi-tooltip-trigger">
        ℹ️
        <div class="tooltip-box">${options.tooltip}</div>
      </div>`
    : '';

  return `
    <div class="kpi-card">
      <div class="kpi-top">
        <span class="kpi-label">${options.label}</span>
        ${tooltipHtml}
      </div>
      <div class="kpi-value">${options.value}</div>
      <div class="kpi-subtext">
        ${pillHtml}
        <span>${options.subtext || ''}</span>
      </div>
    </div>
  `;
}
