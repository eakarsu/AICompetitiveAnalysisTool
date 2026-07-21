'use strict';

const crypto = require('crypto');
const PRIVATE_HOST = /^(localhost|\[?::1\]?|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/i;

function normalizeSourceUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { throw Object.assign(new Error('A valid source URL is required'), { statusCode: 400 }); }
  if (!['http:', 'https:'].includes(parsed.protocol) || PRIVATE_HOST.test(parsed.hostname)) {
    throw Object.assign(new Error('Source URL protocol or host is not permitted'), { statusCode: 400 });
  }
  parsed.hash = '';
  return parsed.toString();
}

function claimFingerprint({ competitorId, normalizedText, sourceUrl }) {
  if (!competitorId || !normalizedText || !sourceUrl) throw Object.assign(new Error('competitorId, claim text and source URL are required'), { statusCode: 400 });
  return crypto.createHash('sha256').update(`${competitorId}|${normalizedText.trim().toLowerCase()}|${normalizeSourceUrl(sourceUrl)}`).digest('hex');
}

function canPublish(role, status, citationCount) {
  return ['reviewer', 'admin'].includes(role) && status === 'approved' && Number(citationCount) > 0;
}

module.exports = { normalizeSourceUrl, claimFingerprint, canPublish };
