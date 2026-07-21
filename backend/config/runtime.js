'use strict';

function validateRuntime(env = process.env) {
  const errors = [];
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) errors.push('JWT_SECRET must be at least 32 characters');
  if (!env.DATABASE_URL) errors.push('DATABASE_URL is required');
  if (env.NODE_ENV === 'production' && env.EXPOSE_AUTH_TOKENS === 'true') errors.push('EXPOSE_AUTH_TOKENS cannot be enabled in production');
  if (errors.length) throw new Error(`Invalid runtime configuration: ${errors.join('; ')}`);
  return Object.freeze({ nodeEnv: env.NODE_ENV || 'development' });
}

module.exports = { validateRuntime };
