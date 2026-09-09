"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PaymentOptionsPage() {
  const [minWithdrawal, setMinWithdrawal] = useState(100);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eb_admin_payment_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.minWithdrawal !== undefined) setMinWithdrawal(parsed.minWithdrawal);
      } catch (e) {}
    }
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('eb_admin_payment_settings', JSON.stringify({ minWithdrawal }));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="admin-content-card">
      <div className="card-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem' }}>🇮🇳</span>
            <h2 className="card-heading" style={{ margin: 0 }}>Direct Indian Payment Rails</h2>
            <span style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--accent-emerald)',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '99px',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>Active</span>
          </div>
          <p className="card-subheading">
            EarnByApps operates exclusively in India. Multi-country dynamic payment gateways are disabled. Payout details are captured directly through fixed Indian fields.
          </p>
        </div>
        <Link 
          href="/admin/wallet"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, var(--accent-indigo), #0ea5e9)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.88rem',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
          }}
        >
          💰 View Wallet & Payout Claims ↗
        </Link>
      </div>

      {/* Active Indian Rails Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        margin: '24px 0'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1rem' }}>UPI (Unified Payments Interface)</strong>
              <span style={{ color: 'var(--accent-emerald)', fontSize: '0.78rem', fontWeight: 600 }}>Default & Instant</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0, lineHeight: 1.4 }}>
            Direct field: <code>UPI ID / VPA</code> (e.g. <code>user@okhdfcbank</code>, <code>9876543210@paytm</code>). Zero fees, instant settlement across GPay, PhonePe, Paytm, and BHIM.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>🏦</span>
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1rem' }}>Bank Transfer (IMPS / NEFT)</strong>
              <span style={{ color: 'var(--accent-indigo)', fontSize: '0.78rem', fontWeight: 600 }}>Direct Account Credit</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0, lineHeight: 1.4 }}>
            Direct fields: <code>Account Holder Name</code>, <code>Bank Name</code>, <code>Account Number</code>, and <code>IFSC Code</code>. Supported for all Indian commercial & rural banks.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>📲</span>
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', fontSize: '1rem' }}>Paytm Wallet</strong>
              <span style={{ color: 'var(--accent-cyan)', fontSize: '0.78rem', fontWeight: 600 }}>Mobile Wallet Direct</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: 0, lineHeight: 1.4 }}>
            Direct field: <code>10-digit Indian Mobile Number</code>. Instant wallet top-up for KYC-verified Paytm accounts.
          </p>
        </div>
      </div>

      {/* Threshold configuration */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '560px'
      }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          🪙 Payout Threshold Settings (INR)
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Set the minimum earner wallet balance required before requesting an Indian withdrawal claim.
        </p>

        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Minimum Withdrawal Limit (₹)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>₹</span>
              <input 
                type="number"
                min="10"
                step="10"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Recommended minimum: ₹50 - ₹100 to reduce micro-transaction overhead.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="submit"
              style={{
                background: 'var(--accent-indigo)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Save Settings
            </button>
            {savedSuccess && (
              <span style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
                ✓ Settings saved successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
