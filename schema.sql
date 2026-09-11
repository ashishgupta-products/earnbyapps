-- SQL Schema for EarnByApps Database Setup
-- You can run this in your Neon.tech SQL Editor console directly!

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    gender VARCHAR(20),
    country VARCHAR(100) DEFAULT 'India',
    role VARCHAR(50) DEFAULT 'user', -- 'user' or 'admin'
    balance NUMERIC(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(100),
    payment_details TEXT,
    origin_app_id VARCHAR(100) DEFAULT 'main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Campaigns Table
CREATE TABLE IF NOT EXISTS campaigns (
    id VARCHAR(255) PRIMARY KEY, -- e.g. 'groww', 'phonepe'
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    platforms VARCHAR(255) NOT NULL, -- e.g. 'iOS,Android,Web'
    earning_rate VARCHAR(255),
    reward NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    description TEXT,
    long_description TEXT,
    tags VARCHAR(255), -- e.g. 'Popular,Fast Payout'
    external_url TEXT,
    target_country VARCHAR(100) DEFAULT 'India',
    currency VARCHAR(10) DEFAULT 'INR',
    currency_symbol VARCHAR(10) DEFAULT '₹',
    target_completions INTEGER DEFAULT 1000,
    video_url TEXT,
    logo_url TEXT,
    referral_code VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Referral Slots Table (For rotating pool links)
CREATE TABLE IF NOT EXISTS referral_slots (
    id VARCHAR(255) PRIMARY KEY,
    campaign_id VARCHAR(255) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    referral_url TEXT NOT NULL,
    limit_count INTEGER NOT NULL DEFAULT 5,
    completed_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Task Submissions Ledger Table
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(255) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    app_name VARCHAR(255) NOT NULL,
    app_id VARCHAR(255) NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    reward NUMERIC(10, 2) NOT NULL,
    proof TEXT NOT NULL,
    proof_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'video'
    proof_url TEXT,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Paid', 'Rejected'
    verifier_email VARCHAR(255) NOT NULL, -- 'admin' or user's email
    verification_type VARCHAR(50) DEFAULT 'admin', -- 'admin' or 'creator'
    referral_slot_id VARCHAR(255),
    origin_app_id VARCHAR(100) DEFAULT 'main',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Payout / Withdrawal Requests Table (Min ₹20 threshold)
CREATE TABLE IF NOT EXISTS payout_requests (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payout_rail VARCHAR(50) NOT NULL, -- 'upi', 'bank', 'paytm'
    payout_details TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- 'Pending', 'Processed', 'Rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Seed Initial Admin User
INSERT INTO users (email, full_name, role, balance, country)
VALUES ('admin@earnbyapps.com', 'System Admin', 'admin', 500.00, 'India')
ON CONFLICT (email) DO NOTHING;

-- Seed Initial Earning Campaigns (India Focused)
INSERT INTO campaigns (id, name, category, platforms, earning_rate, reward, description, long_description, tags, external_url, target_country, currency, currency_symbol)
VALUES 
('groww', 'Groww: Stocks & Mutual Funds', 'App Install & Sign Up', 'Android,iOS,Web', '₹150.00 / signup', 150.00, 'Open a free Demat account & complete KYC on Groww.', 'Register and complete your identity verification to start investing and earn cash.', 'Finance,High Reward,Instant KYC', 'https://groww.in', 'India', 'INR', '₹'),
('phonepe', 'PhonePe UPI Payments', 'App Install & Sign Up', 'Android,iOS', '₹50.00 / setup', 50.00, 'Install PhonePe and link bank account for first UPI transaction.', 'Connect your Indian bank account and complete a test transaction of ₹1 or more.', 'UPI,Fast Payout,Popular', 'https://phonepe.com', 'India', 'INR', '₹'),
('angelone', 'Angel One Demat & Trading', 'App Install & Sign Up', 'Android,iOS,Web', '₹200.00 / account', 200.00, 'Open a zero-brokerage Demat account on Angel One.', 'Submit online Aadhaar and PAN KYC verification to claim your reward.', 'Finance,Top Earner,Trending', 'https://angelone.in', 'India', 'INR', '₹'),
('winzo', 'WinZO Games', 'Gaming', 'Android', '₹35.00 / play', 35.00, 'Install WinZO app and play 3 casual mobile games.', 'Download the APK launcher, play 3 fun games, and upload gameplay screenshot proof.', 'Android Only,Fun,Instant Payout', 'https://winzogames.com', 'India', 'INR', '₹'),
('swagbucks-in', 'Swagbucks India', 'Surveys', 'Android,iOS,Web', '₹100.00 / survey', 100.00, 'Complete Indian consumer demographic surveys for instant cash.', 'Answer market research questions about products in India and redeem points.', 'Surveys,Easy,Verified', 'https://swagbucks.com', 'India', 'INR', '₹'),
('rozdhan', 'Roz Dhan: News & Earn', 'Passive', 'Android', '₹25.00 / install', 25.00, 'Read news articles and check in daily on Roz Dhan.', 'Install the Roz Dhan app, log in, and browse trending articles for 3 days.', 'Passive,Daily Checkin,Simple', 'https://rozdhan.com', 'India', 'INR', '₹')
ON CONFLICT (id) DO NOTHING;

-- 6. Performance Indexes for Low-Latency Querying
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_country ON users (country);

CREATE INDEX IF NOT EXISTS idx_submissions_user_email_lower ON submissions (LOWER(user_email));
CREATE INDEX IF NOT EXISTS idx_submissions_user_email ON submissions (user_email);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);
CREATE INDEX IF NOT EXISTS idx_submissions_app_id ON submissions (app_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_origin_app_id ON submissions (origin_app_id);

CREATE INDEX IF NOT EXISTS idx_payouts_user_email_lower ON payout_requests (LOWER(user_email));
CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payout_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payout_requests (status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payout_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaigns_country ON campaigns (target_country);
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active ON campaigns (is_active);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns (category);

