"use client";

import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/AppLogo';
import BrandLogo from '@/components/BrandLogo';

export default function PartnerTermsPage() {
  return (
    <div className="legal-page-container">
      <header className="legal-page-header">
        <Link href="/" className="legal-brand-link">
          <AppLogo size={32} />
          <BrandLogo fontSize="1.3rem" />
        </Link>
        <Link href="/" className="legal-back-btn">
          ← Back to Home
        </Link>
      </header>

      <main className="legal-main-card">
        <div className="legal-title-section">
          <span className="legal-badge">Legal Documentation</span>
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last Updated: October 2026</p>
        </div>

        <section className="legal-section">
          <h2>1. Overview & Acceptance</h2>
          <p>
            Welcome to EarnByApps ("we", "our", or "us"). By registering, accessing, or utilizing our platform 
            either as an Earner (User) or as a Growth Partner (Advertiser), you agree to comply with and be bound 
            by these Terms of Service. If you do not agree to these terms, please refrain from using the platform.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Partner & Advertiser Guidelines</h2>
          <p>
            Advertisers launch task-based campaigns to acquire genuine users, reviews, and community engagement.
          </p>
          <ul>
            <li><strong>Authentic Campaigns:</strong> All campaign URLs, APKs, and survey links must be safe, free of malware, spyware, phishing, or deceptive practices.</li>
            <li><strong>Fair Verification:</strong> Partners must review submitted proofs in good faith and approve valid submissions within the designated audit timeframe.</li>
            <li><strong>Credits & Budgets:</strong> Promotional credits (such as the 100 free starting credits) are non-transferable and can only be used to fund active campaigns on EarnByApps.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Earner / User Standards</h2>
          <p>
            Earners receive cash rewards by completing tasks accurately according to the instructions provided.
          </p>
          <ul>
            <li><strong>One Account Per User:</strong> Each earner is permitted strictly one registered account and device signature.</li>
            <li><strong>No Emulators or Automation:</strong> Automated bots, proxies, VPNs, GPS spoofers, or edited screenshot proofs will result in permanent account suspension and forfeiture of rewards.</li>
            <li><strong>Genuine Reviews:</strong> Reviews on app stores or Google Maps must reflect authentic feedback and comply with relevant third-party store policies.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Payments & Payouts</h2>
          <p>
            Payouts to earners are processed in Indian Rupees (INR) via supported UPI channels (Google Pay, PhonePe, Paytm, BHIM) 
            or Paytm Wallet. The standard minimum threshold is ₹20. Payout processing typically completes in 2 to 15 minutes, 
            subject to banking server availability and fraud audits.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Dispute Resolution & Contact</h2>
          <p>
            If you have questions regarding these Terms or wish to raise a dispute, please contact our support team at 
            <a href="mailto:support@earnbyapps.com"> support@earnbyapps.com</a> or visit the 
            <Link href="/partner/help-center"> Partner Help Center</Link>.
          </p>
        </section>
      </main>

      <style>{`
        .legal-page-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 30px 20px 80px;
          font-family: inherit;
          color: var(--text-primary, #0f172a);
        }
        .legal-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 24px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
        }
        .legal-brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .legal-back-btn {
          font-size: 0.88rem;
          font-weight: 700;
          color: #4f46e5;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          background: rgba(79, 70, 229, 0.08);
          transition: all 0.2s;
        }
        .legal-back-btn:hover {
          background: rgba(79, 70, 229, 0.16);
        }
        .legal-main-card {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 20px;
          padding: 44px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }
        .legal-title-section {
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border-color, #e2e8f0);
          padding-bottom: 20px;
        }
        .legal-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #4f46e5;
          background: rgba(79, 70, 229, 0.1);
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 12px;
        }
        .legal-title-section h1 {
          font-size: 2.2rem;
          font-weight: 900;
          margin: 0 0 6px;
        }
        .legal-updated {
          font-size: 0.85rem;
          color: var(--text-muted, #94a3b8);
          margin: 0;
        }
        .legal-section {
          margin-bottom: 30px;
        }
        .legal-section h2 {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 12px;
          color: var(--text-primary, #0f172a);
        }
        .legal-section p {
          font-size: 0.95rem;
          color: var(--text-secondary, #475569);
          line-height: 1.7;
          margin-bottom: 12px;
        }
        .legal-section ul {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .legal-section li {
          font-size: 0.92rem;
          color: var(--text-secondary, #475569);
          line-height: 1.6;
        }
        .legal-section a {
          color: #4f46e5;
          text-decoration: none;
          font-weight: 600;
        }
        .legal-section a:hover {
          text-decoration: underline;
        }
        @media (max-width: 640px) {
          .legal-main-card {
            padding: 24px 20px;
          }
          .legal-title-section h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </div>
  );
}
