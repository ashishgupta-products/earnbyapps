"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface IndependentApp {
  id: string;
  appName: string;
  appImage: string;
  description: string;
  referralCode: string;
  appLink: string;
  rewardBadge: string;
  category?: string;
  createdAt?: string;
}

const DEFAULT_INDEPENDENT_APPS: IndependentApp[] = [
  {
    id: 'indep-angelone',
    appName: 'Angel One Demat & Trading',
    appImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=160&auto=format&fit=crop&q=80',
    description: 'Complete paperless Aadhaar & PAN KYC verification. Instant demat account activation and direct cash reward credited to your bank.',
    referralCode: 'ANGELDIRECT',
    appLink: 'https://angelone.in/referral?ref=ANGELDIRECT',
    rewardBadge: '₹250 Direct Cash',
    category: 'Finance & Demat'
  },
  {
    id: 'indep-groww',
    appName: 'Groww: Stocks & Mutual Funds',
    appImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=160&auto=format&fit=crop&q=80',
    description: 'Open a zero-maintenance Demat account on Groww. Complete KYC to receive instant cashback sent straight to your primary bank account.',
    referralCode: 'GROWW2026',
    appLink: 'https://groww.in/open-demat-account?invite=GROWW2026',
    rewardBadge: '₹150 Instant Credit',
    category: 'Finance & Demat'
  },
  {
    id: 'indep-winzo',
    appName: 'WinZO Games: Play & Win',
    appImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=160&auto=format&fit=crop&q=80',
    description: 'Download verified Android APK and play casual games. Sign up with invite code for instant ₹50 wallet cash redeemable via UPI.',
    referralCode: 'WINZO50',
    appLink: 'https://winzogames.com/install?ref=WINZO50',
    rewardBadge: '₹50 Signup Bonus',
    category: 'Casual Gaming'
  },
  {
    id: 'indep-swagbucks',
    appName: 'Swagbucks India Surveys',
    appImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=160&auto=format&fit=crop&q=80',
    description: 'Participate in everyday consumer opinion surveys. Zero waiting time—rewards are credited and transferred directly via PayPal or gift cards.',
    referralCode: 'SWAG2026',
    appLink: 'https://www.swagbucks.com/register?r=SWAG2026',
    rewardBadge: '₹100 Direct Voucher',
    category: 'Surveys & Tasks'
  },
  {
    id: 'indep-navi',
    appName: 'Navi: UPI, Loans & Digital Gold',
    appImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=160&auto=format&fit=crop&q=80',
    description: 'Setup Navi UPI and make a minimum digital gold purchase of ₹10 to unlock a flat ₹100 direct cashback deposited into your UPI linked bank.',
    referralCode: 'NAVI100',
    appLink: 'https://navi.com/referral?code=NAVI100',
    rewardBadge: '₹100 Direct Cashback',
    category: 'UPI & Banking'
  }
];

export default function InstantPayoutPage() {
  const [apps, setApps] = useState<IndependentApp[]>(DEFAULT_INDEPENDENT_APPS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadApps() {
      try {
        setLoading(true);
        const res = await fetch('/api/independent');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.apps) && data.apps.length > 0) {
            setApps(data.apps);
            return;
          }
        }
      } catch (err) {
        console.warn('Using client-side direct apps fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadApps();
  }, []);

  const handleCopyCode = (code: string, id: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setToastMessage(`Promo code "${code}" copied! Paste it during app signup.`);
    setTimeout(() => {
      setCopiedCodeId(null);
      setToastMessage(null);
    }, 2800);
  };

  const categories = ['All', 'Finance & Demat', 'Casual Gaming', 'Surveys & Tasks', 'UPI & Banking'];

  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesSearch = 
        app.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.referralCode && app.referralCode.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = 
        selectedCategory === 'All' || 
        app.category === selectedCategory ||
        (selectedCategory === 'Finance & Demat' && (app.appName.includes('Demat') || app.appName.includes('Groww') || app.appName.includes('Trading'))) ||
        (selectedCategory === 'Casual Gaming' && app.appName.includes('WinZO')) ||
        (selectedCategory === 'Surveys & Tasks' && app.appName.includes('Surveys')) ||
        (selectedCategory === 'UPI & Banking' && app.appName.includes('Navi'));

      return matchesSearch && matchesCat;
    });
  }, [apps, searchTerm, selectedCategory]);

  return (
    <main className="instant-payot-page">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="instant-toast">
          <span className="toast-icon">✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header Section */}
      <section className="instant-hero-section">
        <div className="hero-glow-back" />
        <div className="hero-inner">
          <div className="hero-pill-badge">
            <span className="live-dot" />
            <span>⚡ INSTANT DIRECT PAYOUTS • ZERO WAITING</span>
          </div>

          <h1 className="hero-main-title">
            Apps That Pay <span className="highlight-gradient">Directly To You</span>
          </h1>

          {/* User's Exact Requested Line Highlight Box */}
          <div className="instant-quote-card">
            <div className="quote-badge-tag">GUARANTEED DIRECT REWARDS</div>
            <p className="instant-quote-text">
              instant page contain apps that pay directly to their users , direct reward zero waiting signup with these codes and the apps will send your rewards directly to you
            </p>
          </div>

          {/* Value Props Row */}
          <div className="hero-perks-row">
            <div className="hero-perk-item">
              <span className="perk-icon">⚡</span>
              <div>
                <strong>Zero Waiting Time</strong>
                <span>Instant reward on verified signup</span>
              </div>
            </div>
            <div className="hero-perk-item">
              <span className="perk-icon">🏦</span>
              <div>
                <strong>Direct Bank &amp; UPI</strong>
                <span>App transfers directly to your account</span>
              </div>
            </div>
            <div className="hero-perk-item">
              <span className="perk-icon">🔑</span>
              <div>
                <strong>Verified Referral Codes</strong>
                <span>Exclusive bonuses tested daily</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works Guide */}
      <section className="how-it-works-bar">
        <div className="steps-container">
          <div className="step-item">
            <span className="step-num">1</span>
            <div className="step-info">
              <strong>Select &amp; Copy Code</strong>
              <p>Pick an app below and copy the exclusive signup code.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <span className="step-num">2</span>
            <div className="step-info">
              <strong>Install &amp; Sign Up</strong>
              <p>Open the app link and complete simple registration / KYC.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-item">
            <span className="step-num">3</span>
            <div className="step-info">
              <strong>Receive Direct Cash</strong>
              <p>The app credits your reward directly into your bank or UPI.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Apps Feed Section */}
      <section className="apps-feed-section">
        <div className="feed-controls-header">
          {/* Category Chips */}
          <div className="category-scroll-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-chip-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="search-bar-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search apps or promo codes..."
              className="search-input-field"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Counter & Active Filter info */}
        <div className="results-status-bar">
          <span>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredApps.length}</strong> instant payout apps
          </span>
          <span className="direct-safety-badge">
            🔒 100% Official Links • Verified by EarnByApps
          </span>
        </div>

        {/* Empty State */}
        {filteredApps.length === 0 ? (
          <div className="empty-results-box">
            <span className="empty-emoji">🔍</span>
            <h3>No apps match your search</h3>
            <p>Try searching for a different keyword or view all categories.</p>
            <button
              type="button"
              className="reset-search-btn"
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Cards Grid */
          <div className="apps-cards-grid">
            {filteredApps.map((app) => (
              <div key={app.id} className="app-offer-card">
                
                {/* Card Top: Logo & Titles */}
                <div className="card-header-flex">
                  <img
                    src={app.appImage}
                    alt={app.appName}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/120x120/4f46e5/ffffff?text=App';
                    }}
                    className="app-logo-image"
                  />
                  <div className="app-meta-group">
                    <div className="badge-row">
                      <span className="reward-badge-pill">
                        {app.rewardBadge || 'Direct Reward'}
                      </span>
                      <span className="zero-waiting-tag">
                        ⚡ Direct Pay
                      </span>
                    </div>
                    <h2 className="app-name-heading">{app.appName}</h2>
                  </div>
                </div>

                {/* Card Description */}
                <p className="app-instruction-desc">
                  {app.description}
                </p>

                {/* Promo Referral Code Box */}
                {app.referralCode ? (
                  <div className="promo-code-box">
                    <div className="code-text-group">
                      <span className="code-caption">SIGNUP PROMO CODE</span>
                      <strong className="code-value">{app.referralCode}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(app.referralCode, app.id)}
                      className={`copy-pill-button ${copiedCodeId === app.id ? 'copied' : ''}`}
                    >
                      {copiedCodeId === app.id ? '✓ Copied' : '📋 Copy Code'}
                    </button>
                  </div>
                ) : (
                  <div className="no-code-box">
                    <span>✨ No code required — Click link below to claim</span>
                  </div>
                )}

                {/* Direct Action Link */}
                <div className="card-footer-action">
                  <a
                    href={app.appLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="open-app-button"
                  >
                    <span>Install &amp; Claim Direct</span>
                    <span className="link-arrow">↗</span>
                  </a>
                </div>

                <div className="instant-notice">
                  ✓ Reward is credited directly to your bank account or UPI
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scoped CSS styling */}
      <style>{`
        .instant-payot-page {
          min-height: 80vh;
          max-width: 1280px;
          margin: 0 auto;
          padding: 24px 20px 80px;
          color: var(--text-primary);
        }

        /* Floating Toast */
        .instant-toast {
          position: fixed;
          top: 28px;
          right: 28px;
          z-index: 10000;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          padding: 12px 22px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.92rem;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideDownToast 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .toast-icon {
          background: rgba(255, 255, 255, 0.25);
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }
        @keyframes slideDownToast {
          from { transform: translateY(-25px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Hero Section */
        .instant-hero-section {
          position: relative;
          text-align: center;
          padding: 48px 24px 36px;
          border-radius: 24px;
          background: linear-gradient(180deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.03) 100%), var(--bg-card);
          border: 1px solid var(--border-color);
          overflow: hidden;
          margin-bottom: 32px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
        }
        .hero-glow-back {
          position: absolute;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 300px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, rgba(6, 182, 212, 0.1) 50%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-inner {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          max-width: 900px;
          margin: 0 auto;
        }
        .hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(79, 70, 229, 0.12);
          border: 1px solid rgba(79, 70, 229, 0.3);
          color: var(--accent-indigo, #4f46e5);
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          padding: 5px 16px;
          border-radius: 999px;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulseDot 2s infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.25); }
        }
        .hero-main-title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .highlight-gradient {
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* User's Exact Quote Box */
        .instant-quote-card {
          background: rgba(79, 70, 229, 0.07);
          border: 1px solid rgba(79, 70, 229, 0.25);
          border-radius: 16px;
          padding: 18px 24px;
          margin: 8px 0;
          max-width: 780px;
          text-align: center;
          position: relative;
        }
        .quote-badge-tag {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--accent-indigo, #4f46e5);
          background: rgba(79, 70, 229, 0.12);
          display: inline-block;
          padding: 2px 10px;
          border-radius: 999px;
          margin-bottom: 8px;
        }
        .instant-quote-text {
          margin: 0;
          font-size: 1.02rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.55;
        }

        /* Hero Perks */
        .hero-perks-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          width: 100%;
          margin-top: 12px;
        }
        .hero-perk-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 14px 18px;
          text-align: left;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .perk-icon {
          font-size: 1.6rem;
          flex-shrink: 0;
        }
        .hero-perk-item strong {
          display: block;
          font-size: 0.9rem;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .hero-perk-item span {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }

        /* How it works */
        .how-it-works-bar {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 18px;
          padding: 20px 28px;
          margin-bottom: 32px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
        }
        .steps-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 220px;
        }
        .step-num {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          color: #ffffff;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }
        .step-info strong {
          display: block;
          font-size: 0.92rem;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .step-info p {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .step-arrow {
          font-size: 1.4rem;
          color: var(--border-color);
          font-weight: bold;
        }

        /* Feed Controls */
        .apps-feed-section {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .feed-controls-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }
        .category-scroll-bar {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .cat-chip-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 18px;
          border-radius: 999px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .cat-chip-btn:hover {
          color: var(--text-primary);
          border-color: rgba(79, 70, 229, 0.4);
        }
        .cat-chip-btn.active {
          background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        }

        .search-bar-wrap {
          position: relative;
          min-width: 280px;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
          opacity: 0.6;
          pointer-events: none;
        }
        .search-input-field {
          width: 100%;
          padding: 10px 36px 10px 38px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 999px;
          color: var(--text-primary);
          font-size: 0.88rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .search-input-field:focus {
          border-color: var(--accent-indigo, #4f46e5);
        }
        .clear-search-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          cursor: pointer;
        }

        .results-status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.86rem;
          color: var(--text-secondary);
          flex-wrap: gap;
        }
        .direct-safety-badge {
          color: var(--accent-emerald, #10b981);
          font-weight: 600;
          font-size: 0.8rem;
        }

        /* Empty State */
        .empty-results-box {
          background: var(--bg-card);
          border: 1px dashed var(--border-color);
          border-radius: 20px;
          padding: 60px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-emoji {
          font-size: 2.8rem;
        }
        .empty-results-box h3 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--text-primary);
        }
        .empty-results-box p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .reset-search-btn {
          margin-top: 8px;
          background: rgba(79, 70, 229, 0.12);
          border: 1px solid rgba(79, 70, 229, 0.3);
          color: var(--accent-indigo, #4f46e5);
          padding: 8px 20px;
          border-radius: 999px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Cards Grid */
        .apps-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 24px;
        }
        .app-offer-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .app-offer-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(79, 70, 229, 0.12);
          border-color: rgba(79, 70, 229, 0.4);
        }

        .card-header-flex {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .app-logo-image {
          width: 58px;
          height: 58px;
          border-radius: 14px;
          object-fit: cover;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .app-meta-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }
        .badge-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .reward-badge-pill {
          font-size: 0.74rem;
          font-weight: 800;
          padding: 2px 9px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.14);
          color: var(--accent-emerald, #10b981);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .zero-waiting-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(79, 70, 229, 0.1);
          color: var(--accent-indigo, #4f46e5);
          border: 1px solid rgba(79, 70, 229, 0.2);
        }
        .app-name-heading {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
        }

        .app-instruction-desc {
          margin: 0;
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.55;
          flex-grow: 1;
        }

        /* Promo Code */
        .promo-code-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(79, 70, 229, 0.06);
          border: 1px dashed rgba(79, 70, 229, 0.35);
          border-radius: 12px;
          padding: 10px 16px;
        }
        .no-code-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 10px 16px;
          font-size: 0.82rem;
          color: var(--text-muted);
          text-align: center;
        }
        .code-text-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .code-caption {
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--text-muted);
        }
        .code-value {
          font-family: monospace;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--accent-indigo, #4f46e5);
          letter-spacing: 0.06em;
        }
        .copy-pill-button {
          background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
          color: #ffffff;
          border: none;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 7px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
        }
        .copy-pill-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        }
        .copy-pill-button.copied {
          background: #10b981;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }

        .card-footer-action {
          margin-top: auto;
        }
        .open-app-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(6, 182, 212, 0.12));
          color: var(--accent-indigo, #4f46e5);
          border: 1px solid rgba(79, 70, 229, 0.3);
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 0.92rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }
        .open-app-button:hover {
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
          transform: translateY(-1px);
        }
        .link-arrow {
          font-size: 1.1rem;
          transition: transform 0.2s;
        }
        .open-app-button:hover .link-arrow {
          transform: translate(2px, -2px);
        }

        .instant-notice {
          font-size: 0.75rem;
          color: var(--accent-emerald, #10b981);
          text-align: center;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-main-title {
            font-size: 1.9rem;
          }
          .step-arrow {
            display: none;
          }
          .steps-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .apps-cards-grid {
            grid-template-columns: 1fr;
          }
          .feed-controls-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .search-bar-wrap {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
