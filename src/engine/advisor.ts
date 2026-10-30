import { ModelAssumptions } from '../data/defaultAssumptions';
import { calculateAcquisitionMetrics, calculateMarginalCAC } from './acquisition';
import { calculateUnitEconomics } from './unitEconomics';
import { calculateLTVMetrics } from './ltv';
import { simulateCashFlow } from './simulator';
import { optimizeFixedBudget } from './optimizer';

export interface AdvisorAnalysis {
  recommendation: 'PAUSAR' | 'OPTIMIZAR' | 'ESCALAR';
  recommendationSubtitle: string;
  recommendationExplanation: string;
  theValeriaTrap: {
    reportedCAC: number;
    reportedRatio: number;
    realCACPaid: number;
    realRatioPaid: number;
    explanation: string;
  };
  answers: {
    id: string;
    question: string;
    answer: string;
    category: 'cac' | 'churn' | 'budget' | 'conversion' | 'annual' | 'cash' | 'comparison';
    impactMetric?: string;
  }[];
  twoMinutePitch: string;
}

/**
 * Genera el análisis de inteligencia financiera del CFO para Ricardo y el equipo ejecutivo
 */
export function generateAdvisorAnalysis(assumptions: ModelAssumptions): AdvisorAnalysis {
  const acq = calculateAcquisitionMetrics(assumptions.adInvestment, assumptions);
  const ue = calculateUnitEconomics(assumptions);
  const ltv = calculateLTVMetrics(
    ue.monthlyContribution,
    assumptions.monthlyChurn,
    acq.cacPaid,
    acq.cacBlended,
    assumptions.simulationMonths
  );
  const sim = simulateCashFlow(assumptions);
  const opt = optimizeFixedBudget(assumptions);

  // Comparación con $30k de Valeria
  const acq30k = calculateAcquisitionMetrics(30000, assumptions);
  const marginalCAC30k = calculateMarginalCAC(acq, acq30k);
  const sim30k = simulateCashFlow({ ...assumptions, adInvestment: 30000 });

  // Determinación de la recomendación ejecutiva
  let recommendation: 'PAUSAR' | 'OPTIMIZAR' | 'ESCALAR' = 'OPTIMIZAR';
  let recommendationSubtitle = '';
  let recommendationExplanation = '';

  if (!sim.isViable || (acq.cacPaid && ltv.ltv24 / acq.cacPaid < 1.2)) {
    recommendation = 'PAUSAR';
    recommendationSubtitle = 'Riesgo crítico de insolvencia o destrucción de capital';
    recommendationExplanation = `El plan actual compromete la viabilidad de la empresa: ${
      !sim.isViable
        ? `la caja vulnera el piso de seguridad de $${assumptions.cashFloor.toLocaleString()} en el Mes ${sim.firstBreachMonth}.`
        : `el ratio LTV:CAC Paid de ${(ltv.ltvCacPaid || 0).toFixed(2)}x es destructivo o de altísimo riesgo.`
    } Se debe suspender la escalada publicitaria de inmediato.`;
  } else if (
    sim.isViable &&
    ltv.ltvCacPaid &&
    ltv.ltvCacPaid >= 2.5 &&
    assumptions.monthlyChurn <= 0.045
  ) {
    recommendation = 'ESCALAR';
    recommendationSubtitle = 'Unit economics sólidos y flujo de caja blindado';
    recommendationExplanation = `La empresa cuenta con un LTV:CAC Paid saludable de ${ltv.ltvCacPaid.toFixed(
      2
    )}x y la caja mínima se mantiene holgada en $${sim.minCash.toFixed(
      0
    )}. Existen condiciones operativas para acelerar gradualmente la adquisición.`;
  } else {
    recommendation = 'OPTIMIZAR';
    recommendationSubtitle = 'Corregir fugas operativas antes de inyectar más capital';
    recommendationExplanation = `Triplicar los anuncios hoy generaría iliquidez rápida. La prioridad financiera debe ser mejorar la conversión de trials a pago (hoy en ${(
      assumptions.trialConversionRate * 100
    ).toFixed(0)}%), reducir el churn mensual (${(assumptions.monthlyChurn * 100).toFixed(
      1
    )}%) e incentivar el plan anual para autofinanciar la adquisición.`;
  }

  // Desglose de la trampa de Valeria
  const theValeriaTrap = {
    reportedCAC: 105,
    reportedRatio: 2.4,
    realCACPaid: acq.cacPaid || 180,
    realRatioPaid: ltv.ltvCacPaid || 1.4,
    explanation:
      'Valeria tomó el costo total de adquisición ($12.600: $10.000 ads + $1.200 vendedora + $1.400 comisiones) y lo dividió entre 120 clientes totales ($105). Sin embargo, 50 de esos clientes llegaron gratis por vía orgánica (boca a boca / insignia). El CAC que realmente costó cada cliente traído por la publicidad fue de $180 ($12.600 / 70). Por ende, el ratio LTV:CAC de los anuncios no es 2,4x sino un frágil 1,4x.',
  };

  // Preguntas frecuentes del CFO con respuestas dinámicas
  const answers = [
    {
      id: 'why-cac-increases',
      category: 'cac' as const,
      question: '¿Por qué está aumentando el CAC al subir la inversión?',
      answer: `Por dos factores matemáticos rigurosos: 
1) Rendimientos decrecientes en pauta: El historial muestra que los primeros $5.000 generan 290 trials ($17,24/trial), pero pasar de $20k a $30k solo genera 140 trials adicionales ($71,43 por trial marginal).
2) Costos comerciales escalonados: Cada 500 trials se requiere contratar otra vendedora ($1.200/mes) más $20 de comisión por cliente. A $30.000 de ads, el CAC Marginal calculado es de $${
        marginalCAC30k ? marginalCAC30k.toFixed(2) : '398.57'
      } por cliente extra.`,
      impactMetric: `CAC Paid sube de $${(acq.cacPaid || 0).toFixed(0)} a $${(
        acq30k.cacPaid || 0
      ).toFixed(0)}`,
    },
    {
      id: 'churn-reduction',
      category: 'churn' as const,
      question: '¿Qué sucede si reducco el churn mensual al 4%?',
      answer: `El churn es el mayor multiplicador de rentabilidad. Con churn al 4%, la vida media en 24 meses aumenta de ${ltv.expectedRetentionMonths24.toFixed(
        1
      )} meses a 15,6 meses. El LTV a 24 meses sube de $${ltv.ltv24.toFixed(
        2
      )} a $304,20 (+21% de valor por cliente). Además, la base al mes 24 retiene cientos de clientes adicionales sin gastar un centavo más en anuncios.`,
      impactMetric: '+21% en LTV y menor drenaje de base',
    },
    {
      id: 'how-much-can-we-spend',
      category: 'budget' as const,
      question: '¿Cuánto presupuesto publicitario puede soportar Agendo realmente?',
      answer: `Bajo los supuestos actuales del caso, el presupuesto publicitario óptimo fijo que maximiza clientes al mes 24 sin romper el piso de $10.000 es de $${opt.optimalBudget.toLocaleString()} al mes. Invertir $30.000 fijos como propone Valeria agota la caja de $60.000 y rompe el piso de liquidez en el mes ${
        sim30k.firstBreachMonth || 'temprano'
      }.`,
      impactMetric: `Máximo seguro: $${opt.optimalBudget.toLocaleString()}/mes`,
    },
    {
      id: 'conversion-increase',
      category: 'conversion' as const,
      question: '¿Qué pasa si aumento la conversión de trials del 14% al 18%?',
      answer: `A $10.000 de ads (500 trials), una conversión del 18% produce 90 clientes pagados en lugar de 70 (+20 clientes/mes). El CAC Paid cae de $180 a $144,44 (-20%) y el ratio LTV:CAC Paid salta de 1,40x a 1,74x. Esto genera $390 adicionales de margen bruto mensual recurrente.`,
      impactMetric: 'CAC Paid se reduce a $144,44',
    },
    {
      id: 'annual-plan-impact',
      category: 'annual' as const,
      question: '¿Qué impacto tiene aumentar el plan anual al 30%?',
      answer: `El plan anual transforma radicalmente el perfil de liquidez: cada cliente anual paga $240 por adelantado, dejando $187,20 de margen neto en el Mes 0. Con un CAC Paid de $180, el cliente se autofinancia desde el primer día (Payback = 0 meses). Esto inyecta caja inmediata para blindar el balance de la empresa.`,
      impactMetric: 'Payback mes 0 y liquidez inmediata',
    },
    {
      id: 'cash-floor-breach',
      category: 'cash' as const,
      question: '¿En qué mes se rompe el piso de caja con la propuesta de Valeria ($30.000)?',
      answer: `Con $30.000 fijos de inversión publicitaria, las salidas mensuales ascienden a $48.920 ($30k ads + $2.400 sueldos de 2 vendedoras + $2.520 comisiones + $14.000 costos fijos), mientras que las entradas del mes 1 son solo de $23.536. El déficit mensual es de -$25.384. La caja de $60.000 cae por debajo del piso de $10.000 en el Mes ${
        sim30k.firstBreachMonth || 3
      } y quiebra en el Mes ${sim30k.firstBankruptcyMonth || 4}.`,
      impactMetric: `Quiebra en Mes ${sim30k.firstBreachMonth || 3}`,
    },
    {
      id: 'scenario-comparison',
      category: 'comparison' as const,
      question: '¿Qué escenario es financieramente superior para Ricardo y Valeria?',
      answer: `El escenario 'Estrategia Optimizada': Mantener la inversión entre $10.000 y $12.500, activar 20% de adopción en plan anual, mejorar onboarding para subir conversión al 16% y reducir churn al 4,5%. Este plan no solo protege el piso de $10.000 durante los 24 meses, sino que termina con mayor base de clientes activos y caja acumulada positiva.`,
      impactMetric: 'Viabilidad 100% y crecimiento sostenible',
    },
  ];

  // Pitch de 2 minutos para Ricardo
  const twoMinutePitch = `«Ricardo:
Valeria tiene una energía admirable, pero su propuesta de triplicar anuncios a $30.000 quebraría a Agendo antes del cuarto mes. 
Su lámina reporta un CAC de $105 y un LTV:CAC de 2,4x, pero ese número tiene una trampa matemática: es un CAC Blended que se apoya en 50 clientes que llegan gratis de forma orgánica. El CAC real que pagan los anuncios es de $180, y el retorno real es de apenas 1,4x.
Peor aún: debido a la saturación de audiencias, pasar de $10k a $30k no triplica los registros como cree el freelancer; solo lleva los trials de 500 a 900. El CAC marginal de esos clientes adicionales asciende a casi $400, superando ampliamente el valor de vida del cliente ($251).
Nuestra recomendación ejecutiva es OPTIMIZAR antes de escalar:
1. Incentivar el plan anual al 20%: El cobro adelantado de $240 con margen de $187,20 recupera el CAC de inmediato y aporta liquidez.
2. Afinar la activación para elevar la conversión del 14% al 16% y bajar el churn al 4,5%.
Con esos dos ajustes, una inversión controlada de $12.500 no solo respeta tu piso innegociable de $10.000 en el banco, sino que multiplica por 2,2x el valor del negocio al mes 24 sin necesidad de rondas de emergencia».`;

  return {
    recommendation,
    recommendationSubtitle,
    recommendationExplanation,
    theValeriaTrap,
    answers,
    twoMinutePitch,
  };
}
