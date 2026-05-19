import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function MarketShareDonut() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/custom-views/market-share')
      .then(r => { setData(r.data); setLoading(false); })
      .catch(e => { setErr(e.response?.data?.error || e.message); setLoading(false); });
  }, []);

  const s = {
    card: { background: '#16213e', border: '1px solid #0f3460', borderRadius: 12, padding: 20, marginBottom: 20 },
    title: { color: '#e94560', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    row: { display: 'flex', gap: 30, alignItems: 'center', flexWrap: 'wrap' },
    legend: { color: '#e0e0e0', fontSize: 13, flex: 1, minWidth: 220 },
    legendItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' },
    sw: (c) => ({ width: 14, height: 14, background: c, borderRadius: 3 }),
  };

  if (loading) return <div style={s.card}><div style={s.title}>Market Share</div><div style={{ color: '#888' }}>Loading...</div></div>;
  if (err) return <div style={s.card}><div style={s.title}>Market Share</div><div style={{ color: '#e94560' }}>Error: {err}</div></div>;

  const total = data.segments.reduce((sum, x) => sum + x.share, 0);
  const R = 90;
  const cx = 110, cy = 110;
  let acc = 0;
  const slices = data.segments.map((seg, i) => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += seg.share;
    const end = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end);
    const largeArc = end - start > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={i} d={d} fill={seg.color} stroke="#16213e" strokeWidth="2" />;
  });

  return (
    <div style={s.card} data-testid="market-share-donut">
      <div style={s.title}>Market Share Distribution</div>
      <div style={s.row}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          {slices}
          <circle cx={cx} cy={cy} r={48} fill="#16213e" />
          <text x={cx} y={cy - 4} fill="#e0e0e0" fontSize="12" textAnchor="middle">Total</text>
          <text x={cx} y={cy + 14} fill="#e94560" fontSize="16" fontWeight="bold" textAnchor="middle">{total.toFixed(1)}%</text>
        </svg>
        <div style={s.legend}>
          {data.segments.map(seg => (
            <div key={seg.competitor} style={s.legendItem}>
              <div style={s.sw(seg.color)} />
              <div style={{ flex: 1 }}>{seg.competitor}</div>
              <div style={{ color: '#888' }}>{seg.share}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
