import React, { useState } from 'react';

const sample = JSON.stringify([
  { name: 'You', mentions: 420, positive: 260, searchRank: 2 },
  { name: 'RivalOne', mentions: 510, positive: 230, searchRank: 1 },
  { name: 'NicheCo', mentions: 180, positive: 120, searchRank: 5 }
], null, 2);

export default function ShareOfVoicePage() {
  const [payload, setPayload] = useState(sample);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function run() {
    setError('');
    setResult(null);
    try {
      const response = await fetch('http://localhost:3001/api/share-of-voice/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ competitors: JSON.parse(payload) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: 24, color: '#f8fafc' }}>
      <h1>Share of Voice Radar</h1>
      <p style={{ color: '#a0a0b0' }}>Rank competitor visibility gaps using mentions, sentiment, and search position.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <section style={{ background: '#16213e', padding: 18, borderRadius: 8 }}>
          <textarea rows={14} value={payload} onChange={(event) => setPayload(event.target.value)} style={{ width: '100%', fontFamily: 'monospace' }} />
          {error && <p style={{ color: '#fb7185' }}>{error}</p>}
          <button onClick={run}>Score voice</button>
        </section>
        <section style={{ background: '#16213e', padding: 18, borderRadius: 8 }}>
          {result ? (
            <>
              <h2>Leader: {result.leader}</h2>
              {result.ranked.map((row) => (
                <div key={row.name} style={{ borderBottom: '1px solid #334155', padding: '10px 0' }}>
                  <strong>{row.name}</strong>
                  <div>Share {row.share}% | Sentiment {row.sentiment}% | Opportunity {row.opportunityScore}</div>
                </div>
              ))}
              <ul>{result.recommendations.map((line) => <li key={line}>{line}</li>)}</ul>
            </>
          ) : <p>Run the radar to see ranking and recommendations.</p>}
        </section>
      </div>
    </div>
  );
}
