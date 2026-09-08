"use client";
 
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { getCategoryIcon } from '../data/apps';

export default function Home() {
  const { data: session } = useSession();

  const handleLaunchCampaignClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!session) {
      e.preventDefault();
      window.location.href = `/login?callbackUrl=/partner/create-campaign`;
    }
  };

  // Dynamic Typewriter effect
  const words = ['Actions', 'Results', 'Leads', 'Conversions', 'Growth'];
  const [wordIndex, setWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const activeWord = words[wordIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(activeWord.substring(0, currentText.length - 1));
        setTypingSpeed(75);
      }, typingSpeed);
    } else {
      timer = setTimeout(() => {
        setCurrentText(activeWord.substring(0, currentText.length + 1));
        setTypingSpeed(150);
      }, typingSpeed);
    }

    if (!isDeleting && currentText === activeWord) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      setTypingSpeed(1200);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex]);

  // Interactive ROI Calculator State
  const [selectedGoal, setSelectedGoal] = useState<'installs' | 'reviews' | 'signups' | 'community'>('installs');
  const [actionCount, setActionCount] = useState(500);

  const goalPricing = {
    installs: { label: 'App Installs & Signups', costPerUnit: 8, unitName: 'Installs' },
    reviews: { label: 'Store & Maps Reviews', costPerUnit: 15, unitName: 'Reviews' },
    signups: { label: 'Lead & Account Registrations', costPerUnit: 12, unitName: 'Signups' },
    community: { label: 'Telegram / WhatsApp Members', costPerUnit: 4, unitName: 'Members' }
  };

  const calculatedCost = useMemo(() => {
    const unitPrice = goalPricing[selectedGoal].costPerUnit;
    const gross = actionCount * unitPrice;
    // 100 free credits discount applied (e.g. ₹100 worth)
    const discount = 100;
    const net = Math.max(0, gross - discount);
    return { gross, discount, net, unitPrice };
  }, [selectedGoal, actionCount]);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How do the 100 free credits work for new campaigns?",
      a: "When you sign up as a new partner, you receive 100 complimentary credits directly in your balance. You can apply them immediately toward your first campaign to test our real-user acquisition engine without spending a rupee upfront."
    },
    {
      q: "How are task completions verified to prevent fraud and bot traffic?",
      a: "Every submission requires proof — such as mandatory in-app screenshots, transaction IDs, or video screen captures. Our automated fraud-detection algorithms cross-check device signatures and IP uniqueness, followed by human audit before any payout is released."
    },
    {
      q: "Can I target specific countries and operating systems?",
      a: "Yes! You can geo-target your campaigns to India, United States, United Kingdom, or Global markets, and choose specific platforms including Android, iOS, or Web."
    },
    {
      q: "How quickly will my campaign start receiving real completions?",
      a: "Once approved, campaigns are published to our active user feed and partner mobile app instantly. Most partners start seeing verified submissions within 15 to 30 minutes of launch."
    },
    {
      q: "What payment methods are supported for funding and payouts?",
      a: "We support instant UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit/Debit Cards, PayPal, and Crypto (USDT/USDC) for seamless deposits and withdrawals worldwide."
    }
  ];

  return (
    <main className="landing-page-main">
      
      {/* 1. HERO SECTION */}
      <section className="landing-hero-section">
        <div className="landing-content-container">
          
          {/* Capsule Badge */}
          <div className="hero-capsule">
            <span className="live-dot"></span> Powering User Acquisition Globally
          </div>

          {/* Main Header title */}
          <h1 className="landing-hero-title">
            Your Growth Partner <span className="arrow">↓</span>
          </h1>

          {/* Hero description */}
          <div className="landing-hero-subtitle">
            <span className="static-part">Pay only for&nbsp;</span>
            <span className="dynamic-part">
              {currentText}
              <span className="typing-cursor"></span>
            </span>
          </div>
          <p className="landing-hero-tagline">
            Don't pay for impressions — pay only for verified actions!
          </p>

          {/* Promo Credit card box */}
          <div className="promo-container-box">
            <div className="promo-badge-tag">🔥 Special Launch Offer</div>
            <h2 className="promo-header">
              100 Free Credits for 1st Campaign!
            </h2>
            <p className="promo-subheader">
              Easily set up your campaign & start getting guaranteed conversions
            </p>

            <div className="promo-actions-row">
              <Link 
                href="/partner/create-campaign" 
                className="glow-btn-purple"
                onClick={handleLaunchCampaignClick}
              >
                Launch Your Campaign →
              </Link>
              <Link href="/offerwall" className="secondary-outline-btn">
                Browse Live Tasks
              </Link>
            </div>

            <div className="promo-footer-note">
              <span>✓ No credit card required</span>
              <span>✓ Real human users</span>
              <span>✓ Instant setup</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS & SOCIAL PROOF BAR */}
      <section className="landing-stats-section">
        <div className="stats-bar-grid">
          <div className="stat-card">
            <div className="stat-number">500K+</div>
            <div className="stat-label">Verified Actions Delivered</div>
            <div className="stat-sub">Across 150+ App Campaigns</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">99.4%</div>
            <div className="stat-label">Human Verification Rate</div>
            <div className="stat-sub">Zero Bot or Fake Activity</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">₹45L+</div>
            <div className="stat-label">Paid Out to Real Earners</div>
            <div className="stat-sub">Instant UPI & Global Transfers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">3.2x</div>
            <div className="stat-label">Higher ROI vs Ad Networks</div>
            <div className="stat-sub">Strict Cost-Per-Action Pricing</div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="landing-section">
        <div className="section-header-block">
          <div className="section-pill">Simple 3-Step Process</div>
          <h2 className="section-main-heading">How EarnByApps Delivers Guaranteed Scale</h2>
          <p className="section-lead-text">
            No complicated bidding auctions or wasted impressions. Set your requirements and watch real users complete them.
          </p>
        </div>

        <div className="steps-container-grid">
          <div className="step-card">
            <div className="step-number-bubble">01</div>
            <div className="step-icon">🎯</div>
            <h3 className="step-title">Create Your Campaign</h3>
            <p className="step-desc">
              Choose your target goal (App install, store review, signup, or social follower) and set your budget with 100 free starting credits.
            </p>
            <div className="step-tag">Takes under 2 minutes</div>
          </div>

          <div className="step-card featured-step">
            <div className="step-number-bubble">02</div>
            <div className="step-icon">🌍</div>
            <h3 className="step-title">Target Real Global Users</h3>
            <p className="step-desc">
              Your campaign is distributed to verified users matched by country (India, US, UK, Global) and platform (Android, iOS, or Web).
            </p>
            <div className="step-tag">Geo & OS Filtered</div>
          </div>

          <div className="step-card">
            <div className="step-number-bubble">03</div>
            <div className="step-icon">🛡️</div>
            <h3 className="step-title">Verify Proofs & Pay</h3>
            <p className="step-desc">
              Review screenshot or video proof before payout approval. Funds are deducted strictly for confirmed, authentic completions.
            </p>
            <div className="step-tag">100% Risk Free</div>
          </div>
        </div>
      </section>

      {/* 4. MULTI-CHANNEL CONVERSION CHANNELS */}
      <section className="landing-section">
        <div className="section-header-block">
          <div className="section-pill">Acquisition Channels</div>
          <h2 className="section-main-heading">Every Conversion Goal Under One Roof</h2>
          <p className="section-lead-text">
            Whatever key performance indicator drives your growth, we have verified users ready to take action.
          </p>
        </div>

        <div className="channels-grid">
          <div className="channel-box">
            <div className="channel-icon-wrapper">
              {getCategoryIcon('App Install & Sign Up')}
            </div>
            <h3 className="channel-name">App Installs & Signups</h3>
            <p className="channel-desc">
              High-retention mobile app downloads with onboarding and signup milestones on Google Play & App Store.
            </p>
            <div className="channel-badge">Most Popular</div>
          </div>

          <div className="channel-box">
            <div className="channel-icon-wrapper">
              {getCategoryIcon('Play Store Reviews')}
            </div>
            <h3 className="channel-name">Store Ratings & Reviews</h3>
            <p className="channel-desc">
              Organic 5-star ratings and authentic user reviews that enhance your ASO rank and user conversion rate.
            </p>
            <div className="channel-badge">ASO Booster</div>
          </div>

          <div className="channel-box">
            <div className="channel-icon-wrapper">
              {getCategoryIcon('Google Maps Reviews')}
            </div>
            <h3 className="channel-name">Google Maps & Local SEO</h3>
            <p className="channel-desc">
              Legitimate local reviews with photo attachments to build reputation and dominate local Google searches.
            </p>
            <div className="channel-badge">Local Trust</div>
          </div>

          <div className="channel-box">
            <div className="channel-icon-wrapper">
              {getCategoryIcon('Telegram Members')}
            </div>
            <h3 className="channel-name">Telegram & WhatsApp</h3>
            <p className="channel-desc">
              Instant community expansion with real active members joining your crypto, trading, or brand channels.
            </p>
            <div className="channel-badge">Community Growth</div>
          </div>

          <div className="channel-box">
            <div className="channel-icon-wrapper">
              {getCategoryIcon('Youtube Subscribers')}
            </div>
            <h3 className="channel-name">Social Followers & Fans</h3>
            <p className="channel-desc">
              Boost your social presence across YouTube, LinkedIn, Instagram, and Facebook with genuine follower growth.
            </p>
            <div className="channel-badge">Brand Authority</div>
          </div>

          <div className="channel-box">
            <div className="channel-icon-wrapper">
              {getCategoryIcon('Surveys')}
            </div>
            <h3 className="channel-name">Surveys & User Research</h3>
            <p className="channel-desc">
              Obtain targeted demographic data, consumer feedback, and product opinions from real verified participants.
            </p>
            <div className="channel-badge">Instant Feedback</div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE ROI CALCULATOR */}
      <section className="landing-section">
        <div className="calculator-wrapper-card">
          <div className="calc-header-side">
            <div className="section-pill">Interactive Estimator</div>
            <h2 className="calc-title">Estimate Your Acquisition Scale</h2>
            <p className="calc-description">
              See how many verified results you can get for your budget. Our transparent per-action pricing means zero surprises.
            </p>

            <div className="goal-picker-row">
              {(['installs', 'reviews', 'signups', 'community'] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedGoal(key)}
                  className={`goal-btn ${selectedGoal === key ? 'active' : ''}`}
                >
                  {goalPricing[key].label}
                </button>
              ))}
            </div>

            <div className="slider-container-box">
              <div className="slider-label-row">
                <span>Target Actions:</span>
                <span className="slider-val-highlight">{actionCount.toLocaleString()} {goalPricing[selectedGoal].unitName}</span>
              </div>
              <input
                type="range"
                min="100"
                max="5000"
                step="100"
                value={actionCount}
                onChange={(e) => setActionCount(Number(e.target.value))}
                className="custom-range-slider"
              />
              <div className="slider-ticks">
                <span>100</span>
                <span>1,000</span>
                <span>2,500</span>
                <span>5,000</span>
              </div>
            </div>
          </div>

          <div className="calc-summary-side">
            <div className="summary-glass-box">
              <div className="summary-title">Campaign Estimation</div>
              
              <div className="summary-line">
                <span className="line-label">Cost per Action</span>
                <span className="line-val">₹{calculatedCost.unitPrice}.00</span>
              </div>
              <div className="summary-line">
                <span className="line-label">Total Actions</span>
                <span className="line-val">{actionCount.toLocaleString()}</span>
              </div>
              <div className="summary-line">
                <span className="line-label">Gross Investment</span>
                <span className="line-val">₹{calculatedCost.gross.toLocaleString()}</span>
              </div>
              <div className="summary-line discount-line">
                <span className="line-label">🎁 100 Free Credits Applied</span>
                <span className="line-val">-₹{calculatedCost.discount}.00</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-row">
                <div>
                  <div className="total-label">Estimated Total</div>
                  <div className="total-sub">Guaranteed Real Conversions</div>
                </div>
                <div className="total-amount">₹{calculatedCost.net.toLocaleString()}</div>
              </div>

              <Link 
                href="/partner/create-campaign"
                className="glow-btn-purple calc-cta-btn"
                onClick={handleLaunchCampaignClick}
              >
                Start Campaign with Free Credits →
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* 6. COMPARISON TABLE: TRADITIONAL ADS VS EARNBYAPPS */}
      <section className="landing-section">
        <div className="section-header-block">
          <div className="section-pill">Why We Win</div>
          <h2 className="section-main-heading">EarnByApps vs Traditional Ad Networks</h2>
          <p className="section-lead-text">
            See how performance-driven acquisition beats paying for passive impressions and accidental clicks.
          </p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature / Factor</th>
                <th className="highlight-col">₹ EarnByApps (Action-Based)</th>
                <th>Traditional Ad Networks (CPM/CPC)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="feature-cell">
                  <strong>Billing Model</strong>
                  <span>What you actually spend money on</span>
                </td>
                <td className="highlight-col success-cell">
                  <span className="check-icon">✓</span> Only verified completed actions
                </td>
                <td className="danger-cell">
                  <span className="cross-icon">✗</span> Passive impressions & accidental clicks
                </td>
              </tr>
              <tr>
                <td className="feature-cell">
                  <strong>Bot & Fraud Protection</strong>
                  <span>Integrity of your traffic</span>
                </td>
                <td className="highlight-col success-cell">
                  <span className="check-icon">✓</span> Screenshot/video proof required & audited
                </td>
                <td className="danger-cell">
                  <span className="cross-icon">✗</span> Up to 30% spent on web crawler bots
                </td>
              </tr>
              <tr>
                <td className="feature-cell">
                  <strong>Conversion Certainty</strong>
                  <span>Guarantee of result</span>
                </td>
                <td className="highlight-col success-cell">
                  <span className="check-icon">✓</span> 100% Guaranteed target goal delivery
                </td>
                <td className="danger-cell">
                  <span className="cross-icon">✗</span> Zero conversion guarantees
                </td>
              </tr>
              <tr>
                <td className="feature-cell">
                  <strong>Initial Trial</strong>
                  <span>Getting started risk</span>
                </td>
                <td className="highlight-col success-cell">
                  <span className="check-icon">✓</span> 100 Free credits to test first campaign
                </td>
                <td className="danger-cell">
                  <span className="cross-icon">✗</span> High minimum deposit & setup fees
                </td>
              </tr>
              <tr>
                <td className="feature-cell">
                  <strong>Real Community Impact</strong>
                  <span>User engagement depth</span>
                </td>
                <td className="highlight-col success-cell">
                  <span className="check-icon">✓</span> Genuine downloads, reviews & active members
                </td>
                <td className="danger-cell">
                  <span className="cross-icon">✗</span> High immediate bounce rate
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. FAQ ACCORDION */}
      <section className="landing-section">
        <div className="section-header-block">
          <div className="section-pill">Got Questions?</div>
          <h2 className="section-main-heading">Frequently Asked Questions</h2>
          <p className="section-lead-text">
            Everything you need to know about launching your first campaign or earning rewards.
          </p>
        </div>

        <div className="faq-accordion-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${openFaq === index ? 'faq-item-open' : ''}`}
              onClick={() => toggleFaq(index)}
            >
              <div className="faq-question-row">
                <h3 className="faq-question-text">{faq.q}</h3>
                <span className="faq-toggle-icon">{openFaq === index ? '−' : '+'}</span>
              </div>
              {openFaq === index && (
                <div className="faq-answer-block">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL BOTTOM CTA BANNER */}
      <section className="landing-bottom-cta-section">
        <div className="final-cta-card">
          <div className="cta-glow-circle"></div>
          <div className="final-cta-content">
            <h2 className="final-cta-title">Ready to Scale Your App with Guaranteed Results?</h2>
            <p className="final-cta-subtitle">
              Join hundreds of creators and brands getting verified conversions today. Claim your 100 free credits now.
            </p>

            <div className="final-cta-buttons">
              <Link 
                href="/partner/create-campaign" 
                className="glow-btn-purple final-large-btn"
                onClick={handleLaunchCampaignClick}
              >
                Launch Your First Campaign →
              </Link>
              <Link href="/offerwall" className="secondary-outline-btn final-large-btn">
                Explore Earn Offerwall
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE STYLES */}
      <style>{`
        .landing-page-main {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding-bottom: 80px;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        /* Hero */
        .landing-hero-section {
          width: 100%;
          display: flex;
          justify-content: center;
          padding: 40px 24px 20px;
          box-sizing: border-box;
        }
        .landing-content-container {
          max-width: 860px;
          width: 100%;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          margin-right: 6px;
          box-shadow: 0 0 10px #10b981;
          animation: pulseDot 2s infinite ease-in-out;
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }

        .landing-hero-subtitle {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          font-size: 1.35rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .landing-hero-tagline {
          font-size: 0.95rem;
          color: var(--text-muted);
          margin-top: -6px;
          margin-bottom: 8px;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .static-part {
          flex: 1;
          text-align: right;
          white-space: nowrap;
        }
        .dynamic-part {
          flex: 1;
          text-align: left;
          color: var(--accent-indigo);
          font-weight: 800;
          position: relative;
          white-space: nowrap;
        }
        .typing-cursor {
          display: inline-block;
          width: 3px;
          height: 1.25rem;
          background-color: var(--accent-indigo);
          margin-left: 2px;
          vertical-align: text-bottom;
          animation: blink 0.75s step-end infinite;
        }
        @keyframes blink {
          from, to { background-color: transparent }
          50% { background-color: var(--accent-indigo); }
        }

        /* Promo card refinements */
        .promo-container-box {
          position: relative;
          max-width: 640px;
          width: 100%;
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 28px 28px 22px;
          background: var(--hero-card-bg);
          box-shadow: var(--shadow-premium);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          backdrop-filter: blur(16px);
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .promo-container-box:hover {
          border-color: var(--accent-indigo);
          transform: translateY(-2px);
        }
        .promo-badge-tag {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          background: rgba(79, 70, 229, 0.12);
          color: #818cf8;
          padding: 4px 12px;
          border-radius: 20px;
          margin-bottom: 12px;
          border: 1px solid rgba(79, 70, 229, 0.25);
        }
        .promo-actions-row {
          display: flex;
          gap: 12px;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .secondary-outline-btn {
          padding: 10px 22px;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
        }
        .secondary-outline-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--text-secondary);
        }
        .promo-footer-note {
          display: flex;
          gap: 16px;
          font-size: 0.78rem;
          color: var(--text-muted);
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Common Section Layout */
        .landing-section {
          width: 100%;
          max-width: 1160px;
          margin: 64px auto 0;
          padding: 0 24px;
          box-sizing: border-box;
        }
        .section-header-block {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 40px;
        }
        .section-pill {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--accent-indigo);
          background: rgba(79, 70, 229, 0.08);
          border: 1px solid rgba(79, 70, 229, 0.2);
          padding: 4px 14px;
          border-radius: 999px;
          margin-bottom: 12px;
        }
        .section-main-heading {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          line-height: 1.25;
          margin-bottom: 12px;
        }
        .section-lead-text {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* 2. Stats Bar Section */
        .landing-stats-section {
          width: 100%;
          max-width: 1160px;
          margin: 40px auto 0;
          padding: 0 24px;
          box-sizing: border-box;
        }
        .stats-bar-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          background: var(--hero-card-bg);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 28px 24px;
          box-shadow: var(--shadow-lg);
          backdrop-filter: blur(12px);
        }
        .stat-card {
          text-align: center;
          border-right: 1px solid var(--border-color);
          padding: 0 12px;
        }
        .stat-card:last-child {
          border-right: none;
        }
        .stat-number {
          font-family: var(--font-display);
          font-size: 2.3rem;
          font-weight: 900;
          color: #818cf8;
          letter-spacing: -0.03em;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        body.light-theme .stat-number {
          color: #4f46e5;
        }
        .stat-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .stat-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* 3. Steps Grid */
        .steps-container-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .step-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 18px;
          padding: 32px 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: transform 0.25s ease, border-color 0.25s ease;
        }
        .step-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-indigo);
        }
        .featured-step {
          background: linear-gradient(180deg, rgba(79, 70, 229, 0.05) 0%, var(--bg-card) 100%);
          border-color: rgba(79, 70, 229, 0.35);
        }
        .step-number-bubble {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--accent-indigo);
          background: rgba(79, 70, 229, 0.1);
          padding: 4px 10px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .step-icon {
          font-size: 2rem;
          margin-bottom: 14px;
        }
        .step-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 10px;
        }
        .step-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 20px;
          flex-grow: 1;
        }
        .step-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent-teal);
          background: rgba(13, 148, 136, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
        }

        /* 4. Channels Grid */
        .channels-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .channel-box {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          transition: all 0.2s ease;
        }
        .channel-box:hover {
          border-color: var(--accent-indigo);
          background: var(--bg-card-hover);
          transform: translateY(-3px);
        }
        .channel-icon-wrapper {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          margin-bottom: 16px;
        }
        .channel-icon-wrapper svg {
          width: 26px !important;
          height: 26px !important;
        }
        .channel-name {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .channel-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 16px;
          flex-grow: 1;
        }
        .channel-badge {
          font-size: 0.72rem;
          font-weight: 700;
          color: #818cf8;
          background: rgba(79, 70, 229, 0.1);
          padding: 3px 8px;
          border-radius: 6px;
        }

        /* 5. ROI Calculator */
        .calculator-wrapper-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 24px;
          padding: 36px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 36px;
          box-shadow: var(--shadow-premium);
        }
        .calc-title {
          font-family: var(--font-display);
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .calc-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .goal-picker-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 28px;
        }
        .goal-btn {
          padding: 10px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-secondary);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }
        .goal-btn:hover {
          border-color: var(--accent-indigo);
          color: var(--text-primary);
        }
        .goal-btn.active {
          border-color: var(--accent-indigo);
          background: rgba(79, 70, 229, 0.12);
          color: #818cf8;
          font-weight: 700;
        }
        body.light-theme .goal-btn.active {
          color: #4f46e5;
        }
        .slider-container-box {
          margin-top: 16px;
        }
        .slider-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .slider-val-highlight {
          color: var(--accent-indigo);
          font-weight: 800;
        }
        .custom-range-slider {
          width: 100%;
          height: 8px;
          border-radius: 4px;
          background: var(--border-color);
          outline: none;
          cursor: pointer;
          accent-color: var(--accent-indigo);
        }
        .slider-ticks {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .summary-glass-box {
          background: var(--hero-card-bg);
          border: 1px solid var(--border-color);
          border-radius: 18px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
          justify-content: center;
        }
        .summary-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .summary-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .line-val {
          font-weight: 600;
          color: var(--text-primary);
        }
        .discount-line {
          color: #10b981;
          font-weight: 600;
        }
        .discount-line .line-val {
          color: #10b981;
        }
        .summary-divider {
          height: 1px;
          background: var(--border-color);
          margin: 6px 0;
        }
        .summary-total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .total-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .total-amount {
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 900;
          color: #818cf8;
        }
        body.light-theme .total-amount {
          color: #4f46e5;
        }
        .calc-cta-btn {
          width: 100%;
          text-align: center;
          margin-top: 8px;
        }

        /* 6. Comparison Table */
        .comparison-table-wrapper {
          overflow-x: auto;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
        }
        .comparison-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .comparison-table th {
          padding: 20px 24px;
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.02);
        }
        .comparison-table th.highlight-col {
          color: #818cf8;
          background: rgba(79, 70, 229, 0.08);
          border-left: 1px solid rgba(79, 70, 229, 0.2);
          border-right: 1px solid rgba(79, 70, 229, 0.2);
        }
        .comparison-table td {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
        }
        .comparison-table tr:last-child td {
          border-bottom: none;
        }
        .feature-cell strong {
          display: block;
          color: var(--text-primary);
          margin-bottom: 2px;
        }
        .feature-cell span {
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .comparison-table td.highlight-col {
          background: rgba(79, 70, 229, 0.04);
          border-left: 1px solid rgba(79, 70, 229, 0.2);
          border-right: 1px solid rgba(79, 70, 229, 0.2);
          font-weight: 600;
        }
        .success-cell {
          color: var(--text-primary);
        }
        .check-icon {
          color: #10b981;
          font-weight: 900;
          margin-right: 6px;
        }
        .danger-cell {
          color: var(--text-secondary);
        }
        .cross-icon {
          color: #ef4444;
          font-weight: 900;
          margin-right: 6px;
        }

        /* 8. FAQ Accordion */
        .faq-accordion-container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .faq-item {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 20px 24px;
          cursor: pointer;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }
        .faq-item:hover, .faq-item-open {
          border-color: var(--accent-indigo);
          background: var(--bg-card-hover);
        }
        .faq-question-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }
        .faq-question-text {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .faq-toggle-icon {
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--accent-indigo);
        }
        .faq-answer-block {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--border-color);
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* 9. Final Bottom CTA Banner */
        .landing-bottom-cta-section {
          width: 100%;
          max-width: 1160px;
          margin: 80px auto 0;
          padding: 0 24px;
          box-sizing: border-box;
        }
        .final-cta-card {
          position: relative;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(13, 148, 136, 0.12) 100%), var(--bg-card);
          border: 1px solid rgba(79, 70, 229, 0.3);
          border-radius: 28px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: var(--shadow-premium);
          overflow: hidden;
        }
        .cta-glow-circle {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.35) 0%, transparent 70%);
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .final-cta-content {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 auto;
        }
        .final-cta-title {
          font-family: var(--font-display);
          font-size: 2.3rem;
          font-weight: 900;
          color: var(--text-primary);
          line-height: 1.25;
          letter-spacing: -0.03em;
          margin-bottom: 14px;
        }
        .final-cta-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .final-cta-buttons {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .final-large-btn {
          padding: 14px 28px;
          font-size: 1rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 960px) {
          .stats-bar-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          .stat-card {
            border-right: none;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 16px;
          }
          .stat-card:nth-child(3), .stat-card:nth-child(4) {
            border-bottom: none;
            padding-bottom: 0;
          }
          .steps-container-grid, .channels-grid {
            grid-template-columns: 1fr;
          }
          .calculator-wrapper-card {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .landing-hero-title {
            font-size: 2.3rem;
          }
          .stats-bar-grid {
            grid-template-columns: 1fr;
          }
          .stat-card {
            border-bottom: 1px solid var(--border-color);
          }
          .stat-card:last-child {
            border-bottom: none;
          }
          .final-cta-title {
            font-size: 1.75rem;
          }
          .final-cta-card {
            padding: 40px 20px;
          }
          .goal-picker-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

    </main>
  );
}
