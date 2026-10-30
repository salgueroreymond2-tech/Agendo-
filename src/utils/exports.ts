import { SimulationSummary, MonthlySimulationRow } from '../engine/cashFlow';
import { ModelAssumptions } from '../data/defaultAssumptions';
import { calculateAcquisitionMetrics, calculateMarginalCAC } from '../engine/acquisition';
import { calculateUnitEconomics } from '../engine/unitEconomics';
import { calculateLTVMetrics } from '../engine/ltv';
import { generateAdvisorAnalysis } from '../engine/advisor';

/**
 * Descarga universal y segura de Blob en el navegador
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    if (a.parentNode) {
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * ============================================================
 * EXPORTAR A EXCEL (.xlsx)
 * Genera un workbook con 3 hojas:
 *   1. Simulación 24M (tabla completa mes a mes)
 *   2. Resumen Ejecutivo (KPIs clave)
 *   3. Supuestos del Modelo (configuración activa)
 * ============================================================
 */
export async function exportToExcel(
  assumptions: ModelAssumptions,
  simulation: SimulationSummary
): Promise<void> {
  const XLSX = await import('xlsx');

  // ----- Hoja 1: Simulación mes a mes -----
  const simHeaders = [
    'Mes',
    'Inversión Ads (USD)',
    'Trials',
    'Vendedoras',
    'Clientes Nuevos Ads',
    'Clientes Orgánicos',
    'Clientes Nuevos Totales',
    'Clientes Mensuales Activos',
    'Clientes Anuales Activos',
    'Clientes Activos Totales',
    'Entradas Margen (USD)',
    'Salidas Totales (USD)',
    'Flujo Neto (USD)',
    'Caja Final (USD)',
    'Alerta Liquidez (<$10k)',
  ];

  const simData = simulation.rows.map((r: MonthlySimulationRow) => [
    r.month,
    r.adInvestment,
    parseFloat(r.trials.toFixed(1)),
    r.salespeople,
    parseFloat(r.newPaidCustomers.toFixed(2)),
    r.newOrganicCustomers,
    parseFloat(r.totalNewCustomers.toFixed(2)),
    parseFloat(r.activeMonthlyCustomers.toFixed(2)),
    parseFloat(r.activeAnnualCustomers.toFixed(2)),
    parseFloat(r.totalActiveCustomers.toFixed(2)),
    parseFloat(r.totalCashIn.toFixed(2)),
    parseFloat(r.totalCashOut.toFixed(2)),
    parseFloat(r.netCashFlow.toFixed(2)),
    parseFloat(r.endingCash.toFixed(2)),
    r.isLiquidityBreached ? 'ALERTA: DÉFICIT' : 'OK',
  ]);

  const wsSimulation = XLSX.utils.aoa_to_sheet([simHeaders, ...simData]);

  // Column widths for readability
  wsSimulation['!cols'] = simHeaders.map((h: string) => ({
    wch: Math.max(h.length + 2, 16),
  }));

  // ----- Hoja 2: Resumen Ejecutivo -----
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const baseAcq = calculateAcquisitionMetrics(10000, assumptions);
  const marginalCAC = assumptions.adInvestment !== 10000 ? calculateMarginalCAC(baseAcq, acq) : null;
  const ue = calculateUnitEconomics(assumptions);
  const ltv = calculateLTVMetrics(
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    acq.cacPaid,
    acq.cacBlended,
    assumptions.simulationMonths
  );
  const advisor = generateAdvisorAnalysis(assumptions);

  const resumenData = [
    ['AGENDO FINANCIAL INTELLIGENCE', ''],
    ['Reporte Ejecutivo', new Date().toLocaleDateString('es-MX')],
    ['', ''],
    ['INDICADOR', 'VALOR'],
    ['Recomendación del Advisor', advisor.recommendation],
    ['Clientes Activos Iniciales', assumptions.initialActiveCustomers],
    ['Clientes Activos al Mes 24', simulation.finalActiveCustomers.toFixed(0)],
    ['Caja Inicial (USD)', assumptions.initialCash],
    ['Caja Final Mes 24 (USD)', simulation.finalCash.toFixed(2)],
    ['Caja Mínima (USD)', simulation.minCash.toFixed(2)],
    ['Mes de Caja Mínima', simulation.monthOfMinCash],
    ['Piso de Liquidez (USD)', assumptions.cashFloor],
    ['¿Viable? (Caja >= $10k)', simulation.isViable ? 'SÍ' : 'NO'],
    ['', ''],
    ['MÉTRICAS DE ADQUISICIÓN', ''],
    ['Inversión Publicitaria Mensual (USD)', assumptions.adInvestment],
    ['Trials Generados / Mes', acq.trials.toFixed(1)],
    ['Tasa de Conversión Trial → Paid', (assumptions.trialConversionRate * 100).toFixed(1) + '%'],
    ['Clientes Nuevos / Mes (Ads)', acq.paidCustomers.toFixed(1)],
    ['Clientes Orgánicos / Mes', acq.organicCustomers],
    ['CAC Paid (Real Anuncios)', acq.cacPaid !== null ? acq.cacPaid.toFixed(2) : 'N/A'],
    ['CAC Blended (Con Orgánicos)', acq.cacBlended !== null ? acq.cacBlended.toFixed(2) : 'N/A'],
    ['CAC Marginal', marginalCAC !== null ? marginalCAC.toFixed(2) : 'N/A'],
    ['', ''],
    ['UNIT ECONOMICS', ''],
    ['Precio Mensual (USD)', assumptions.monthlyPrice],
    ['Margen Bruto (%)', (assumptions.grossMargin * 100).toFixed(0) + '%'],
    ['Contribución Mensual por Cliente (USD)', ue.monthlyContribution.toFixed(2)],
    ['LTV a 24 Meses (USD)', ltv.ltv24.toFixed(2)],
    ['LTV : CAC Paid', ltv.ltvCacPaid !== null ? ltv.ltvCacPaid.toFixed(2) + 'x' : 'N/A'],
    ['LTV : CAC Blended', ltv.ltvCacBlended !== null ? ltv.ltvCacBlended.toFixed(2) + 'x' : 'N/A'],
    ['Churn Mensual (%)', (assumptions.monthlyChurn * 100).toFixed(1) + '%'],
    ['', ''],
    ['TOTALES ACUMULADOS (24M)', ''],
    ['Inversión Total en Ads (USD)', simulation.totalAdInvestment.toFixed(2)],
    ['Costo Total de Adquisición (USD)', simulation.totalAcquisitionCost.toFixed(2)],
    ['Contribución Total de Ingresos (USD)', simulation.totalRevenueContribution.toFixed(2)],
    ['Total de Clientes Adquiridos', simulation.totalNewCustomersAcquired.toFixed(0)],
  ];

  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  wsResumen['!cols'] = [{ wch: 42 }, { wch: 22 }];

  // ----- Hoja 3: Supuestos del Modelo -----
  const supuestosData = [
    ['SUPUESTOS DEL MODELO FINANCIERO', ''],
    ['Parámetro', 'Valor Configurado'],
    ['Clientes Activos Iniciales', assumptions.initialActiveCustomers],
    ['Caja Inicial (USD)', assumptions.initialCash],
    ['Piso de Caja (USD)', assumptions.cashFloor],
    ['Precio Mensual (USD)', assumptions.monthlyPrice],
    ['Precio Anual (USD)', assumptions.annualPrice],
    ['Margen Bruto (%)', (assumptions.grossMargin * 100).toFixed(0) + '%'],
    ['Churn Mensual (%)', (assumptions.monthlyChurn * 100).toFixed(1) + '%'],
    ['Inversión en Ads (USD/mes)', assumptions.adInvestment],
    ['Tasa de Conversión Trial → Paid', (assumptions.trialConversionRate * 100).toFixed(1) + '%'],
    ['Proporción Plan Anual (%)', (assumptions.annualPlanShare * 100).toFixed(0) + '%'],
    ['Clientes Orgánicos / Mes', assumptions.organicCustomersMonthly],
    ['Capacidad Vendedora (trials/mes)', assumptions.salespersonCapacity],
    ['Salario Base Vendedora (USD)', assumptions.salespersonSalary],
    ['Comisión por Conversión (USD)', assumptions.commissionPerPaidCustomer],
    ['Costos Fijos Totales (USD/mes)', assumptions.fixedCosts],
    ['Meses de Simulación', assumptions.simulationMonths],
    ['Tasa de Renovación Anual (%)', (assumptions.annualRenewalRate * 100).toFixed(0) + '%'],
  ];

  const wsSupuestos = XLSX.utils.aoa_to_sheet(supuestosData);
  wsSupuestos['!cols'] = [{ wch: 40 }, { wch: 22 }];

  // ----- Crear Workbook y Descargar -----
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSimulation, 'Simulación 24M');
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');
  XLSX.utils.book_append_sheet(wb, wsSupuestos, 'Supuestos');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const filename = `Agendo_Reporte_Financiero_${new Date().toISOString().slice(0, 10)}.xlsx`;
  downloadBlob(blob, filename);
}

/**
 * ============================================================
 * EXPORTAR A PDF
 * Genera un reporte ejecutivo PDF con:
 *   - Encabezado corporativo con branding
 *   - KPIs principales
 *   - Tabla de simulación 24 meses
 *   - Pie de página profesional
 * ============================================================
 */
export async function exportToPDF(
  assumptions: ModelAssumptions,
  simulation: SimulationSummary
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTableModule = await import('jspdf-autotable');
  const autoTable = autoTableModule.default || (autoTableModule as any).autoTable;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Colores corporativos (Forest Green + Beige)
  const green = { r: 28, g: 77, b: 45 };
  const darkGreen = { r: 18, g: 43, b: 30 };
  const beige = { r: 245, g: 239, b: 229 };
  const gold = { r: 212, g: 163, b: 75 };

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // === HEADER BAR ===
  doc.setFillColor(darkGreen.r, darkGreen.g, darkGreen.b);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Gold accent line
  doc.setFillColor(gold.r, gold.g, gold.b);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  // Título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('AGENDO FINANCIAL INTELLIGENCE', 14, 14);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 220, 200);
  doc.text('Reporte Ejecutivo CFO · Simulador Financiero a 24 Meses', 14, 22);

  // Fecha
  doc.setFontSize(9);
  doc.setTextColor(180, 200, 180);
  doc.text(
    `Generado: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageWidth - 14,
    14,
    { align: 'right' }
  );

  // === KPI SECTION ===
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const ue = calculateUnitEconomics(assumptions);
  const ltv = calculateLTVMetrics(
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    acq.cacPaid,
    acq.cacBlended,
    assumptions.simulationMonths
  );
  const advisor = generateAdvisorAnalysis(assumptions);

  let y = 36;

  // Recomendación badge
  const recomColor = advisor.recommendation === 'ESCALAR' ? green
    : advisor.recommendation === 'PAUSAR' ? { r: 185, g: 28, b: 28 }
    : { r: 180, g: 83, b: 9 };

  doc.setFillColor(recomColor.r, recomColor.g, recomColor.b);
  doc.roundedRect(14, y, 60, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`RECOMENDACIÓN: ${advisor.recommendation}`, 17, y + 5.5);

  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(advisor.recommendationSubtitle, 78, y + 5.5);

  y += 14;

  // KPI Cards Row
  const kpis = [
    { label: 'Caja Inicial', value: `$${assumptions.initialCash.toLocaleString()}` },
    { label: 'Caja Final M24', value: `$${simulation.finalCash.toFixed(0)}` },
    { label: 'Caja Mínima', value: `$${simulation.minCash.toFixed(0)} (M${simulation.monthOfMinCash})` },
    { label: 'Clientes M24', value: simulation.finalActiveCustomers.toFixed(0) },
    { label: 'CAC Paid', value: acq.cacPaid !== null ? `$${acq.cacPaid.toFixed(2)}` : 'N/A' },
    { label: 'CAC Blended', value: acq.cacBlended !== null ? `$${acq.cacBlended.toFixed(2)}` : 'N/A' },
    { label: 'LTV 24M', value: `$${ltv.ltv24.toFixed(2)}` },
    { label: 'LTV:CAC Paid', value: ltv.ltvCacPaid !== null ? `${ltv.ltvCacPaid.toFixed(2)}x` : 'N/A' },
    { label: 'Viable', value: simulation.isViable ? 'SÍ ✓' : 'NO ✗' },
  ];

  const kpiCardW = (pageWidth - 28 - (kpis.length - 1) * 3) / kpis.length;
  kpis.forEach((kpi, i) => {
    const x = 14 + i * (kpiCardW + 3);
    doc.setFillColor(beige.r, beige.g, beige.b);
    doc.roundedRect(x, y, kpiCardW, 16, 2, 2, 'F');
    doc.setDrawColor(200, 190, 170);
    doc.roundedRect(x, y, kpiCardW, 16, 2, 2, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text(kpi.label, x + kpiCardW / 2, y + 5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkGreen.r, darkGreen.g, darkGreen.b);
    doc.text(kpi.value, x + kpiCardW / 2, y + 12, { align: 'center' });
  });

  y += 22;

  // === SECTION TITLE ===
  doc.setFillColor(green.r, green.g, green.b);
  doc.rect(14, y, 3, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkGreen.r, darkGreen.g, darkGreen.b);
  doc.text('Proyección de Caja · 24 Meses', 20, y + 4.5);
  y += 10;

  // === TABLA DE SIMULACIÓN ===
  const tableHeaders = [
    'Mes', 'Inv. Ads', 'Trials', 'Vend.', 'Nuevos Ads',
    'Orgánicos', 'Total Nuevos', 'Activos', 'Entradas $',
    'Salidas $', 'Flujo Neto $', 'Caja Final $', 'Estado',
  ];

  const tableData = simulation.rows.map((r: MonthlySimulationRow) => [
    `M${r.month}`,
    `$${r.adInvestment.toLocaleString()}`,
    r.trials.toFixed(0),
    r.salespeople.toString(),
    r.newPaidCustomers.toFixed(1),
    r.newOrganicCustomers.toString(),
    r.totalNewCustomers.toFixed(1),
    r.totalActiveCustomers.toFixed(0),
    `$${r.totalCashIn.toFixed(0)}`,
    `$${r.totalCashOut.toFixed(0)}`,
    `$${r.netCashFlow.toFixed(0)}`,
    `$${r.endingCash.toFixed(0)}`,
    r.isLiquidityBreached ? '⚠️' : '✓',
  ]);

  const autoTableConfig = {
    head: [tableHeaders],
    body: tableData,
    startY: y,
    margin: { left: 14, right: 14 },
    theme: 'grid' as const,
    styles: {
      fontSize: 6.5,
      cellPadding: 1.5,
      lineColor: [200, 190, 170] as [number, number, number],
      lineWidth: 0.2,
      textColor: [30, 50, 35] as [number, number, number],
    },
    headStyles: {
      fillColor: [green.r, green.g, green.b] as [number, number, number],
      textColor: [255, 255, 255] as [number, number, number],
      fontStyle: 'bold' as const,
      fontSize: 6.5,
      halign: 'center' as const,
    },
    alternateRowStyles: {
      fillColor: [beige.r, beige.g, beige.b] as [number, number, number],
    },
    columnStyles: {
      0: { halign: 'center' as const, fontStyle: 'bold' as const },
      12: { halign: 'center' as const },
    },
    didParseCell: (data: any) => {
      // Highlight breach rows in red
      if (data.section === 'body' && data.column.index === 12) {
        const val = data.cell.raw;
        if (val === '⚠️') {
          data.cell.styles.textColor = [185, 28, 28];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  };

  if (typeof autoTable === 'function') {
    autoTable(doc, autoTableConfig);
  } else if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable(autoTableConfig);
  }

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(darkGreen.r, darkGreen.g, darkGreen.b);
    doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(180, 200, 180);
    doc.text('Agendo Financial Intelligence · Motor Determinista 100% Independiente · Caso B SaaS', 14, pageHeight - 4);
    doc.text(`Página ${p} de ${totalPages}`, pageWidth - 14, pageHeight - 4, { align: 'right' });
  }

  // Descargar mediante Blob universal
  const filename = `Agendo_Reporte_Ejecutivo_${new Date().toISOString().slice(0, 10)}.pdf`;
  const blob = doc.output('blob');
  downloadBlob(blob, filename);
}

/**
 * ============================================================
 * EXPORTAR A CSV
 * Descarga los 24 meses de la simulación en formato .csv estándar
 * ============================================================
 */
export function exportSimulationToCSV(simulation: SimulationSummary): void {
  const headers = [
    'Mes',
    'Inversion Ads (USD)',
    'Trials',
    'Vendedoras',
    'Clientes Nuevos Ads',
    'Clientes Organicos',
    'Clientes Nuevos Totales',
    'Clientes Mensuales Activos',
    'Clientes Anuales Activos',
    'Clientes Activos Totales',
    'Entradas Margen (USD)',
    'Salidas Totales (USD)',
    'Flujo Neto (USD)',
    'Caja Final (USD)',
    'Estado Liquidez (<$10k)',
  ];

  const rows = simulation.rows.map((r: MonthlySimulationRow) => [
    r.month,
    r.adInvestment,
    r.trials.toFixed(1),
    r.salespeople,
    r.newPaidCustomers.toFixed(2),
    r.newOrganicCustomers,
    r.totalNewCustomers.toFixed(2),
    r.activeMonthlyCustomers.toFixed(2),
    r.activeAnnualCustomers.toFixed(2),
    r.totalActiveCustomers.toFixed(2),
    r.totalCashIn.toFixed(2),
    r.totalCashOut.toFixed(2),
    r.netCashFlow.toFixed(2),
    r.endingCash.toFixed(2),
    r.isLiquidityBreached ? 'DEFICIT' : 'OK',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename = `Agendo_Simulacion_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadBlob(blob, filename);
}

/**
 * ============================================================
 * EXPORTAR ESCENARIO A JSON
 * Descarga supuestos y resultados en formato JSON
 * ============================================================
 */
export function exportScenarioToJSON(
  assumptions: ModelAssumptions,
  simulation: SimulationSummary
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    assumptions,
    simulationSummary: {
      finalCash: simulation.finalCash,
      minCash: simulation.minCash,
      monthOfMinCash: simulation.monthOfMinCash,
      finalActiveCustomers: simulation.finalActiveCustomers,
      totalNewCustomersAcquired: simulation.totalNewCustomersAcquired,
      totalAdInvestment: simulation.totalAdInvestment,
      totalAcquisitionCost: simulation.totalAcquisitionCost,
      totalRevenueContribution: simulation.totalRevenueContribution,
      isViable: simulation.isViable,
      firstBreachMonth: simulation.firstBreachMonth,
      firstBankruptcyMonth: simulation.firstBankruptcyMonth,
    },
    rows: simulation.rows,
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = `Agendo_Escenario_${new Date().toISOString().slice(0, 10)}.json`;
  downloadBlob(blob, filename);
}
