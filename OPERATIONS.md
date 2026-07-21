# Evidence-backed intelligence operations

The authoritative path is `/api/intelligence`: analysts register only terms-approved public/authorized sources, snapshots retain hashes and storage locators, normalized claims deduplicate by fingerprint, citations preserve evidence, and only reviewers may publish approved briefs with citations. Private-network retrieval is blocked. Generated `/api/gap-*` surfaces are no longer mounted or navigable; model text cannot publish a brief.

Use `.env.example`, `scripts/bootstrap.sh`, `scripts/migrate.sh`, and the non-mutating `start.sh`. Seed data requires `CONFIRM_DEMO_SEED=yes` outside production. Connector runs persist cursor, status, record counts, and sanitized errors in `ci_connector_runs`.

Web/content, CRM, market-data, document-store, search, and alert adapters remain deployment-specific. Each requires source-terms approval, outbound host allowlisting, rate limits, provenance retention, idempotent cursors, and reviewer acceptance tests. No permission to scrape or licensed market-data access is implied.
