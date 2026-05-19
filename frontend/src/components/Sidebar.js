import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/competitors', label: 'Competitors', icon: '🏢' },
  { path: '/market-analysis', label: 'Market Analysis', icon: '📈' },
  { path: '/swot-analysis', label: 'SWOT Analysis', icon: '🎯' },
  { path: '/price-comparison', label: 'Price Comparison', icon: '💰' },
  { path: '/product-comparison', label: 'Product Comparison', icon: '⚖️' },
  { path: '/social-media', label: 'Social Media', icon: '📱' },
  { path: '/news-trends', label: 'News & Trends', icon: '📰' },
  { path: '/customer-reviews', label: 'Customer Reviews', icon: '⭐' },
  { path: '/seo-analysis', label: 'SEO Analysis', icon: '🔍' },
  { path: '/industry-reports', label: 'Industry Reports', icon: '📋' },
  { path: '/ad-tracker', label: 'Ad Tracker', icon: '📣' },
  { path: '/hiring-tracker', label: 'Hiring Tracker', icon: '👥' },
  { path: '/ai-tools', label: 'AI Tools', icon: '🤖' },
  { path: '/compliance-agents', label: 'Compliance Audit', icon: '🛡️' },
  { path: '/custom-views', label: 'Compete Views', icon: '🧭' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const s = {
    sidebar: { width: 250, background: '#16213e', height: '100vh', position: 'fixed', left: 0, top: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #0f3460', overflowY: 'auto' },
    logo: { padding: '20px', fontSize: '18px', fontWeight: 'bold', color: '#e94560', borderBottom: '1px solid #0f3460', textAlign: 'center' },
    menu: { flex: 1, padding: '10px 0' },
    item: (active) => ({
      padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
      background: active ? '#0f3460' : 'transparent', color: active ? '#e94560' : '#a0a0b0',
      borderLeft: active ? '3px solid #e94560' : '3px solid transparent', transition: 'all 0.2s', fontSize: '13px'
    }),
    logout: { padding: '15px 20px', borderTop: '1px solid #0f3460', cursor: 'pointer', color: '#e94560', textAlign: 'center', fontSize: '14px' }
  };

  return (
    <div style={s.sidebar}>
      <div style={s.logo}>🏆 Competitive Analysis</div>
      <div style={s.menu}>
        {menuItems.map(item => (
          <div key={item.path} style={s.item(location.pathname === item.path)} onClick={() => navigate(item.path)}>
            <span>{item.icon}</span> {item.label}
          </div>
        ))}
      </div>
      <div style={s.logout} onClick={() => { localStorage.removeItem('token'); window.location.href = '/'; }}>🚪 Logout</div>
    </div>
  );
}
