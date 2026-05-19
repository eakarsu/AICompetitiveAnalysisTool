import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CrudPage from './pages/CrudPage';
import AIToolsPage from './pages/AIToolsPage';
import AIHistoryPage from './pages/AIHistoryPage';
import ComplianceAgentsPage from './pages/ComplianceAgentsPage';
import CustomViewsPage from './pages/CustomViewsPage';

// // === Batch 02 Gaps & Frontend Mounts ===
import CfAiCompetitivePositioningDashboard from './pages/CfAiCompetitivePositioningDashboard';
import CfPredictiveMADetection from './pages/CfPredictiveMADetection';
import CfWinLossAnalysisAutomation from './pages/CfWinLossAnalysisAutomation';
import CfRealTimeAlertEngine from './pages/CfRealTimeAlertEngine';
import CfVerticalIndustryBenchmarking from './pages/CfVerticalIndustryBenchmarking';
import GapCompetitorsLacksComparativeSwotOrPositioningAiEndpoin from './pages/GapCompetitorsLacksComparativeSwotOrPositioningAiEndpoin';
import GapMonitoringLacksPredictiveTrendMarketShiftAi from './pages/GapMonitoringLacksPredictiveTrendMarketShiftAi';
import GapNoSynthesizeIntelligenceAutomatedInsightGeneration from './pages/GapNoSynthesizeIntelligenceAutomatedInsightGeneration';
import GapNoAiDrivenSentimentOrReviewAggregation from './pages/GapNoAiDrivenSentimentOrReviewAggregation';
import GapNoPricingDatabaseOrPricingIntelligenceModule from './pages/GapNoPricingDatabaseOrPricingIntelligenceModule';
import GapNoDealPartnershipOpportunityTracker from './pages/GapNoDealPartnershipOpportunityTracker';
import GapNoPlaybookStrategyLibrary from './pages/GapNoPlaybookStrategyLibrary';
import GapNoWebhooksForRealTimeCompetitorSignalIngestion from './pages/GapNoWebhooksForRealTimeCompetitorSignalIngestion';
import GapNoSmsOrPaymentIntegration from './pages/GapNoSmsOrPaymentIntegration';
import GapNoCalendarIntegration from './pages/GapNoCalendarIntegration';

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
            <Route path="/ai-history" element={<AIHistoryPage />} />
            <Route path="/compliance-agents" element={<ComplianceAgentsPage />} />
            <Route path="/custom-views" element={<CustomViewsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          
        {/* // === Batch 02 Gaps & Frontend Mounts === */}
        <Route path="/cf/ai-competitive-positioning-dashboard" element={<CfAiCompetitivePositioningDashboard />} />
        <Route path="/cf/predictive-m-a-detection" element={<CfPredictiveMADetection />} />
        <Route path="/cf/win-loss-analysis-automation" element={<CfWinLossAnalysisAutomation />} />
        <Route path="/cf/real-time-alert-engine" element={<CfRealTimeAlertEngine />} />
        <Route path="/cf/vertical-industry-benchmarking" element={<CfVerticalIndustryBenchmarking />} />
        <Route path="/gap/competitors-lacks-comparative-swot-or-positioning-ai-endpoin" element={<GapCompetitorsLacksComparativeSwotOrPositioningAiEndpoin />} />
        <Route path="/gap/monitoring-lacks-predictive-trend-market-shift-ai" element={<GapMonitoringLacksPredictiveTrendMarketShiftAi />} />
        <Route path="/gap/no-synthesize-intelligence-automated-insight-generation" element={<GapNoSynthesizeIntelligenceAutomatedInsightGeneration />} />
        <Route path="/gap/no-ai-driven-sentiment-or-review-aggregation" element={<GapNoAiDrivenSentimentOrReviewAggregation />} />
        <Route path="/gap/no-pricing-database-or-pricing-intelligence-module" element={<GapNoPricingDatabaseOrPricingIntelligenceModule />} />
        <Route path="/gap/no-deal-partnership-opportunity-tracker" element={<GapNoDealPartnershipOpportunityTracker />} />
        <Route path="/gap/no-playbook-strategy-library" element={<GapNoPlaybookStrategyLibrary />} />
        <Route path="/gap/no-webhooks-for-real-time-competitor-signal-ingestion" element={<GapNoWebhooksForRealTimeCompetitorSignalIngestion />} />
        <Route path="/gap/no-sms-or-payment-integration" element={<GapNoSmsOrPaymentIntegration />} />
        <Route path="/gap/no-calendar-integration" element={<GapNoCalendarIntegration />} />
      </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
