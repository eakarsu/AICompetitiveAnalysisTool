const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');
const pool = require('../db');
const fetch = require('node-fetch');

router.use(authMiddleware);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

const callAI = async (prompt) => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Competitive Analysis - Compliance Audit'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await response.json();
  const content = data.choices[0].message.content;
  const tokensUsed = data.usage?.total_tokens || null;
  let parsed;
  try { parsed = JSON.parse(content); } catch { parsed = { analysis: content }; }
  return { result: parsed, model: data.model || OPENROUTER_MODEL, tokensUsed };
};

async function persistAnalysis(userId, analysisType, inputParams, result, model, tokensUsed) {
  try {
    const r = await pool.query(
      `INSERT INTO ai_analyses (user_id, analysis_type, input_params, result, model, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
      [userId || null, analysisType, JSON.stringify(inputParams), JSON.stringify(result), model, tokensUsed]
    );
    return r.rows[0];
  } catch (e) {
    console.error('Failed to persist compliance analysis:', e.message);
    return null;
  }
}

router.post('/scan-compliance', aiLimiter, async (req, res) => {
  try {
    const { framework, scope, current_state } = req.body;
    if (!framework) return res.status(400).json({ error: 'framework is required' });
    const { result, model, tokensUsed } = await callAI(`Scan for ${framework} compliance violations. Scope: ${scope}. Current state: ${current_state}. Return JSON with: compliance_score (0-100), violations (array with control_id, title, severity, description, remediation), compliant_areas (array), risk_level, executive_summary, immediate_actions (array).`);
    const stored = await persistAnalysis(req.user?.id, 'compliance-scan', { framework, scope, current_state }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/generate-evidence', aiLimiter, async (req, res) => {
  try {
    const { framework, control, requirement } = req.body;
    if (!framework || !control) return res.status(400).json({ error: 'framework and control are required' });
    const { result, model, tokensUsed } = await callAI(`Generate evidence requirements for ${framework} control: "${control}". Requirement: ${requirement}. Return JSON with: evidence_needed (array with title, type, description, priority), documentation_templates (array), testing_procedures (array), review_checklist (array), common_gaps (array).`);
    const stored = await persistAnalysis(req.user?.id, 'compliance-evidence', { framework, control, requirement }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/remediation-plan', aiLimiter, async (req, res) => {
  try {
    const { findings, framework, timeline } = req.body;
    if (!findings) return res.status(400).json({ error: 'findings is required' });
    const { result, model, tokensUsed } = await callAI(`Create remediation plan for ${framework} findings: ${findings}. Timeline: ${timeline || '90 days'}. Return JSON with: remediation_steps (array with finding, action, owner, deadline, effort_hours, priority), total_effort_hours, risk_reduction_estimate, dependencies (array), milestones (array with date, milestone, deliverables), budget_estimate.`);
    const stored = await persistAnalysis(req.user?.id, 'compliance-remediation', { findings, framework, timeline }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
