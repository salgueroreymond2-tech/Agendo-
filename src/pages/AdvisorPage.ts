import { ModelAssumptions } from '../data/defaultAssumptions';
import { generateAdvisorAnalysis } from '../engine/advisor';
import { renderControlsPanel } from '../components/Controls';


export function renderAdvisorPage(assumptions: ModelAssumptions): string {
  const analysis = generateAdvisorAnalysis(assumptions);

  const recomClass =
    analysis.recommendation === 'ESCALAR'
      ? 'recom-escalar'
      : analysis.recommendation === 'PAUSAR'
      ? 'recom-pausar'
      : 'recom-optimizar';

  return `
    <div class="advisor-page">
      <!-- Banner Principal de Inteligencia Financiera -->
      <div class="recommendation-banner ${recomClass}">
        <div class="recom-badge-large">${analysis.recommendation}</div>
        <div class="recom-content">
          <div class="recom-title">Dictamen del CFO: ${analysis.recommendationSubtitle}</div>
          <div class="recom-desc">${analysis.recommendationExplanation}</div>
        </div>
      </div>

      ${renderControlsPanel(assumptions, false)}

      <!-- El Pitch de 2 Minutos para Ricardo Méndez -->
      <div class="card" style="margin-bottom: 28px; border-left: 4px solid #1c4d2d; background: linear-gradient(135deg, rgba(28, 77, 45, 0.06), transparent);">
        <div class="card-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">🎙️</span>
            <div>
              <h3 class="card-title" style="color: #1c4d2d;">Pitch Ejecutivo de 2 Minutos para Ricardo Méndez</h3>
              <p class="card-subtitle">Argumentación directa para defender ante el inversionista ángel.</p>
            </div>
          </div>
          <span class="kpi-pill badge-primary">Para Comité Ejecutivo</span>
        </div>
        <div style="font-size: 14.5px; line-height: 1.8; color: var(--text-main); white-space: pre-line; background: var(--bg-card-subtle); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
${analysis.twoMinutePitch}
        </div>
      </div>

      <!-- Análisis Detallado de la Trampa de Valeria -->
      <div class="card" style="margin-bottom: 28px; border-left: 4px solid #b45309;">
        <div class="card-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 22px;">🕵️‍♂️</span>
            <div>
              <h3 class="card-title" style="color: #b45309;">La Trampa del Caso: El Número que Engaña al Dueño</h3>
              <p class="card-subtitle">Desmontando matemáticamente el informe del tercer trimestre.</p>
            </div>
          </div>
          <span class="kpi-pill badge-warning">Rigor Financiero</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-bottom: 16px;">
          <div style="padding: 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 12px; color: var(--text-dim); text-transform: uppercase;">Lo que dice Valeria:</span>
            <div style="font-size: 20px; font-weight: 800; color: #b91c1c; margin-top: 4px;">CAC $105 · LTV:CAC 2,4x</div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">«Cada dólar vuelve 2,4 veces. Tripliquemos ads a $30k».</p>
          </div>
          <div style="padding: 14px; background: var(--bg-card-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
            <span style="font-size: 12px; color: var(--text-dim); text-transform: uppercase;">La Realidad Matemática:</span>
            <div style="font-size: 20px; font-weight: 800; color: #1c4d2d; margin-top: 4px;">CAC Paid $180 · LTV:CAC 1,40x</div>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Los anuncios solo traen 70 clientes. 50 entran gratis por boca a boca.</p>
          </div>
        </div>
        <p style="font-size: 13.5px; color: var(--text-muted); line-height: 1.6;">
          ${analysis.theValeriaTrap.explanation}
        </p>
      </div>

      <!-- Consultorio del CFO: Preguntas Estratégicas y Respuestas Dinámicas -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">💡 Consultorio CFO: Respuestas Dinámicas a Preguntas Clave de Negocio</h3>
            <p class="card-subtitle">Todas las respuestas se calculan en vivo según los parámetros activos de la empresa.</p>
          </div>
          <span class="kpi-pill badge-emerald">Inteligencia Determinista</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${analysis.answers
            .map(
              (item) => `
            <div class="advisor-card">
              <div class="advisor-question">
                <span>${item.question}</span>
                ${
                  item.impactMetric
                    ? `<span class="kpi-pill badge-primary" style="font-size: 11px;">${item.impactMetric}</span>`
                    : ''
                }
              </div>
              <div class="advisor-answer">${item.answer}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}
