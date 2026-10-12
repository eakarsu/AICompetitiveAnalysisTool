import React, { useState } from 'react';
import api from '../services/api';
import AIFieldPresets, { completeExample } from './AIFieldPresets';
import AIResultView from './AIResultView';

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
  { id: 'generate-battle-card', label: '⚔️ Battle Card', endpoint: '/ai/generate-battle-card', fields: [
    { key: 'our_company', label: 'Our Company', type: 'input' },
    { key: 'competitor', label: 'Competitor Name', type: 'input' },
    { key: 'our_strengths', label: 'Our Key Strengths', type: 'textarea' },
    { key: 'deal_context', label: 'Deal Context', type: 'textarea' }] },
  { id: 'analyze-competitors', label: '🆚 Competitors SWOT', endpoint: '/ai/analyze-competitors', fields: [
    { key: 'our_company', label: 'Our Company', type: 'input' },
    { key: 'competitors', label: 'Competitors (comma-separated)', type: 'input' },
    { key: 'industry', label: 'Industry', type: 'input' },
    { key: 'context', label: 'Additional Context', type: 'textarea' }] },
  { id: 'predict-market-shift', label: '🌪️ Market Shift', endpoint: '/ai/predict-market-shift', fields: [
    { key: 'industry', label: 'Industry', type: 'input' },
    { key: 'region', label: 'Region', type: 'input' },
    { key: 'signals', label: 'Recent Signals / Indicators', type: 'textarea' },
    { key: 'horizon', label: 'Forecast Horizon', type: 'input' }] },
  { id: 'synthesize-intelligence', label: '🧠 Synthesize', endpoint: '/ai/synthesize-intelligence', fields: [
    { key: 'topic', label: 'Topic / Focus', type: 'input' },
    { key: 'intel_items', label: 'Intel Items (one per line)', type: 'textarea' },
    { key: 'audience', label: 'Audience', type: 'input' }] },
  { id: 'vertical-benchmarking', label: '📊 Vertical Benchmark', endpoint: '/ai/vertical-benchmarking', fields: [
    { key: 'our_company', label: 'Our Company', type: 'input' },
    { key: 'vertical', label: 'Vertical / Industry', type: 'input' },
    { key: 'region', label: 'Region', type: 'input' },
    { key: 'peers', label: 'Peers (comma-separated, optional)', type: 'input' },
    { key: 'our_metrics_text', label: 'Our metrics (one per line, key: value)', type: 'textarea' }] },
];

function illustrativeExamples(tab) {
  const organizations = ['Northstar Analytics', 'Maple Metrics', 'Acme Insights'];
  const products = ['Market Atlas', 'Signal Desk', 'Benchmark Studio'];
  const stages = ['initial planning', 'evidence review', 'executive decision'];
  return ['Quick scenario', 'Evidence review', 'Executive brief'].map((label, index) => ({
    label,
    values: Object.fromEntries(tab.fields.map(({ key, label: fieldLabel }) => {
      const field = `${key} ${fieldLabel}`.toLowerCase();
      const fictional = 'Fictional example only; replace with verified, authorized source information.';
      let value;
      if (key === 'competitor_url' || key === 'url') value = `https://example.com/${['market', 'research', 'brief'][index]}`;
      else if (['competitor_name', 'competitor', 'company', 'our_company', 'brand'].includes(key)) value = `${organizations[index]} (fictional)`;
      else if (key === 'product' || key === 'product1') value = `${products[index]} (fictional)`;
      else if (key === 'product2') value = `${products[(index + 1) % products.length]} (fictional)`;
      else if (field.includes('industry') || key === 'vertical') value = 'Competitive intelligence software (illustrative)';
      else if (key === 'region' || key === 'market') value = 'North America (illustrative market scope)';
      else if (key === 'timeframe' || key === 'horizon') value = ['Next 30 days', 'Next 90 days', 'Next two quarters'][index];
      else if (key === 'focus_areas') value = `${fictional} Review product positioning, pricing presentation, audience, and public messaging.`;
      else if (key === 'criteria') value = `${fictional} Compare product fit, stated capabilities, support model, and evidence quality.`;
      else if (key === 'platforms') value = 'Company website and publicly available channels; verify source terms before research.';
      else if (key === 'sample_reviews') value = `${fictional}\n“Setup was straightforward, though the reporting options took time to learn.”\n“Support answered our questions after we clarified the issue.”`;
      else if (['data_points', 'signals', 'our_metrics_text'].includes(key)) value = `${fictional}\nAdoption: example observation requiring validation\nGrowth: no verified figures supplied\nRisk: source freshness and comparability need review`;
      else if (key === 'intel_items') value = `${fictional}\nPublic product-page change — verify date and source\nCustomer comment trend — confirm collection rights and sample size`;
      else if (key === 'keywords') value = 'market intelligence; competitive positioning; analyst workflow (illustrative terms)';
      else if (key === 'report_type') value = ['Initial market scan', 'Evidence and gap review', 'Executive briefing'][index];
      else if (key === 'ad_type') value = ['Search campaign', 'Product announcement', 'Brand awareness'][index];
      else if (key === 'roles') value = 'Product analyst; customer success lead (illustrative roles)';
      else if (key === 'audience') value = ['Strategy team', 'Research reviewers', 'Executive decision makers'][index];
      else if (key === 'message') value = `${fictional} Explain the comparison, evidence gaps, and decisions needed for ${stages[index]}.`;
      else value = `${fictional} ${fieldLabel}: assess the available information for ${stages[index]}, state assumptions, and identify what should be verified.`;
      return [key, value];
    })),
  }));
}

export default function AIToolsPage() {
  const [activeTab, setActiveTab] = useState('analyze-competitor');
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [presetMessage, setPresetMessage] = useState('');

  const tab = tabs.find(t => t.id === activeTab);

  const handleSubmit = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      let payload = { ...formData };
      if (tab.id === 'vertical-benchmarking') {
        if (typeof payload.peers === 'string' && payload.peers.trim()) {
          payload.peers = payload.peers.split(',').map(s => s.trim()).filter(Boolean);
        }
        if (typeof payload.our_metrics_text === 'string' && payload.our_metrics_text.trim()) {
          const m = {};
          payload.our_metrics_text.split('\n').forEach(line => {
            const idx = line.indexOf(':');
            if (idx > 0) {
              const k = line.slice(0, idx).trim();
              const v = line.slice(idx + 1).trim();
              if (k) m[k] = v;
            }
          });
          payload.our_metrics = m;
          delete payload.our_metrics_text;
        }
      }
      const res = await api.post(tab.endpoint, payload);
      setResult(res.data);
    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.error || e.message;
      setError(status === 503 ? `${msg} (server is missing the LLM API key)` : msg);
    }
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
      <div style={s.subtitle}>14 AI-powered competitive analysis tools &mdash; <a href="/ai-history" style={{ color: '#e94560', textDecoration: 'none' }}>View Analysis History &rarr;</a></div>

      <div style={s.tabs}>
        {tabs.map(t => (
          <button key={t.id} style={s.tab(activeTab === t.id)} onClick={() => { setActiveTab(t.id); setResult(null); setError(''); setPresetMessage(''); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={s.card}>
        <AIFieldPresets fields={tab.fields} samples={illustrativeExamples(tab)} context={tab.label} disabled={loading} onFill={(sample, index) => { setFormData(completeExample(tab.fields, sample, index, tab.label, formData)); setResult(null); setError(''); setPresetMessage(`${tab.fields.length} fields filled with fictional inputs, including every optional field. Review before running.`); }} />
        {presetMessage && <p role="status" style={{ color: '#fbbf24', marginBottom: 16 }}>{presetMessage}</p>}
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
      {result && <AIResultView response={result} title={`${tab.label} analysis`} label="AI analysis" />}
    </div>
  );
}
