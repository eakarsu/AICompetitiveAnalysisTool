import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TYPE_LABELS = {
  'analyze-competitor': 'Competitor Analysis',
  'generate-swot': 'SWOT Analysis',
  'analyze-market': 'Market Analysis',
  'analyze-pricing': 'Pricing Analysis',
  'compare-products': 'Product Comparison',
  'analyze-social-media': 'Social Media',
  'analyze-trends': 'Trend Analysis',
  'analyze-reviews': 'Review Analysis',
  'analyze-seo': 'SEO Analysis',
  'generate-report': 'Report',
  'analyze-ads': 'Ad Analysis',
  'analyze-hiring': 'Hiring Analysis',
  'chat': 'Chat',
  'generate-battle-card': 'Battle Card',
  'compliance-scan': 'Compliance Scan',
  'compliance-evidence': 'Compliance Evidence',
  'compliance-remediation': 'Remediation Plan',
};

const s = {
  page: { padding: 30 },
  title: { color: '#e94560', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { color: '#888', fontSize: 14, marginBottom: 24 },
  card: { background: '#16213e', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid #0f3460', cursor: 'pointer' },
  badge: (type) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 'bold',
    background: '#0f3460', color: '#e94560', marginBottom: 8
  }),
  meta: { color: '#666', fontSize: 12, marginTop: 6 },
  detail: { background: '#16213e', borderRadius: 12, padding: 24, border: '1px solid #0f3460', marginTop: 16 },
  closeBtn: { padding: '8px 20px', borderRadius: 8, border: 'none', background: '#e94560', color: '#fff', fontWeight: 'bold', cursor: 'pointer', marginBottom: 16 },
  filter: { padding: '8px 14px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 13, marginRight: 8 },
  pagination: { display: 'flex', gap: 8, marginTop: 20 },
  pageBtn: (active) => ({ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 'bold', background: active ? '#e94560' : '#16213e', color: active ? '#fff' : '#a0a0b0' }),
  empty: { color: '#666', textAlign: 'center', padding: 60 },
};

function renderJson(obj, depth = 0) {
  if (!obj || (typeof obj === 'object' && Object.keys(obj).length === 0)) return null;
  if (typeof obj === 'string') return <p style={{ color: '#e0e0e0', margin: '4px 0', whiteSpace: 'pre-wrap' }}>{obj}</p>;
  if (Array.isArray(obj)) return (
    <div style={{ marginLeft: depth * 10 }}>
      {obj.map((item, i) => (
        <div key={i} style={{ background: '#1a1a2e', padding: 10, borderRadius: 6, marginBottom: 6, borderLeft: '3px solid #e94560' }}>
          {typeof item === 'object' ? renderJson(item, depth + 1) : <span style={{ color: '#e0e0e0' }}>{String(item)}</span>}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ marginLeft: depth * 10 }}>
      {Object.entries(obj).filter(([k]) => !k.startsWith('_')).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 10 }}>
          <div style={{ color: '#e94560', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 3 }}>{k.replace(/_/g, ' ')}</div>
          {typeof v === 'object' && v !== null ? renderJson(v, depth + 1) : (
            <div style={{ color: '#e0e0e0', background: '#1a1a2e', padding: '6px 10px', borderRadius: 5, fontSize: 13 }}>
              {typeof v === 'number' ? <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{v}</span> : String(v)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AIHistoryPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const limit = 15;

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (typeFilter) params.type = typeFilter;
      const res = await api.get('/ai/history', { params });
      setItems(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [page, typeFilter]);

  const totalPages = Math.ceil(total / limit);

  const inputSummary = (params) => {
    const vals = Object.values(params || {}).filter(Boolean).slice(0, 2);
    return vals.join(' | ') || '—';
  };

  return (
    <div style={s.page}>
      <div style={s.title}>📚 AI Analysis History</div>
      <div style={s.subtitle}>All persisted AI analyses — {total} total</div>

      <div style={{ marginBottom: 20 }}>
        <select style={s.filter} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        {typeFilter && <button style={{ ...s.closeBtn, padding: '8px 14px', marginBottom: 0 }} onClick={() => { setTypeFilter(''); setPage(1); }}>Clear</button>}
      </div>

      {selected && (
        <div style={s.detail}>
          <button style={s.closeBtn} onClick={() => setSelected(null)}>Close</button>
          <div style={{ color: '#e94560', fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
            {TYPE_LABELS[selected.analysis_type] || selected.analysis_type}
          </div>
          <div style={s.meta}>
            Run on {new Date(selected.created_at).toLocaleString()} &bull; Model: {selected.model || 'unknown'} &bull; Tokens: {selected.tokens_used || '—'}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#a0a0b0', fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>Input Parameters</div>
            {renderJson(selected.input_params)}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ color: '#a0a0b0', fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>Result</div>
            {renderJson(selected.result)}
          </div>
        </div>
      )}

      {!selected && (
        <>
          {loading && <div style={s.empty}>Loading...</div>}
          {!loading && items.length === 0 && <div style={s.empty}>No analyses found. Run some AI tools to see history here.</div>}
          {!loading && items.map(item => (
            <div key={item.id} style={s.card} onClick={() => setSelected(item)}>
              <span style={s.badge(item.analysis_type)}>{TYPE_LABELS[item.analysis_type] || item.analysis_type}</span>
              <div style={{ color: '#e0e0e0', fontSize: 14 }}>{inputSummary(item.input_params)}</div>
              <div style={s.meta}>
                {new Date(item.created_at).toLocaleString()} &bull; {item.model || 'unknown model'}
                {item.tokens_used ? ` &bull; ${item.tokens_used} tokens` : ''}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={s.pagination}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} style={s.pageBtn(p === page)} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
