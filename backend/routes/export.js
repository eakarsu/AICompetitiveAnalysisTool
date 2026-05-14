const router = require('express').Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');
const PDFDocument = require('pdfkit');

// Helper: flatten JSON value to readable string
function flattenValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val).replace(/[{}"[\]]/g, '').substring(0, 200);
  return String(val);
}

// GET /api/export/competitor-report/:competitor_name — PDF report for a competitor
router.get('/competitor-report/:competitor_name', authMiddleware, async (req, res) => {
  try {
    const competitorName = decodeURIComponent(req.params.competitor_name);

    // Fetch competitor record
    const compR = await pool.query(
      'SELECT * FROM competitors WHERE name ILIKE $1 ORDER BY created_at DESC LIMIT 1',
      [`%${competitorName}%`]
    );

    // Fetch all AI analyses for this competitor
    const analysesR = await pool.query(
      `SELECT analysis_type, result, model, tokens_used, created_at
       FROM ai_analyses
       WHERE input_params::text ILIKE $1
       ORDER BY created_at DESC LIMIT 20`,
      [`%${competitorName}%`]
    );

    // Fetch SWOT
    const swotR = await pool.query(
      `SELECT * FROM swot_analysis WHERE company ILIKE $1 ORDER BY created_at DESC LIMIT 3`,
      [`%${competitorName}%`]
    );

    // Fetch ad tracking
    const adR = await pool.query(
      `SELECT * FROM ad_tracker WHERE competitor ILIKE $1 ORDER BY created_at DESC LIMIT 5`,
      [`%${competitorName}%`]
    );

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="competitor-report-${competitorName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`);
    doc.pipe(res);

    // Cover
    doc.fontSize(24).fillColor('#1a1a2e').text('Competitive Intelligence Report', { align: 'center' });
    doc.fontSize(18).fillColor('#16213e').text(competitorName, { align: 'center' });
    doc.fontSize(10).fillColor('#555').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Competitor Profile
    if (compR.rows.length > 0) {
      const c = compR.rows[0];
      doc.fontSize(16).fillColor('#1a1a2e').text('Competitor Profile');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#ccc');
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#333');
      const profileFields = [
        ['Name', c.name], ['Industry', c.industry], ['Website', c.website],
        ['Headquarters', c.headquarters], ['Founded', c.founded || c.founded_year],
        ['Employee Count', c.employee_count], ['Market Cap', c.market_cap],
        ['Threat Level', c.threat_level], ['Pricing Model', c.pricing_model],
        ['Status', c.status]
      ];
      profileFields.forEach(([label, val]) => {
        if (val) doc.text(`${label}: ${val}`);
      });
      if (c.description) { doc.moveDown(0.5); doc.text(`Description: ${c.description}`); }
      doc.moveDown(1);
    }

    // AI Analyses
    if (analysesR.rows.length > 0) {
      doc.fontSize(16).fillColor('#1a1a2e').text('AI Analysis History');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#ccc');
      doc.moveDown(0.5);

      analysesR.rows.forEach((analysis, i) => {
        doc.fontSize(12).fillColor('#16213e').text(`${i + 1}. ${analysis.analysis_type.replace(/-/g, ' ').toUpperCase()}`);
        doc.fontSize(9).fillColor('#777').text(`Date: ${new Date(analysis.created_at).toLocaleDateString()} | Model: ${analysis.model || 'N/A'}`);
        doc.fontSize(10).fillColor('#333');

        const result = analysis.result;
        if (result && typeof result === 'object') {
          const keyFields = ['executive_summary', 'summary', 'analysis', 'overall_assessment',
            'market_position', 'competitive_advantage', 'strategic_recommendations'];
          for (const field of keyFields) {
            if (result[field]) {
              const text = typeof result[field] === 'string'
                ? result[field]
                : JSON.stringify(result[field]).substring(0, 300);
              doc.text(text.substring(0, 400));
              break;
            }
          }
        }
        doc.moveDown(0.5);
      });
      doc.moveDown(1);
    }

    // SWOT
    if (swotR.rows.length > 0) {
      doc.fontSize(16).fillColor('#1a1a2e').text('SWOT Analyses');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#ccc');
      doc.moveDown(0.5);
      swotR.rows.forEach((s) => {
        doc.fontSize(12).fillColor('#16213e').text(s.title || `SWOT for ${s.company}`);
        doc.fontSize(10).fillColor('#333');
        if (s.strengths) doc.text(`Strengths: ${String(s.strengths).substring(0, 200)}`);
        if (s.weaknesses) doc.text(`Weaknesses: ${String(s.weaknesses).substring(0, 200)}`);
        if (s.opportunities) doc.text(`Opportunities: ${String(s.opportunities).substring(0, 200)}`);
        if (s.threats) doc.text(`Threats: ${String(s.threats).substring(0, 200)}`);
        doc.moveDown(0.5);
      });
      doc.moveDown(1);
    }

    // Ad Tracking
    if (adR.rows.length > 0) {
      doc.fontSize(16).fillColor('#1a1a2e').text('Ad Tracking');
      doc.moveTo(50, doc.y).lineTo(560, doc.y).stroke('#ccc');
      doc.moveDown(0.5);
      adR.rows.forEach((a) => {
        doc.fontSize(10).fillColor('#333');
        doc.text(`Platform: ${a.platform || 'N/A'} | Type: ${a.ad_type || 'N/A'} | Est. Spend: ${a.estimated_spend || 'N/A'}`);
        if (a.ad_copy) doc.text(`Copy: ${String(a.ad_copy).substring(0, 150)}`);
        doc.moveDown(0.3);
      });
    }

    doc.fontSize(9).fillColor('#aaa').text('AI Competitive Analysis Tool — Confidential', { align: 'center' });
    doc.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/export/all-analyses — CSV export of all AI analyses
router.get('/all-analyses', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT a.id, a.analysis_type, a.model, a.tokens_used, a.created_at,
              u.name as user_name, u.email as user_email,
              a.input_params, a.result
       FROM ai_analyses a
       LEFT JOIN users u ON u.id = a.user_id
       ORDER BY a.created_at DESC
       LIMIT 10000`
    );

    const rows = r.rows;

    // Build CSV
    const headers = ['id', 'analysis_type', 'model', 'tokens_used', 'created_at', 'user_name', 'user_email', 'input_summary', 'result_summary'];

    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""').replace(/\n/g, ' ').substring(0, 500);
      return `"${str}"`;
    };

    const csvLines = [
      headers.join(','),
      ...rows.map(row => [
        escape(row.id),
        escape(row.analysis_type),
        escape(row.model),
        escape(row.tokens_used),
        escape(row.created_at ? new Date(row.created_at).toISOString() : ''),
        escape(row.user_name),
        escape(row.user_email),
        escape(typeof row.input_params === 'object' ? JSON.stringify(row.input_params) : row.input_params),
        escape(typeof row.result === 'object' ? JSON.stringify(row.result).substring(0, 300) : row.result)
      ].join(','))
    ];

    const csv = csvLines.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="all-analyses-${Date.now()}.csv"`);
    res.send(csv);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/export/competitors — CSV of all competitors
router.get('/competitors', authMiddleware, async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM competitors ORDER BY created_at DESC');
    const rows = r.rows;

    const escape = (val) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""').replace(/\n/g, ' ').substring(0, 500);
      return `"${str}"`;
    };

    const headers = ['id', 'name', 'website', 'industry', 'headquarters', 'founded', 'employee_count', 'market_cap', 'threat_level', 'pricing_model', 'status', 'created_at'];
    const csvLines = [
      headers.join(','),
      ...rows.map(row => headers.map(h => escape(row[h])).join(','))
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="competitors-${Date.now()}.csv"`);
    res.send(csvLines.join('\n'));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
