"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSession } from 'next-auth/react';

type PayoutRail = 'upi' | 'bank' | 'paytm';

export default function UserProfileModal() {
  const { userRole, userProfile, updateUserProfile } = useApp();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Email Login, 2: Profile Details
  
  // Form fields
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');

  // Direct Indian Payout Fields
  const [payoutRail, setPayoutRail] = useState<PayoutRail>('upi');
  const [upiId, setUpiId] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [paytmNumber, setPaytmNumber] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Listen to a custom event to open the modal from other components (like Header)
  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      if (userProfile) {
        // Edit mode
        setEmail(userProfile.email || '');
        setFullName(userProfile.fullName || '');
        setGender(userProfile.gender || 'Male');
        
        // Parse phone
        const savedPhone = userProfile.phone || '';
        const cleanPhone = savedPhone.replace('+91', '').trim();
        setPhone(cleanPhone);

        // Parse Indian Payout Details
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
              setPaytmNumber(parsed.paytmNumber || cleanPhone || '');
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

        setStep(2);
      } else {
        setStep(1);
      }
    };

    window.addEventListener('open-profile-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-profile-modal', handleOpenModal);
    };
  }, [userProfile]);

  if (!isOpen) return null;

  const validateEmail = (val: string) => {
    return /\S+@\S+\.\S+/.test(val);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setStep(2);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    
    const cleanPhone = phone.replace(/[\s-+]/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Phone Number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }

    // Validate direct Indian payout fields
    let finalMethod = 'UPI ID';
    let finalDetails = '';

    if (payoutRail === 'upi') {
      finalMethod = 'UPI ID';
      const cleanUpi = upiId.trim();
      if (!cleanUpi) {
        newErrors.upiId = 'UPI ID is required for receiving payouts';
      } else if (!cleanUpi.includes('@') || cleanUpi.length < 4) {
        newErrors.upiId = 'Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@paytm)';
      }
      finalDetails = JSON.stringify({ upiId: cleanUpi });
    } else if (payoutRail === 'bank') {
      finalMethod = 'Bank Transfer (India)';
      if (!accountHolder.trim()) newErrors.accountHolder = 'Account holder name is required';
      if (!accountNumber.trim()) {
        newErrors.accountNumber = 'Bank account number is required';
      } else if (accountNumber.trim().length < 8) {
        newErrors.accountNumber = 'Account number must be at least 8 digits';
      }
      if (!ifsc.trim()) {
        newErrors.ifsc = 'IFSC code is required';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc.trim())) {
        newErrors.ifsc = 'Please enter a valid 11-digit IFSC code (e.g. SBIN0001234)';
      }
      finalDetails = JSON.stringify({
        accountHolder: accountHolder.trim(),
        bankName: bankName.trim() || 'Bank of India',
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase()
      });
    } else if (payoutRail === 'paytm') {
      finalMethod = 'Paytm Wallet';
      const cleanPaytm = paytmNumber.replace(/[\s-+]/g, '');
      if (!cleanPaytm) {
        newErrors.paytmNumber = 'Paytm mobile number is required';
      } else if (!/^[6-9]\d{9}$/.test(cleanPaytm)) {
        newErrors.paytmNumber = 'Please enter a valid 10-digit Indian mobile number';
      }
      finalDetails = JSON.stringify({ paytmNumber: cleanPaytm });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedProfile = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: `+91 ${cleanPhone}`,
      gender,
      country: 'India',
      paymentMethod: finalMethod,
      paymentDetails: finalDetails
    };

    // Update client context
    updateUserProfile(updatedProfile);

    // Sync to PostgreSQL database in the background
    fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile)
    }).catch(err => console.warn('Could not sync profile to DB:', err));

    // Close and reset
    setIsOpen(false);
    setStep(1);
    setErrors({});
  };

  const handleClose = () => {
    const isPartnerRoute = window.location.pathname.startsWith('/partner');
    if (isPartnerRoute && !userProfile) {
      window.location.href = '/';
      return;
    }
    setIsOpen(false);
  };

  return (
    <div className="profile-modal-overlay">
      <div className="glass-card profile-modal-card">
        <button className="close-modal-btn" onClick={handleClose}>×</button>
        
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="modal-form-flow">
            <div className="modal-header-sec">
              <span className="modal-icon-badge">🔐</span>
              <h2>Sign In</h2>
              <p>Enter your email to verify your identity and manage your payouts.</p>
            </div>

            <div className="form-group-field">
              <label htmlFor="modal-email">Email Address</label>
              <input 
                id="modal-email"
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'input-error' : ''}
                autoFocus
              />
              {errors.email && <span className="error-text-msg">{errors.email}</span>}
            </div>

            <button type="submit" className="glow-btn-purple submit-modal-btn">
              Continue
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitProfile} className="modal-form-flow">
            <div className="modal-header-sec">
              <span className="modal-icon-badge">👤</span>
              <h2>{userProfile ? 'Profile & Payout Settings' : 'Complete Setup'}</h2>
              <p>Direct Indian payout configuration. Earn & withdraw in INR (₹).</p>
            </div>

            <div className="form-group-field">
              <label>Email Address (Verified)</label>
              <input 
                type="email" 
                value={email} 
                disabled
                className="input-disabled"
              />
            </div>

            <div className="form-group-field">
              <label htmlFor="modal-fullName">Full Name</label>
              <input 
                id="modal-fullName"
                type="text" 
                placeholder="e.g. Ashish Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={errors.fullName ? 'input-error' : ''}
              />
              {errors.fullName && <span className="error-text-msg">{errors.fullName}</span>}
            </div>

            <div className="form-group-field">
              <label>Country & Jurisdiction</label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                padding: '10px 14px',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.92rem'
              }}>
                <span>🇮🇳</span>
                <span>India (+91)</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Active Territory
                </span>
              </div>
            </div>

            <div className="form-group-field">
              <label htmlFor="modal-phone">Mobile Number (+91)</label>
              <div className="phone-input-container">
                <div className="phone-prefix-badge">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input 
                  id="modal-phone"
                  type="tel" 
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={errors.phone ? 'input-error' : ''}
                  style={{ flex: 1 }}
                />
              </div>
              {errors.phone && <span className="error-text-msg">{errors.phone}</span>}
            </div>

            <div className="form-group-field">
              <label>Gender</label>
              <div className="gender-selector-group">
                {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    className={`gender-option-btn ${gender === g ? 'active' : ''}`}
                    onClick={() => setGender(g)}
                  >
                    {g === 'Male' ? '🙋‍♂️ Male' : g === 'Female' ? '🙋‍♀️ Female' : g === 'Other' ? '👤 Other' : '🔒 Private'}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Indian Payout Section */}
            <div className="payout-settings-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.2rem' }}>💳</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>Direct Indian Payout Details</strong>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                Directly receive earnings into your Indian bank account or UPI app with zero transfer fees.
              </p>

              {/* Payout Rail Tabs */}
              <div className="payout-rail-tabs">
                <button
                  type="button"
                  onClick={() => setPayoutRail('upi')}
                  className={`rail-tab-btn ${payoutRail === 'upi' ? 'active' : ''}`}
                >
                  <span>⚡ UPI</span>
                  <span className="tab-pill">Instant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutRail('bank')}
                  className={`rail-tab-btn ${payoutRail === 'bank' ? 'active' : ''}`}
                >
                  <span>🏦 Bank Account</span>
                  <span className="tab-pill">IMPS/NEFT</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutRail('paytm')}
                  className={`rail-tab-btn ${payoutRail === 'paytm' ? 'active' : ''}`}
                >
                  <span>📲 Paytm</span>
                  <span className="tab-pill">Wallet</span>
                </button>
              </div>

              {/* Rail 1: UPI ID */}
              {payoutRail === 'upi' && (
                <div className="rail-fields-box">
                  <label htmlFor="modal-upiId">UPI ID / VPA</label>
                  <input
                    id="modal-upiId"
                    type="text"
                    placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className={errors.upiId ? 'input-error' : ''}
                  />
                  {errors.upiId && <span className="error-text-msg">{errors.upiId}</span>}
                  <span className="rail-help-text">
                    ✓ Supports Google Pay, PhonePe, Paytm, BHIM, and any UPI handle.
                  </span>
                </div>
              )}

              {/* Rail 2: Bank Account Details */}
              {payoutRail === 'bank' && (
                <div className="rail-fields-box">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label htmlFor="modal-accHolder">Account Holder Name</label>
                      <input
                        id="modal-accHolder"
                        type="text"
                        placeholder="As per bank passbook"
                        value={accountHolder}
                        onChange={(e) => setAccountHolder(e.target.value)}
                        className={errors.accountHolder ? 'input-error' : ''}
                      />
                      {errors.accountHolder && <span className="error-text-msg">{errors.accountHolder}</span>}
                    </div>
                    <div>
                      <label htmlFor="modal-bankName">Bank Name</label>
                      <input
                        id="modal-bankName"
                        type="text"
                        placeholder="e.g. SBI, HDFC, ICICI"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                    <div>
                      <label htmlFor="modal-accNum">Account Number</label>
                      <input
                        id="modal-accNum"
                        type="password"
                        placeholder="e.g. 1234567890"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className={errors.accountNumber ? 'input-error' : ''}
                      />
                      {errors.accountNumber && <span className="error-text-msg">{errors.accountNumber}</span>}
                    </div>
                    <div>
                      <label htmlFor="modal-ifsc">IFSC Code</label>
                      <input
                        id="modal-ifsc"
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        value={ifsc}
                        onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        className={errors.ifsc ? 'input-error' : ''}
                        maxLength={11}
                      />
                      {errors.ifsc && <span className="error-text-msg">{errors.ifsc}</span>}
                    </div>
                  </div>
                  <span className="rail-help-text">
                    ✓ Direct NEFT / IMPS transfer to all commercial & rural Indian banks.
                  </span>
                </div>
              )}

              {/* Rail 3: Paytm Wallet */}
              {payoutRail === 'paytm' && (
                <div className="rail-fields-box">
                  <label htmlFor="modal-paytm">Paytm Mobile Number</label>
                  <div className="phone-input-container">
                    <div className="phone-prefix-badge">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      id="modal-paytm"
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={paytmNumber}
                      onChange={(e) => setPaytmNumber(e.target.value)}
                      className={errors.paytmNumber ? 'input-error' : ''}
                      style={{ flex: 1 }}
                    />
                  </div>
                  {errors.paytmNumber && <span className="error-text-msg">{errors.paytmNumber}</span>}
                  <span className="rail-help-text">
                    ✓ Instant wallet transfer to your KYC-verified Paytm account.
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="offerwall-btn" 
                style={{ flex: 1 }}
                disabled={!!userProfile}
              >
                Back
              </button>
              <button type="submit" className="glow-btn-purple submit-modal-btn" style={{ flex: 2, marginTop: 0 }}>
                {userProfile ? 'Save Profile & Payout Details' : 'Complete Setup'}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }
        .profile-modal-card {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          border-radius: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-premium), 0 20px 40px rgba(0,0,0,0.4);
          position: relative;
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .profile-modal-card::-webkit-scrollbar {
          width: 6px;
        }
        .profile-modal-card::-webkit-scrollbar-track {
          background: transparent;
        }
        .profile-modal-card::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 4px;
        }
        .close-modal-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
          transition: color 0.2s;
          padding: 4px 8px;
          line-height: 1;
        }
        .close-modal-btn:hover {
          color: var(--text-primary);
        }
        .modal-form-flow {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .modal-header-sec {
          text-align: center;
          margin-bottom: 6px;
        }
        .modal-icon-badge {
          font-size: 2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: rgba(79, 70, 229, 0.1);
          margin-bottom: 12px;
          border: 1px solid rgba(79, 70, 229, 0.15);
        }
        .modal-header-sec h2 {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .modal-header-sec p {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
        }
        .form-group-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .form-group-field label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group-field input {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 10px 14px;
          border-radius: 8px;
          font-family: var(--font-primary);
          font-size: 0.92rem;
          transition: all 0.2s;
        }
        .form-group-field input:focus {
          outline: none;
          border-color: var(--accent-indigo);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
          background: rgba(255, 255, 255, 0.05);
        }
        .phone-input-container {
          display: flex;
          gap: 8px;
          width: 100%;
        }
        .phone-prefix-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 10px 14px;
          border-radius: 8px;
          color: var(--text-primary);
          fontSize: 0.92rem;
          font-weight: 600;
          user-select: none;
        }
        .form-group-field input.input-disabled {
          background: rgba(255, 255, 255, 0.01) !important;
          color: var(--text-muted) !important;
          border-style: dashed;
          cursor: not-allowed;
        }
        .input-error {
          border-color: rgba(239, 68, 68, 0.5) !important;
        }
        .error-text-msg {
          font-size: 0.76rem;
          color: #ef4444;
          margin-top: 2px;
          font-weight: 500;
        }
        .gender-selector-group {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 6px;
          margin-top: 2px;
        }
        .gender-option-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 4px;
          border-radius: 8px;
          font-family: var(--font-primary);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gender-option-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }
        .gender-option-btn.active {
          border-color: var(--accent-indigo);
          color: var(--accent-indigo);
          background: rgba(79, 70, 229, 0.08);
          font-weight: 600;
        }

        /* Payout Settings Card */
        .payout-settings-card {
          background: rgba(79, 70, 229, 0.04);
          border: 1px solid rgba(79, 70, 229, 0.2);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .payout-rail-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          margin-bottom: 8px;
        }
        .rail-tab-btn {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 6px;
          border-radius: 8px;
          font-size: 0.8rem;
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
          background: rgba(79, 70, 229, 0.15);
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
        .rail-fields-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }
        .rail-fields-box label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .rail-fields-box input {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          width: 100%;
          box-sizing: border-box;
          transition: all 0.2s;
        }
        .rail-fields-box input:focus {
          outline: none;
          border-color: var(--accent-indigo);
          box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
        }
        .rail-help-text {
          font-size: 0.74rem;
          color: var(--accent-emerald);
          font-weight: 500;
          margin-top: 2px;
        }
        .submit-modal-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
