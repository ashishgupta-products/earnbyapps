"use client";

import React, { useState, useEffect } from 'react';
import { useApp, UserProfile } from '../context/AppContext';

type PayoutRail = 'upi' | 'bank' | 'paytm';

interface PayoutRequestItem {
  id: string;
  amount: number;
  payoutRail: string;
  payoutDetails: string;
  status: 'Pending' | 'Processed' | 'Rejected';
  date: string;
  processedAt?: string | null;
}

export default function UserProfileModal() {
  const { userProfile, updateUserProfile } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1 = Email verify, 2 = Main View
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet'>('profile');

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

  // Wallet & Withdrawal state
  const [liveBalance, setLiveBalance] = useState<number>(0);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('20');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [withdrawErrorMsg, setWithdrawErrorMsg] = useState<string | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<PayoutRequestItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const MIN_WITHDRAWAL = 20.00;

  // Fetch live balance and payout history from DB
  const refreshWalletData = async (userEmail: string) => {
    if (!userEmail) return;
    try {
      setHistoryLoading(true);
      // Fetch user profile / balance
      const userRes = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`);
      if (userRes.ok) {
        const u = await userRes.json();
        const bal = typeof u.balance === 'number' ? u.balance : parseFloat(u.balance || '0');
        setLiveBalance(bal);
        if (bal >= MIN_WITHDRAWAL) {
          setWithdrawAmount(bal.toFixed(0));
        } else {
          setWithdrawAmount('20');
        }
      }

      // Fetch user's payout requests
      const payoutRes = await fetch(`/api/payouts?email=${encodeURIComponent(userEmail)}`);
      if (payoutRes.ok) {
        const pData = await payoutRes.json();
        setPayoutHistory(pData.requests || []);
      }
    } catch (e) {
      console.warn("Failed to refresh wallet data:", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const populateFromProfile = () => {
    if (userProfile) {
      const uEmail = userProfile.email || '';
      setEmail(uEmail);
      setFullName(userProfile.fullName || '');
      setGender(userProfile.gender || 'Male');
      
      const savedPhone = userProfile.phone || '';
      const cleanPhone = savedPhone.replace('+91', '').trim();
      setPhone(cleanPhone);

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
      refreshWalletData(uEmail);
    } else {
      setStep(1);
    }
  };

  // Listen to custom events
  useEffect(() => {
    const handleOpenProfileModal = () => {
      setActiveTab('profile');
      setIsOpen(true);
      populateFromProfile();
    };

    const handleOpenWalletModal = () => {
      setActiveTab('wallet');
      setIsOpen(true);
      populateFromProfile();
    };

    window.addEventListener('open-profile-modal', handleOpenProfileModal);
    window.addEventListener('open-wallet-modal', handleOpenWalletModal);

    return () => {
      window.removeEventListener('open-profile-modal', handleOpenProfileModal);
      window.removeEventListener('open-wallet-modal', handleOpenWalletModal);
    };
  }, [userProfile]);

  if (!isOpen) return null;

  const validateEmail = (val: string) => /\S+@\S+\.\S+/.test(val);

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
    refreshWalletData(email);
  };

  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Mobile Number is required';
    } else if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit Indian mobile number';
    }

    let finalDetails = '';
    let finalMethod = 'UPI ID';

    if (payoutRail === 'upi') {
      finalMethod = 'UPI ID';
      const cleanUpi = upiId.trim();
      if (!cleanUpi) {
        newErrors.upiId = 'UPI ID is required for receiving payouts';
      } else if (!cleanUpi.includes('@')) {
        newErrors.upiId = 'Invalid UPI ID format (e.g. yourname@okaxis)';
      }
      finalDetails = JSON.stringify({ upiId: cleanUpi });
    } else if (payoutRail === 'bank') {
      finalMethod = 'Bank Account';
      if (!accountHolder.trim()) newErrors.accountHolder = 'Account holder name is required';
      if (!bankName.trim()) newErrors.bankName = 'Bank name is required';
      if (!accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
      if (!ifsc.trim()) {
        newErrors.ifsc = 'IFSC code is required';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())) {
        newErrors.ifsc = 'Invalid IFSC code (e.g. SBIN0001234)';
      }
      finalDetails = JSON.stringify({
        accountHolder: accountHolder.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase()
      });
    } else if (payoutRail === 'paytm') {
      finalMethod = 'Paytm Wallet';
      const cleanPaytm = paytmNumber.trim();
      if (!cleanPaytm) {
        newErrors.paytmNumber = 'Paytm mobile number is required';
      } else if (!/^[6-9]\d{9}$/.test(cleanPaytm)) {
        newErrors.paytmNumber = 'Enter a valid 10-digit mobile number for Paytm';
      }
      finalDetails = JSON.stringify({ paytmNumber: cleanPaytm });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedProfile: UserProfile = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: `+91 ${phone.trim()}`,
      gender,
      country: 'India',
      paymentMethod: finalMethod,
      paymentDetails: finalDetails
    };

    updateUserProfile(updatedProfile);

    fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile)
    }).catch(err => console.warn('Could not sync profile to DB:', err));

    setWithdrawSuccessMsg("✓ Profile and Payout details saved successfully!");
    setTimeout(() => setWithdrawSuccessMsg(null), 3000);
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawErrorMsg(null);
    setWithdrawSuccessMsg(null);

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setWithdrawErrorMsg("Please enter a valid withdrawal amount.");
      return;
    }

    if (amt < MIN_WITHDRAWAL) {
      setWithdrawErrorMsg(`Minimum withdrawal is ₹${MIN_WITHDRAWAL.toFixed(2)}. You requested ₹${amt.toFixed(2)}.`);
      return;
    }

    if (amt > liveBalance) {
      setWithdrawErrorMsg(`Insufficient balance. Available: ₹${liveBalance.toFixed(2)}.`);
      return;
    }

    // Determine current configured details
    let activeRail = payoutRail;
    let activeDetails = '';
    if (payoutRail === 'upi' && upiId.trim()) {
      activeDetails = upiId.trim();
    } else if (payoutRail === 'bank' && accountNumber.trim()) {
      activeDetails = `${bankName} A/C ${accountNumber} (IFSC: ${ifsc})`;
    } else if (payoutRail === 'paytm' && paytmNumber.trim()) {
      activeDetails = `Paytm: ${paytmNumber.trim()}`;
    } else if (userProfile?.paymentDetails) {
      activeDetails = userProfile.paymentDetails;
      activeRail = (userProfile.paymentMethod?.toLowerCase().includes('bank') ? 'bank' : userProfile.paymentMethod?.toLowerCase().includes('paytm') ? 'paytm' : 'upi') as PayoutRail;
    }

    if (!activeDetails) {
      setWithdrawErrorMsg("Please configure your UPI ID or Bank details in the 'Payout & Details' tab first.");
      return;
    }

    try {
      setWithdrawLoading(true);
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || userProfile?.email,
          amount: amt,
          payoutRail: activeRail,
          payoutDetails: activeDetails
        })
      });

      const data = await res.json();
      if (res.ok) {
        setWithdrawSuccessMsg(`✓ Withdrawal request for ₹${amt.toFixed(2)} placed! Amount deducted from wallet and queued for admin release.`);
        setLiveBalance(data.newBalance);
        await refreshWalletData(email || userProfile?.email || '');
      } else {
        setWithdrawErrorMsg(data.error || 'Failed to request withdrawal.');
      }
    } catch (err: any) {
      setWithdrawErrorMsg(err.message || 'Network error submitting withdrawal request.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleClose = () => {
    const isPartnerRoute = window.location.pathname.startsWith('/partner');
    if (isPartnerRoute && !userProfile) {
      window.location.href = '/';
      return;
    }
    setIsOpen(false);
    setWithdrawSuccessMsg(null);
    setWithdrawErrorMsg(null);
  };

  const progressToMin = Math.min(100, (liveBalance / MIN_WITHDRAWAL) * 100);
  const neededToMin = Math.max(0, MIN_WITHDRAWAL - liveBalance);

  return (
    <div className="profile-modal-overlay">
      <div className="glass-card profile-modal-card">
        <button className="close-modal-btn" onClick={handleClose}>×</button>
        
        {step === 1 ? (
          <form onSubmit={handleNextStep} className="modal-form-flow">
            <div className="modal-header-sec">
              <span className="modal-icon-badge">🔐</span>
              <h2>Verify Your Email</h2>
              <p>Enter your account email to access your wallet, balance, and payout settings.</p>
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
              />
              {errors.email && <span className="error-text-msg">{errors.email}</span>}
            </div>

            <button type="submit" className="glow-btn-purple submit-modal-btn">
              Continue to Wallet & Settings
            </button>
          </form>
        ) : (
          <div>
            {/* Top Tab Switcher */}
            <div style={{
              display: 'flex',
              gap: '6px',
              marginBottom: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '4px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeTab === 'wallet' ? 'var(--accent-indigo)' : 'transparent',
                  color: activeTab === 'wallet' ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>👛 Wallet (₹{liveBalance.toFixed(2)})</span>
                {liveBalance >= MIN_WITHDRAWAL ? (
                  <span style={{ fontSize: '0.68rem', background: '#10b981', color: 'black', padding: '1px 6px', borderRadius: '8px', fontWeight: 800 }}>Ready</span>
                ) : (
                  <span style={{ fontSize: '0.68rem', background: 'rgba(245,158,11,0.2)', color: '#f59e0b', padding: '1px 6px', borderRadius: '8px', fontWeight: 700 }}>Min ₹20</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: activeTab === 'profile' ? 'var(--accent-indigo)' : 'transparent',
                  color: activeTab === 'profile' ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                💳 Payout & Details
              </button>
            </div>

            {/* TAB 1: WALLET & WITHDRAWALS */}
            {activeTab === 'wallet' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Live Balance Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(16, 185, 129, 0.15))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Available Wallet Balance
                  </span>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--accent-emerald)', margin: '6px 0 2px' }}>
                    ₹{liveBalance.toFixed(2)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Task rewards add here first • Min required: ₹20.00
                  </span>
                </div>

                {/* Progress / Threshold Condition Box */}
                {liveBalance < MIN_WITHDRAWAL ? (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                        🪙 Minimum ₹20.00 Required to Withdraw
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                        ₹{liveBalance.toFixed(2)} / ₹20.00
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${progressToMin}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      Task completions add funds to your wallet first. Earn <strong>₹{neededToMin.toFixed(2)} more</strong> by testing apps to unlock instant withdrawal release to UPI or Bank!
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.4rem' }}>✅</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                        Withdrawal Threshold Reached!
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        You have met the ₹20.00 requirement and can withdraw your funds now.
                      </div>
                    </div>
                  </div>
                )}

                {withdrawSuccessMsg && (
                  <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {withdrawSuccessMsg}
                  </div>
                )}

                {withdrawErrorMsg && (
                  <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {withdrawErrorMsg}
                  </div>
                )}

                {/* Withdrawal Form */}
                <form onSubmit={handleRequestWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group-field">
                    <label>Amount to Withdraw (₹)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>₹</span>
                      <input 
                        type="number"
                        min="20"
                        max={liveBalance}
                        step="1"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        disabled={liveBalance < MIN_WITHDRAWAL || withdrawLoading}
                        placeholder="20"
                        style={{ flex: 1 }}
                      />
                    </div>
                  </div>

                  {/* Quick Select Chips */}
                  {liveBalance >= MIN_WITHDRAWAL && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {[20, 50, 100].filter(a => a <= liveBalance).map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setWithdrawAmount(String(chip))}
                          style={{
                            padding: '4px 10px',
                            background: withdrawAmount === String(chip) ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            fontWeight: 600
                          }}
                        >
                          ₹{chip}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setWithdrawAmount(liveBalance.toFixed(0))}
                        style={{
                          padding: '4px 10px',
                          background: withdrawAmount === liveBalance.toFixed(0) ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        All (₹{liveBalance.toFixed(0)})
                      </button>
                    </div>
                  )}

                  {/* Destination Info Box */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Payout Rail Destination:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {payoutRail === 'upi' ? `UPI: ${upiId || 'Not configured'}` : payoutRail === 'bank' ? `Bank: ${accountNumber ? `A/C ${accountNumber}` : 'Not configured'}` : `Paytm: ${paytmNumber || 'Not configured'}`}
                      </strong>
                    </div>
                    {(!upiId && !accountNumber && !paytmNumber) && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.75rem',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }}
                      >
                        Set up details →
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={liveBalance < MIN_WITHDRAWAL || withdrawLoading}
                    className="glow-btn-purple submit-modal-btn"
                    style={{
                      marginTop: '4px',
                      opacity: liveBalance < MIN_WITHDRAWAL ? 0.5 : 1,
                      cursor: liveBalance < MIN_WITHDRAWAL ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {withdrawLoading ? 'Processing Request...' : liveBalance < MIN_WITHDRAWAL ? `Need ₹${neededToMin.toFixed(2)} more to withdraw` : `Request ₹${withdrawAmount} Withdrawal`}
                  </button>
                </form>

                {/* Withdrawal History */}
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>Withdrawal History</strong>
                    <button
                      type="button"
                      onClick={() => refreshWalletData(email || userProfile?.email || '')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      ↻ Refresh
                    </button>
                  </div>

                  {historyLoading ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>Loading history...</div>
                  ) : payoutHistory.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                      No withdrawal requests yet. Your payout requests will appear here.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                      {payoutHistory.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.8rem'
                          }}
                        >
                          <div>
                            <strong style={{ color: 'var(--accent-emerald)' }}>₹{item.amount.toFixed(2)}</strong>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '8px', fontSize: '0.74rem' }}>{item.date}</span>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>via {item.payoutRail.toUpperCase()}</span>
                          </div>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background: item.status === 'Pending' ? 'rgba(245,158,11,0.12)' : item.status === 'Processed' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            color: item.status === 'Pending' ? '#f59e0b' : item.status === 'Processed' ? 'var(--accent-emerald)' : '#ef4444'
                          }}>
                            {item.status === 'Pending' ? '⏳ Pending' : item.status === 'Processed' ? '✅ Released' : '❌ Refunded'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* TAB 2: PROFILE & INDIAN PAYOUT SETTINGS */
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
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                    Where should we release your wallet balance once you reach ₹20? Choose your preferred Indian payout rail.
                  </p>

                  {/* Payout Rail Tabs */}
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
                      <span>🏦 Bank Account</span>
                      <span className="tab-pill">NEFT/IMPS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutRail('paytm')}
                      className={`rail-tab-btn ${payoutRail === 'paytm' ? 'active' : ''}`}
                    >
                      <span>📲 Paytm Wallet</span>
                      <span className="tab-pill">Wallet</span>
                    </button>
                  </div>

                  {/* Rail 1: UPI */}
                  {payoutRail === 'upi' && (
                    <div className="form-group-field" style={{ marginTop: '8px' }}>
                      <label htmlFor="modal-upiId">UPI Virtual Payment Address (VPA) *</label>
                      <input 
                        id="modal-upiId"
                        type="text" 
                        placeholder="yourname@okaxis / 9876543210@paytm"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className={errors.upiId ? 'input-error' : ''}
                      />
                      {errors.upiId && <span className="error-text-msg">{errors.upiId}</span>}
                      <span className="hint-msg">
                        ✓ Works with Google Pay, PhonePe, Paytm, BHIM & all Indian banking apps.
                      </span>
                    </div>
                  )}

                  {/* Rail 2: Bank Account */}
                  {payoutRail === 'bank' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                      <div className="form-group-field">
                        <label htmlFor="modal-accountHolder">Account Holder Name *</label>
                        <input 
                          id="modal-accountHolder"
                          type="text" 
                          placeholder="Name as printed on bank passbook"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                          className={errors.accountHolder ? 'input-error' : ''}
                        />
                        {errors.accountHolder && <span className="error-text-msg">{errors.accountHolder}</span>}
                      </div>

                      <div className="form-group-field">
                        <label htmlFor="modal-bankName">Bank Name *</label>
                        <input 
                          id="modal-bankName"
                          type="text" 
                          placeholder="e.g. State Bank of India, HDFC Bank"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className={errors.bankName ? 'input-error' : ''}
                        />
                        {errors.bankName && <span className="error-text-msg">{errors.bankName}</span>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                        <div className="form-group-field">
                          <label htmlFor="modal-accountNumber">Account Number *</label>
                          <input 
                            id="modal-accountNumber"
                            type="text" 
                            placeholder="Bank account number"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className={errors.accountNumber ? 'input-error' : ''}
                          />
                          {errors.accountNumber && <span className="error-text-msg">{errors.accountNumber}</span>}
                        </div>

                        <div className="form-group-field">
                          <label htmlFor="modal-ifsc">IFSC Code *</label>
                          <input 
                            id="modal-ifsc"
                            type="text" 
                            placeholder="SBIN0001234"
                            value={ifsc}
                            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                            className={errors.ifsc ? 'input-error' : ''}
                            maxLength={11}
                          />
                          {errors.ifsc && <span className="error-text-msg">{errors.ifsc}</span>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rail 3: Paytm Wallet */}
                  {payoutRail === 'paytm' && (
                    <div className="form-group-field" style={{ marginTop: '8px' }}>
                      <label htmlFor="modal-paytmNumber">Paytm Registered Mobile Number *</label>
                      <div className="phone-input-container">
                        <div className="phone-prefix-badge">
                          <span>🇮🇳</span>
                          <span>+91</span>
                        </div>
                        <input 
                          id="modal-paytmNumber"
                          type="tel" 
                          placeholder="10-digit Paytm mobile number"
                          value={paytmNumber}
                          onChange={(e) => setPaytmNumber(e.target.value)}
                          className={errors.paytmNumber ? 'input-error' : ''}
                          style={{ flex: 1 }}
                        />
                      </div>
                      {errors.paytmNumber && <span className="error-text-msg">{errors.paytmNumber}</span>}
                      <span className="hint-msg">
                        ✓ Instant wallet transfer to your KYC-verified Paytm account.
                      </span>
                    </div>
                  )}
                </div>

                {withdrawSuccessMsg && (
                  <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                    {withdrawSuccessMsg}
                  </div>
                )}

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
        )}
      </div>

      <style>{`
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
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
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 32px;
          border-radius: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-premium), 0 20px 40px rgba(0,0,0,0.5);
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
          gap: 16px;
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
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 4px;
        }
        .modal-header-sec p {
          font-size: 0.82rem;
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
          font-size: 0.78rem;
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
          font-size: 0.92rem;
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
          font-family: var(--font-primary);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
        }
        .rail-tab-btn:hover {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }
        .rail-tab-btn.active {
          border-color: var(--accent-indigo);
          color: #ffffff;
          background: var(--accent-indigo);
        }
        .tab-pill {
          font-size: 0.65rem;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: inherit;
        }
        .rail-tab-btn.active .tab-pill {
          background: rgba(255, 255, 255, 0.25);
        }
        .hint-msg {
          font-size: 0.74rem;
          color: var(--accent-emerald);
          display: block;
          margin-top: 3px;
        }
        .submit-modal-btn {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.92rem;
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
