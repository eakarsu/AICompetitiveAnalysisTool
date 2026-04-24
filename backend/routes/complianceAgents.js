const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
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
  try { return JSON.parse(content); } catch { return { analysis: content }; }
};

router.post('/scan-compliance', async (req, res) => {
  try {
    const { framework, scope, current_state } = req.body;
    const result = await callAI(`Scan for ${framework} compliance violations. Scope: ${scope}. Current state: ${current_state}. Return JSON with: compliance_score (0-100), violations (array with control_id, title, severity, description, remediation), compliant_areas (array), risk_level, executive_summary, immediate_actions (array).`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/generate-evidence', async (req, res) => {
  try {
    const { framework, control, requirement } = req.body;
    const result = await callAI(`Generate evidence requirements for ${framework} control: "${control}". Requirement: ${requirement}. Return JSON with: evidence_needed (array with title, type, description, priority), documentation_templates (array), testing_procedures (array), review_checklist (array), common_gaps (array).`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/remediation-plan', async (req, res) => {
  try {
    const { findings, framework, timeline } = req.body;
    const result = await callAI(`Create remediation plan for ${framework} findings: ${findings}. Timeline: ${timeline || '90 days'}. Return JSON with: remediation_steps (array with finding, action, owner, deadline, effort_hours, priority), total_effort_hours, risk_reduction_estimate, dependencies (array), milestones (array with date, milestone, deliverables), budget_estimate.`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
