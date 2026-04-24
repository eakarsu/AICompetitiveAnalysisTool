import React, { useState, useEffect } from 'react';
import api from '../services/api';

const resourceConfigs = {
  'competitors': { title: 'Competitors', icon: '🏢', fields: ['name','website','industry','description','market_cap','employee_count','headquarters','founded','key_products','threat_level','status'] },
  'market-analysis': { title: 'Market Analysis', icon: '📈', fields: ['title','industry','region','market_size','growth_rate','key_trends','major_players','opportunities','threats','status'] },
  'swot-analysis': { title: 'SWOT Analysis', icon: '🎯', fields: ['title','company','strengths','weaknesses','opportunities','threats','recommendations','overall_score','analyst','status'] },
  'price-comparison': { title: 'Price Comparison', icon: '💰', fields: ['title','product','our_price','competitor_name','competitor_price','features_comparison','value_score','market','status'] },
  'product-comparison': { title: 'Product Comparison', icon: '⚖️', fields: ['title','product1','product2','criteria','comparison_results','winner','recommendation','status'] },
  'social-media': { title: 'Social Media', icon: '📱', fields: ['title','brand','platform','followers','engagement_rate','content_frequency','sentiment','top_posts','analysis','status'] },
  'news-trends': { title: 'News & Trends', icon: '📰', fields: ['title','industry','source','summary','impact_level','relevance_score','keywords','status'] },
  'customer-reviews': { title: 'Customer Reviews', icon: '⭐', fields: ['title','product','source','rating','sentiment','positive_themes','negative_themes','feature_requests','review_count','status'] },
  'seo-analysis': { title: 'SEO Analysis', icon: '🔍', fields: ['title','url','domain_authority','keywords','organic_traffic_estimate','backlinks_estimate','top_pages','technical_issues','content_gaps','status'] },
  'industry-reports': { title: 'Industry Reports', icon: '📋', fields: ['title','industry','report_type','executive_summary','key_findings','market_data','recommendations','source','status'] },
  'ad-tracker': { title: 'Ad Tracker', icon: '📣', fields: ['title','competitor','platform','ad_type','ad_copy','targeting','estimated_spend','landing_page','effectiveness_score','status'] },
  'hiring-tracker': { title: 'Hiring Tracker', icon: '👥', fields: ['title','company','role_title','department','seniority','location','skills_required','salary_range','strategic_signal','status'] },
};

const longFields = ['description','key_products','strengths','weaknesses','opportunities','threats','recommendations','key_trends','major_players','features_comparison','criteria','comparison_results','recommendation','top_posts','analysis','summary','keywords','positive_themes','negative_themes','feature_requests','top_pages','technical_issues','content_gaps','executive_summary','key_findings','market_data','ad_copy','targeting','skills_required','strategic_signal'];

export default function CrudPage({ resource }) {
  const config = resourceConfigs[resource] || { title: resource, icon: '📄', fields: ['title','status'] };
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => api.get(`/${resource}`).then(r => setItems(r.data.data || r.data)).catch(() => {});
  useEffect(() => { load(); setSelected(null); }, [resource]);

  const handleSave = async () => {
    try {
      if (editing) await api.put(`/${resource}/${formData.id}`, formData);
      else await api.post(`/${resource}`, formData);
      setShowModal(false); setFormData({}); setEditing(false); load();
    } catch (e) { alert(e.response?.data?.error || 'Error saving'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try { await api.delete(`/${resource}/${id}`); if (selected?.id === id) setSelected(null); load(); } catch (e) { alert('Error deleting'); }
  };

  const s = {
    page: { padding: 30 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { color: '#e94560', fontSize: 24, fontWeight: 'bold' },
    btn: { padding: '10px 20px', borderRadius: 8, border: 'none', background: '#e94560', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
    searchBox: { padding: '10px 16px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', width: 300, marginRight: 12 },
    content: { display: 'flex', gap: 20 },
    list: { flex: selected ? 1 : 1 },
    detail: { width: 400, background: '#16213e', borderRadius: 12, padding: 20, border: '1px solid #0f3460' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', color: '#e94560', borderBottom: '2px solid #0f3460', fontSize: 13, textTransform: 'uppercase' },
    td: { padding: '10px 16px', borderBottom: '1px solid #0f3460', color: '#e0e0e0', fontSize: 14, cursor: 'pointer' },
    row: (active) => ({ background: active ? '#0f3460' : 'transparent', transition: 'background 0.2s' }),
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#16213e', borderRadius: 16, padding: 30, width: 500, maxHeight: '80vh', overflowY: 'auto', border: '1px solid #0f3460' },
    input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #0f3460', background: '#0a0a1a', color: '#e0e0e0', fontSize: 14, marginBottom: 12, minHeight: 80, boxSizing: 'border-box', resize: 'vertical' },
    label: { color: '#a0a0b0', fontSize: 12, marginBottom: 4, display: 'block', textTransform: 'uppercase' },
    detailField: { marginBottom: 12 },
    detailLabel: { color: '#e94560', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 2 },
    detailValue: { color: '#e0e0e0', fontSize: 14, background: '#0a0a1a', padding: '8px 12px', borderRadius: 6, wordBreak: 'break-word' },
    actions: { display: 'flex', gap: 8, marginTop: 16 },
    btnSmall: (bg) => ({ padding: '8px 16px', borderRadius: 6, border: 'none', background: bg, color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: 13 }),
  };

  const displayFields = config.fields.slice(0, 4);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>{config.icon} {config.title}</div>
        <div>
          <input style={s.searchBox} placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={s.btn} onClick={() => { setFormData({}); setEditing(false); setShowModal(true); }}>+ Add New</button>
        </div>
      </div>

      <div style={s.content}>
        <div style={s.list}>
          <table style={s.table}>
            <thead><tr>{displayFields.map(f => <th key={f} style={s.th}>{f.replace(/_/g,' ')}</th>)}<th style={s.th}>Actions</th></tr></thead>
            <tbody>
              {items.filter(item => !search || JSON.stringify(item).toLowerCase().includes(search.toLowerCase())).map(item => (
                <tr key={item.id} style={s.row(selected?.id === item.id)} onClick={() => setSelected(item)}>
                  {displayFields.map(f => <td key={f} style={s.td}>{String(item[f] || '').substring(0, 60)}</td>)}
                  <td style={s.td}>
                    <span style={{ cursor: 'pointer', marginRight: 12 }} onClick={(e) => { e.stopPropagation(); setFormData(item); setEditing(true); setShowModal(true); }}>✏️</span>
                    <span style={{ cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}>🗑️</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <div style={{ color: '#888', textAlign: 'center', padding: 40 }}>No records found</div>}
        </div>

        {selected && (
          <div style={s.detail}>
            <div style={{ color: '#e94560', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Details</div>
            {config.fields.map(f => selected[f] != null && (
              <div key={f} style={s.detailField}>
                <div style={s.detailLabel}>{f.replace(/_/g, ' ')}</div>
                <div style={s.detailValue}>{String(selected[f])}</div>
              </div>
            ))}
            <div style={s.actions}>
              <button style={s.btnSmall('#3498db')} onClick={() => { setFormData(selected); setEditing(true); setShowModal(true); }}>Edit</button>
              <button style={s.btnSmall('#e74c3c')} onClick={() => handleDelete(selected.id)}>Delete</button>
              <button style={s.btnSmall('#555')} onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={s.modal} onClick={() => setShowModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ color: '#e94560', fontSize: 20, fontWeight: 'bold', marginBottom: 20 }}>{editing ? 'Edit' : 'Create'} {config.title}</div>
            {config.fields.filter(f => f !== 'id').map(f => (
              <div key={f}>
                <label style={s.label}>{f.replace(/_/g, ' ')}</label>
                {longFields.includes(f) ? (
                  <textarea style={s.textarea} value={formData[f] || ''} onChange={e => setFormData({ ...formData, [f]: e.target.value })} />
                ) : (
                  <input style={s.input} value={formData[f] || ''} onChange={e => setFormData({ ...formData, [f]: e.target.value })} />
                )}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button style={s.btn} onClick={handleSave}>{editing ? 'Update' : 'Create'}</button>
              <button style={{ ...s.btn, background: '#555' }} onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
