const router = require('express').Router();
const fetch = require('node-fetch');
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = 'anthropic/claude-3-5-sonnet-20241022';
const SYSTEM = 'You are an expert competitive intelligence analyst with deep expertise in market strategy, sales, and technology trends. Provide detailed, actionable competitive intelligence.';

function _noKey() {
  return !OPENROUTER_API_KEY || OPENROUTER_API_KEY.trim() === '' || OPENROUTER_API_KEY === 'your-openrouter-api-key';
}

async function callOpenRouter(prompt) {
  if (_noKey()) {
    const err = new Error('OpenRouter API key not configured (set OPENROUTER_API_KEY)');
    err.statusCode = 503;
    throw err;
  }
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Competitive Analysis Tool'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 3000
    })
  });
  const data = await response.json();
  if (!data.choices || !data.choices[0]) throw new Error('Invalid AI response: ' + JSON.stringify(data));
  const content = data.choices[0].message.content;
  const tokensUsed = data.usage?.total_tokens || null;
  let parsed;
  try { parsed = JSON.parse(content); } catch {
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
    try { parsed = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content); }
    catch { parsed = { analysis: content }; }
  }
  return { result: parsed, model: data.model || MODEL, tokensUsed };
}

async function persistAnalysis(userId, analysisType, inputParams, result, model, tokensUsed) {
  try {
    const r = await pool.query(
      `INSERT INTO ai_analyses (user_id, analysis_type, input_params, result, model, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at`,
      [userId || null, analysisType, JSON.stringify(inputParams), JSON.stringify(result), model, tokensUsed]
    );
    return r.rows[0];
  } catch (e) {
    console.error('Failed to persist AI analysis:', e.message);
    return null;
  }
}

// POST /api/ai/battle-card
// Body: { our_company, competitor_name, deal_context }
router.post('/battle-card', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { our_company, competitor_name, deal_context } = req.body;
    if (!our_company || !competitor_name) {
      return res.status(400).json({ error: 'our_company and competitor_name are required' });
    }

    const { result, model, tokensUsed } = await callOpenRouter(
      `Create a detailed sales battle card for "${our_company}" competing against "${competitor_name}".
Deal context: ${deal_context || 'general competitive situation'}.

Return JSON with:
- executive_summary: 2-sentence overview of competitive positioning
- our_strengths: array of {strength, proof_point, how_to_use_in_sales}
- competitor_weaknesses: array of {weakness, how_to_expose, evidence}
- common_objections: array of {objection, our_response, trap_to_avoid}
- landmines: array of {topic, what_competitor_says, our_counter}
- discovery_questions: array of questions to ask prospects to expose competitor weaknesses
- proof_points: array of {claim, supporting_evidence, when_to_use}
- pricing_positioning: how to handle pricing comparisons
- when_we_win: conditions/scenarios where we typically beat this competitor
- when_we_lose: honest assessment of when competitor wins and why
- key_differentiators: array of {differentiator, importance (high/medium/low), proof}
- talk_track: suggested elevator pitch vs this competitor`
    );

    const stored = await persistAnalysis(req.user?.id, 'battle-card', { our_company, competitor_name, deal_context }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
});

// POST /api/ai/win-loss-analysis
// Body: { deals: [{competitor, outcome, deal_size, industry, notes}, ...] }
router.post('/win-loss-analysis', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { deals } = req.body;
    if (!Array.isArray(deals) || deals.length === 0) {
      return res.status(400).json({ error: 'deals must be a non-empty array' });
    }

    const dealsText = deals.map((d, i) =>
      `Deal ${i + 1}: Competitor=${d.competitor || 'unknown'}, Outcome=${d.outcome || 'unknown'}, Size=$${d.deal_size || 'N/A'}, Industry=${d.industry || 'N/A'}, Notes=${d.notes || 'none'}`
    ).join('\n');

    const { result, model, tokensUsed } = await callOpenRouter(
      `Analyze these win/loss deals to identify competitive patterns and strategy adjustments:

${dealsText}

Return JSON with:
- overall_win_rate: percentage
- win_rate_by_competitor: array of {competitor, wins, losses, win_rate, trend}
- win_patterns: array of {pattern, frequency, deals_affected, recommended_action}
- loss_patterns: array of {pattern, frequency, root_cause, recommended_fix}
- deal_size_analysis: {best_size_range, worst_size_range, insight}
- industry_performance: array of {industry, win_rate, key_factors}
- top_reasons_we_win: array of {reason, frequency}
- top_reasons_we_lose: array of {reason, frequency, is_fixable}
- strategy_adjustments: array of {adjustment, rationale, priority (high/medium/low), expected_impact}
- competitor_specific_strategies: array of {competitor, recommended_approach, key_messages}
- forecast: outlook based on patterns observed`
    );

    const stored = await persistAnalysis(req.user?.id, 'win-loss-analysis', { deals }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
});

// POST /api/ai/partner-ecosystem
// Body: { competitor_name }
router.post('/partner-ecosystem', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { competitor_name } = req.body;
    if (!competitor_name) return res.status(400).json({ error: 'competitor_name is required' });

    const { result, model, tokensUsed } = await callOpenRouter(
      `Analyze the partner ecosystem and channel strategy of "${competitor_name}".

Return JSON with:
- partner_network_overview: summary of their partner strategy
- technology_partners: array of {partner, type, integration_depth, strategic_value}
- channel_partners: array of {partner_type, geographic_focus, revenue_contribution_estimate, exclusivity}
- reseller_program: {structure, tiers, incentives, strengths, weaknesses}
- marketplace_presence: array of {marketplace, listing_count_estimate, key_integrations}
- ecosystem_gaps: array of {gap, opportunity, difficulty_to_exploit}
- our_counter_strategy: array of {action, rationale, partners_to_target, priority}
- partner_poaching_opportunities: partners that could be flipped to our side with reasoning
- alliance_opportunities: potential partners to lock up before competitor does
- ecosystem_strength_score: number 1-10 with explanation`
    );

    const stored = await persistAnalysis(req.user?.id, 'partner-ecosystem', { competitor_name }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
});

// POST /api/ai/technology-radar
// Body: { competitors: [name, ...] }
router.post('/technology-radar', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { competitors } = req.body;
    if (!Array.isArray(competitors) || competitors.length === 0) {
      return res.status(400).json({ error: 'competitors must be a non-empty array of competitor names' });
    }

    const { result, model, tokensUsed } = await callOpenRouter(
      `Analyze technology adoption trends and innovation gaps across these competitors: ${competitors.join(', ')}.

Return JSON with:
- technology_landscape: overview of tech trends in this competitive space
- competitor_tech_profiles: array of {competitor, core_technologies (array), ai_ml_investments, cloud_infrastructure, dev_tooling, tech_debt_indicators}
- technology_adoption_matrix: array of {technology, ${competitors.map(c => `${c.replace(/[^a-zA-Z0-9]/g, '_')}_adoption`).join(', ')}, industry_average, trend}
- innovation_gaps: array of {gap, which_competitors_missing, opportunity_size, time_to_exploit}
- emerging_technologies: array of {technology, adoption_stage (research/pilot/production), who_leading, strategic_implications}
- build_vs_buy_patterns: how competitors approach technology acquisition
- patent_activity_summary: areas of likely IP concentration
- talent_technology_signals: what hiring patterns reveal about tech investments
- our_technology_recommendations: array of {technology, action (invest/watch/avoid), rationale, urgency}
- radar_quadrants: {adopt: [], trial: [], assess: [], hold: []} of technologies`
    );

    const stored = await persistAnalysis(req.user?.id, 'technology-radar', { competitors }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
});

// POST /api/ai/analyze-competitors  (audit gap)
// Body: { our_company, competitors: [{name, focus_areas?}], focus? }
router.post('/analyze-competitors', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { our_company, competitors, focus } = req.body;
    if (!our_company || !Array.isArray(competitors) || competitors.length === 0) {
      return res.status(400).json({ error: 'our_company and a non-empty competitors array are required' });
    }
    const compText = competitors.map((c, i) => `${i + 1}. ${c.name}${c.focus_areas ? ` (focus: ${c.focus_areas})` : ''}`).join('\n');
    const { result, model, tokensUsed } = await callOpenRouter(
      `Perform a comparative SWOT and market-positioning analysis for "${our_company}" vs. these competitors:

${compText}

Optional analysis focus: ${focus || 'overall product/market fit'}.

Return JSON with:
- swot: {our_strengths, our_weaknesses, opportunities, threats}
- per_competitor: array of {name, positioning, strengths, weaknesses, threat_level (low/medium/high)}
- market_segments: array of {segment, leader, challenger, our_position}
- competitive_moats: array of {moat, holder, durability}
- recommended_actions: array of {action, rationale, priority (high/medium/low), time_horizon}`
    );
    const stored = await persistAnalysis(req.user?.id, 'analyze-competitors', { our_company, competitors, focus }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
});

// POST /api/ai/predict-market-shift  (audit gap)
// Body: { market, signals: [string], horizon_months? }
router.post('/predict-market-shift', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { market, signals, horizon_months } = req.body;
    if (!market) return res.status(400).json({ error: 'market is required' });
    const signalsText = Array.isArray(signals) && signals.length ? signals.map((s, i) => `- ${s}`).join('\n') : '(no specific signals provided)';
    const horizon = Number(horizon_months) || 12;
    const { result, model, tokensUsed } = await callOpenRouter(
      `Predict shifts in the "${market}" market over the next ${horizon} months given these signals:

${signalsText}

Return JSON with:
- market_summary: high-level current state
- predicted_shifts: array of {shift, probability (0-1), drivers, time_to_materialize_months, impact (low/medium/high)}
- emerging_winners: array of {company_or_product, why}
- emerging_losers: array of {company_or_product, why}
- inflection_points: array of {trigger_event, watch_for}
- recommended_actions: array of {action, rationale, priority}
- monitoring_metrics: array of {metric, source, target_threshold}`
    );
    const stored = await persistAnalysis(req.user?.id, 'predict-market-shift', { market, signals, horizon_months: horizon }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
});

// POST /api/ai/synthesize-intelligence  (audit gap)
// Body: { intel_items: [string], focus_question?, our_company? }
router.post('/synthesize-intelligence', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { intel_items, focus_question, our_company } = req.body;
    if (!Array.isArray(intel_items) || intel_items.length === 0) {
      return res.status(400).json({ error: 'intel_items must be a non-empty array' });
    }
    const itemsText = intel_items.map((it, i) => `${i + 1}. ${typeof it === 'string' ? it : JSON.stringify(it)}`).join('\n');
    const { result, model, tokensUsed } = await callOpenRouter(
      `Synthesize the following competitive intelligence items into a coherent insight brief${our_company ? ` for "${our_company}"` : ''}.

${focus_question ? `Focus question: ${focus_question}` : ''}

Items:
${itemsText}

Return JSON with:
- key_insights: array of {insight, supporting_items_indices (array), confidence (low/medium/high)}
- contradictions: array of {topic, conflicting_items_indices, resolution_suggestion}
- gaps: array of intelligence gaps that need filling
- recommended_actions: array of {action, owner_function (sales/product/marketing), priority}
- executive_summary: 3-5 sentences of the overall picture
- monitoring_recommendations: array of {what_to_watch, frequency}`
    );
    const stored = await persistAnalysis(req.user?.id, 'synthesize-intelligence', { intel_items, focus_question, our_company }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
});

// POST /api/ai/vertical-benchmarking  (audit backlog: vertical-industry benchmarking)
// Body: { our_company, vertical, our_metrics?: {revenue?, growth?, gross_margin?, churn?, nps?}, peers?: [string], region? }
router.post('/vertical-benchmarking', authMiddleware, aiLimiter, async (req, res) => {
  try {
    const { our_company, vertical, our_metrics, peers, region } = req.body || {};
    if (!our_company || !vertical) {
      return res.status(400).json({ error: 'our_company and vertical are required' });
    }
    const peersText = Array.isArray(peers) && peers.length ? peers.join(', ') : '(infer typical peers for this vertical)';
    const metricsText = our_metrics && typeof our_metrics === 'object'
      ? Object.entries(our_metrics).map(([k, v]) => `- ${k}: ${v}`).join('\n')
      : '(no internal metrics supplied)';
    const { result, model, tokensUsed } = await callOpenRouter(
      `Benchmark "${our_company}" against vertical-industry peers in the "${vertical}" sector${region ? ` (region: ${region})` : ''}.

Peers to weigh: ${peersText}

Our metrics:
${metricsText}

Return JSON with:
- vertical_overview: 2-3 sentence state of the vertical
- benchmark_table: array of {metric, our_value, vertical_median_estimate, top_quartile_estimate, gap_assessment}
- relative_position: {percentile_estimate (0-100), strengths, weaknesses}
- top_performers: array of {company, why_they_lead, transferable_practices}
- vertical_specific_kpis: array of {kpi, why_it_matters_in_this_vertical, where_we_likely_stand}
- regulatory_or_compliance_factors: array of {factor, impact_on_benchmarks}
- risk_flags: array of {risk, severity (low/medium/high), mitigation}
- recommended_initiatives: array of {initiative, expected_uplift, time_horizon, priority (high/medium/low)}
- monitoring_metrics: array of {metric, source_or_proxy, target}`
    );
    const stored = await persistAnalysis(req.user?.id, 'vertical-benchmarking', { our_company, vertical, our_metrics, peers, region }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) {
    res.status(e.statusCode || 500).json({ error: e.message });
  }
});

module.exports = router;
