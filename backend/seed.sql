INSERT INTO users (name, email, password, role, email_verified) VALUES
('Admin User', 'admin@test.com', '$2b$10$xPBm3LsSCVrejHAfXU7GNuGf2uELoYbVCthyjE3ZZTN7mRNMRxVMa', 'admin', true),
('Analyst User', 'analyst@test.com', '$2b$10$xPBm3LsSCVrejHAfXU7GNuGf2uELoYbVCthyjE3ZZTN7mRNMRxVMa', 'analyst', true),
('Viewer User', 'viewer@test.com', '$2b$10$xPBm3LsSCVrejHAfXU7GNuGf2uELoYbVCthyjE3ZZTN7mRNMRxVMa', 'viewer', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO competitors (name, website, industry, description, threat_level, status) VALUES
('TechCorp', 'https://techcorp.com', 'SaaS', 'Enterprise SaaS platform', 'high', 'active'),
('DataFlow Inc', 'https://dataflow.io', 'Data Analytics', 'Real-time analytics', 'high', 'active'),
('CloudBase', 'https://cloudbase.dev', 'Cloud', 'Cloud infrastructure', 'medium', 'active'),
('InnovateTech', 'https://innovatetech.com', 'AI/ML', 'AI solutions provider', 'high', 'active'),
('MarketPro', 'https://marketpro.com', 'MarTech', 'Marketing automation', 'medium', 'active'),
('SecureNet', 'https://securenet.io', 'Cybersecurity', 'Enterprise security', 'low', 'active'),
('FinanceAI', 'https://financeai.com', 'FinTech', 'AI-powered finance', 'medium', 'active'),
('HealthTech Co', 'https://healthtech.co', 'HealthTech', 'Digital health platform', 'low', 'active'),
('EduSmart', 'https://edusmart.com', 'EdTech', 'Online learning', 'low', 'active'),
('LogiFlow', 'https://logiflow.com', 'Logistics', 'Supply chain AI', 'medium', 'active'),
('RetailGenius', 'https://retailgenius.com', 'Retail', 'Retail analytics', 'medium', 'active'),
('DevTools Pro', 'https://devtoolspro.com', 'DevTools', 'Developer tools', 'high', 'active'),
('GreenEnergy AI', 'https://greenenergy.ai', 'CleanTech', 'Energy optimization', 'low', 'active'),
('CryptoAnalyzer', 'https://cryptoanalyzer.io', 'Crypto', 'Blockchain analytics', 'low', 'active'),
('SocialPulse', 'https://socialpulse.com', 'Social Media', 'Social listening tool', 'medium', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO market_analysis (title, industry, region, market_size, growth_rate, status) VALUES
('Global SaaS Market 2024', 'SaaS', 'Global', '$195B', '11.7%', 'published'),
('AI Tools Market Overview', 'AI/ML', 'Global', '$150B', '38.1%', 'published'),
('Cloud Infrastructure Q4', 'Cloud', 'North America', '$85B', '22.3%', 'published'),
('Cybersecurity Trends', 'Cybersecurity', 'Global', '$267B', '14.3%', 'published'),
('FinTech Disruption Report', 'FinTech', 'Europe', '$45B', '25.2%', 'draft'),
('EdTech Growth Analysis', 'EdTech', 'Asia Pacific', '$30B', '16.5%', 'published'),
('HealthTech Innovation', 'HealthTech', 'North America', '$120B', '18.7%', 'published'),
('MarTech Stack Report', 'MarTech', 'Global', '$65B', '12.8%', 'draft'),
('E-commerce Landscape', 'E-commerce', 'Global', '$6.3T', '9.4%', 'published'),
('IoT Market Forecast', 'IoT', 'Global', '$1.1T', '26.4%', 'published'),
('Blockchain Enterprise', 'Blockchain', 'Global', '$20B', '56.3%', 'draft'),
('DevOps Tools Market', 'DevOps', 'North America', '$12B', '19.1%', 'published'),
('Data Analytics Growth', 'Analytics', 'Global', '$49B', '23.2%', 'published'),
('AR/VR Enterprise Use', 'AR/VR', 'Global', '$28B', '31.5%', 'draft'),
('Quantum Computing Market', 'Quantum', 'Global', '$1.3B', '42.8%', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO swot_analysis (title, company, strengths, weaknesses, overall_score, status) VALUES
('Q4 TechCorp Review', 'TechCorp', 'Strong brand, Large customer base', 'High pricing, Slow innovation', 72, 'draft'),
('DataFlow Assessment', 'DataFlow Inc', 'Real-time processing, API-first', 'Small team, Limited market', 68, 'draft'),
('Our Company Q1', 'Our Company', 'Innovation, Agile team', 'Limited funding', 75, 'published'),
('CloudBase Eval', 'CloudBase', 'Scalable infra, Low cost', 'Complex setup', 65, 'draft'),
('InnovateTech Profile', 'InnovateTech', 'AI expertise, Patents', 'Narrow focus', 70, 'draft'),
('MarketPro Analysis', 'MarketPro', 'Automation, Integrations', 'UI complexity', 63, 'published'),
('SecureNet Review', 'SecureNet', 'Strong security, Compliance', 'Expensive, Complex', 60, 'draft'),
('FinanceAI Assessment', 'FinanceAI', 'ML models, Speed', 'Regulatory risk', 67, 'draft'),
('HealthTech Profile', 'HealthTech Co', 'HIPAA compliant, UX', 'Small market', 62, 'published'),
('EduSmart Analysis', 'EduSmart', 'Content quality, Engagement', 'Monetization', 58, 'draft'),
('LogiFlow Review', 'LogiFlow', 'Route optimization, AI', 'Limited regions', 64, 'draft'),
('RetailGenius Eval', 'RetailGenius', 'Data insights, POS integration', 'Legacy tech', 61, 'published'),
('DevTools Pro', 'DevTools Pro', 'Developer love, Open source', 'Revenue model', 69, 'draft'),
('GreenEnergy Review', 'GreenEnergy AI', 'Green tech, Government support', 'Early stage', 55, 'draft'),
('SocialPulse Analysis', 'SocialPulse', 'Real-time monitoring, NLP', 'Data accuracy', 66, 'published')
ON CONFLICT DO NOTHING;

INSERT INTO price_comparison (title, product, our_price, competitor_name, competitor_price, value_score, status) VALUES
('Enterprise Plan vs TechCorp', 'Enterprise Plan', 299.00, 'TechCorp', 399.00, 85, 'active'),
('Pro Plan vs DataFlow', 'Pro Plan', 99.00, 'DataFlow', 149.00, 78, 'active'),
('Starter vs CloudBase', 'Starter Plan', 29.00, 'CloudBase', 25.00, 72, 'active'),
('AI Module vs InnovateTech', 'AI Module', 199.00, 'InnovateTech', 249.00, 80, 'active'),
('Analytics vs MarketPro', 'Analytics Suite', 149.00, 'MarketPro', 179.00, 75, 'active'),
('Security vs SecureNet', 'Security Add-on', 79.00, 'SecureNet', 129.00, 82, 'active'),
('API Access vs DataFlow', 'API Plan', 49.00, 'DataFlow', 69.00, 77, 'active'),
('Team Plan vs TechCorp', 'Team Plan', 199.00, 'TechCorp', 249.00, 81, 'active'),
('Basic vs EduSmart', 'Basic Plan', 19.00, 'EduSmart', 15.00, 70, 'active'),
('Premium vs RetailGenius', 'Premium Plan', 399.00, 'RetailGenius', 449.00, 83, 'active'),
('Dev Tools vs DevTools Pro', 'Dev Suite', 59.00, 'DevTools Pro', 49.00, 68, 'active'),
('Reports vs MarketPro', 'Reports Module', 89.00, 'MarketPro', 99.00, 76, 'active'),
('Dashboard vs CloudBase', 'Dashboard Pro', 129.00, 'CloudBase', 159.00, 79, 'active'),
('Integration vs LogiFlow', 'Integration Pack', 69.00, 'LogiFlow', 89.00, 74, 'active'),
('Full Suite vs TechCorp', 'Full Suite', 499.00, 'TechCorp', 699.00, 88, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO product_comparison (title, product1, product2, winner, status) VALUES
('CRM Comparison', 'Our CRM', 'TechCorp CRM', 'Our CRM', 'draft'),
('Analytics Head to Head', 'Our Analytics', 'DataFlow Analytics', 'DataFlow Analytics', 'draft'),
('Cloud Storage Battle', 'Our Cloud', 'CloudBase Storage', 'CloudBase Storage', 'draft'),
('AI Features Compare', 'Our AI', 'InnovateTech AI', 'Our AI', 'published'),
('Marketing Suite', 'Our Marketing', 'MarketPro Suite', 'Our Marketing', 'draft'),
('Security Features', 'Our Security', 'SecureNet Pro', 'SecureNet Pro', 'published'),
('API Platform', 'Our API', 'DataFlow API', 'Our API', 'draft'),
('Reporting Tools', 'Our Reports', 'TechCorp Reports', 'Our Reports', 'draft'),
('Mobile App', 'Our Mobile', 'InnovateTech Mobile', 'InnovateTech Mobile', 'published'),
('Integration Hub', 'Our Integrations', 'MarketPro Connect', 'Our Integrations', 'draft'),
('Customer Support', 'Our Support', 'TechCorp Support', 'TechCorp Support', 'draft'),
('Onboarding Flow', 'Our Onboarding', 'EduSmart Onboarding', 'Our Onboarding', 'published'),
('Dashboard UX', 'Our Dashboard', 'CloudBase Dashboard', 'Our Dashboard', 'draft'),
('Data Export', 'Our Export', 'DataFlow Export', 'DataFlow Export', 'draft'),
('Pricing Model', 'Our Pricing', 'DevTools Pro Pricing', 'DevTools Pro Pricing', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO social_media (title, brand, platform, followers, engagement_rate, sentiment, status) VALUES
('TechCorp Twitter', 'TechCorp', 'Twitter/X', 125000, 3.2, 'positive', 'active'),
('DataFlow LinkedIn', 'DataFlow', 'LinkedIn', 45000, 5.1, 'positive', 'active'),
('CloudBase Instagram', 'CloudBase', 'Instagram', 32000, 4.5, 'neutral', 'active'),
('InnovateTech YouTube', 'InnovateTech', 'YouTube', 89000, 6.2, 'positive', 'active'),
('MarketPro TikTok', 'MarketPro', 'TikTok', 210000, 8.7, 'positive', 'active'),
('Our Twitter Analysis', 'Our Company', 'Twitter/X', 78000, 4.1, 'positive', 'active'),
('Our LinkedIn Presence', 'Our Company', 'LinkedIn', 56000, 5.8, 'positive', 'active'),
('SecureNet Reddit', 'SecureNet', 'Reddit', 15000, 7.3, 'mixed', 'active'),
('FinanceAI Twitter', 'FinanceAI', 'Twitter/X', 67000, 3.8, 'positive', 'active'),
('EduSmart Instagram', 'EduSmart', 'Instagram', 145000, 6.9, 'positive', 'active'),
('LogiFlow LinkedIn', 'LogiFlow', 'LinkedIn', 23000, 4.2, 'neutral', 'active'),
('RetailGenius Facebook', 'RetailGenius', 'Facebook', 98000, 2.8, 'neutral', 'active'),
('DevTools GitHub', 'DevTools Pro', 'GitHub', 34000, 12.1, 'positive', 'active'),
('GreenEnergy Twitter', 'GreenEnergy AI', 'Twitter/X', 28000, 5.5, 'positive', 'active'),
('SocialPulse Meta', 'SocialPulse', 'Facebook', 55000, 3.4, 'neutral', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO news_trends (title, industry, source, impact_level, relevance_score, status) VALUES
('AI Regulation EU Act', 'AI/ML', 'Reuters', 'high', 95, 'active'),
('Cloud Market Consolidation', 'Cloud', 'TechCrunch', 'high', 88, 'active'),
('SaaS Pricing Shifts', 'SaaS', 'Gartner', 'medium', 75, 'active'),
('Cybersecurity Breach Trends', 'Cybersecurity', 'Dark Reading', 'high', 92, 'active'),
('FinTech IPO Wave', 'FinTech', 'Bloomberg', 'medium', 70, 'active'),
('EdTech AI Integration', 'EdTech', 'EdSurge', 'medium', 68, 'active'),
('Telehealth Expansion', 'HealthTech', 'STAT News', 'high', 85, 'active'),
('Cookie Deprecation Impact', 'MarTech', 'AdWeek', 'high', 90, 'active'),
('Supply Chain AI Adoption', 'Logistics', 'Supply Chain Dive', 'medium', 72, 'active'),
('Retail Personalization', 'Retail', 'Retail Dive', 'medium', 65, 'active'),
('Open Source Funding', 'DevTools', 'The Register', 'medium', 73, 'active'),
('Green Computing Push', 'CleanTech', 'GreenBiz', 'low', 55, 'active'),
('Quantum Computing Milestone', 'Quantum', 'Nature', 'high', 82, 'active'),
('AR in Enterprise', 'AR/VR', 'VentureBeat', 'medium', 60, 'active'),
('Data Privacy Laws 2024', 'Legal', 'Law360', 'high', 91, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO customer_reviews (title, product, source, rating, sentiment, review_count, status) VALUES
('TechCorp G2 Reviews', 'TechCorp Platform', 'G2', 4.2, 'positive', 1250, 'active'),
('DataFlow Capterra', 'DataFlow Analytics', 'Capterra', 4.5, 'positive', 340, 'active'),
('CloudBase TrustRadius', 'CloudBase Cloud', 'TrustRadius', 3.8, 'mixed', 520, 'active'),
('InnovateTech G2', 'InnovateTech AI', 'G2', 4.6, 'positive', 180, 'active'),
('MarketPro Reviews', 'MarketPro Suite', 'G2', 3.9, 'mixed', 890, 'active'),
('Our Product G2', 'Our Platform', 'G2', 4.4, 'positive', 620, 'active'),
('Our Product Capterra', 'Our Platform', 'Capterra', 4.3, 'positive', 410, 'active'),
('SecureNet Reviews', 'SecureNet Pro', 'Gartner Peer', 4.1, 'positive', 230, 'active'),
('FinanceAI Feedback', 'FinanceAI Tool', 'G2', 4.0, 'positive', 150, 'active'),
('EduSmart App Store', 'EduSmart App', 'App Store', 4.7, 'positive', 5600, 'active'),
('LogiFlow Reviews', 'LogiFlow Platform', 'Capterra', 3.6, 'mixed', 95, 'active'),
('RetailGenius G2', 'RetailGenius', 'G2', 4.1, 'positive', 275, 'active'),
('DevTools GitHub Stars', 'DevTools Pro', 'GitHub', 4.8, 'positive', 12000, 'active'),
('GreenEnergy Reviews', 'GreenEnergy Platform', 'TrustRadius', 3.5, 'mixed', 45, 'active'),
('SocialPulse G2', 'SocialPulse Tool', 'G2', 4.0, 'positive', 310, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO seo_analysis (title, url, domain_authority, organic_traffic_estimate, backlinks_estimate, status) VALUES
('TechCorp SEO', 'techcorp.com', 78, '1.2M/mo', 45000, 'active'),
('DataFlow SEO', 'dataflow.io', 62, '320K/mo', 12000, 'active'),
('CloudBase SEO', 'cloudbase.dev', 55, '180K/mo', 8500, 'active'),
('InnovateTech SEO', 'innovatetech.com', 48, '95K/mo', 4200, 'active'),
('MarketPro SEO', 'marketpro.com', 71, '890K/mo', 32000, 'active'),
('Our Site SEO', 'ourcompany.com', 58, '250K/mo', 9800, 'active'),
('SecureNet SEO', 'securenet.io', 65, '420K/mo', 18000, 'active'),
('FinanceAI SEO', 'financeai.com', 42, '67K/mo', 3100, 'active'),
('EduSmart SEO', 'edusmart.com', 69, '750K/mo', 28000, 'active'),
('LogiFlow SEO', 'logiflow.com', 38, '45K/mo', 2200, 'active'),
('RetailGenius SEO', 'retailgenius.com', 52, '150K/mo', 6800, 'active'),
('DevTools Pro SEO', 'devtoolspro.com', 73, '980K/mo', 35000, 'active'),
('GreenEnergy SEO', 'greenenergy.ai', 35, '28K/mo', 1500, 'active'),
('SocialPulse SEO', 'socialpulse.com', 56, '210K/mo', 9200, 'active'),
('CryptoAnalyzer SEO', 'cryptoanalyzer.io', 44, '78K/mo', 3800, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO industry_reports (title, industry, report_type, executive_summary, status) VALUES
('SaaS Market 2024', 'SaaS', 'Annual', 'SaaS market reaches $195B with AI integration driving growth', 'published'),
('AI Industry Overview', 'AI/ML', 'Quarterly', 'AI adoption accelerates across all sectors', 'published'),
('Cloud Market Report', 'Cloud', 'Annual', 'Multi-cloud strategies dominate enterprise', 'published'),
('Cyber Threat Landscape', 'Cybersecurity', 'Quarterly', 'Ransomware attacks up 150% YoY', 'published'),
('FinTech Disruption Index', 'FinTech', 'Annual', 'Embedded finance reshaping banking', 'published'),
('EdTech Innovation Report', 'EdTech', 'Semi-Annual', 'AI tutoring shows 40% improvement in outcomes', 'published'),
('HealthTech Digital Report', 'HealthTech', 'Annual', 'Telehealth adoption remains high post-pandemic', 'published'),
('MarTech Landscape', 'MarTech', 'Annual', 'Marketing tech stack consolidation trend', 'published'),
('E-commerce Trends', 'E-commerce', 'Quarterly', 'Social commerce growing 3x faster than traditional', 'published'),
('IoT Enterprise Guide', 'IoT', 'Annual', 'Industrial IoT leads enterprise adoption', 'published'),
('DevOps State Report', 'DevOps', 'Annual', 'Platform engineering emerges as top trend', 'published'),
('Analytics Market Guide', 'Analytics', 'Quarterly', 'Real-time analytics becomes table stakes', 'published'),
('Remote Work Tech', 'Enterprise', 'Annual', 'Hybrid work tools market grows 28%', 'published'),
('Green Tech Innovation', 'CleanTech', 'Annual', 'Carbon tracking software demand surges', 'published'),
('Data Privacy Report', 'Legal/Compliance', 'Annual', 'Global privacy regulations expand to 75% of population', 'published')
ON CONFLICT DO NOTHING;

INSERT INTO ad_tracker (title, competitor, platform, ad_type, estimated_spend, effectiveness_score, status) VALUES
('TechCorp Google Ads', 'TechCorp', 'Google Ads', 'Search', '$150K/mo', 82, 'active'),
('DataFlow LinkedIn Ads', 'DataFlow', 'LinkedIn', 'Sponsored Content', '$45K/mo', 75, 'active'),
('CloudBase Facebook', 'CloudBase', 'Facebook', 'Display', '$30K/mo', 60, 'active'),
('InnovateTech YouTube', 'InnovateTech', 'YouTube', 'Video', '$80K/mo', 78, 'active'),
('MarketPro Google', 'MarketPro', 'Google Ads', 'Search+Display', '$200K/mo', 85, 'active'),
('TechCorp LinkedIn', 'TechCorp', 'LinkedIn', 'InMail', '$60K/mo', 70, 'active'),
('DataFlow Twitter', 'DataFlow', 'Twitter/X', 'Promoted Tweets', '$15K/mo', 55, 'active'),
('SecureNet Google', 'SecureNet', 'Google Ads', 'Search', '$90K/mo', 77, 'active'),
('FinanceAI Meta', 'FinanceAI', 'Meta', 'Display', '$25K/mo', 62, 'active'),
('EduSmart TikTok', 'EduSmart', 'TikTok', 'Video', '$40K/mo', 88, 'active'),
('RetailGenius Google', 'RetailGenius', 'Google Ads', 'Shopping', '$120K/mo', 80, 'active'),
('DevTools Reddit', 'DevTools Pro', 'Reddit', 'Sponsored Post', '$8K/mo', 72, 'active'),
('SocialPulse LinkedIn', 'SocialPulse', 'LinkedIn', 'Sponsored Content', '$35K/mo', 68, 'active'),
('Our Google Ads', 'Our Company', 'Google Ads', 'Search', '$100K/mo', 79, 'active'),
('Our LinkedIn Ads', 'Our Company', 'LinkedIn', 'Lead Gen', '$50K/mo', 74, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO hiring_tracker (title, company, role_title, department, seniority, location, status) VALUES
('TechCorp ML Engineer', 'TechCorp', 'ML Engineer', 'Engineering', 'Senior', 'San Francisco', 'active'),
('TechCorp PM', 'TechCorp', 'Product Manager', 'Product', 'Senior', 'Remote', 'active'),
('DataFlow Data Eng', 'DataFlow', 'Data Engineer', 'Engineering', 'Mid', 'New York', 'active'),
('CloudBase SRE', 'CloudBase', 'SRE Engineer', 'Operations', 'Senior', 'Seattle', 'active'),
('InnovateTech Researcher', 'InnovateTech', 'AI Researcher', 'R&D', 'Lead', 'Boston', 'active'),
('MarketPro Growth Lead', 'MarketPro', 'Growth Lead', 'Marketing', 'Senior', 'Remote', 'active'),
('SecureNet SOC Analyst', 'SecureNet', 'SOC Analyst', 'Security', 'Mid', 'Washington DC', 'active'),
('FinanceAI Quant', 'FinanceAI', 'Quant Developer', 'Engineering', 'Senior', 'Chicago', 'active'),
('EduSmart Content Lead', 'EduSmart', 'Content Lead', 'Content', 'Senior', 'Remote', 'active'),
('LogiFlow Backend', 'LogiFlow', 'Backend Engineer', 'Engineering', 'Mid', 'Austin', 'active'),
('RetailGenius Analyst', 'RetailGenius', 'Data Analyst', 'Analytics', 'Junior', 'Remote', 'active'),
('DevTools OSS Lead', 'DevTools Pro', 'Open Source Lead', 'Engineering', 'Lead', 'Remote', 'active'),
('GreenEnergy Scientist', 'GreenEnergy AI', 'Data Scientist', 'R&D', 'Senior', 'Denver', 'active'),
('SocialPulse NLP Eng', 'SocialPulse', 'NLP Engineer', 'Engineering', 'Senior', 'Remote', 'active'),
('TechCorp VP Eng', 'TechCorp', 'VP Engineering', 'Engineering', 'Executive', 'San Francisco', 'active')
ON CONFLICT DO NOTHING;
