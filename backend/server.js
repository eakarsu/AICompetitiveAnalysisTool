require('dotenv').config({ path: '../.env' });
require('./config/runtime').validateRuntime();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Main API routes
app.use('/api', require('./routes/index'));
app.use('/api/intelligence', require('./routes/evidenceWorkflow'));

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
app.use('/api/share-of-voice', require('./routes/shareOfVoice'));

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
app.listen(PORT, () => console.log(`AI Competitive Analysis Backend running on port ${PORT}`));
