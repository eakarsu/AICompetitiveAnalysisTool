const fetch = require('node-fetch');

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
  try { return JSON.parse(content); } catch { return { analysis: content }; }
}

exports.analyzeCompetitor = async (req, res) => {
  try {
    const { competitor_name, competitor_url, industry, focus_areas } = req.body;
    const result = await callOpenRouter(`Analyze competitor "${competitor_name || competitor_url}" in ${industry || 'their industry'}. Focus: ${focus_areas || 'general'}. Return JSON with: company_overview, strengths (array), weaknesses (array), market_position, key_products (array with name, description, pricing), online_presence_score (0-100), technology_stack (array), content_strategy, social_media_presence, recommendations (array).`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generateSwot = async (req, res) => {
  try {
    const { company, industry, context } = req.body;
    const result = await callOpenRouter(`Generate SWOT analysis for "${company}" in ${industry || 'technology'}. Context: ${context || 'general'}. Return JSON with: strengths (array with item, details, impact_score), weaknesses (array with item, details, impact_score), opportunities (array with item, details, timeline, potential_value), threats (array with item, details, likelihood, mitigation), strategic_recommendations (array), competitive_advantage, overall_assessment.`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeMarket = async (req, res) => {
  try {
    const { industry, region, timeframe } = req.body;
    const result = await callOpenRouter(`Analyze ${industry} market in ${region || 'global'}. Timeframe: ${timeframe || 'current'}. Return JSON with: market_size, growth_rate, key_trends (array with trend, impact, timeline), major_players (array with name, market_share), opportunities (array), threats (array), entry_barriers (array), regulatory_factors (array), forecast.`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzePricing = async (req, res) => {
  try {
    const { product, competitors, market } = req.body;
    const result = await callOpenRouter(`Analyze pricing for "${product}" vs competitors: ${competitors || 'market average'}. Market: ${market || 'general'}. Return JSON with: price_positioning, competitor_prices (array with name, price, features), price_elasticity_estimate, recommended_price_range, pricing_strategy, discounting_recommendations, value_perception_score (0-100).`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.compareProducts = async (req, res) => {
  try {
    const { product1, product2, criteria } = req.body;
    const result = await callOpenRouter(`Compare products: "${product1}" vs "${product2}". Criteria: ${criteria || 'features, pricing, UX, support'}. Return JSON with: comparison_table (array with criterion, product1_score, product2_score, winner, notes), overall_winner, product1_advantages (array), product2_advantages (array), recommendation, target_audience_fit.`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeSocialMedia = async (req, res) => {
  try {
    const { brand, platforms, timeframe } = req.body;
    const result = await callOpenRouter(`Analyze social media presence for "${brand}" on ${platforms || 'all platforms'}. Timeframe: ${timeframe || 'recent'}. Return JSON with: overall_score (0-100), platform_breakdown (array with platform, followers_estimate, engagement_rate, content_frequency, top_content_types), sentiment_analysis, content_strategy, best_performing_content, improvement_areas (array), competitor_comparison.`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeTrends = async (req, res) => {
  try {
    const { industry, region, keywords } = req.body;
    const result = await callOpenRouter(`Analyze trends in ${industry} industry. Region: ${region || 'global'}. Keywords: ${keywords || 'general'}. Return JSON with: trending_topics (array with topic, growth_rate, relevance_score), emerging_technologies (array), consumer_behavior_shifts (array), market_predictions (array with prediction, confidence, timeframe), opportunities (array), risks (array).`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeReviews = async (req, res) => {
  try {
    const { product, review_source, sample_reviews } = req.body;
    const result = await callOpenRouter(`Analyze customer reviews for "${product}". Source: ${review_source || 'mixed'}. Sample: ${sample_reviews || 'general feedback'}. Return JSON with: overall_sentiment, sentiment_score (0-100), positive_themes (array with theme, frequency, quotes), negative_themes (array with theme, frequency, quotes), feature_requests (array), nps_estimate, improvement_priorities (array with priority, impact, effort).`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeSeo = async (req, res) => {
  try {
    const { url, keywords, competitors } = req.body;
    const result = await callOpenRouter(`Analyze SEO for "${url}". Target keywords: ${keywords || 'general'}. Competitors: ${competitors || 'industry average'}. Return JSON with: seo_score (0-100), keyword_rankings (array with keyword, estimated_position, difficulty, search_volume), technical_issues (array), content_gaps (array), backlink_profile_estimate, recommendations (array with action, priority, estimated_impact), competitor_comparison.`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.generateReport = async (req, res) => {
  try {
    const { company, report_type, data_points } = req.body;
    const result = await callOpenRouter(`Generate competitive analysis report for "${company}". Type: ${report_type || 'comprehensive'}. Data: ${data_points || 'general market data'}. Return JSON with: executive_summary, market_overview, competitive_landscape, swot_summary, key_findings (array), strategic_recommendations (array with recommendation, priority, timeline, expected_impact), risk_factors (array), conclusion.`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeAds = async (req, res) => {
  try {
    const { competitor, platforms, ad_type } = req.body;
    const result = await callOpenRouter(`Analyze advertising strategy of "${competitor}" on ${platforms || 'all platforms'}. Ad type: ${ad_type || 'all'}. Return JSON with: ad_spend_estimate, primary_channels (array), ad_formats (array with format, frequency, effectiveness), messaging_themes (array), target_audiences (array), creative_analysis, landing_page_strategy, recommendations (array).`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.analyzeHiring = async (req, res) => {
  try {
    const { company, roles, timeframe } = req.body;
    const result = await callOpenRouter(`Analyze hiring patterns of "${company}". Roles: ${roles || 'all departments'}. Timeframe: ${timeframe || 'recent'}. Return JSON with: hiring_velocity, top_departments (array with department, open_roles, growth_signal), key_roles (array with title, seniority, skills, what_it_signals), technology_investments (array), strategic_implications (array), expansion_areas (array), talent_strategy_assessment.`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.chat = async (req, res) => {
  try {
    const { message, context } = req.body;
    const result = await callOpenRouter(message, `You are an AI competitive analysis assistant. Help analyze competitors, markets, and business strategy. Context: ${context || 'general competitive analysis'}. Respond in JSON with: response, suggestions (array of follow-up questions), data_points (array of relevant metrics or facts).`);
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
