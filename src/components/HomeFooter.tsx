"use client";

import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/AppLogo';
import BrandLogo from '@/components/BrandLogo';

export interface HomeFooterProps {
  activeMode?: 'earn' | 'grow';
  onSwitchMode?: (mode: 'earn' | 'grow') => void;
}

export default function HomeFooter({ activeMode = 'earn', onSwitchMode }: HomeFooterProps) {
  return (
    <footer className="earner-footer">
      <div className="footer-container footer-flex">
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
            <Link href="#how-it-works">How It Works</Link>
            <Link href="#faq">FAQs</Link>
            <Link href="/login">User Login</Link>
          </div>
          <div className="footer-col">
            <h4>Legal & Safety</h4>
            <Link href="/partner/terms">Terms of Service</Link>
            <Link href="/partner/privacy">Privacy Policy</Link>
            {activeMode === 'grow' ? (
              <button 
                type="button" 
                onClick={() => {
                  if (onSwitchMode) {
                    onSwitchMode('earn');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="footer-switch-mode-btn"
                id="footer-switch-to-earn-btn"
              >
                💰 Switch to To Earn
              </button>
            ) : (
              <button 
                type="button" 
                onClick={() => {
                  if (onSwitchMode) {
                    onSwitchMode('grow');
                  }
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="footer-switch-mode-btn"
                id="footer-switch-to-grow-btn"
              >
                🚀 Switch to To Grow (For Business)
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>© {new Date().getFullYear()} EarnByApps. All rights reserved. Made with ❤️ for Indian Earners.</p>
      </div>

      <style>{`
        .earner-footer {
          border-top: 1px solid var(--border-color, #e2e8f0);
          background: var(--bg-card, #ffffff);
          padding: 60px 24px 24px;
          width: 100%;
          box-sizing: border-box;
          position: relative;
          z-index: 10;
        }
        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          box-sizing: border-box;
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
        .footer-col a,
        .footer-col button.footer-switch-mode-btn {
          color: var(--text-secondary, #475569);
          text-decoration: none;
          font-size: 0.86rem;
          transition: color 0.2s;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          text-align: left;
        }
        .footer-col a:hover,
        .footer-col button.footer-switch-mode-btn:hover {
          color: #4f46e5;
        }
        .footer-bottom-bar {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
          padding-top: 24px;
          font-size: 0.82rem;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .earner-footer {
            padding: 40px 16px 20px;
          }
          .footer-flex {
            flex-direction: column;
            gap: 32px;
            padding-bottom: 28px;
          }
          .footer-right-links {
            gap: 36px;
          }
        }
      `}</style>
    </footer>
  );
}
