'use strict';
const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { normalizeSourceUrl, claimFingerprint, canPublish } = require('../domain/intelligencePolicy');

async function member(workspaceId, userId) {
  const result = await pool.query('SELECT role FROM ci_memberships WHERE workspace_id=$1 AND user_id=$2', [workspaceId, userId]);
  if (!result.rows.length) throw Object.assign(new Error('Workspace membership is required'), { status: 403 });
  return result.rows[0];
}
function fail(res, error) { res.status(error.status || error.statusCode || 500).json({ error: error.status || error.statusCode ? error.message : 'Intelligence workflow failed' }); }

router.post('/workspaces/:workspaceId/sources', auth, async (req, res) => {
  try {
    const workspaceId = Number(req.params.workspaceId); await member(workspaceId, req.user.id);
    if (!req.body.authorizationBasis || req.body.termsAccepted !== true) return res.status(400).json({ error: 'Documented authorization basis and terms acceptance are required' });
    const url = normalizeSourceUrl(req.body.url);
    const result = await pool.query(`INSERT INTO ci_sources(workspace_id,url,title,authorization_basis,terms_checked_at,created_by)
      VALUES($1,$2,$3,$4,now(),$5) ON CONFLICT(workspace_id,url) DO UPDATE SET title=EXCLUDED.title RETURNING *`, [workspaceId, url, req.body.title || null, req.body.authorizationBasis, req.user.id]);
    await pool.query("INSERT INTO ci_audit_events(workspace_id,actor_id,action,entity_type,entity_id,details) VALUES($1,$2,'source.registered','source',$3,$4)", [workspaceId, req.user.id, result.rows[0].id, { url, authorizationBasis: req.body.authorizationBasis }]);
    res.status(201).json(result.rows[0]);
  } catch (error) { fail(res, error); }
});

router.post('/workspaces/:workspaceId/claims', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const workspaceId = Number(req.params.workspaceId); await member(workspaceId, req.user.id);
    const { competitorId, text, sourceUrl, snapshotId, excerpt, locator } = req.body;
    const fingerprint = claimFingerprint({ competitorId, normalizedText: text, sourceUrl });
    await client.query('BEGIN');
    const claim = await client.query(`INSERT INTO ci_claims(workspace_id,competitor_id,normalized_text,fingerprint) VALUES($1,$2,$3,$4)
      ON CONFLICT(workspace_id,fingerprint) DO UPDATE SET last_seen_at=now() RETURNING *`, [workspaceId, competitorId, text.trim(), fingerprint]);
    await client.query('INSERT INTO ci_citations(claim_id,snapshot_id,excerpt,locator) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING', [claim.rows[0].id, snapshotId, excerpt, locator || null]);
    await client.query("INSERT INTO ci_audit_events(workspace_id,actor_id,action,entity_type,entity_id,details) VALUES($1,$2,'claim.recorded','claim',$3,$4)", [workspaceId, req.user.id, claim.rows[0].id, { snapshotId, fingerprint }]);
    await client.query('COMMIT'); res.status(201).json(claim.rows[0]);
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); fail(res, error); } finally { client.release(); }
});

router.post('/briefs/:id/publish', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT * FROM ci_briefs WHERE id=$1 FOR UPDATE', [req.params.id]);
    if (!found.rows.length) throw Object.assign(new Error('Brief not found'), { status: 404 });
    const brief = found.rows[0]; const membership = await member(brief.workspace_id, req.user.id);
    const citations = await client.query('SELECT count(c.snapshot_id)::int AS count FROM ci_brief_claims bc JOIN ci_citations c ON c.claim_id=bc.claim_id WHERE bc.brief_id=$1', [brief.id]);
    if (!canPublish(membership.role, brief.status, citations.rows[0].count)) throw Object.assign(new Error('Approved, cited brief and reviewer role are required'), { status: 409 });
    const result = await client.query("UPDATE ci_briefs SET status='published',published_at=now(),version=version+1 WHERE id=$1 AND version=$2 RETURNING *", [brief.id, req.body.version]);
    if (!result.rows.length) throw Object.assign(new Error('Brief version conflict'), { status: 409 });
    await client.query("INSERT INTO ci_audit_events(workspace_id,actor_id,action,entity_type,entity_id,details) VALUES($1,$2,'brief.published','brief',$3,$4)", [brief.workspace_id, req.user.id, brief.id, { previousVersion: brief.version }]);
    await client.query('COMMIT'); res.json(result.rows[0]);
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); fail(res, error); } finally { client.release(); }
});

module.exports = router;
