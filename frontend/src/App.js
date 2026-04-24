import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CrudPage from './pages/CrudPage';
import AIToolsPage from './pages/AIToolsPage';
import ComplianceAgentsPage from './pages/ComplianceAgentsPage';

const resources = ['competitors','market-analysis','swot-analysis','price-comparison','product-comparison','social-media','news-trends','customer-reviews','seo-analysis','industry-reports','ad-tracker','hiring-tracker'];

export default function App() {
  const [authenticated, setAuthenticated] = useState(!!localStorage.getItem('token'));
  if (!authenticated) return <LoginPage onLogin={() => setAuthenticated(true)} />;

  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ marginLeft: 250, flex: 1, minHeight: '100vh', background: '#0a0a1a' }}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            {resources.map(r => <Route key={r} path={`/${r}`} element={<CrudPage resource={r} />} />)}
            <Route path="/ai-tools" element={<AIToolsPage />} />
            <Route path="/compliance-agents" element={<ComplianceAgentsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
