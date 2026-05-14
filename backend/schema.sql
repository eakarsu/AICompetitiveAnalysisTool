CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'analyst',
  email_verified BOOLEAN DEFAULT false,
  verify_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS competitors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  industry VARCHAR(255),
  description TEXT,
  market_cap VARCHAR(100),
  employee_count VARCHAR(100),
  headquarters VARCHAR(255),
  founded VARCHAR(50),
  key_products TEXT,
  strengths TEXT,
  weaknesses TEXT,
  threat_level VARCHAR(50) DEFAULT 'medium',
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_analysis (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  region VARCHAR(255),
  market_size VARCHAR(100),
  growth_rate VARCHAR(50),
  key_trends TEXT,
  major_players TEXT,
  opportunities TEXT,
  threats TEXT,
  analysis_date DATE,
  source VARCHAR(500),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS swot_analysis (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  strengths TEXT,
  weaknesses TEXT,
  opportunities TEXT,
  threats TEXT,
  recommendations TEXT,
  overall_score INTEGER,
  analyst VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_comparison (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  product VARCHAR(255),
  our_price DECIMAL(12,2),
  competitor_name VARCHAR(255),
  competitor_price DECIMAL(12,2),
  price_difference DECIMAL(12,2),
  features_comparison TEXT,
  value_score INTEGER,
  market VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_comparison (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  product1 VARCHAR(255),
  product2 VARCHAR(255),
  criteria TEXT,
  comparison_results TEXT,
  winner VARCHAR(255),
  recommendation TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_media (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  platform VARCHAR(100),
  followers INTEGER,
  engagement_rate DECIMAL(5,2),
  content_frequency VARCHAR(100),
  sentiment VARCHAR(50),
  top_posts TEXT,
  analysis TEXT,
  tracked_date DATE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news_trends (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  source VARCHAR(500),
  summary TEXT,
  impact_level VARCHAR(50),
  relevance_score INTEGER,
  keywords TEXT,
  published_date DATE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_reviews (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  product VARCHAR(255),
  source VARCHAR(255),
  rating DECIMAL(3,1),
  sentiment VARCHAR(50),
  positive_themes TEXT,
  negative_themes TEXT,
  feature_requests TEXT,
  review_count INTEGER,
  analysis TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seo_analysis (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  domain_authority INTEGER,
  keywords TEXT,
  organic_traffic_estimate VARCHAR(100),
  backlinks_estimate INTEGER,
  top_pages TEXT,
  technical_issues TEXT,
  content_gaps TEXT,
  recommendations TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS industry_reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  report_type VARCHAR(100),
  executive_summary TEXT,
  key_findings TEXT,
  market_data TEXT,
  recommendations TEXT,
  source VARCHAR(500),
  report_date DATE,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ad_tracker (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  competitor VARCHAR(255),
  platform VARCHAR(100),
  ad_type VARCHAR(100),
  ad_copy TEXT,
  targeting TEXT,
  estimated_spend VARCHAR(100),
  landing_page VARCHAR(500),
  start_date DATE,
  end_date DATE,
  effectiveness_score INTEGER,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hiring_tracker (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  role_title VARCHAR(255),
  department VARCHAR(255),
  seniority VARCHAR(100),
  location VARCHAR(255),
  skills_required TEXT,
  salary_range VARCHAR(100),
  posted_date DATE,
  strategic_signal TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI analysis persistence: stores all AI results with full context
CREATE TABLE IF NOT EXISTS ai_analyses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  analysis_type VARCHAR(100) NOT NULL,
  input_params JSONB NOT NULL,
  result JSONB NOT NULL,
  model VARCHAR(100),
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON ai_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at DESC);
