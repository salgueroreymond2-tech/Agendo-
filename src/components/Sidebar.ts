export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  section?: string;
}

export const NAV_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: '📊', section: 'Principal' },
  { id: 'unit-economics', label: 'Unit Economics & CAC', icon: '⚖️', section: 'Análisis Unitario' },
  { id: 'acquisition', label: 'Adquisición & Funnel', icon: '🎯', section: 'Análisis Unitario' },
  { id: 'payback', label: 'Payback & Curvas J', icon: '⏳', section: 'Análisis Unitario' },
  { id: 'simulator', label: 'Simulador de Caja (24M)', icon: '📈', section: 'Modelado Financiero' },
  { id: 'scenarios', label: 'Comparar Escenarios', icon: '🔀', section: 'Modelado Financiero' },
  { id: 'strategy', label: 'Optimizador de Presupuesto', icon: '🚀', section: 'Estrategia' },
  { id: 'advisor', label: 'AI Financial Advisor', icon: '🧠', section: 'Estrategia' },
  { id: 'case-data', label: 'Datos del Caso Original', icon: '📁', section: 'Referencia' },
];

export function renderSidebar(activeId: string): string {
  let currentSection = '';
  let itemsHtml = '';

  for (const item of NAV_ITEMS) {
    if (item.section && item.section !== currentSection) {
      currentSection = item.section;
      itemsHtml += `<div class="nav-section-title">${currentSection}</div>`;
    }

    const isActive = item.id === activeId;
    itemsHtml += `
      <a class="nav-item ${isActive ? 'active' : ''}" data-nav="${item.id}" href="#${item.id}">
        <span style="font-size: 16px;">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `;
  }

  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-badge">⚡ FinTech Intelligence</div>
        <div class="brand-title">AGENDO <span class="accent">FINANCIAL</span></div>
        <div class="brand-subtitle">Performance & Growth Simulator</div>
      </div>

      <nav class="sidebar-nav">
        ${itemsHtml}
      </nav>

      <div class="sidebar-footer">
        <div style="font-size: 11.5px; color: var(--text-dim); display: flex; align-items: center; justify-content: space-between;">
          <span>Caso B · Agendo SaaS</span>
          <span style="color: #10b981;">v1.0.0</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">
          Motor determinista 100% independiente
        </div>
      </div>
    </aside>
  `;
}
