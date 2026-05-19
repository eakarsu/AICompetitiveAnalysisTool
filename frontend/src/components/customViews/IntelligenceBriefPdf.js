import React, { useState } from 'react';
import api from '../../services/api';

export default function IntelligenceBriefPdf() {
  const [competitor, setCompetitor] = useState('Acme Corp');
  const [focus, setFocus] = useState('pricing');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const download = async () => {
    setBusy(true); setMsg('');
    try {
      const res = await api.post('/custom-views/intelligence-brief',
        { competitor, focus },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `intel-brief-${competitor.replace(/\s+/g,'_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setMsg('PDF downloaded.');
    } catch (e) {
      setMsg('Error: ' + (e.response?.data?.error || e.message));
    } finally {
      setBusy(false);
    }
  };

  const s = {
    card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 12, padding: 20, marginBottom: 20 },
    title: { color: '#e94560', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    row: { display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' },
    input: { padding: '8px 12px', borderRadius: 6, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 13, flex: 1, minWidth: 160 },
    btn: { padding: '8px 16px', borderRadius: 6, border: 'none', background: '#e94560', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
    msg: { color: '#888', fontSize: 12, marginTop: 8 },
  };

  return (
    <div style={s.card} data-testid="intelligence-brief">
      <div style={s.title}>Competitor Intelligence Brief (PDF)</div>
      <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>Generates a downloadable PDF briefing.</div>
      <div style={s.row}>
        <input style={s.input} value={competitor} onChange={e => setCompetitor(e.target.value)} placeholder="Competitor name" />
        <select style={s.input} value={focus} onChange={e => setFocus(e.target.value)}>
          <option value="general">General overview</option>
          <option value="pricing">Pricing</option>
          <option value="positioning">Positioning</option>
          <option value="hiring">Hiring signals</option>
        </select>
        <button style={{ ...s.btn, opacity: busy ? 0.6 : 1 }} onClick={download} disabled={busy}>
          {busy ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
      {msg && <div style={s.msg}>{msg}</div>}
    </div>
  );
}
