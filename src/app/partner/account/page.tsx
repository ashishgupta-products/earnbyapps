"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { useSession } from 'next-auth/react';

type PayoutRail = 'upi' | 'bank' | 'paytm';

export default function PartnerAccountPage() {
  const { userProfile, updateUserProfile } = useApp();
  const { data: session } = useSession();

  const [isEditing, setIsEditing] = useState(false);
  
  // Local personal form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');

  // Direct Indian Payout states
  const [payoutRail, setPayoutRail] = useState<PayoutRail>('upi');
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [paytmNumber, setPaytmNumber] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync form states with profile data
  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.fullName || '');
      const rawPhone = userProfile.phone || '';
      setPhone(rawPhone.replace('+91', '').trim());
      setGender(userProfile.gender || 'Male');

      const rawDetails = (userProfile.paymentDetails || '').trim();
      const savedMethod = (userProfile.paymentMethod || '').toLowerCase();

      if (rawDetails.startsWith('{') || rawDetails.startsWith('[')) {
        try {
          const parsed = Array.isArray(JSON.parse(rawDetails))
            ? (JSON.parse(rawDetails).find((p: any) => p.isPreferred)?.details || JSON.parse(rawDetails)[0]?.details)
            : JSON.parse(rawDetails);

          if (parsed.accountNumber || parsed.ifsc || savedMethod.includes('bank')) {
            setPayoutRail('bank');
            setAccountHolder(parsed.accountHolder || userProfile.fullName || '');
            setBankName(parsed.bankName || '');
            setAccountNumber(parsed.accountNumber || '');
            setIfsc(parsed.ifsc || '');
          } else if (parsed.paytmNumber || savedMethod.includes('paytm')) {
            setPayoutRail('paytm');
            setPaytmNumber(parsed.paytmNumber || rawPhone.replace('+91', '').trim() || '');
          } else {
            setPayoutRail('upi');
            setUpiId(parsed.upiId || parsed.details || '');
          }
        } catch (e) {
          if (rawDetails.includes('@')) {
            setPayoutRail('upi');
            setUpiId(rawDetails);
          }
        }
      } else if (rawDetails.includes('@')) {
        setPayoutRail('upi');
        setUpiId(rawDetails);
      } else if (/^\d{10}$/.test(rawDetails)) {
        setPayoutRail('paytm');
        setPaytmNumber(rawDetails);
      }
    }
  }, [userProfile, isEditing]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    let finalMethod = 'UPI ID';
    let finalDetails = '';

    if (payoutRail === 'upi') {
      finalMethod = 'UPI ID';
      finalDetails = JSON.stringify({ upiId: upiId.trim() });
    } else if (payoutRail === 'bank') {
      finalMethod = 'Bank Transfer (India)';
      finalDetails = JSON.stringify({
        accountHolder: accountHolder.trim() || fullName.trim(),
        bankName: bankName.trim() || 'Bank of India',
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase()
      });
    } else if (payoutRail === 'paytm') {
      finalMethod = 'Paytm Wallet';
      finalDetails = JSON.stringify({ paytmNumber: paytmNumber.replace(/[\s-+]/g, '').trim() });
    }

    const cleanPhone = phone.replace(/[\s-+]/g, '').trim();
    const updated = {
      ...userProfile,
      fullName: fullName.trim(),
      phone: cleanPhone ? `+91 ${cleanPhone}` : userProfile.phone,
      gender,
      country: 'India',
      paymentMethod: finalMethod,
      paymentDetails: finalDetails
    };

    updateUserProfile(updated);

    // Sync to backend DB
    fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(e => console.warn('Could not sync user profile to DB:', e));

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Helper to render current payout in view mode
  const renderCurrentPayoutView = () => {
    const rawDetails = (userProfile?.paymentDetails || '').trim();
    if (!rawDetails || rawDetails === 'N/A') {
      return (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Not configured. Click <em>Edit Profile</em> to set up direct Indian payouts.
        </span>
      );
    }

    try {
      if (rawDetails.startsWith('{') || rawDetails.startsWith('[')) {
        const parsed = Array.isArray(JSON.parse(rawDetails))
          ? (JSON.parse(rawDetails).find((p: any) => p.isPreferred)?.details || JSON.parse(rawDetails)[0]?.details)
          : JSON.parse(rawDetails);

        if (parsed.upiId) {
          return (
            <div className="payout-pill-view">
              <span className="payout-badge-tag upi-tag">⚡ UPI ID</span>
              <strong className="payout-value-text">{parsed.upiId}</strong>
            </div>
          );
        } else if (parsed.accountNumber) {
          return (
            <div className="payout-pill-view">
              <span className="payout-badge-tag bank-tag">🏦 Bank Account</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <strong className="payout-value-text">{parsed.accountHolder} ({parsed.bankName || 'Bank'})</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  A/C: ••••••••{parsed.accountNumber.slice(-4)} | IFSC: {parsed.ifsc}
                </span>
              </div>
            </div>
          );
        } else if (parsed.paytmNumber) {
          return (
            <div className="payout-pill-view">
              <span className="payout-badge-tag paytm-tag">📲 Paytm Wallet</span>
              <strong className="payout-value-text">+91 {parsed.paytmNumber}</strong>
            </div>
          );
        }
      }
    } catch (e) {}

    return (
      <div className="payout-pill-view">
        <span className="payout-badge-tag upi-tag">⚡ {userProfile?.paymentMethod || 'Direct Payout'}</span>
        <strong className="payout-value-text">{rawDetails}</strong>
      </div>
    );
  };

  return (
    <div className="account-page-container">
      <div className="glass-card account-card">
        {/* Profile Header */}
        <div className="account-header">
          <div className="profile-avatar-container">
            {session && session.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Profile Avatar" 
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar-placeholder">👤</div>
            )}
          </div>
          <div className="profile-title-section">
            <h2>{userProfile?.fullName || 'Partner User'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <p className="profile-role-badge">Campaign Partner</p>
              <span style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--accent-emerald)',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '99px',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                🇮🇳 India Verified
              </span>
            </div>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
              ✏️ Edit Profile & Payouts
            </button>
          )}
        </div>

        {saveSuccess && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '10px 16px',
            color: 'var(--accent-emerald)',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginTop: '16px'
          }}>
            ✓ Profile and Indian payout details saved successfully!
          </div>
        )}

        <hr className="divider" />

        {/* Profile Details Section */}
        <form onSubmit={handleSave} className="details-section">
          <h3 className="section-title">📋 Personal Information</h3>
          
          <div className="details-list">
            {/* Full Name */}
            <div className="detail-item">
              <span className="detail-label">Full Name</span>
              {isEditing ? (
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  className="edit-input"
                  required
                />
              ) : (
                <span className="detail-value">{userProfile?.fullName || 'Not Shared'}</span>
              )}
            </div>

            {/* Email Address (Always read-only/verified) */}
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <span className="detail-value text-muted-email">{userProfile?.email || 'Not Shared'}</span>
            </div>

            {/* Phone Number */}
            <div className="detail-item">
              <span className="detail-label">Mobile Number (+91)</span>
              {isEditing ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>🇮🇳 +91</span>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    className="edit-input"
                    placeholder="9876543210"
                    style={{ flex: 1 }}
                  />
                </div>
              ) : (
                <span className="detail-value">{userProfile?.phone || 'Not Shared'}</span>
              )}
            </div>

            {/* Gender */}
            <div className="detail-item">
              <span className="detail-label">Gender</span>
              {isEditing ? (
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                  className="edit-select"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <span className="detail-value">{userProfile?.gender || 'Not Shared'}</span>
              )}
            </div>
          </div>

          <hr className="divider" style={{ margin: '16px 0' }} />

          {/* Direct Indian Payout Section */}
          <div className="payout-section-wrapper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.3rem' }}>💳</span>
              <h3 className="section-title" style={{ border: 'none', margin: 0, padding: 0 }}>
                Direct Indian Payout Details
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', margin: '0 0 16px 0' }}>
              Partner revenue payouts and referral earnings are disbursed directly into this Indian account.
            </p>

            {isEditing ? (
              <div className="payout-edit-box">
                <div className="payout-rail-tabs">
                  <button
                    type="button"
                    onClick={() => setPayoutRail('upi')}
                    className={`rail-tab-btn ${payoutRail === 'upi' ? 'active' : ''}`}
                  >
                    <span>⚡ UPI ID</span>
                    <span className="tab-pill">Instant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutRail('bank')}
                    className={`rail-tab-btn ${payoutRail === 'bank' ? 'active' : ''}`}
                  >
                    <span>🏦 Bank Transfer</span>
                    <span className="tab-pill">IMPS/NEFT</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutRail('paytm')}
                    className={`rail-tab-btn ${payoutRail === 'paytm' ? 'active' : ''}`}
                  >
                    <span>📲 Paytm Wallet</span>
                    <span className="tab-pill">Mobile</span>
                  </button>
                </div>

                {payoutRail === 'upi' && (
                  <div className="rail-input-block">
                    <label>UPI ID / VPA Handle</label>
                    <input 
                      type="text"
                      placeholder="e.g. partner@okhdfcbank or 9876543210@paytm"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="edit-input"
                      required
                    />
                    <span className="hint-msg">✓ Instant zero-fee payouts directly to Google Pay, PhonePe, Paytm, or BHIM.</span>
                  </div>
                )}

                {payoutRail === 'bank' && (
                  <div className="rail-input-block">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label>Account Holder Name</label>
                        <input 
                          type="text"
                          placeholder="As per bank passbook"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          className="edit-input"
                          required
                        />
                      </div>
                      <div>
                        <label>Bank Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. State Bank of India, HDFC"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="edit-input"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                      <div>
                        <label>Account Number</label>
                        <input 
                          type="text"
                          placeholder="e.g. 123456789012"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="edit-input"
                          required
                        />
                      </div>
                      <div>
                        <label>IFSC Code</label>
                        <input 
                          type="text"
                          placeholder="e.g. SBIN0001234"
                          value={ifsc}
                          onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                          className="edit-input"
                          maxLength={11}
                          required
                        />
                      </div>
                    </div>
                    <span className="hint-msg">✓ Direct IMPS / NEFT settlement to any Indian commercial or rural bank.</span>
                  </div>
                )}

                {payoutRail === 'paytm' && (
                  <div className="rail-input-block">
                    <label>Paytm Registered Mobile Number</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-color)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}>🇮🇳 +91</span>
                      <input 
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={paytmNumber}
                        onChange={(e) => setPaytmNumber(e.target.value)}
                        className="edit-input"
                        style={{ flex: 1 }}
                        required
                      />
                    </div>
                    <span className="hint-msg">✓ Instant wallet top-up for KYC-verified Paytm accounts.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="payout-view-container">
                {renderCurrentPayoutView()}
              </div>
            )}
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="form-actions">
              <button type="submit" className="save-btn">
                💾 Save Profile & Payout Details
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>

      <style>{`
        .account-page-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 8px 0;
        }
        .account-card {
          padding: 32px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          box-shadow: var(--shadow-md);
        }
        .account-header {
          display: flex;
          align-items: center;
          gap: 24px;
          position: relative;
          flex-wrap: wrap;
        }
        .profile-avatar-container {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          background: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--accent-indigo);
          box-shadow: 0 0 15px rgba(79, 70, 229, 0.2);
        }
        .profile-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .profile-avatar-placeholder {
          font-size: 2.5rem;
          color: var(--text-secondary);
        }
        .profile-title-section {
          flex: 1;
        }
        .profile-title-section h2 {
          font-family: var(--font-display);
          font-size: 1.8rem;
          margin: 0 0 6px 0;
          color: var(--text-primary);
        }
        .profile-role-badge {
          display: inline-block;
          background: rgba(79, 70, 229, 0.1);
          color: var(--accent-indigo);
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0;
        }
        .edit-profile-btn {
          background: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 18px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .edit-profile-btn:hover {
          border-color: var(--accent-indigo);
          background: rgba(79, 70, 229, 0.05);
          transform: translateY(-1px);
        }
        .divider {
          border: 0;
          height: 1px;
          background: var(--border-color);
          margin: 28px 0;
        }
        .details-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          margin: 0 0 8px 0;
          color: var(--text-primary);
          border-bottom: 1px dashed var(--border-color);
          padding-bottom: 8px;
        }
        .details-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px 32px;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .detail-label {
          font-size: 0.82rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .detail-value {
          font-size: 1rem;
          color: var(--text-primary);
          font-weight: 500;
        }
        .text-muted-email {
          color: var(--text-muted);
        }
        .edit-input, .edit-select {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.92rem;
          font-family: var(--font-primary);
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .edit-input:focus, .edit-select:focus {
          border-color: var(--accent-indigo);
        }

        /* Payout Section */
        .payout-section-wrapper {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
        }
        .payout-edit-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .payout-rail-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 8px;
        }
        .rail-tab-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .rail-tab-btn:hover {
          border-color: var(--accent-indigo);
          color: var(--text-primary);
        }
        .rail-tab-btn.active {
          background: rgba(79, 70, 229, 0.12);
          border-color: var(--accent-indigo);
          color: var(--text-primary);
        }
        .tab-pill {
          font-size: 0.65rem;
          padding: 1px 6px;
          border-radius: 99px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--accent-cyan);
          font-weight: 700;
        }
        .rail-tab-btn.active .tab-pill {
          background: var(--accent-indigo);
          color: #ffffff;
        }
        .rail-input-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rail-input-block label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .hint-msg {
          font-size: 0.76rem;
          color: var(--accent-emerald);
          font-weight: 500;
        }
        .payout-pill-view {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 12px 18px;
          border-radius: 10px;
        }
        .payout-badge-tag {
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .upi-tag {
          background: rgba(16, 185, 129, 0.15);
          color: var(--accent-emerald);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .bank-tag {
          background: rgba(79, 70, 229, 0.15);
          color: var(--accent-indigo);
          border: 1px solid rgba(79, 70, 229, 0.3);
        }
        .paytm-tag {
          background: rgba(14, 165, 233, 0.15);
          color: var(--accent-cyan);
          border: 1px solid rgba(14, 165, 233, 0.3);
        }
        .payout-value-text {
          font-size: 0.95rem;
          color: var(--text-primary);
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }
        .save-btn {
          background: linear-gradient(135deg, var(--accent-indigo), #0ea5e9);
          color: #ffffff;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .save-btn:hover {
          opacity: 0.92;
        }
        .cancel-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        .cancel-btn:hover {
          color: var(--text-primary);
        }

        @media (max-width: 640px) {
          .details-list {
            grid-template-columns: 1fr;
          }
          .payout-rail-tabs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
