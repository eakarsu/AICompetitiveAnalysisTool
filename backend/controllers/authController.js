const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'competitive-analysis-secret-2024';

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length) return res.status(400).json({ error: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, email_verified, verify_token) VALUES ($1,$2,$3,$4,false,$5) RETURNING id, name, email, role',
      [name, email, hash, role || 'analyst', verifyToken]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.logout = (req, res) => { res.json({ message: 'Logged out successfully' }); };

exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, email_verified, created_at FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query('UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), updated_at = NOW() WHERE id = $3 RETURNING id, name, email, role', [name, email, req.user.id]);
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hash, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000);
    await pool.query('UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3', [token, expiry, email]);
    res.json({ message: 'Password reset link sent', token });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await pool.query('SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()', [token]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid or expired token' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2', [hash, result.rows[0].id]);
    res.json({ message: 'Password reset successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.verifyEmail = async (req, res) => {
  try {
    const result = await pool.query('UPDATE users SET email_verified = true, verify_token = NULL WHERE verify_token = $1 RETURNING id', [req.params.token]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid verification token' });
    res.json({ message: 'Email verified successfully' });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.resendVerification = async (req, res) => {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query('UPDATE users SET verify_token = $1 WHERE id = $2', [token, req.user.id]);
    res.json({ message: 'Verification email resent', token });
  } catch (e) { res.status(500).json({ error: e.message }); }
};

exports.checkPasswordStrength = (req, res) => {
  const { password } = req.body;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  const levels = ['very_weak', 'weak', 'fair', 'strong', 'very_strong'];
  res.json({ score, strength: levels[Math.min(score, 4)], maxScore: 5 });
};
