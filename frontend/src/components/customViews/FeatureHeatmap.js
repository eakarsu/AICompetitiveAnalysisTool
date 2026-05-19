import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function FeatureHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/custom-views/feature-heatmap')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(e => { setErr(e.response?.data?.error || e.message); setLoading(false); });
  }, []);

  const colorFor = (v) => {
    const hue = Math.max(0, 130 - v); // red -> green-ish
    return `hsl(${hue}, 70%, 45%)`;
  };

  const s = {
    card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 12, padding: 20, marginBottom: 20 },
    title: { color: '#e94560', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    tableWrap: { overflowX: 'auto' },
    table: { borderCollapse: 'collapse', width: '100%', minWidth: 540 },
    th: { background: '#0f3460', color: '#e0e0e0', padding: '8px 10px', fontSize: 12, textAlign: 'left', borderBottom: '1px solid #0a0a1a' },
    rh: { background: '#0a0a1a', color: '#e0e0e0', padding: '8px 10px', fontSize: 12, fontWeight: 'bold' },
    cell: (v) => ({ background: colorFor(v), color: '#fff', textAlign: 'center', padding: '10px 8px', fontSize: 12, fontWeight: 'bold', minWidth: 56, border: '1px solid #16213e' }),
  };

  if (loading) return <div style={s.card}><div style={s.title}>Feature Comparison Heatmap</div><div style={{ color: '#888' }}>Loading...</div></div>;
  if (err) return <div style={s.card}><div style={s.title}>Feature Comparison Heatmap</div><div style={{ color: '#e94560' }}>Error: {err}</div></div>;

  return (
    <div style={s.card} data-testid="feature-heatmap">
      <div style={s.title}>Feature Comparison Heatmap</div>
      <div style={{ color: '#888', fontSize: 12, marginBottom: 12 }}>Capability score (0-100) per feature x competitor.</div>
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Feature</th>
              {data.competitors.map(c => <th key={c} style={s.th}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.features.map((f, i) => (
              <tr key={f}>
                <td style={s.rh}>{f}</td>
                {data.matrix[i].map((v, j) => (
                  <td key={j} style={s.cell(v)}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
