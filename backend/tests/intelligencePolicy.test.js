'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeSourceUrl, claimFingerprint, canPublish } = require('../domain/intelligencePolicy');
const { validateRuntime } = require('../config/runtime');

test('source policy rejects unsafe retrieval hosts', () => assert.throws(() => normalizeSourceUrl('http://127.0.0.1/admin'), /not permitted/));
test('claim fingerprints deduplicate normalized evidence', () => {
  const a = claimFingerprint({ competitorId: 2, normalizedText: ' PRICE CUT ', sourceUrl: 'https://example.com/a#x' });
  const b = claimFingerprint({ competitorId: 2, normalizedText: 'price cut', sourceUrl: 'https://example.com/a' });
  assert.equal(a, b);
});
test('publication requires approved, cited human review', () => {
  assert.equal(canPublish('reviewer', 'approved', 1), true);
  assert.equal(canPublish('analyst', 'approved', 1), false);
  assert.equal(canPublish('reviewer', 'draft', 1), false);
});
test('runtime rejects production token exposure', () => assert.throws(() => validateRuntime({ NODE_ENV: 'production', JWT_SECRET: 'a'.repeat(32), DATABASE_URL: 'postgres://db', EXPOSE_AUTH_TOKENS: 'true' }), /cannot be enabled/));
