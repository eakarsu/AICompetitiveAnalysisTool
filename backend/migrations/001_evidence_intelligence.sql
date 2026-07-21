BEGIN;
CREATE TABLE IF NOT EXISTS ci_workspaces (id BIGSERIAL PRIMARY KEY, tenant_key TEXT NOT NULL UNIQUE, name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ci_memberships (workspace_id BIGINT NOT NULL REFERENCES ci_workspaces(id), user_id BIGINT NOT NULL, role TEXT NOT NULL CHECK(role IN ('analyst','reviewer','admin')), PRIMARY KEY(workspace_id,user_id));
CREATE TABLE IF NOT EXISTS ci_sources (
  id BIGSERIAL PRIMARY KEY, workspace_id BIGINT NOT NULL REFERENCES ci_workspaces(id), url TEXT NOT NULL, title TEXT,
  authorization_basis TEXT NOT NULL, terms_checked_at TIMESTAMPTZ NOT NULL, retrieval_status TEXT NOT NULL DEFAULT 'registered' CHECK(retrieval_status IN ('registered','fetched','failed','blocked')),
  content_hash TEXT, last_error TEXT, created_by BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(workspace_id,url)
);
CREATE TABLE IF NOT EXISTS ci_source_snapshots (id BIGSERIAL PRIMARY KEY, source_id BIGINT NOT NULL REFERENCES ci_sources(id), captured_at TIMESTAMPTZ NOT NULL, content_hash TEXT NOT NULL, storage_key TEXT NOT NULL, http_status INTEGER, UNIQUE(source_id,content_hash));
CREATE TABLE IF NOT EXISTS ci_claims (
  id BIGSERIAL PRIMARY KEY, workspace_id BIGINT NOT NULL REFERENCES ci_workspaces(id), competitor_id BIGINT NOT NULL,
  normalized_text TEXT NOT NULL, fingerprint TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'unreviewed' CHECK(status IN ('unreviewed','supported','contradicted','rejected')),
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(), last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE(workspace_id,fingerprint)
);
CREATE TABLE IF NOT EXISTS ci_citations (claim_id BIGINT NOT NULL REFERENCES ci_claims(id), snapshot_id BIGINT NOT NULL REFERENCES ci_source_snapshots(id), excerpt TEXT NOT NULL, locator TEXT, PRIMARY KEY(claim_id,snapshot_id));
CREATE TABLE IF NOT EXISTS ci_briefs (
  id BIGSERIAL PRIMARY KEY, workspace_id BIGINT NOT NULL REFERENCES ci_workspaces(id), title TEXT NOT NULL, body JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','review','approved','published','rejected')),
  version INTEGER NOT NULL DEFAULT 1, created_by BIGINT NOT NULL, reviewed_by BIGINT, published_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS ci_brief_claims (brief_id BIGINT NOT NULL REFERENCES ci_briefs(id), claim_id BIGINT NOT NULL REFERENCES ci_claims(id), PRIMARY KEY(brief_id,claim_id));
CREATE TABLE IF NOT EXISTS ci_audit_events (id BIGSERIAL PRIMARY KEY, workspace_id BIGINT, actor_id BIGINT, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id BIGINT, details JSONB, occurred_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS ci_connector_runs (id BIGSERIAL PRIMARY KEY, workspace_id BIGINT NOT NULL, connector TEXT NOT NULL, cursor_value TEXT, status TEXT NOT NULL CHECK(status IN ('running','succeeded','failed','blocked')), records_received INTEGER NOT NULL DEFAULT 0, error_code TEXT, error_message TEXT, started_at TIMESTAMPTZ NOT NULL DEFAULT now(), finished_at TIMESTAMPTZ);
COMMIT;
