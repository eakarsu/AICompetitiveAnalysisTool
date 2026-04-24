const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many auth attempts' } });
const passwordResetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many reset attempts' } });
const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: { error: 'Too many AI requests' } });
module.exports = { authLimiter, passwordResetLimiter, aiLimiter };
