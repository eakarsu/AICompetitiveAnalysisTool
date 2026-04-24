import React, { useState } from 'react';
import api from '../services/api';

const tabs = [
  { id: 'scan', label: '🔍 Scan Compliance', endpoint: '/compliance-agents/scan-compliance', fields: [
    { key: 'framework', label: 'Framework', type: 'input', placeholder: 'e.g., SOC2, GDPR, HIPAA, ISO 27001' },
    { key: 'scope', label: 'Scope', type: 'input', placeholder: 'e.g., Full organization, IT department' },
    { key: 'current_state', label: 'Current State', type: 'textarea', placeholder: 'Describe current compliance posture...' }] },
  { id: 'evidence', label: '📄 Generate Evidence', endpoint: '/compliance-agents/generate-evidence', fields: [
    { key: 'framework', label: 'Framework', type: 'input', placeholder: 'e.g., SOC2, GDPR' },
    { key: 'control', label: 'Control', type: 'input', placeholder: 'e.g., CC6.1 - Logical Access Controls' },
    { key: 'requirement', label: 'Requirement', type: 'textarea', placeholder: 'Describe the specific requirement...' }] },
  { id: 'remediation', label: '🔧 Remediation Plan', endpoint: '/compliance-agents/remediation-plan', fields: [
    { key: 'findings', label: 'Findings', type: 'textarea', placeholder: 'Describe audit findings to remediate...' },
    { key: 'framework', label: 'Framework', type: 'input', placeholder: 'e.g., SOC2, PCI-DSS' },
    { key: 'timeline', label: 'Timeline', type: 'input', placeholder: 'e.g., 90 days, 6 months' }] },
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

export default function ComplianceAgentsPage() {
  const [activeTab, setActiveTab] = useState('scan');
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
    tabs: { display: 'flex', gap: 8, marginBottom: 24 },
    tab: (active) => ({ padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', fontSize: 14, border: 'none', background: active ? '#e94560' : '#16213e', color: active ? '#fff' : '#a0a0b0', transition: 'all 0.2s' }),
    card: { background: '#16213e', borderRadius: 12, padding: 24, marginBottom: 24, border: '1px solid #0f3460' },
    label: { color: '#a0a0b0', fontSize: 13, marginBottom: 6, display: 'block' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 14, marginBottom: 16, minHeight: 100, boxSizing: 'border-box', resize: 'vertical' },
    btn: { padding: '12px 28px', borderRadius: 8, border: 'none', background: '#e94560', color: '#fff', fontWeight: 'bold', fontSize: 15, cursor: 'pointer' },
    error: { background: '#2d1528', border: '1px solid #e94560', color: '#e94560', padding: 16, borderRadius: 12, marginBottom: 24 },
  };

  return (
    <div style={s.page}>
      <div style={s.title}>🛡️ Compliance Audit Agents</div>
      <div style={s.subtitle}>AI-powered compliance scanning, evidence generation, and remediation planning</div>

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
              <textarea style={s.textarea} placeholder={f.placeholder} value={formData[f.key] || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
            ) : (
              <input style={s.input} placeholder={f.placeholder} value={formData[f.key] || ''} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} />
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
