import React, { useState, useEffect } from 'react';
import api from '../services/api';

const statCards = [
  { key: 'competitors', label: 'Competitors', icon: '🏢', color: '#e94560' },
  { key: 'market-analysis', label: 'Market Analysis', icon: '📈', color: '#2ecc71' },
  { key: 'swot-analysis', label: 'SWOT Analysis', icon: '🎯', color: '#3498db' },
  { key: 'price-comparison', label: 'Price Comparisons', icon: '💰', color: '#f39c12' },
  { key: 'product-comparison', label: 'Product Comparisons', icon: '⚖️', color: '#9b59b6' },
  { key: 'social-media', label: 'Social Media', icon: '📱', color: '#1abc9c' },
  { key: 'news-trends', label: 'News & Trends', icon: '📰', color: '#e67e22' },
  { key: 'customer-reviews', label: 'Customer Reviews', icon: '⭐', color: '#f1c40f' },
  { key: 'seo-analysis', label: 'SEO Analysis', icon: '🔍', color: '#2ecc71' },
  { key: 'industry-reports', label: 'Industry Reports', icon: '📋', color: '#3498db' },
  { key: 'ad-tracker', label: 'Ad Tracker', icon: '📣', color: '#e94560' },
  { key: 'hiring-tracker', label: 'Hiring Tracker', icon: '👥', color: '#9b59b6' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  useEffect(() => { api.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {}); }, []);

  const s = {
    page: { padding: 30 },
    title: { color: '#e94560', fontSize: 26, fontWeight: 'bold', marginBottom: 24 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
    card: (color) => ({ background: '#16213e', borderRadius: 12, padding: 20, border: '1px solid #0f3460', borderTop: `3px solid ${color}` }),
    icon: { fontSize: 28, marginBottom: 8 },
    value: { fontSize: 32, fontWeight: 'bold', color: '#e0e0e0' },
    label: { color: '#888', fontSize: 13, marginTop: 4 }
  };

  return (
    <div style={s.page}>
      <div style={s.title}>Dashboard</div>
      <div style={s.grid}>
        {statCards.map(c => (
          <div key={c.key} style={s.card(c.color)}>
            <div style={s.icon}>{c.icon}</div>
            <div style={s.value}>{stats[c.key] || 0}</div>
            <div style={s.label}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
