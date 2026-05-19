const router = require('express').Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Ensure monitoring_schedules table exists
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monitoring_schedules (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      competitor_name VARCHAR(255) NOT NULL,
      analysis_types JSONB NOT NULL DEFAULT '[]',
      frequency VARCHAR(50) NOT NULL DEFAULT 'weekly',
      next_run_at TIMESTAMPTZ,
      last_run_at TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT true,
      notify_email VARCHAR(255),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_monitoring_user ON monitoring_schedules(user_id);
    CREATE INDEX IF NOT EXISTS idx_monitoring_next_run ON monitoring_schedules(next_run_at);
  `);
}

function computeNextRun(frequency) {
  const now = new Date();
  switch (frequency) {
    case 'daily': now.setDate(now.getDate() + 1); break;
    case 'weekly': now.setDate(now.getDate() + 7); break;
    case 'biweekly': now.setDate(now.getDate() + 14); break;
    case 'monthly': now.setMonth(now.getMonth() + 1); break;
    default: now.setDate(now.getDate() + 7);
  }
  return now;
}

// POST /api/monitoring/schedule — schedule periodic competitor analysis
router.post('/schedule', authMiddleware, async (req, res) => {
  try {
    await ensureTable();
    const { competitor_name, analysis_types, frequency, notify_email } = req.body;

    if (!competitor_name) return res.status(400).json({ error: 'competitor_name is required' });
    const validFrequencies = ['daily', 'weekly', 'biweekly', 'monthly'];
    const freq = frequency || 'weekly';
    if (!validFrequencies.includes(freq)) {
      return res.status(400).json({ error: `frequency must be one of: ${validFrequencies.join(', ')}` });
    }

    const types = Array.isArray(analysis_types) && analysis_types.length > 0
      ? analysis_types
      : ['analyze-competitor', 'generate-swot'];

    const nextRun = computeNextRun(freq);

    const r = await pool.query(
      `INSERT INTO monitoring_schedules (user_id, competitor_name, analysis_types, frequency, next_run_at, notify_email)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, competitor_name, JSON.stringify(types), freq, nextRun, notify_email || null]
    );

    res.status(201).json({ success: true, schedule: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/monitoring/schedules — list all scheduled monitoring jobs for user
router.get('/schedules', authMiddleware, async (req, res) => {
  try {
    await ensureTable();
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const countR = await pool.query(
      'SELECT COUNT(*) FROM monitoring_schedules WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countR.rows[0].count);

    const r = await pool.query(
      `SELECT * FROM monitoring_schedules WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [req.user.id, limit, offset]
    );

    res.json({
      data: r.rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/monitoring/schedules/:id — get single schedule
router.get('/schedules/:id', authMiddleware, async (req, res) => {
  try {
    await ensureTable();
    const r = await pool.query(
      'SELECT * FROM monitoring_schedules WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/monitoring/schedules/:id — update schedule
router.put('/schedules/:id', authMiddleware, async (req, res) => {
  try {
    await ensureTable();
    const { competitor_name, analysis_types, frequency, notify_email, is_active } = req.body;

    const existing = await pool.query(
      'SELECT * FROM monitoring_schedules WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });

    const current = existing.rows[0];
    const newFreq = frequency || current.frequency;
    const nextRun = frequency ? computeNextRun(newFreq) : current.next_run_at;

    const r = await pool.query(
      `UPDATE monitoring_schedules SET
        competitor_name = $1,
        analysis_types = $2,
        frequency = $3,
        next_run_at = $4,
        notify_email = $5,
        is_active = $6,
        updated_at = NOW()
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [
        competitor_name || current.competitor_name,
        JSON.stringify(analysis_types || current.analysis_types),
        newFreq,
        nextRun,
        notify_email !== undefined ? notify_email : current.notify_email,
        is_active !== undefined ? is_active : current.is_active,
        req.params.id,
        req.user.id
      ]
    );
    res.json({ success: true, schedule: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/monitoring/schedules/:id
router.delete('/schedules/:id', authMiddleware, async (req, res) => {
  try {
    await ensureTable();
    const r = await pool.query(
      'DELETE FROM monitoring_schedules WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
