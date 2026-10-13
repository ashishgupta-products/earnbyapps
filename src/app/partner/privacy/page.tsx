"use client";

import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/AppLogo';
import BrandLogo from '@/components/BrandLogo';

export default function PartnerPrivacyPage() {
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
          <span className="legal-badge">Security & Compliance</span>
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last Updated: October 2026</p>
        </div>

        <section className="legal-section">
          <h2>1. Introduction</h2>
          <p>
            At EarnByApps, we are committed to respecting and protecting the privacy of all our users and partners. 
            This Privacy Policy explains how we collect, store, process, and safeguard information when you use our website, 
            mobile application, or partner dashboard.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Information We Collect</h2>
          <p>
            Depending on your role (Earner or Partner), we may collect the following data:
          </p>
          <ul>
            <li><strong>Account Details:</strong> Name, email address, and profile picture (when signing in via Google OAuth or Credentials).</li>
            <li><strong>Payout Information:</strong> UPI ID (Virtual Payment Address) or Paytm number strictly used to deliver approved withdrawal funds. We never request or store bank account passwords, debit card PINs, or CVV numbers.</li>
            <li><strong>Task Proofs:</strong> Screenshots or transaction identifiers submitted to verify task completion.</li>
            <li><strong>Device Diagnostics:</strong> Basic device telemetry (OS version, IP address) utilized solely for fraud prevention and preventing duplicate accounts.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. How We Use Your Information</h2>
          <p>
            Your information is used strictly to:
          </p>
          <ul>
            <li>Facilitate instant UPI cashback disbursements to your registered payment identifier.</li>
            <li>Authenticate partner campaigns and track genuine completion metrics.</li>
            <li>Detect, investigate, and prevent fraudulent activity and robotic submissions.</li>
            <li>Provide customer support and resolve user disputes.</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Data Protection & Security</h2>
          <p>
            We deploy industry-standard TLS encryption for all data in transit. Sensitive payout records are 
            stored in encrypted databases with strict role-based access controls. We never sell, rent, or trade 
            your personal identification data to third-party data brokers.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or wish to request data deletion, please reach out to: 
            <a href="mailto:privacy@earnbyapps.com"> privacy@earnbyapps.com</a> or visit our 
            <Link href="/partner/help-center"> Help Center</Link>.
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
          color: #10b981;
          background: rgba(16, 185, 129, 0.1);
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
