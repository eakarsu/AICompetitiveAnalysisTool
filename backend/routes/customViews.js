/**
 * Custom Views - Competitive Market Analysis
 *  - GET    /api/custom-views/feature-heatmap      (VIZ)
 *  - GET    /api/custom-views/market-share         (VIZ)
 *  - POST   /api/custom-views/intelligence-brief   (NON-VIZ : PDF)
 *  - GET/POST/PUT/DELETE /api/custom-views/tracked-rules  (NON-VIZ : CRUD)
 */
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
let pool = null; try { pool = require('../db'); } catch (_) { pool = null; }

let _tablesReady = false;
async function ensureTables() {
  if (_tablesReady) return;
  if (!pool || !pool.query) return;
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS tracked_competitor_rules (
      id SERIAL PRIMARY KEY,
      name VARCHAR(160) NOT NULL,
      competitor VARCHAR(160) NOT NULL,
      signal_type VARCHAR(80) NOT NULL,
      threshold VARCHAR(80),
      action VARCHAR(120),
      enabled BOOLEAN DEFAULT TRUE,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`);
    const r = await pool.query(`SELECT COUNT(*)::int AS c FROM tracked_competitor_rules`);
    if (r.rows[0].c === 0) {
      await pool.query(`INSERT INTO tracked_competitor_rules (name, competitor, signal_type, threshold, action, enabled, notes) VALUES
        ('Price drop alert', 'Acme Corp', 'price_change', '-10%', 'notify_sales', TRUE, 'Trigger on 10% drop in flagship SKU'),
        ('New product launch', 'Globex', 'launch', 'any', 'create_battlecard', TRUE, 'Spawn battlecard within 24h'),
        ('Funding event', 'Initech', 'funding', '>$20M', 'escalate_exec', TRUE, 'Notify executives on funding rounds'),
        ('Hiring spike', 'Umbrella', 'hiring', '+25%', 'monitor', FALSE, 'Watch hiring trend'),
        ('Negative review surge', 'Soylent', 'reviews', '<2.5', 'capture_quote', TRUE, 'Use in win-loss narratives');
      `);
    }
    _tablesReady = true;
  } catch (e) {
    console.warn('[customViews] ensureTables skipped:', e.message);
  }
}

// VIZ 1 -- Feature comparison heatmap (features x competitors with scores 0-100)
router.get('/feature-heatmap', auth, async (req, res) => {
  try {
    const features = ['AI Insights', 'Pricing Intel', 'SWOT', 'Social Listening', 'SEO Tracker', 'Ad Tracking', 'Battle Cards', 'API Access'];
    const competitors = ['Acme Corp', 'Globex', 'Initech', 'Umbrella', 'Soylent'];
    const matrix = features.map((f, i) =>
      competitors.map((c, j) => {
        const seed = (i * 31 + j * 17 + f.length + c.length) % 100;
        return Math.max(10, Math.min(98, seed + 15));
      })
    );
    res.json({
      ok: true,
      feature: 'feature-heatmap',
      features,
      competitors,
      matrix,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// VIZ 2 -- Market share donut
router.get('/market-share', auth, async (req, res) => {
  try {
    const segments = [
      { competitor: 'Acme Corp', share: 28.4, color: '#e94560' },
      { competitor: 'Globex',    share: 21.7, color: '#0f3460' },
      { competitor: 'Initech',   share: 17.2, color: '#16213e' },
      { competitor: 'Umbrella',  share: 12.8, color: '#f7b32b' },
      { competitor: 'Soylent',   share:  9.5, color: '#2bb673' },
      { competitor: 'Others',    share: 10.4, color: '#888888' },
    ];
    res.json({
      ok: true,
      feature: 'market-share',
      segments,
      total: segments.reduce((s, x) => s + x.share, 0),
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// NON-VIZ 1 -- Competitor intelligence brief PDF
router.post('/intelligence-brief', auth, async (req, res) => {
  try {
    const body = req.body || {};
    const competitor = body.competitor || 'Acme Corp';
    const focus = body.focus || 'general';
    let PDFDocument;
    try { PDFDocument = require('pdfkit'); } catch (_) {
      return res.status(503).json({ error: 'pdfkit module not installed' });
    }
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="intel-brief-${competitor.replace(/\s+/g,'_')}.pdf"`);
    doc.pipe(res);
    doc.fontSize(22).fillColor('#e94560').text('Competitor Intelligence Brief', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor('#000').text(`Competitor: ${competitor}`);
    doc.fontSize(12).fillColor('#444').text(`Focus area: ${focus}`);
    doc.fontSize(10).fillColor('#777').text(`Generated: ${new Date().toISOString()}`);
    doc.moveDown(1);
    const sections = [
      ['Overview', `${competitor} is an active player in the competitive landscape tracked by AICompetitiveAnalysisTool.`],
      ['Strengths', '- Established brand presence\n- Mature product line\n- Strong distribution network'],
      ['Weaknesses', '- Slower release cadence\n- Limited AI capabilities\n- Higher pricing'],
      ['Opportunities', '- Expansion into mid-market\n- AI-augmented offerings\n- Partnerships'],
      ['Threats', '- New entrants with disruptive pricing\n- Macroeconomic headwinds'],
      ['Recommended Actions', `1. Monitor ${competitor} pricing weekly\n2. Track hiring signals for org changes\n3. Refresh battlecards monthly`],
    ];
    sections.forEach(([h, txt]) => {
      doc.moveDown(0.6);
      doc.fontSize(13).fillColor('#0f3460').text(h);
      doc.fontSize(11).fillColor('#000').text(txt);
    });
    doc.end();
  } catch (err) {
    console.error('[intelligence-brief] error:', err.message);
    if (!res.headersSent) res.status(500).json({ error: err.message || 'Internal error' });
  }
});

// NON-VIZ 2 -- Tracked competitor rules (CRUD)
router.get('/tracked-rules', auth, async (req, res) => {
  try {
    await ensureTables();
    if (!pool || !pool.query) return res.json({ ok: true, rules: [], note: 'no-db' });
    const r = await pool.query(`SELECT * FROM tracked_competitor_rules ORDER BY id DESC`);
    res.json({ ok: true, rules: r.rows, count: r.rowCount });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

router.post('/tracked-rules', auth, async (req, res) => {
  try {
    await ensureTables();
    const b = req.body || {};
    if (!b.name || !b.competitor || !b.signal_type)
      return res.status(400).json({ error: 'name, competitor, signal_type required' });
    if (!pool || !pool.query)
      return res.status(503).json({ error: 'database unavailable' });
    const r = await pool.query(
      `INSERT INTO tracked_competitor_rules (name, competitor, signal_type, threshold, action, enabled, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [b.name, b.competitor, b.signal_type, b.threshold || null, b.action || null, b.enabled !== false, b.notes || null]
    );
    res.json({ ok: true, rule: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

router.put('/tracked-rules/:id', auth, async (req, res) => {
  try {
    await ensureTables();
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    if (!pool || !pool.query)
      return res.status(503).json({ error: 'database unavailable' });
    const b = req.body || {};
    const r = await pool.query(
      `UPDATE tracked_competitor_rules
       SET name=COALESCE($1,name), competitor=COALESCE($2,competitor),
           signal_type=COALESCE($3,signal_type), threshold=COALESCE($4,threshold),
           action=COALESCE($5,action), enabled=COALESCE($6,enabled),
           notes=COALESCE($7,notes), updated_at=NOW()
       WHERE id=$8 RETURNING *`,
      [b.name, b.competitor, b.signal_type, b.threshold, b.action,
       typeof b.enabled === 'boolean' ? b.enabled : null, b.notes, id]
    );
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true, rule: r.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

router.delete('/tracked-rules/:id', auth, async (req, res) => {
  try {
    await ensureTables();
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'invalid id' });
    if (!pool || !pool.query)
      return res.status(503).json({ error: 'database unavailable' });
    const r = await pool.query(`DELETE FROM tracked_competitor_rules WHERE id=$1 RETURNING id`, [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json({ ok: true, deleted_id: r.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

router.get('/health', (req, res) => {
  res.json({ feature: 'custom-views', endpoints: [
    'GET /feature-heatmap',
    'GET /market-share',
    'POST /intelligence-brief',
    'GET|POST|PUT|DELETE /tracked-rules'
  ]});
});

module.exports = router;
