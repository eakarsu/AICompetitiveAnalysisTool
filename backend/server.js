require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Main API routes
app.use('/api', require('./routes/index'));

// Compliance agents - mounted under /api so aiLimiter applies consistently
app.use('/api/compliance-agents', require('./routes/complianceAgents'));

// New AI endpoints (battle-card, win-loss-analysis, partner-ecosystem, technology-radar)
app.use('/api/ai', require('./routes/aiNew'));






app.use('/api/ai', require('./routes/verticalBenchmark'));
app.use('/api/ai', require('./routes/realTimeAlerts'));
app.use('/api/ai', require('./routes/winLossAnalysis'));
app.use('/api/ai', require('./routes/maDetection'));
app.use('/api/ai', require('./routes/positioningDashboard'));
// Competitor monitoring schedules
app.use('/api/monitoring', require('./routes/monitoring'));

// Competitor profiles CRUD + full-profile aggregation
app.use('/api/competitors', require('./routes/competitors'));

// Export routes: PDF competitor report + CSV analyses
app.use('/api/export', require('./routes/export'));

// Custom Views - competitive market analysis (mounted BEFORE 404/error handler)
app.use('/api/custom-views', require('./routes/customViews'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.BACKEND_PORT || 3001;
// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-competitors-lacks-comparative-swot-or-positioning-ai-endpoin', require('./routes/gap_competitors_lacks_comparative_swot_or_positioning_ai_endpoin'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-monitoring-lacks-predictive-trend-market-shift-ai', require('./routes/gap_monitoring_lacks_predictive_trend_market_shift_ai'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-synthesize-intelligence-automated-insight-generation', require('./routes/gap_no_synthesize_intelligence_automated_insight_generation'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-ai-driven-sentiment-or-review-aggregation', require('./routes/gap_no_ai_driven_sentiment_or_review_aggregation'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-pricing-database-or-pricing-intelligence-module', require('./routes/gap_no_pricing_database_or_pricing_intelligence_module'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-deal-partnership-opportunity-tracker', require('./routes/gap_no_deal_partnership_opportunity_tracker'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-playbook-strategy-library', require('./routes/gap_no_playbook_strategy_library'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-webhooks-for-real-time-competitor-signal-ingestion', require('./routes/gap_no_webhooks_for_real_time_competitor_signal_ingestion'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-sms-or-payment-integration', require('./routes/gap_no_sms_or_payment_integration'));

// // === Batch 02 Gaps & Frontend Mounts ===
app.use('/api/gap-no-calendar-integration', require('./routes/gap_no_calendar_integration'));

app.listen(PORT, () => console.log(`AI Competitive Analysis Backend running on port ${PORT}`));
