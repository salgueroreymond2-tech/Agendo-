import { ModelAssumptions } from './data/defaultAssumptions';
import {
  loadSavedAssumptions,
  saveAssumptions,
  resetToDefaultAssumptions,
} from './utils/storage';
import {
  exportToExcel,
  exportToPDF,
  exportSimulationToCSV,
  exportScenarioToJSON,
} from './utils/exports';
import { showToast } from './utils/notifications';
import { simulateCashFlow } from './engine/simulator';
import { renderSidebar } from './components/Sidebar';
import { renderHeader } from './components/Header';
import { attachControlsListeners } from './components/Controls';

// Páginas
import { renderDashboardPage, initDashboardCharts } from './pages/Dashboard';
import { renderUnitEconomicsPage } from './pages/UnitEconomics';
import { renderAcquisitionPage, initAcquisitionCharts } from './pages/Acquisition';
import { renderPaybackPage, initPaybackCharts } from './pages/PaybackPage';
import { renderCashSimulatorPage, initCashSimulatorCharts } from './pages/CashSimulator';
import { renderScenariosPage, initScenariosCharts } from './pages/Scenarios';
import { renderStrategyPage, initStrategyCharts } from './pages/Strategy';
import { renderAdvisorPage } from './pages/AdvisorPage';
import { renderCaseDataPage } from './pages/CaseDataPage';

export class App {
  private assumptions: ModelAssumptions;
  private currentRoute: string = 'dashboard';
  private strategyMode: 'fixed' | 'variable' = 'fixed';

  constructor() {
    this.assumptions = loadSavedAssumptions();
  }

  public init(): void {
    // Escuchar cambios de hash para enrutamiento
    window.addEventListener('hashchange', () => {
      this.handleHashChange();
    });

    // Leer ruta inicial
    this.handleHashChange();
  }

  private handleHashChange(): void {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.currentRoute = hash;
    this.render();
  }

  public setRoute(route: string): void {
    window.location.hash = route;
  }

  private updateAssumptions(partial: Partial<ModelAssumptions>): void {
    this.assumptions = { ...this.assumptions, ...partial };
    saveAssumptions(this.assumptions);
    this.render();
  }

  private resetAssumptions(): void {
    this.assumptions = resetToDefaultAssumptions();
    this.render();
  }

  public render(): void {
    const root = document.getElementById('app');
    if (!root) return;

    const sim = simulateCashFlow(this.assumptions);

    // Determinar título y subtítulo de la página
    let pageTitle = 'Executive Dashboard';
    let pageSubtitle = 'Visión de alto nivel para Ricardo Méndez y Valeria Ortiz';

    switch (this.currentRoute) {
      case 'unit-economics':
        pageTitle = 'Unit Economics & Márgenes';
        pageSubtitle = 'Análisis unitario de ingresos, contribución y costos comerciales';
        break;
      case 'acquisition':
        pageTitle = 'Adquisición, Funnel & Rendimientos Decrecientes';
        pageSubtitle = 'Rendimiento de pauta publicitaria, canales y costo comercial';
        break;
      case 'payback':
        pageTitle = 'Payback & Curvas de Recuperación de Caja';
        pageSubtitle = 'Curvas J del cliente mensual frente al plan anual';
        break;
      case 'simulator':
        pageTitle = 'Simulador de Caja (24 Meses)';
        pageSubtitle = 'Proyección determinista con protección estricta del piso de $10.000';
        break;
      case 'scenarios':
        pageTitle = 'Comparador de Escenarios Estratégicos';
        pageSubtitle = 'Comparación lado a lado: Situación actual ($10k) vs Valeria ($30k) vs Optimizada';
        break;
      case 'strategy':
        pageTitle = 'Optimizador Financiero de Presupuesto';
        pageSubtitle = 'Búsqueda determinista de la inversión que maximiza clientes sin insolvencia';
        break;
      case 'advisor':
        pageTitle = 'AI Financial Advisor (Inteligencia CFO)';
        pageSubtitle = 'Interpretación estratégica, pitch de inversión y consultorio determinista';
        break;
      case 'case-data':
        pageTitle = 'Datos y Configuración del Caso Original';
        pageSubtitle = 'Parámetros base, desglose de costos fijos e información de mercado';
        break;
      default:
        pageTitle = 'Executive Dashboard';
        pageSubtitle = 'Visión de alto nivel para Ricardo Méndez y Valeria Ortiz';
        break;
    }

    // Renderizar plantilla de la página
    let pageContentHtml = '';
    switch (this.currentRoute) {
      case 'unit-economics':
        pageContentHtml = renderUnitEconomicsPage(this.assumptions);
        break;
      case 'acquisition':
        pageContentHtml = renderAcquisitionPage(this.assumptions);
        break;
      case 'payback':
        pageContentHtml = renderPaybackPage(this.assumptions);
        break;
      case 'simulator':
        pageContentHtml = renderCashSimulatorPage(this.assumptions);
        break;
      case 'scenarios':
        pageContentHtml = renderScenariosPage(this.assumptions);
        break;
      case 'strategy':
        pageContentHtml = renderStrategyPage(this.assumptions, this.strategyMode);
        break;
      case 'advisor':
        pageContentHtml = renderAdvisorPage(this.assumptions);
        break;
      case 'case-data':
        pageContentHtml = renderCaseDataPage(this.assumptions);
        break;
      case 'dashboard':
      default:
        pageContentHtml = renderDashboardPage(this.assumptions);
        break;
    }

    root.innerHTML = `
      <div id="app-container">
        ${renderSidebar(this.currentRoute)}
        <div class="main-wrapper">
          ${renderHeader({
            title: pageTitle,
            subtitle: pageSubtitle,
            isViable: sim.isViable,
            minCash: sim.minCash,
          })}
          <main class="content-area">
            ${pageContentHtml}
          </main>
        </div>
      </div>
    `;

    // Vincular controladores y gráficos
    this.bindEvents();
    this.initCharts();
  }

  private bindEvents(): void {
    // Escuchar controles de sliders y valores
    attachControlsListeners({
      onUpdate: (partial) => this.updateAssumptions(partial),
      onReset: () => this.resetAssumptions(),
    });


    // Botón de reseteo en página de case-data
    const resetCaseDataBtn = document.getElementById('btn-reset-case-page');
    if (resetCaseDataBtn) {
      resetCaseDataBtn.onclick = () => this.resetAssumptions();
    }

    // Menú de exportación desplegable
    const exportBtn = document.getElementById('btn-export-menu');
    const exportMenu = document.getElementById('export-dropdown');
    if (exportBtn && exportMenu) {
      exportBtn.onclick = (e) => {
        e.stopPropagation();
        const isShown = exportMenu.style.display === 'flex';
        exportMenu.style.display = isShown ? 'none' : 'flex';
      };

      exportMenu.onclick = (e) => {
        e.stopPropagation();
      };

      document.addEventListener('click', () => {
        exportMenu.style.display = 'none';
      });
    }

    // Acciones de exportación
    const excelBtn = document.getElementById('export-excel-btn');
    if (excelBtn) {
      excelBtn.onclick = async () => {
        if (exportMenu) exportMenu.style.display = 'none';
        try {
          showToast('Generando reporte en Excel (.xlsx)...', 'info');
          const sim = simulateCashFlow(this.assumptions);
          await exportToExcel(this.assumptions, sim);
          showToast('Reporte Excel descargado con éxito', 'success');
        } catch (err: any) {
          console.error(err);
          showToast('Error al generar Excel: ' + (err?.message || err), 'error');
        }
      };
    }

    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) {
      pdfBtn.onclick = async () => {
        if (exportMenu) exportMenu.style.display = 'none';
        try {
          showToast('Generando reporte ejecutivo en PDF...', 'info');
          const sim = simulateCashFlow(this.assumptions);
          await exportToPDF(this.assumptions, sim);
          showToast('Reporte PDF descargado con éxito', 'success');
        } catch (err: any) {
          console.error(err);
          showToast('Error al generar PDF: ' + (err?.message || err), 'error');
        }
      };
    }

    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) {
      csvBtn.onclick = () => {
        if (exportMenu) exportMenu.style.display = 'none';
        try {
          const sim = simulateCashFlow(this.assumptions);
          exportSimulationToCSV(sim);
          showToast('Simulación CSV descargada con éxito', 'success');
        } catch (err: any) {
          console.error(err);
          showToast('Error al generar CSV: ' + (err?.message || err), 'error');
        }
      };
    }

    const jsonBtn = document.getElementById('export-json-btn');
    if (jsonBtn) {
      jsonBtn.onclick = () => {
        if (exportMenu) exportMenu.style.display = 'none';
        try {
          const sim = simulateCashFlow(this.assumptions);
          exportScenarioToJSON(this.assumptions, sim);
          showToast('Escenario JSON descargado con éxito', 'success');
        } catch (err: any) {
          console.error(err);
          showToast('Error al generar JSON: ' + (err?.message || err), 'error');
        }
      };
    }

    // Modos de estrategia en la página de optimizador
    const fixedModeBtn = document.getElementById('btn-opt-mode-fixed');
    const varModeBtn = document.getElementById('btn-opt-mode-variable');
    if (fixedModeBtn && varModeBtn) {
      fixedModeBtn.onclick = () => {
        this.strategyMode = 'fixed';
        this.render();
      };
      varModeBtn.onclick = () => {
        this.strategyMode = 'variable';
        this.render();
      };
    }

    // Botón para aplicar presupuesto óptimo
    const applyBudgetBtn = document.getElementById('btn-apply-optimal-budget');
    if (applyBudgetBtn) {
      applyBudgetBtn.onclick = () => {
        const targetBudget = parseFloat(applyBudgetBtn.getAttribute('data-budget') || '10000');
        this.updateAssumptions({ adInvestment: targetBudget });
      };
    }
  }

  private initCharts(): void {
    setTimeout(() => {
      switch (this.currentRoute) {
        case 'dashboard':
          initDashboardCharts(this.assumptions);
          break;
        case 'acquisition':
          initAcquisitionCharts(this.assumptions);
          break;
        case 'payback':
          initPaybackCharts(this.assumptions);
          break;
        case 'simulator':
          initCashSimulatorCharts(this.assumptions);
          break;
        case 'scenarios':
          initScenariosCharts(this.assumptions);
          break;
        case 'strategy':
          initStrategyCharts(this.assumptions, this.strategyMode);
          break;
      }
    }, 20);
  }
}
