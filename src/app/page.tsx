"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import AppLogo from '@/components/AppLogo';
import BrandLogo from '@/components/BrandLogo';
import HomeAudienceSwitcher from '@/components/HomeAudienceSwitcher';
import BusinessView from '@/components/BusinessView';







// FAQs for Earners
const FAQS = [
  {
    q: 'Is EarnByApps 100% free to use?',
    a: 'Yes, absolutely 100% free! You never have to pay or invest anything. You only earn real cash by trying out new apps, rating them, and completing quick sponsored tasks.'
  },
  {
    q: 'How do I withdraw my earnings?',
    a: 'You can withdraw directly to your Bank Account via UPI (Google Pay, PhonePe, Paytm, BHIM) or Paytm Wallet. The minimum withdrawal threshold is just ₹20, and payouts are processed within 2 to 15 minutes.'
  },
  {
    q: 'Is it safe to install the APK on Android?',
    a: 'Yes! The APK is built directly from verified source code and scanned clean. It requires standard app permissions and does not access your sensitive personal data or financial passwords.'
  },
  {
    q: 'Can I earn on both the Android App and the website?',
    a: 'Yes! Your account and wallet balance are synchronized in real-time. You can complete tasks on our website offerwall or through the Android APK using the same Google login.'
  },
  {
    q: 'How does the Refer & Earn program work?',
    a: 'When your friend downloads EarnByApps with your referral link or code, you automatically earn an instant bonus plus up to 50% commission on every task they complete for life!'
  }
];

export default function Home() {
  const { data: session } = useSession();
  const [activeMode, setActiveMode] = useState<'earn' | 'grow'>('earn');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Monitor scroll for mobile sticky download bar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 380) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const apkDownloadUrl = process.env.NEXT_PUBLIC_ANDROID_APK_URL || '/EarnByApps%20v-1.0.0.apk';

  return (
    <div className="home-root-wrapper">



      {/* 2. AUDIENCE SWITCHER: TO EARN vs TO GROW */}
      <HomeAudienceSwitcher 
        activeMode={activeMode} 
        onModeChange={(mode) => setActiveMode(mode)} 
      />

      {activeMode === 'grow' ? (
        <BusinessView onSwitchToEarn={() => setActiveMode('earn')} />
      ) : (
        <main className="earner-homepage-main">
          {/* 3. HERO SECTION */}
          <section className="earner-hero-section">
            <div className="hero-container">
          
          {/* Left Hero Content */}
          <div className="hero-left-content">
            <div className="hero-trust-tag">
              <span>🔥 India’s #1 Real Cash Earning App</span>
            </div>

            <h1 className="hero-title">
              Complete Simple Tasks, <br />
              <span className="highlight-gradient">Get Instant UPI Cash Daily</span>
            </h1>

            <p className="hero-subtitle">
              Install genuine apps, rate & review, spin the daily wheel, and refer buddies. 
              Transfer your cash rewards straight to <strong>Google Pay, PhonePe, or Paytm</strong> with a 
              minimum withdrawal of just <strong>₹20</strong>!
            </p>

            {/* Primary Action Buttons */}
            <div className="hero-actions-row">
              <a 
                href={apkDownloadUrl} 
                download="EarnByApps-v1.0.0.apk"
                className="main-apk-download-btn"
                id="hero-download-apk-btn"
              >
                <div className="apk-btn-icon-wrapper">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1523-.5676.416.416 0 00-.5676.1523l-2.0223 3.503C15.5902 8.411 13.8559 8.1 12 8.1s-3.5902.311-5.1366.8499L4.8411 5.4469a.4161.4161 0 00-.5677-.1523.4157.4157 0 00-.1522.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396"/>
                  </svg>
                </div>
                <div className="apk-btn-text-wrapper">
                  <span className="apk-btn-sub">DIRECT ANDROID INSTALL</span>
                  <span className="apk-btn-main">Download App to Earn</span>
                </div>
                <span className="apk-file-badge">32 MB • APK</span>
              </a>

            </div>

            {/* Micro Trust Points */}
            <div className="hero-micro-trust">
              <div className="micro-trust-item">
                <span className="check-icon">✓</span>
                <span><strong>Min. ₹20</strong> Instant UPI Payout</span>
              </div>
              <div className="micro-trust-item">
                <span className="check-icon">✓</span>
                <span><strong>100% Free</strong> • No Investment</span>
              </div>
              <div className="micro-trust-item">
                <span className="check-icon">✓</span>
                <span><strong>No Passwords</strong> Required</span>
              </div>
            </div>

            {/* Stats Counter Row */}
            <div className="hero-stats-strip">
              <div className="hero-stat-box">
                <span className="stat-number">₹10L+</span>
                <span className="stat-label">Paid to Earners</span>
              </div>
              <div className="hero-stat-box divider-box">
                <span className="stat-number">50,000+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="hero-stat-box divider-box">
                <span className="stat-number">4.7 ★</span>
                <span className="stat-label">App Rating</span>
              </div>
              <div className="hero-stat-box divider-box">
                <span className="stat-number">2 Mins</span>
                <span className="stat-label">Avg. Payout Time</span>
              </div>
            </div>

          </div>

          {/* Right Hero: Responsive Interactive Phone Mockup */}
          <div className="hero-right-mockup">
            <div className="phone-wrapper">
              
              {/* Floating Money Badges */}
              <div className="floating-badge badge-top-right animate-float-slow">
                <span className="badge-icon">💸</span>
                <div>
                  <div className="badge-title">+₹150.00</div>
                  <div className="badge-sub">UPI Bank Transfer</div>
                </div>
              </div>

              <div className="floating-badge badge-bottom-left animate-float-delay">
                <span className="badge-icon">🎉</span>
                <div>
                  <div className="badge-title">Daily Spin Bonus</div>
                  <div className="badge-sub">+25 Sikka Coins</div>
                </div>
              </div>

              {/* Smartphone Outer Shell */}
              <div className="phone-shell">
                <div className="phone-notch">
                  <div className="phone-camera"></div>
                  <div className="phone-speaker"></div>
                </div>

                {/* Phone Inside Screen */}
                <div className="phone-screen">
                  
                  {/* App Header in Phone */}
                  <div className="mockup-header">
                    <div className="mockup-brand">
                      <AppLogo size={24} />
                      <span className="mockup-brand-name">EarnByApps</span>
                    </div>
                    <div className="mockup-user-chip">
                      <span className="mockup-user-avatar">🇮🇳</span>
                      <span>₹340.50</span>
                    </div>
                  </div>

                  {/* Wallet Card inside Mockup */}
                  <div className="mockup-wallet-card">
                    <div className="mockup-wallet-row">
                      <div>
                        <span className="mockup-wallet-label">Available Balance</span>
                        <div className="mockup-wallet-bal">₹340.50</div>
                      </div>
                      <button className="mockup-withdraw-btn">Withdraw →</button>
                    </div>
                    <div className="mockup-min-note">Min. ₹20 • Instant UPI Transfer</div>
                  </div>

                  {/* Quick Action Chips inside Mockup */}
                  <div className="mockup-action-chips">
                    <div className="mockup-chip active">🔥 High Payouts</div>
                    <div className="mockup-chip">🎡 Daily Spin</div>
                    <div className="mockup-chip">⭐ Ratings</div>
                  </div>

                  {/* Sample Task Cards in Mockup */}
                  <div className="mockup-tasks-list">
                    <div className="mockup-task-item">
                      <div className="mockup-task-icon">📈</div>
                      <div className="mockup-task-info">
                        <div className="mockup-task-title">Groww Demat Setup</div>
                        <div className="mockup-task-desc">Install & Complete KYC</div>
                      </div>
                      <div className="mockup-task-reward">
                        <span>+₹150</span>
                        <button className="mockup-task-btn">Get</button>
                      </div>
                    </div>

                    <div className="mockup-task-item">
                      <div className="mockup-task-icon">🪙</div>
                      <div className="mockup-task-info">
                        <div className="mockup-task-title">Angel One App</div>
                        <div className="mockup-task-desc">Register & Verify</div>
                      </div>
                      <div className="mockup-task-reward">
                        <span>+₹120</span>
                        <button className="mockup-task-btn">Get</button>
                      </div>
                    </div>

                    <div className="mockup-task-item">
                      <div className="mockup-task-icon">⭐</div>
                      <div className="mockup-task-info">
                        <div className="mockup-task-title">Play Store Review</div>
                        <div className="mockup-task-desc">5 Star Rating Task</div>
                      </div>
                      <div className="mockup-task-reward">
                        <span>+₹35</span>
                        <button className="mockup-task-btn">Get</button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation Mockup */}
                  <div className="mockup-bottom-nav">
                    <span className="nav-tab active">🏠 Home</span>
                    <span className="nav-tab">📋 Tasks</span>
                    <span className="nav-tab">👛 Wallet</span>
                    <span className="nav-tab">🤝 Refer</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SUPPORTED PAYMENT PARTNERS STRIP */}
      <section className="payment-partners-section">
        <div className="partners-container">
          <span className="partners-title">Instant Cash Withdrawals Supported via:</span>
          <div className="partners-pills-row">
            <div className="partner-pill">⚡ UPI (Instant)</div>
            <div className="partner-pill">📱 Google Pay</div>
            <div className="partner-pill">🟣 PhonePe</div>
            <div className="partner-pill">🔵 Paytm Wallet</div>
            <div className="partner-pill">🇮🇳 BHIM UPI</div>
            <div className="partner-pill">🏦 Direct Bank Transfer</div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 3 SIMPLE STEPS TO EARN */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">SIMPLE 3-STEP PROCESS</span>
            <h2 className="section-title">How to Earn Daily Cash on EarnByApps</h2>
            <p className="section-desc">
              Start earning within 2 minutes. No prior experience or complicated requirements.
            </p>
          </div>

          <div className="steps-grid">
            <div className="earner-step-card">
              <div className="step-number-tag">STEP 01</div>
              <div className="step-icon-circle">📥</div>
              <h3 className="step-heading">Download & Open App</h3>
              <p className="step-body">
                Install our official Android APK (or use the web app). Log in with your Google account in 
                5 seconds to claim your welcome bonus.
              </p>
            </div>

            <div className="earner-step-card featured-step">
              <div className="step-number-tag">STEP 02</div>
              <div className="step-icon-circle">📱</div>
              <h3 className="step-heading">Complete Easy App Tasks</h3>
              <p className="step-body">
                Browse high-paying offers on the live Offerwall. Test new apps, complete quick registrations, 
                or give 5-star ratings to accumulate coins.
              </p>
            </div>

            <div className="earner-step-card">
              <div className="step-number-tag">STEP 03</div>
              <div className="step-icon-circle">💰</div>
              <h3 className="step-heading">Instant UPI Cashout</h3>
              <p className="step-body">
                Enter your UPI ID (Google Pay, PhonePe, Paytm). Hit withdraw starting at ₹20 and receive the 
                real money in your bank account in 2 minutes!
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="faq-section" id="faq">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="section-title">All Your Doubts Resolved</h2>
            <p className="section-desc">Got questions about earning, rewards, or payments? Find answers below.</p>
          </div>

          <div className="faq-accordion-list">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className={`faq-accordion-item ${isOpen ? 'open' : ''}`}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div className="faq-question-row">
                    <h3 className="faq-q-text">{faq.q}</h3>
                    <span className="faq-toggle-icon">{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && (
                    <div className="faq-answer-box">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* 11. DEDICATED EARNER FOOTER & BUSINESS LINK */}
      <footer className="earner-footer">
        <div className="section-container footer-flex">
          <div className="footer-left">
            <div className="footer-brand-row">
              <AppLogo size={32} />
              <BrandLogo fontSize="1.35rem" />
            </div>
            <p className="footer-tagline">
              India’s premier daily cash reward platform. Earn real money by completing simple app tasks, 
              surveys, and inviting friends.
            </p>
          </div>

          <div className="footer-right-links">
            <div className="footer-col">
              <h4>Quick Links</h4>
              <Link href="/offerwall">Live Offerwall</Link>
              <Link href="#how-it-works">How It Works</Link>
              <Link href="#faq">FAQs</Link>
              <Link href="/login">User Login</Link>
            </div>
            <div className="footer-col">
              <h4>Legal & Safety</h4>
              <Link href="/partner/terms">Terms of Service</Link>
              <Link href="/partner/privacy">Privacy Policy</Link>
              <Link href="/business">Business / Partner Portal</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <p>© {new Date().getFullYear()} EarnByApps. All rights reserved. Made with ❤️ for Indian Earners.</p>
        </div>
      </footer>

      {/* 12. STICKY MOBILE DOWNLOAD BAR */}
      {showStickyBar && (
        <div className="sticky-mobile-bar">
          <div className="sticky-bar-content">
            <div className="sticky-app-info">
              <AppLogo size={32} />
              <div>
                <div className="sticky-app-title">EarnByApps APK</div>
                <div className="sticky-app-sub">⭐ 4.7 • 32 MB • Free</div>
              </div>
            </div>
            <a 
              href={apkDownloadUrl}
              download="EarnByApps-v1.0.0.apk"
              className="sticky-download-btn"
            >
              Download App
            </a>
          </div>
        </div>
      )}
        </main>
      )}

      {/* SCOPED COMPREHENSIVE STYLING */}
      <style>{`
        .home-root-wrapper {
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg-dark, #f8fafc);
          color: var(--text-primary, #0f172a);
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .earner-homepage-main {
          width: 100%;
          min-height: 100vh;
          background-color: var(--bg-dark, #f8fafc);
          color: var(--text-primary, #0f172a);
          font-family: inherit;
          overflow-x: hidden;
          box-sizing: border-box;
        }





        /* 2. HERO SECTION */
        .earner-hero-section {
          padding: 40px 24px 60px;
          max-width: 1240px;
          margin: 0 auto;
          box-sizing: border-box;
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 48px;
          align-items: center;
        }
        .hero-trust-tag {
          display: inline-block;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #b45309;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1.18;
          margin: 0 0 18px 0;
          letter-spacing: -0.02em;
          color: var(--text-primary, #0f172a);
        }
        .highlight-gradient {
          background: linear-gradient(135deg, #3A5998 0%, #2b4374 50%, #EAA812 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          line-height: 1.65;
          color: var(--text-secondary, #475569);
          margin: 0 0 28px 0;
          max-width: 580px;
        }
        .hero-subtitle strong {
          color: var(--text-primary, #0f172a);
        }

        /* Hero Action Buttons */
        .hero-actions-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .main-apk-download-btn {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, #3A5998 0%, #2b4374 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 14px 24px;
          border-radius: 14px;
          font-weight: 700;
          transition: all 0.25s ease;
          box-shadow: 0 6px 20px rgba(58, 89, 152, 0.35);
          border: 1px solid rgba(58, 89, 152, 0.5);
        }
        .main-apk-download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(58, 89, 152, 0.5);
          filter: brightness(1.06);
        }
        .apk-btn-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.2);
          width: 44px;
          height: 44px;
          border-radius: 10px;
        }
        .apk-btn-text-wrapper {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        .apk-btn-sub {
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.9;
          font-weight: 800;
        }
        .apk-btn-main {
          font-size: 1.15rem;
          font-weight: 800;
        }
        .apk-file-badge {
          background: rgba(0, 0, 0, 0.22);
          font-size: 0.72rem;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 700;
        }


        /* Micro Trust Points */
        .hero-micro-trust {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 32px;
          font-size: 0.86rem;
          color: var(--text-secondary, #475569);
        }
        .micro-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .check-icon {
          color: #3A5998;
          font-weight: 900;
        }

        /* Stats Strip */
        .hero-stats-strip {
          display: flex;
          align-items: center;
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 16px;
          padding: 16px 24px;
          max-width: 580px;
          justify-content: space-between;
          box-shadow: var(--shadow-sm);
        }
        .hero-stat-box {
          display: flex;
          flex-direction: column;
          text-align: center;
        }
        .hero-stat-box .stat-number {
          font-size: 1.35rem;
          font-weight: 900;
          color: #d97706;
        }
        .hero-stat-box .stat-label {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
          font-weight: 600;
          margin-top: 2px;
        }

        /* Right Hero Mockup */
        .hero-right-mockup {
          display: flex;
          justify-content: center;
          position: relative;
        }
        .phone-wrapper {
          position: relative;
          width: 310px;
        }
        .floating-badge {
          position: absolute;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid var(--border-color, #e2e8f0);
          backdrop-filter: blur(12px);
          padding: 10px 14px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 10;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }
        .badge-top-right {
          top: 30px;
          right: -36px;
        }
        .badge-bottom-left {
          bottom: 40px;
          left: -40px;
        }
        .badge-icon {
          font-size: 1.3rem;
        }
        .badge-title {
          font-weight: 800;
          font-size: 0.88rem;
          color: #3A5998;
        }
        .badge-sub {
          font-size: 0.7rem;
          color: var(--text-muted, #64748b);
        }
        .animate-float-slow {
          animation: floatSlow 4s ease-in-out infinite;
        }
        .animate-float-delay {
          animation: floatSlow 4s ease-in-out 2s infinite;
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        /* Smartphone Shell (Clean hardware design) */
        .phone-shell {
          width: 300px;
          height: 600px;
          background: #0f172a;
          border: 6px solid #334155;
          border-radius: 42px;
          box-shadow: 0 25px 60px -12px rgba(15, 23, 42, 0.25), 0 0 40px rgba(58, 89, 152, 0.15);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .phone-notch {
          height: 24px;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .phone-camera {
          width: 8px;
          height: 8px;
          background: #000;
          border-radius: 50%;
        }
        .phone-speaker {
          width: 36px;
          height: 4px;
          background: #475569;
          border-radius: 4px;
        }
        .phone-screen {
          flex: 1;
          background: #0b1120;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          overflow: hidden;
        }
        .mockup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mockup-brand {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .mockup-brand-name {
          font-weight: 800;
          font-size: 0.85rem;
          color: #ffffff;
        }
        .mockup-user-chip {
          background: rgba(58, 89, 152, 0.15);
          color: #3A5998;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .mockup-wallet-card {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
          border-radius: 16px;
          padding: 12px 14px;
          color: #ffffff;
        }
        .mockup-wallet-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .mockup-wallet-label {
          font-size: 0.68rem;
          opacity: 0.8;
          text-transform: uppercase;
          font-weight: 700;
        }
        .mockup-wallet-bal {
          font-size: 1.25rem;
          font-weight: 900;
          margin-top: 2px;
        }
        .mockup-withdraw-btn {
          background: #f59e0b;
          color: #000000;
          border: none;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
        }
        .mockup-min-note {
          font-size: 0.65rem;
          opacity: 0.75;
          margin-top: 6px;
        }
        .mockup-action-chips {
          display: flex;
          gap: 6px;
        }
        .mockup-chip {
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.06);
          padding: 4px 8px;
          border-radius: 8px;
          color: #94a3b8;
        }
        .mockup-chip.active {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }
        .mockup-tasks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .mockup-task-item {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mockup-task-icon {
          font-size: 1.2rem;
        }
        .mockup-task-info {
          flex: 1;
        }
        .mockup-task-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
        }
        .mockup-task-desc {
          font-size: 0.62rem;
          color: #64748b;
        }
        .mockup-task-reward {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
        }
        .mockup-task-reward span {
          font-size: 0.78rem;
          font-weight: 800;
          color: #3A5998;
        }
        .mockup-task-btn {
          background: rgba(58, 89, 152, 0.15);
          color: #3A5998;
          border: none;
          font-size: 0.62rem;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .mockup-bottom-nav {
          display: flex;
          justify-content: space-around;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.65rem;
          color: #64748b;
        }
        .nav-tab.active {
          color: #f59e0b;
          font-weight: 800;
        }

        /* 3. PAYMENT PARTNERS STRIP */
        .payment-partners-section {
          background: var(--bg-card, #ffffff);
          border-top: 1px solid var(--border-color, #e2e8f0);
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          padding: 24px 20px;
        }
        .partners-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
        }
        .partners-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
        }
        .partners-pills-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
        }
        .partner-pill {
          background: var(--bg-dark, #f8fafc);
          border: 1px solid var(--border-color, #e2e8f0);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--text-primary, #0f172a);
          box-shadow: var(--shadow-sm);
        }

        /* COMMON SECTION STYLES */
        .section-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 24px;
          box-sizing: border-box;
        }
        .section-header {
          text-align: center;
          max-width: 680px;
          margin: 0 auto 44px;
        }
        .section-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #b45309;
          background: rgba(245, 158, 11, 0.12);
          padding: 4px 12px;
          border-radius: 16px;
          margin-bottom: 10px;
        }
        .section-title {
          font-size: 2.2rem;
          font-weight: 900;
          margin: 0 0 12px;
          line-height: 1.25;
          color: var(--text-primary, #0f172a);
        }
        .section-desc {
          font-size: 1.02rem;
          color: var(--text-secondary, #475569);
          line-height: 1.6;
          margin: 0;
        }

        /* 4. HOW IT WORKS GRID */
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        .earner-step-card {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 20px;
          padding: 32px 24px;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: all 0.25s ease;
          box-shadow: var(--shadow-sm);
        }
        .earner-step-card:hover {
          transform: translateY(-4px);
          border-color: rgba(245, 158, 11, 0.5);
          box-shadow: var(--shadow-md);
        }
        .earner-step-card.featured-step {
          background: linear-gradient(180deg, rgba(58, 89, 152, 0.05) 0%, #ffffff 100%);
          border-color: rgba(58, 89, 152, 0.35);
        }
        .step-number-tag {
          font-size: 0.72rem;
          font-weight: 900;
          color: #b45309;
          letter-spacing: 0.08em;
          margin-bottom: 16px;
        }
        .step-icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: rgba(245, 158, 11, 0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-bottom: 20px;
        }
        .earner-step-card.featured-step .step-icon-circle {
          background: rgba(58, 89, 152, 0.15);
        }
        .step-heading {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-primary, #0f172a);
          margin: 0 0 10px;
        }
        .step-body {
          font-size: 0.92rem;
          color: var(--text-secondary, #475569);
          line-height: 1.6;
          margin: 0;
        }



        /* 9. FAQ ACCORDION */
        .faq-accordion-list {
          max-width: 820px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .faq-accordion-item {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 16px;
          padding: 20px 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: var(--shadow-sm);
        }
        .faq-accordion-item:hover, .faq-accordion-item.open {
          border-color: #f59e0b;
          background: #fffdfa;
        }
        .faq-question-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .faq-q-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary, #0f172a);
          margin: 0;
        }
        .faq-toggle-icon {
          font-size: 1.4rem;
          color: #f59e0b;
          font-weight: bold;
        }
        .faq-answer-box {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--border-color, #e2e8f0);
          color: var(--text-secondary, #475569);
          line-height: 1.6;
          font-size: 0.94rem;
        }
        .faq-answer-box p {
          margin: 0;
        }


        /* 11. DEDICATED EARNER FOOTER & BUSINESS LINK */
        .earner-footer {
          border-top: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-card, #ffffff);
          padding: 60px 24px 24px;
        }
        .footer-flex {
          display: flex;
          justify-content: space-between;
          gap: 48px;
          flex-wrap: wrap;
          padding-bottom: 40px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }
        .footer-left {
          max-width: 420px;
        }
        .footer-brand-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .footer-tagline {
          font-size: 0.88rem;
          color: var(--text-secondary, #475569);
          line-height: 1.6;
          margin: 0 0 20px;
        }
        .footer-right-links {
          display: flex;
          gap: 60px;
          flex-wrap: wrap;
        }
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-col h4 {
          font-size: 0.95rem;
          font-weight: 800;
          margin: 0 0 6px;
          color: var(--text-primary, #0f172a);
        }
        .footer-col a {
          color: var(--text-secondary, #475569);
          text-decoration: none;
          font-size: 0.86rem;
          transition: color 0.2s;
        }
        .footer-col a:hover {
          color: #3A5998;
        }
        .footer-bottom-bar {
          text-align: center;
          padding-top: 24px;
          font-size: 0.82rem;
          color: #64748b;
        }

        /* 12. STICKY MOBILE DOWNLOAD BAR */
        .sticky-mobile-bar {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(16px);
          border-top: 1px solid var(--border-color, #e2e8f0);
          padding: 12px 16px;
          z-index: 999;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
        }
        .sticky-bar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 480px;
          margin: 0 auto;
        }
        .sticky-app-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sticky-app-title {
          font-weight: 800;
          font-size: 0.92rem;
          color: var(--text-primary, #0f172a);
        }
        .sticky-app-sub {
          font-size: 0.72rem;
          color: #3A5998;
          font-weight: 700;
        }
        .sticky-download-btn {
          background: linear-gradient(135deg, #3A5998 0%, #2b4374 100%);
          color: #ffffff;
          font-weight: 800;
          padding: 10px 18px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 0.88rem;
          box-shadow: 0 4px 12px rgba(58, 89, 152, 0.35);
        }

        /* RESPONSIVE MEDIA QUERIES */
        @media (max-width: 992px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .hero-left-content {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .hero-title {
            font-size: 2.4rem;
          }
          .hero-actions-row {
            justify-content: center;
          }
          .hero-micro-trust {
            justify-content: center;
          }
          .hero-stats-strip {
            margin: 0 auto;
          }
          .steps-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .sticky-mobile-bar {
            display: block;
          }
          .earner-hero-section {
            padding: 24px 16px 40px;
          }
          .hero-title {
            font-size: 1.95rem;
          }
          .hero-subtitle {
            font-size: 0.95rem;
          }
          .main-apk-download-btn {
            width: 100%;
            justify-content: center;
          }

          .hero-stats-strip {
            width: 100%;
            padding: 12px 14px;
          }
          .hero-stat-box .stat-number {
            font-size: 1.1rem;
          }
          .badge-top-right, .badge-bottom-left {
            display: none;
          }
        }
      `}</style>

    </div>
  );
}
