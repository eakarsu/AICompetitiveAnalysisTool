# Audit Note — AICompetitiveAnalysisTool

Source: `_AUDIT/reports/batch_02.md`

## Maturity: TEMPLATE-CLONE (audit reports 6 routes, 0 AI endpoints)

The audit's "0 AI endpoints" claim is inaccurate; `routes/aiNew.js` already has
`/battle-card`, `/win-loss-analysis`, `/partner-ecosystem`, `/technology-radar` (4 endpoints).

## Original audit recommendations

### Gaps — missing AI counterparts
- `competitors.js` lacks `/analyze-competitors` (comparative SWOT, market positioning).
- `monitoring.js` lacks `/predict-market-shift` (trend detection).
- Missing `/synthesize-intelligence` for automated insight generation.

### Custom Feature Suggestions
- AI competitive positioning dashboard.
- Predictive M&A detection.
- Win/loss analysis automation (already implemented as `/win-loss-analysis`).
- Real-time alert engine.
- Vertical industry benchmarking.

## Categorization
- **MECHANICAL:** All three "missing AI counterparts" are direct additions to the existing aiNew.js pattern.
- **NEEDS-PRODUCT-DECISION:** Predictive M&A detection (data sourcing), real-time alerting.

## Implementations applied
1. **`backend/routes/aiNew.js`** — added three audit-specified AI endpoints following the existing pattern:
   - `POST /api/ai/analyze-competitors` — comparative SWOT + market positioning.
   - `POST /api/ai/predict-market-shift` — market shift prediction with probability/drivers.
   - `POST /api/ai/synthesize-intelligence` — synthesize multiple intel items into a coherent brief.

   Each uses the same OpenRouter wrapper, validation, and `persistAnalysis` ai_analyses pattern as the existing endpoints.

Syntax-checked with `node --check`.

## Backlog (prioritized)

### High priority
- **Real-time alert engine** — given the new `/predict-market-shift`, schedule periodic execution per saved query and emit notifications on threshold-cross.
- **Vertical-industry benchmarking** endpoint.

### Medium priority
- **M&A detection** — needs financial signal sources (Crunchbase, PitchBook, etc.).
- **Customer review/sentiment aggregation** — needs review-source connectors.

### Low priority
- White-label / per-tenant branding.
- Agentic competitor-monitoring orchestrator.

## Apply pass 3 (frontend)

LEFT-AS-IS. `frontend/src/pages/AIToolsPage.js` already exposes `analyze-competitors`, `predict-market-shift`, `synthesize-intelligence` (tabs match the pass-2 endpoints) and is registered at `/ai-tools` in `App.js`. JWT Bearer auth is provided by `services/api.js`; 503-no-key is surfaced via the existing `e.response?.data?.error` path. No FE files modified.
