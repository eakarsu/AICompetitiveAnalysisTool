import React, { useState } from 'react';
import api from '../services/api';

const tabs = [
  { id: 'analyze-competitor', label: '🏢 Competitor', endpoint: '/ai/analyze-competitor', fields: [
    { key: 'competitor_name', label: 'Competitor Name', type: 'input' }, { key: 'competitor_url', label: 'URL', type: 'input' }, { key: 'industry', label: 'Industry', type: 'input' }, { key: 'focus_areas', label: 'Focus Areas', type: 'textarea' }] },
  { id: 'generate-swot', label: '🎯 SWOT', endpoint: '/ai/generate-swot', fields: [
    { key: 'company', label: 'Company', type: 'input' }, { key: 'industry', label: 'Industry', type: 'input' }, { key: 'context', label: 'Context', type: 'textarea' }] },
  { id: 'analyze-market', label: '📈 Market', endpoint: '/ai/analyze-market', fields: [
    { key: 'industry', label: 'Industry', type: 'input' }, { key: 'region', label: 'Region', type: 'input' }, { key: 'timeframe', label: 'Timeframe', type: 'input' }] },
  { id: 'analyze-pricing', label: '💰 Pricing', endpoint: '/ai/analyze-pricing', fields: [
    { key: 'product', label: 'Product', type: 'input' }, { key: 'competitors', label: 'Competitors', type: 'input' }, { key: 'market', label: 'Market', type: 'input' }] },
  { id: 'compare-products', label: '⚖️ Products', endpoint: '/ai/compare-products', fields: [
    { key: 'product1', label: 'Product 1', type: 'input' }, { key: 'product2', label: 'Product 2', type: 'input' }, { key: 'criteria', label: 'Criteria', type: 'textarea' }] },
  { id: 'analyze-social-media', label: '📱 Social', endpoint: '/ai/analyze-social-media', fields: [
    { key: 'brand', label: 'Brand', type: 'input' }, { key: 'platforms', label: 'Platforms', type: 'input' }, { key: 'timeframe', label: 'Timeframe', type: 'input' }] },
  { id: 'analyze-trends', label: '📰 Trends', endpoint: '/ai/analyze-trends', fields: [
    { key: 'industry', label: 'Industry', type: 'input' }, { key: 'region', label: 'Region', type: 'input' }, { key: 'keywords', label: 'Keywords', type: 'input' }] },
  { id: 'analyze-reviews', label: '⭐ Reviews', endpoint: '/ai/analyze-reviews', fields: [
    { key: 'product', label: 'Product', type: 'input' }, { key: 'review_source', label: 'Source', type: 'input' }, { key: 'sample_reviews', label: 'Sample Reviews', type: 'textarea' }] },
  { id: 'analyze-seo', label: '🔍 SEO', endpoint: '/ai/analyze-seo', fields: [
    { key: 'url', label: 'URL', type: 'input' }, { key: 'keywords', label: 'Keywords', type: 'input' }, { key: 'competitors', label: 'Competitors', type: 'input' }] },
  { id: 'generate-report', label: '📋 Report', endpoint: '/ai/generate-report', fields: [
    { key: 'company', label: 'Company', type: 'input' }, { key: 'report_type', label: 'Report Type', type: 'input' }, { key: 'data_points', label: 'Data Points', type: 'textarea' }] },
  { id: 'analyze-ads', label: '📣 Ads', endpoint: '/ai/analyze-ads', fields: [
    { key: 'competitor', label: 'Competitor', type: 'input' }, { key: 'platforms', label: 'Platforms', type: 'input' }, { key: 'ad_type', label: 'Ad Type', type: 'input' }] },
  { id: 'analyze-hiring', label: '👥 Hiring', endpoint: '/ai/analyze-hiring', fields: [
    { key: 'company', label: 'Company', type: 'input' }, { key: 'roles', label: 'Roles', type: 'input' }, { key: 'timeframe', label: 'Timeframe', type: 'input' }] },
  { id: 'chat', label: '💬 Chat', endpoint: '/ai/chat', fields: [
    { key: 'message', label: 'Message', type: 'textarea' }, { key: 'context', label: 'Context', type: 'input' }] },
];

const renderResult = (obj, depth = 0) => {
  if (!obj) return null;
  if (typeof obj === 'string') return <p style={{ color: '#e0e0e0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{obj}</p>;
  if (Array.isArray(obj)) return (
    <div style={{ marginLeft: depth * 12 }}>
      {obj.map((item, i) => (
        <div key={i} style={{ background: '#1a1a2e', padding: 12, borderRadius: 8, marginBottom: 8, borderLeft: '3px solid #e94560' }}>
          {typeof item === 'object' ? renderResult(item, depth + 1) : <span style={{ color: '#e0e0e0' }}>{String(item)}</span>}
        </div>
      ))}
    </div>
  );
  return (
    <div style={{ marginLeft: depth * 12 }}>
      {Object.entries(obj).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 12 }}>
          <div style={{ color: '#e94560', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 }}>{k.replace(/_/g, ' ')}</div>
          {typeof v === 'object' && v !== null ? renderResult(v, depth + 1) : (
            <div style={{ color: '#e0e0e0', background: '#1a1a2e', padding: '8px 12px', borderRadius: 6, fontSize: 14 }}>
              {typeof v === 'number' ? <span style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: 18 }}>{v}</span> :
               typeof v === 'boolean' ? <span style={{ color: v ? '#2ecc71' : '#e94560', fontWeight: 'bold' }}>{v ? 'Yes' : 'No'}</span> : String(v)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState('analyze-competitor');
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const tab = tabs.find(t => t.id === activeTab);

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await api.post(tab.endpoint, formData);
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(false); }
  };

  const s = {
    page: { padding: 30 },
    title: { color: '#e94560', fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { color: '#888', fontSize: 14, marginBottom: 20 },
    tabs: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 },
    tab: (active) => ({ padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 12, border: 'none', background: active ? '#e94560' : '#16213e', color: active ? '#fff' : '#a0a0b0', transition: 'all 0.2s' }),
    card: { background: '#16213e', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #0f3460' },
    label: { color: '#a0a0b0', fontSize: 13, marginBottom: 6, display: 'block' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 14, marginBottom: 16, minHeight: 100, boxSizing: 'border-box', resize: 'vertical' },
    btn: { padding: '12px 28px', borderRadius: 8, border: 'none', background: '#e94560', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' },
    error: { background: '#2d1528', border: '1px solid #e94560', color: '#e94560', padding: 16, borderRadius: 12, marginBottom: 24 },
  };

  return (
    <div style={s.page}>
      <div style={s.title}>🤖 AI Analysis Tools</div>
      <div style={s.subtitle}>13 AI-powered competitive analysis tools</div>

      <div style={s.tabs}>
        {tabs.map(t => (
          <button key={t.id} style={s.tab(activeTab === t.id)} onClick={() => { setActiveTab(t.id); setResult(null); setError(''); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.card}>
        {tab.fields.map(f => (
          <div key={f.key}>
            <label style={s.label}>{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea style={s.textarea} placeholder={`Enter ${f.label.toLowerCase()}...`} value={formData[f.key] || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
            ) : (
              <input style={s.input} placeholder={`Enter ${f.label.toLowerCase()}...`} value={formData[f.key] || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
            )}
          </div>
        ))}
        <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>
      </div>

      {error && <div style={s.error}>{error}</div>}
      {result && (
        <div style={s.card}>
          <div style={{ color: '#e94560', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Results</div>
          {renderResult(result)}
        </div>
      )}
    </div>
  );
}
