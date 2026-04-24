const pool = require('../db');

const tableMap = {
  'competitors': 'competitors',
  'market-analysis': 'market_analysis',
  'swot-analysis': 'swot_analysis',
  'price-comparison': 'price_comparison',
  'product-comparison': 'product_comparison',
  'social-media': 'social_media',
  'news-trends': 'news_trends',
  'customer-reviews': 'customer_reviews',
  'seo-analysis': 'seo_analysis',
  'industry-reports': 'industry_reports',
  'ad-tracker': 'ad_tracker',
  'hiring-tracker': 'hiring_tracker'
};

const getTable = (resource) => tableMap[resource] || resource.replace(/-/g, '_');

exports.getAll = (resource) => async (req, res) => {
  try {
    const table = getTable(resource);
    const { page = 1, limit = 50, sort = 'created_at', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    const countResult = await pool.query(`SELECT COUNT(*) FROM ${table}`);
    const result = await pool.query(`SELECT * FROM ${table} ORDER BY ${sort} ${order} LIMIT $1 OFFSET $2`, [limit, offset]);
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getById = (resource) => async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${getTable(resource)} WHERE id = $1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.create = (resource) => async (req, res) => {
  try {
    const table = getTable(resource);
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const result = await pool.query(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`, values);
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.update = (resource) => async (req, res) => {
  try {
    const table = getTable(resource);
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(req.params.id);
    const result = await pool.query(`UPDATE ${table} SET ${sets}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`, values);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.delete = (resource) => async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM ${getTable(resource)} WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.search = (resource) => async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: 'Search query required' });
    const table = getTable(resource);
    const cols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND data_type IN ('text','character varying')`, [table]);
    if (!cols.rows.length) return res.json({ data: [] });
    const conditions = cols.rows.map((c, i) => `${c.column_name} ILIKE $1`).join(' OR ');
    const result = await pool.query(`SELECT * FROM ${table} WHERE ${conditions} ORDER BY created_at DESC LIMIT 50`, [`%${q}%`]);
    res.json({ data: result.rows, total: result.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.exportPDF = (resource) => async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM ${getTable(resource)} ORDER BY created_at DESC`);
    res.json({ data: result.rows, format: 'json_for_pdf', resource });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.bulkUpdate = (resource) => async (req, res) => {
  try {
    const { ids, updates } = req.body;
    if (!ids?.length || !updates) return res.status(400).json({ error: 'ids and updates required' });
    const table = getTable(resource);
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    values.push(ids);
    const result = await pool.query(`UPDATE ${table} SET ${sets}, updated_at = NOW() WHERE id = ANY($${values.length}) RETURNING *`, values);
    res.json({ updated: result.rows.length, data: result.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.bulkDelete = (resource) => async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'ids required' });
    const result = await pool.query(`DELETE FROM ${getTable(resource)} WHERE id = ANY($1) RETURNING id`, [ids]);
    res.json({ deleted: result.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const tables = Object.entries(tableMap);
    const stats = {};
    for (const [key, table] of tables) {
      const r = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      stats[key] = parseInt(r.rows[0].count);
    }
    res.json(stats);
  } catch (e) { res.status(500).json({ error: e.message }); }
};
