const fetch = require('node-fetch');
const pool = require('../db');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

async function callOpenRouter(prompt, systemPrompt = '') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI Competitive Analysis Tool'
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ]
    })
  });
  const data = await response.json();
  const content = data.choices[0].message.content;
  const tokensUsed = data.usage?.total_tokens || null;
  let parsed;
  try { parsed = JSON.parse(content); } catch { parsed = { analysis: content }; }
  return { result: parsed, model: data.model || OPENROUTER_MODEL, tokensUsed };
}

// Persist AI result to DB and return the stored row
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

exports.analyzeCompetitor = async (req, res) => {
  try {
    const { competitor_name, competitor_url, industry, focus_areas } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze competitor "${competitor_name || competitor_url}" in ${industry || 'their industry'}. Focus: ${focus_areas || 'general'}. Return JSON with: company_overview, strengths (array), weaknesses (array), market_position, key_products (array with name, description, pricing), online_presence_score (0-100), technology_stack (array), content_strategy, social_media_presence, recommendations (array).`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-competitor', { competitor_name, competitor_url, industry, focus_areas }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generateSwot = async (req, res) => {
  try {
    const { company, industry, context } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Generate SWOT analysis for "${company}" in ${industry || 'technology'}. Context: ${context || 'general'}. Return JSON with: strengths (array with item, details, impact_score), weaknesses (array with item, details, impact_score), opportunities (array with item, details, timeline, potential_value), threats (array with item, details, likelihood, mitigation), strategic_recommendations (array), competitive_advantage, overall_assessment.`);
    const stored = await persistAnalysis(req.user?.id, 'generate-swot', { company, industry, context }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeMarket = async (req, res) => {
  try {
    const { industry, region, timeframe } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze ${industry} market in ${region || 'global'}. Timeframe: ${timeframe || 'current'}. Return JSON with: market_size, growth_rate, key_trends (array with trend, impact, timeline), major_players (array with name, market_share), opportunities (array), threats (array), entry_barriers (array), regulatory_factors (array), forecast.`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-market', { industry, region, timeframe }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzePricing = async (req, res) => {
  try {
    const { product, competitors, market } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze pricing for "${product}" vs competitors: ${competitors || 'market average'}. Market: ${market || 'general'}. Return JSON with: price_positioning, competitor_prices (array with name, price, features), price_elasticity_estimate, recommended_price_range, pricing_strategy, discounting_recommendations, value_perception_score (0-100).`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-pricing', { product, competitors, market }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.compareProducts = async (req, res) => {
  try {
    const { product1, product2, criteria } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Compare products: "${product1}" vs "${product2}". Criteria: ${criteria || 'features, pricing, UX, support'}. Return JSON with: comparison_table (array with criterion, product1_score, product2_score, winner, notes), overall_winner, product1_advantages (array), product2_advantages (array), recommendation, target_audience_fit.`);
    const stored = await persistAnalysis(req.user?.id, 'compare-products', { product1, product2, criteria }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeSocialMedia = async (req, res) => {
  try {
    const { brand, platforms, timeframe } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze social media presence for "${brand}" on ${platforms || 'all platforms'}. Timeframe: ${timeframe || 'recent'}. Return JSON with: overall_score (0-100), platform_breakdown (array with platform, followers_estimate, engagement_rate, content_frequency, top_content_types), sentiment_analysis, content_strategy, best_performing_content, improvement_areas (array), competitor_comparison.`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-social-media', { brand, platforms, timeframe }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeTrends = async (req, res) => {
  try {
    const { industry, region, keywords } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze trends in ${industry} industry. Region: ${region || 'global'}. Keywords: ${keywords || 'general'}. Return JSON with: trending_topics (array with topic, growth_rate, relevance_score), emerging_technologies (array), consumer_behavior_shifts (array), market_predictions (array with prediction, confidence, timeframe), opportunities (array), risks (array).`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-trends', { industry, region, keywords }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeReviews = async (req, res) => {
  try {
    const { product, review_source, sample_reviews } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze customer reviews for "${product}". Source: ${review_source || 'mixed'}. Sample: ${sample_reviews || 'general feedback'}. Return JSON with: overall_sentiment, sentiment_score (0-100), positive_themes (array with theme, frequency, quotes), negative_themes (array with theme, frequency, quotes), feature_requests (array), nps_estimate, improvement_priorities (array with priority, impact, effort).`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-reviews', { product, review_source, sample_reviews }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeSeo = async (req, res) => {
  try {
    const { url, keywords, competitors } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze SEO for "${url}". Target keywords: ${keywords || 'general'}. Competitors: ${competitors || 'industry average'}. Return JSON with: seo_score (0-100), keyword_rankings (array with keyword, estimated_position, difficulty, search_volume), technical_issues (array), content_gaps (array), backlink_profile_estimate, recommendations (array with action, priority, estimated_impact), competitor_comparison.`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-seo', { url, keywords, competitors }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generateReport = async (req, res) => {
  try {
    const { company, report_type, data_points } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Generate competitive analysis report for "${company}". Type: ${report_type || 'comprehensive'}. Data: ${data_points || 'general market data'}. Return JSON with: executive_summary, market_overview, competitive_landscape, swot_summary, key_findings (array), strategic_recommendations (array with recommendation, priority, timeline, expected_impact), risk_factors (array), conclusion.`);
    const stored = await persistAnalysis(req.user?.id, 'generate-report', { company, report_type, data_points }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeAds = async (req, res) => {
  try {
    const { competitor, platforms, ad_type } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze advertising strategy of "${competitor}" on ${platforms || 'all platforms'}. Ad type: ${ad_type || 'all'}. Return JSON with: ad_spend_estimate, primary_channels (array), ad_formats (array with format, frequency, effectiveness), messaging_themes (array), target_audiences (array), creative_analysis, landing_page_strategy, recommendations (array).`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-ads', { competitor, platforms, ad_type }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeHiring = async (req, res) => {
  try {
    const { company, roles, timeframe } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(`Analyze hiring patterns of "${company}". Roles: ${roles || 'all departments'}. Timeframe: ${timeframe || 'recent'}. Return JSON with: hiring_velocity, top_departments (array with department, open_roles, growth_signal), key_roles (array with title, seniority, skills, what_it_signals), technology_investments (array), strategic_implications (array), expansion_areas (array), talent_strategy_assessment.`);
    const stored = await persistAnalysis(req.user?.id, 'analyze-hiring', { company, roles, timeframe }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    const { result, model, tokensUsed } = await callOpenRouter(message, `You are an AI competitive analysis assistant. Help analyze competitors, markets, and business strategy. Context: ${context || 'general competitive analysis'}. Respond in JSON with: response, suggestions (array of follow-up questions), data_points (array of relevant metrics or facts).`);
    const stored = await persistAnalysis(req.user?.id, 'chat', { message, context }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// NEW: Sales battle card generator - top proposed feature
exports.generateBattleCard = async (req, res) => {
  try {
    const { our_company, competitor, our_strengths, deal_context } = req.body;
    if (!competitor) return res.status(400).json({ error: 'competitor is required' });

    const { result, model, tokensUsed } = await callOpenRouter(
      `Generate a sales battle card for reps facing "${competitor}" when selling for "${our_company || 'our company'}".
Our known strengths: ${our_strengths || 'not specified'}.
Deal context: ${deal_context || 'general competitive deal'}.

Return JSON with:
{
  "competitor_summary": "<2-sentence overview of competitor>",
  "their_strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "their_weaknesses": ["<weakness1>", "<weakness2>", "<weakness3>"],
  "our_advantages": ["<advantage1>", "<advantage2>", "<advantage3>"],
  "landmines": [{"topic": "<topic>", "what_they_say": "<their claim>", "how_to_counter": "<counter-argument>"}],
  "discovery_questions": ["<question to uncover their weaknesses>", "<question2>", "<question3>"],
  "proof_points": ["<customer success or data point>", "<proof2>"],
  "objection_handling": [{"objection": "<common objection>", "response": "<recommended response>"}],
  "closing_strategy": "<recommended closing approach>",
  "qualification_signals": ["<signal that you can win>", "<signal2>"],
  "red_flags": ["<signal that competitor will likely win>"]
}`
    );
    const stored = await persistAnalysis(req.user?.id, 'generate-battle-card', { our_company, competitor, our_strengths, deal_context }, result, model, tokensUsed);
    res.json({ ...result, _analysis_id: stored?.id, _generated_at: stored?.created_at });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET all AI analyses history for current user
exports.getAnalysisHistory = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [req.user.id];
    let whereExtra = '';
    if (type) { whereExtra = ' AND analysis_type = $2'; params.push(type); }
    const countR = await pool.query(`SELECT COUNT(*) FROM ai_analyses WHERE user_id = $1${whereExtra}`, params);
    const rows = await pool.query(
      `SELECT id, analysis_type, input_params, result, model, tokens_used, created_at
       FROM ai_analyses WHERE user_id = $1${whereExtra}
       ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );
    res.json({ data: rows.rows, total: parseInt(countR.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

// GET single analysis by ID
exports.getAnalysisById = async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM ai_analyses WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Analysis not found' });
    res.json(r.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
