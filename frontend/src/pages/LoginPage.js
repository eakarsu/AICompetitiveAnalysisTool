import React, { useState } from 'react';
import api from '../services/api';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLogin();
    } catch (e) { setError(e.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  const s = {
    page: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a1a 0%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    card: { background: '#16213e', padding: 40, borderRadius: 16, width: 400, border: '1px solid #0f3460' },
    title: { color: '#e94560', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { color: '#888', textAlign: 'center', marginBottom: 30, fontSize: 14 },
    input: { width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' },
    btn: { width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: '#e94560', color: '#fff', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' },
    error: { color: '#e94560', textAlign: 'center', marginBottom: 16, fontSize: 14 }
  };

  return (
    <div style={s.page}>
      <form style={s.card} onSubmit={handleSubmit}>
        <div style={s.title}>🏆 Competitive Analysis</div>
        <div style={s.subtitle}>AI-Powered Market Intelligence</div>
        {error && <div style={s.error}>{error}</div>}
        <input style={s.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input style={s.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button
          type="button"
          onClick={() => { setEmail(process.env.REACT_APP_DEMO_EMAIL || ''); setPassword(process.env.REACT_APP_DEMO_PASSWORD || ''); }}
          disabled={!process.env.REACT_APP_DEMO_EMAIL || !process.env.REACT_APP_DEMO_PASSWORD}
          aria-label="Auto Fill Demo Credentials"
          style={{ width: '100%', marginBottom: '12px', padding: '10px 14px', borderRadius: '8px', border: '1px solid currentColor', background: 'transparent', cursor: 'pointer' }}
        >
          Auto Fill Demo Credentials
        </button>
        <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </div>
  );
}
