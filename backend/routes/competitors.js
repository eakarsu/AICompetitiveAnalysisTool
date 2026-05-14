const router = require('express').Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Ensure extended competitor profile columns exist (safe ALTER TABLE)
async function ensureColumns() {
  const cols = [
    `ALTER TABLE competitors ADD COLUMN IF NOT EXISTS founded_year INTEGER`,
    `ALTER TABLE competitors ADD COLUMN IF NOT EXISTS pricing_model VARCHAR(255)`,
    `ALTER TABLE competitors ADD COLUMN IF NOT EXISTS key_products_arr JSONB DEFAULT '[]'`
  ];
  for (const sql of cols) {
    try { await pool.query(sql); } catch (e) { /* ignore */ }
  }
}

// GET /api/competitors?page=1&limit=20&status=active
router.get('/', authMiddleware, async (req, res) => {
  try {
    await ensureColumns();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const statusFilter = req.query.status;

    let where = '';
    const params = [limit, offset];
    if (statusFilter) {
      where = 'WHERE status = $3';
      params.push(statusFilter);
    }

    const countR = await pool.query(`SELECT COUNT(*) FROM competitors ${where}`, statusFilter ? [statusFilter] : []);
    const total = parseInt(countR.rows[0].count);

    const r = await pool.query(
      `SELECT * FROM competitors ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      params
    );

    res.json({
      data: r.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/competitors/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    await ensureColumns();
    const r = await pool.query('SELECT * FROM competitors WHERE id = $1', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Competitor not found' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/competitors/:id/full-profile — aggregated analyses for this competitor
router.get('/:id/full-profile', authMiddleware, async (req, res) => {
  try {
    await ensureColumns();
    const compR = await pool.query('SELECT * FROM competitors WHERE id = $1', [req.params.id]);
    if (compR.rows.length === 0) return res.status(404).json({ error: 'Competitor not found' });
    const competitor = compR.rows[0];

    // Fetch all AI analyses mentioning this competitor
    const analysesR = await pool.query(
      `SELECT id, analysis_type, input_params, result, model, tokens_used, created_at
       FROM ai_analyses
       WHERE input_params::text ILIKE $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [`%${competitor.name}%`]
    );

    // Fetch related market analyses, SWOT, etc. from other tables
    const swotR = await pool.query(
      `SELECT id, title, strengths, weaknesses, opportunities, threats, recommendations, overall_score, created_at
       FROM swot_analysis WHERE company ILIKE $1 ORDER BY created_at DESC LIMIT 10`,
      [`%${competitor.name}%`]
    );

    const adR = await pool.query(
      `SELECT id, title, platform, ad_type, estimated_spend, effectiveness_score, created_at
       FROM ad_tracker WHERE competitor ILIKE $1 ORDER BY created_at DESC LIMIT 10`,
      [`%${competitor.name}%`]
    );

    const hiringR = await pool.query(
      `SELECT id, title, role_title, department, seniority, skills_required, strategic_signal, created_at
       FROM hiring_tracker WHERE company ILIKE $1 ORDER BY created_at DESC LIMIT 10`,
      [`%${competitor.name}%`]
    );

    // Monitoring schedules
    const schedR = await pool.query(
      `SELECT * FROM monitoring_schedules WHERE competitor_name ILIKE $1 ORDER BY created_at DESC LIMIT 5`,
      [`%${competitor.name}%`]
    ).catch(() => ({ rows: [] }));

    res.json({
      competitor,
      aiAnalyses: {
        total: analysesR.rows.length,
        items: analysesR.rows
      },
      swotAnalyses: swotR.rows,
      adTracking: adR.rows,
      hiringSignals: hiringR.rows,
      monitoringSchedules: schedR.rows
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/competitors
router.post('/', authMiddleware, async (req, res) => {
  try {
    await ensureColumns();
    const {
      name, website, industry, description, market_cap, employee_count,
      headquarters, founded, key_products, strengths, weaknesses,
      threat_level, notes, status,
      // Extended fields
      founded_year, pricing_model, key_products_arr
    } = req.body;

    if (!name) return res.status(400).json({ error: 'name is required' });

    const r = await pool.query(
      `INSERT INTO competitors
        (name, website, industry, description, market_cap, employee_count, headquarters,
         founded, key_products, strengths, weaknesses, threat_level, notes, status,
         founded_year, pricing_model, key_products_arr)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [
        name, website || null, industry || null, description || null,
        market_cap || null, employee_count || null, headquarters || null,
        founded || null, key_products || null, strengths || null,
        weaknesses || null, threat_level || 'medium', notes || null,
        status || 'active',
        founded_year || null, pricing_model || null,
        JSON.stringify(key_products_arr || [])
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/competitors/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    await ensureColumns();
    const existing = await pool.query('SELECT * FROM competitors WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Competitor not found' });
    const c = existing.rows[0];

    const {
      name, website, industry, description, market_cap, employee_count,
      headquarters, founded, key_products, strengths, weaknesses,
      threat_level, notes, status, founded_year, pricing_model, key_products_arr
    } = req.body;

    const r = await pool.query(
      `UPDATE competitors SET
        name = $1, website = $2, industry = $3, description = $4, market_cap = $5,
        employee_count = $6, headquarters = $7, founded = $8, key_products = $9,
        strengths = $10, weaknesses = $11, threat_level = $12, notes = $13,
        status = $14, founded_year = $15, pricing_model = $16, key_products_arr = $17,
        updated_at = NOW()
       WHERE id = $18 RETURNING *`,
      [
        name || c.name,
        website !== undefined ? website : c.website,
        industry !== undefined ? industry : c.industry,
        description !== undefined ? description : c.description,
        market_cap !== undefined ? market_cap : c.market_cap,
        employee_count !== undefined ? employee_count : c.employee_count,
        headquarters !== undefined ? headquarters : c.headquarters,
        founded !== undefined ? founded : c.founded,
        key_products !== undefined ? key_products : c.key_products,
        strengths !== undefined ? strengths : c.strengths,
        weaknesses !== undefined ? weaknesses : c.weaknesses,
        threat_level || c.threat_level,
        notes !== undefined ? notes : c.notes,
        status || c.status,
        founded_year !== undefined ? founded_year : c.founded_year,
        pricing_model !== undefined ? pricing_model : c.pricing_model,
        key_products_arr !== undefined ? JSON.stringify(key_products_arr) : c.key_products_arr,
        req.params.id
      ]
    );
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/competitors/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM competitors WHERE id = $1 RETURNING id', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Competitor not found' });
    res.json({ message: 'Competitor deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
