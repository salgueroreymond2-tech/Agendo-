import {
  Chart,
  LineController,
  BarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
  ChartConfiguration,
} from 'chart.js';
import { MonthlySimulationRow } from '../engine/cashFlow';
import { CustomerCashCurve } from '../engine/payback';
import { HISTORICAL_ADS } from '../data/historicalAds';
import { interpolateTrials } from '../engine/interpolation';

Chart.register(
  LineController,
  BarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

// Map para rastrear instancias activas y destruirlas antes de recrear
const activeCharts: Map<string, Chart> = new Map();

export function destroyChart(canvasId: string): void {
  const existing = activeCharts.get(canvasId);
  if (existing) {
    existing.destroy();
    activeCharts.delete(canvasId);
  }
}

function getChartThemeColors() {
  return {
    text: '#4e6858',
    grid: 'rgba(20, 40, 29, 0.07)',
    forestPrimary: '#1c5230',
    forestFill: 'rgba(28, 82, 48, 0.12)',
    danger: '#b91c1c',
    amber: '#b45309',
    sage: '#3a6b4c',
    neutral: 'rgba(20, 40, 29, 0.3)',
  };
}

/**
 * 1. Gráfico de Pista de Caja a 24 Meses con Piso Crítico de $10.000
 */
export function renderCashFlowChart(
  canvasId: string,
  rows: MonthlySimulationRow[],
  cashFloor: number = 10000
): Chart | null {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return null;

  const colors = getChartThemeColors();
  const labels = rows.map((r) => `M${r.month}`);
  const cashData = rows.map((r) => r.endingCash);
  const floorData = rows.map(() => cashFloor);

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Caja al Final del Mes',
          data: cashData,
          borderColor: colors.forestPrimary,
          backgroundColor: colors.forestFill,
          fill: true,
          tension: 0.25,
          borderWidth: 2.5,
          pointRadius: 3.5,
          pointHoverRadius: 6,
          pointBackgroundColor: (ctx) => {
            const val = ctx.raw as number;
            return val < cashFloor ? colors.danger : colors.forestPrimary;
          },
        },
        {
          label: `Piso Crítico ($${cashFloor.toLocaleString()})`,
          data: floorData,
          borderColor: colors.danger,
          borderDash: [6, 4],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: colors.text, font: { size: 12, weight: 600 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw as number;
              return `${ctx.dataset.label}: $${val.toLocaleString('en-US', {
                maximumFractionDigits: 0,
              })}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 11 } },
        },
        y: {
          grid: { color: colors.grid },
          ticks: {
            color: colors.text,
            font: { size: 11 },
            callback: (v) => `$${Number(v).toLocaleString()}`,
          },
        },
      },
    },
  };

  const chart = new Chart(canvas, config);
  activeCharts.set(canvasId, chart);
  return chart;
}

/**
 * 2. Curvas de Caja del Cliente (Payback & J-Curve)
 */
export function renderPaybackChart(
  canvasId: string,
  monthlyCurve: CustomerCashCurve,
  annualCurve: CustomerCashCurve,
  hybridCurve?: CustomerCashCurve
): Chart | null {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return null;

  const colors = getChartThemeColors();
  const labels = monthlyCurve.points.map((p) => `M${p.month}`);
  const zeroData = monthlyCurve.points.map(() => 0);

  const datasets: any[] = [
    {
      label: 'Cliente Mensual ($25/mes)',
      data: monthlyCurve.points.map((p) => p.cumulativeCash),
      borderColor: colors.amber,
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      tension: 0.2,
      pointRadius: 2.5,
    },
    {
      label: 'Cliente Anual ($240 prepago + renovación 70%)',
      data: annualCurve.points.map((p) => p.cumulativeCash),
      borderColor: colors.forestPrimary,
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      tension: 0.1,
      pointRadius: 2.5,
    },
  ];

  if (hybridCurve) {
    datasets.push({
      label: 'Cliente Combinado / Propuesta Optimizada',
      data: hybridCurve.points.map((p) => p.cumulativeCash),
      borderColor: colors.sage,
      backgroundColor: 'transparent',
      borderDash: [4, 3],
      borderWidth: 2.5,
      pointRadius: 2.5,
    });
  }

  // Línea de Breakeven en $0
  datasets.push({
    label: 'Punto de Equilibrio ($0)',
    data: zeroData,
    borderColor: colors.neutral,
    borderDash: [5, 5],
    borderWidth: 1.5,
    pointRadius: 0,
    fill: false,
  });

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: colors.text, font: { size: 12, weight: 600 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw as number;
              return `${ctx.dataset.label}: $${val.toFixed(2)}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 11 } },
        },
        y: {
          grid: { color: colors.grid },
          ticks: {
            color: colors.text,
            font: { size: 11 },
            callback: (v) => `$${Number(v).toFixed(0)}`,
          },
        },
      },
    },
  };

  const chart = new Chart(canvas, config);
  activeCharts.set(canvasId, chart);
  return chart;
}

/**
 * 3. Curva de Inversión vs Trials (Rendimientos Decrecientes e Interpolación)
 */
export function renderAcquisitionCurveChart(
  canvasId: string,
  currentInvestment: number
): Chart | null {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return null;

  const colors = getChartThemeColors();
  const sampleInvestments: number[] = [];
  const sampleTrials: number[] = [];
  for (let inv = 0; inv <= 30000; inv += 1000) {
    sampleInvestments.push(inv);
    sampleTrials.push(interpolateTrials(inv));
  }

  const linearTrials = sampleInvestments.map((inv) => inv / 20);

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: {
      labels: sampleInvestments.map((inv) => `$${(inv / 1000).toFixed(0)}k`),
      datasets: [
        {
          label: 'Trials Reales (Historial e Interpolación)',
          data: sampleTrials,
          borderColor: colors.forestPrimary,
          backgroundColor: colors.forestFill,
          fill: true,
          tension: 0.1,
          borderWidth: 2.5,
          pointRadius: (ctx) => {
            const inv = sampleInvestments[ctx.dataIndex];
            const isHistorical = HISTORICAL_ADS.some((h) => h.investment === inv);
            const isCurrent = Math.abs(inv - currentInvestment) < 500;
            return isHistorical || isCurrent ? 5 : 0;
          },
          pointBackgroundColor: (ctx) => {
            const inv = sampleInvestments[ctx.dataIndex];
            if (Math.abs(inv - currentInvestment) < 500) return colors.danger;
            return colors.forestPrimary;
          },
        },
        {
          label: 'Fantasía del Freelancer (Sin saturación $20/trial)',
          data: linearTrials,
          borderColor: colors.neutral,
          borderDash: [5, 4],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: colors.text, font: { size: 12, weight: 600 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${Math.round(ctx.raw as number)} trials`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 11 } },
        },
        y: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 11 } },
        },
      },
    },
  };

  const chart = new Chart(canvas, config);
  activeCharts.set(canvasId, chart);
  return chart;
}

/**
 * 4. Gráfico de Comparación de Escenarios (A vs B vs C)
 */
export function renderScenarioBarChart(
  canvasId: string,
  scenarioLabels: string[],
  activeCustomersM24: number[],
  minCashLevels: number[]
): Chart | null {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return null;

  const colors = getChartThemeColors();

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: scenarioLabels,
      datasets: [
        {
          label: 'Clientes Activos al Mes 24',
          data: activeCustomersM24,
          backgroundColor: colors.forestPrimary,
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Caja Mínima en el Horizonte (USD)',
          data: minCashLevels,
          backgroundColor: (ctx) => {
            const val = ctx.raw as number;
            return val < 10000 ? colors.danger : colors.sage;
          },
          borderRadius: 6,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: colors.text, font: { size: 12, weight: 600 } },
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 11 } },
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          grid: { color: colors.grid },
          ticks: {
            color: colors.text,
            font: { size: 11 },
            callback: (v) => `${Number(v).toLocaleString()} clientes`,
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: {
            color: colors.text,
            font: { size: 11 },
            callback: (v) => `$${Number(v).toLocaleString()}`,
          },
        },
      },
    },
  };

  const chart = new Chart(canvas, config);
  activeCharts.set(canvasId, chart);
  return chart;
}

/**
 * 5. Gráfico de LTV vs CAC con líneas guía de 1:1 y 3:1
 */
export function renderLTVvsCACBarChart(
  canvasId: string,
  cacPaid: number,
  cacBlended: number,
  ltv24: number
): Chart | null {
  destroyChart(canvasId);
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return null;

  const colors = getChartThemeColors();

  const config: ChartConfiguration<'bar'> = {
    type: 'bar',
    data: {
      labels: ['CAC Paid (Real Anuncios)', 'CAC Blended (Con Orgánicos)', 'LTV a 24 Meses'],
      datasets: [
        {
          label: 'Valor en USD',
          data: [cacPaid, cacBlended, ltv24],
          backgroundColor: [
            colors.amber,         // CAC Paid (Terracotta/Amber)
            colors.sage,          // CAC Blended (Sage/Olive)
            colors.forestPrimary, // LTV24 (Forest Green)
          ],
          borderRadius: 8,
          barThickness: 50,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `$${Number(ctx.raw).toFixed(2)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: colors.grid },
          ticks: { color: colors.text, font: { size: 11 } },
        },
        y: {
          grid: { color: colors.grid },
          ticks: {
            color: colors.text,
            font: { size: 11 },
            callback: (v) => `$${Number(v).toFixed(0)}`,
          },
        },
      },
    },
  };

  const chart = new Chart(canvas, config);
  activeCharts.set(canvasId, chart);
  return chart;
}
