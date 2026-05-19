import React from 'react';
import FeatureHeatmap from '../components/customViews/FeatureHeatmap';
import MarketShareDonut from '../components/customViews/MarketShareDonut';
import IntelligenceBriefPdf from '../components/customViews/IntelligenceBriefPdf';
import TrackedRulesEditor from '../components/customViews/TrackedRulesEditor';

export default function CustomViewsPage() {
  const s = {
    page: { padding: 30, minHeight: '100vh', background: '#0a0a1a' },
    header: { color: '#e94560', fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
    sub: { color: '#888', fontSize: 14, marginBottom: 24 },
  };
  return (
    <div style={s.page} data-testid="custom-views-page">
      <div style={s.header}>Compete Views</div>
      <div style={s.sub}>Custom competitive market analysis views: heatmap, market share, intel brief, tracked rules.</div>
      <FeatureHeatmap />
      <MarketShareDonut />
      <IntelligenceBriefPdf />
      <TrackedRulesEditor />
    </div>
  );
}
