"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { countries } from '../../../../data/countries';

interface PayoutRecord {
  id: string;
  amount: number;
  payoutRail: string;
  payoutDetails: string;
  status: 'Pending' | 'Processed' | 'Rejected';
  createdAt: string | null;
  dateFormatted: string;
  processedAt: string | null;
}

interface SubmissionRecord {
  id: string;
  appName: string;
  appId: string;
  reward: number;
  proof: string;
  proofType: string;
  proofUrl: string | null;
  status: string;
  time: string;
  createdAt: string | null;
}

interface UserDetailData {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  country: string;
  role: string;
  isBlocked: boolean;
  lastLogin: string;
  paymentMethod: string;
  upi: string;
  tasksDone: number;
  balance: number;
  totalCashedOut: number;
  pendingPayout: number;
  rejectedPayout: number;
  totalTaskEarnings: number;
  pendingTaskEarnings: number;
  lifetimeEarnings: number;
  payoutHistory: PayoutRecord[];
  submissionsHistory: SubmissionRecord[];
}

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;

  const [selectedUser, setSelectedUser] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  // Balance adjustment modal state
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // Payout action state
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);

  // Lightbox for proof screenshots
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Status message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedUser(data);
      } else {
        setSelectedUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      showToast('Failed to load user details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const finalAmount = adjustType === 'credit' ? amt : -amt;

    try {
      setIsSubmittingAdjust(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          adjustAmount: finalAmount,
          note: adjustNote || `${adjustType === 'credit' ? 'Credit' : 'Debit'} adjustment by Admin`
        })
      });

      if (res.ok) {
        showToast(`Adjusted balance by ${finalAmount > 0 ? '+' : ''}₹${finalAmount.toFixed(2)}.`);
        setShowAdjustModal(false);
        setAdjustAmount('');
        setAdjustNote('');
        fetchUser();
      } else {
        const errData = await res.json();
        alert(`Failed: ${errData.error}`);
      }
    } catch (err) {
      alert('Network error adjusting balance.');
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const handleUpdatePayoutStatus = async (payoutId: string, newStatus: 'Processed' | 'Rejected') => {
    const actionLabel = newStatus === 'Processed' ? 'Approve and Mark Paid' : 'Reject and Refund to Wallet';
    if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) {
      return;
    }

    try {
      setProcessingPayoutId(payoutId);
      const res = await fetch('/api/payouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: payoutId,
          status: newStatus
        })
      });

      if (res.ok) {
        showToast(`Payout request marked as ${newStatus}.`);
        fetchUser();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (err) {
      alert('Failed to update payout status.');
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedUser) return;
    const action = selectedUser.isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Are you sure you want to ${action} user "${selectedUser.name}"?`)) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, action })
      });
      if (res.ok) {
        showToast(`User successfully ${action}ed.`);
        fetchUser();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (err) {
      alert('Failed to update block status.');
    }
  };

  const getCountryFlag = (countryName: string) => {
    const matched = countries.find(c => c.name.toLowerCase() === (countryName || '').toLowerCase());
    return matched ? matched.flag : '🇮🇳';
  };

  const getCleanUpi = (upiString: string) => {
    if (!upiString || upiString === 'N/A') return 'Not configured';
    try {
      if (upiString.trim().startsWith('{')) {
        const parsed = JSON.parse(upiString);
        return parsed.upiId || parsed.upi || parsed.accountNumber || upiString;
      }
    } catch {}
    return upiString;
  };

  const extractProofMedia = (proof: string, proofUrl?: string | null) => {
    if (proofUrl && typeof proofUrl === 'string' && proofUrl.trim().length > 0) {
      return proofUrl.trim();
    }
    const text = (proof || '').trim();
    if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/uploads/') || text.startsWith('data:image/')) {
      return text;
    }
    const match = text.match(/(https?:\/\/[^\s]+)/);
    if (match) return match[1];
    return null;
  };

  if (loading) {
    return (
      <div style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p style={{ fontSize: '0.85rem' }}>Loading user details...</p>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '1.1rem' }}>User Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.85rem' }}>Account does not exist.</p>
        <button 
          onClick={() => window.close()} 
          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Close Tab
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '16px 20px 48px', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          background: toastMessage.type === 'success' ? '#065f46' : '#991b1b',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '0.82rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid ' + (toastMessage.type === 'success' ? '#10b981' : '#ef4444')
        }}>
          {toastMessage.type === 'success' ? '✓ ' : '✕ '} {toastMessage.text}
        </div>
      )}

      {/* 1. Header Bar: Clean identity & controls */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '12px'
      }}>
        {/* Left: Back button + Name/Email */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => window.close()} 
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.78rem'
            }}
          >
            ← Back
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{selectedUser.name}</strong>
              <span style={{
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '3px',
                fontWeight: 600,
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)'
              }}>
                {selectedUser.role}
              </span>
              {selectedUser.isBlocked && (
                <span style={{ fontSize: '0.65rem', background: '#ef4444', color: 'white', padding: '1px 5px', borderRadius: '3px', fontWeight: 700 }}>
                  BLOCKED
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '10px' }}>
              <span>{selectedUser.email}</span>
              <span>•</span>
              <span>{selectedUser.phone}</span>
              <span>•</span>
              <span>{getCountryFlag(selectedUser.country)} {selectedUser.country}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowAdjustModal(true)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              padding: '5px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600
            }}
          >
            Adjust Balance
          </button>

          {selectedUser.role !== 'Admin' && (
            <button
              onClick={handleToggleBlock}
              style={{
                background: 'transparent',
                border: '1px solid ' + (selectedUser.isBlocked ? '#10b981' : 'var(--border-color)'),
                color: selectedUser.isBlocked ? '#10b981' : 'var(--text-secondary)',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {selectedUser.isBlocked ? 'Unblock' : 'Block'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Financial Overview Metric Strip: 4 clean columns */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 18px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '12px',
        alignItems: 'center'
      }}>
        {/* Metric 1: Wallet Balance */}
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Available Wallet
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '2px 0' }}>
            ₹{selectedUser.balance.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Min withdrawal: ₹20.00
          </span>
        </div>

        {/* Metric 2: Total Cashed Out */}
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Total Disbursed
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
            ₹{selectedUser.totalCashedOut.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {selectedUser.payoutHistory.filter(p => p.status === 'Processed').length} payout(s) paid
          </span>
        </div>

        {/* Metric 3: Pending Cashout */}
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Pending Cashout
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: selectedUser.pendingPayout > 0 ? '#f59e0b' : 'var(--text-secondary)', margin: '2px 0' }}>
            ₹{selectedUser.pendingPayout.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.7rem', color: selectedUser.pendingPayout > 0 ? '#fcd34d' : 'var(--text-muted)' }}>
            {selectedUser.payoutHistory.filter(p => p.status === 'Pending').length} claim(s) awaiting release
          </span>
        </div>

        {/* Metric 4: Lifetime Task Earnings */}
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Tasks Earned
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
            ₹{selectedUser.totalTaskEarnings.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Across {selectedUser.tasksDone} task(s)
          </span>
        </div>
      </div>

      {/* 3. Section: User Profile & Saved Details */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 18px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Account & Payment Setup
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            ID: <code style={{ color: 'var(--text-secondary)' }}>{selectedUser.id}</code>
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '8px 16px',
          fontSize: '0.8rem',
          marginBottom: '8px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Name</span>
            <span>{selectedUser.name}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Email</span>
            <span style={{ wordBreak: 'break-all' }}>{selectedUser.email}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Mobile</span>
            <span>{selectedUser.phone}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Payment Rail / Details</span>
            <code style={{ fontSize: '0.76rem', color: 'var(--text-primary)' }}>{getCleanUpi(selectedUser.upi)}</code>
          </div>
        </div>
      </div>

      {/* 4. Section: Withdrawal & Cashout Requests Ledger */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 18px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Withdrawal Requests ({selectedUser.payoutHistory.length})
            </span>
            {selectedUser.pendingPayout > 0 && (
              <span style={{ background: '#f59e0b', color: 'black', borderRadius: '3px', padding: '1px 5px', fontSize: '0.65rem', fontWeight: 700 }}>
                {selectedUser.payoutHistory.filter(p => p.status === 'Pending').length} Pending
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Paid: <strong style={{ color: 'var(--text-primary)' }}>₹{selectedUser.totalCashedOut.toFixed(2)}</strong>
          </span>
        </div>

        {selectedUser.payoutHistory.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No withdrawal requests made yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {selectedUser.payoutHistory.map((payout) => (
              <div 
                key={payout.id}
                style={{
                  background: payout.status === 'Pending' ? 'rgba(245,158,11,0.02)' : 'rgba(255,255,255,0.01)',
                  border: '1px solid ' + (payout.status === 'Pending' ? 'rgba(245,158,11,0.3)' : 'var(--border-color)'),
                  borderRadius: '6px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{payout.amount.toFixed(2)}
                  </span>

                  <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '2px 5px', borderRadius: '3px', border: '1px solid var(--border-color)' }}>
                    {payout.payoutRail}
                  </span>

                  <code style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                    {getCleanUpi(payout.payoutDetails)}
                  </code>

                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '3px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    background: payout.status === 'Pending' ? 'rgba(245,158,11,0.12)' : (payout.status === 'Processed' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'),
                    color: payout.status === 'Pending' ? '#f59e0b' : (payout.status === 'Processed' ? '#10b981' : '#ef4444')
                  }}>
                    {payout.status}
                  </span>

                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {payout.dateFormatted}
                  </span>
                </div>

                {payout.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleUpdatePayoutStatus(payout.id, 'Processed')}
                      disabled={processingPayoutId === payout.id}
                      style={{
                        background: '#10b981',
                        color: 'black',
                        border: 'none',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      {processingPayoutId === payout.id ? '...' : 'Mark Paid'}
                    </button>

                    <button
                      onClick={() => handleUpdatePayoutStatus(payout.id, 'Rejected')}
                      disabled={processingPayoutId === payout.id}
                      style={{
                        background: 'transparent',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Section: Task Submissions History */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 18px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Task Completion History ({selectedUser.submissionsHistory.length})
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Earned: <strong style={{ color: 'var(--text-primary)' }}>₹{selectedUser.totalTaskEarnings.toFixed(2)}</strong>
          </span>
        </div>

        {selectedUser.submissionsHistory.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            No task submissions recorded.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {selectedUser.submissionsHistory.map((sub) => {
              const mediaUrl = extractProofMedia(sub.proof, sub.proofUrl);
              return (
                <div
                  key={sub.id}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '220px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      +₹{sub.reward.toFixed(2)}
                    </span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '0.82rem' }}>{sub.appName}</strong>
                    <span style={{
                      padding: '1px 5px',
                      borderRadius: '3px',
                      fontSize: '0.68rem',
                      background: sub.status === 'Paid' ? 'rgba(16,185,129,0.12)' : (sub.status === 'Pending' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)'),
                      color: sub.status === 'Paid' ? '#10b981' : (sub.status === 'Pending' ? '#f59e0b' : '#ef4444')
                    }}>
                      {sub.status}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub.time}</span>
                  </div>

                  <div style={{ flex: 1, minWidth: '180px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span style={{ wordBreak: 'break-all' }}>{sub.proof}</span>
                  </div>

                  {mediaUrl && (
                    <button
                      onClick={() => setLightboxImage(mediaUrl)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      View Proof
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Adjust Balance */}
      {showAdjustModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '20px',
            width: '100%',
            maxWidth: '360px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              Adjust Balance
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
              Current: <strong style={{ color: '#10b981' }}>₹{selectedUser.balance.toFixed(2)}</strong>
            </p>

            <form onSubmit={handleAdjustBalance}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: adjustType === 'credit' ? '#10b981' : 'transparent',
                    color: adjustType === 'credit' ? 'black' : 'var(--text-secondary)',
                    border: '1px solid ' + (adjustType === 'credit' ? '#10b981' : 'var(--border-color)')
                  }}
                >
                  + Credit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: adjustType === 'debit' ? '#ef4444' : 'transparent',
                    color: adjustType === 'debit' ? 'white' : 'var(--text-secondary)',
                    border: '1px solid ' + (adjustType === 'debit' ? '#ef4444' : 'var(--border-color)')
                  }}
                >
                  - Debit
                </button>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Reason for adjustment"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '0.78rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  style={{ padding: '6px 12px', borderRadius: '4px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust}
                  style={{ padding: '6px 14px', borderRadius: '4px', background: adjustType === 'credit' ? '#10b981' : '#ef4444', color: adjustType === 'credit' ? 'black' : 'white', border: 'none', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {isSubmittingAdjust ? 'Saving...' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Zoom */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20000,
            padding: '20px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '85vw', maxHeight: '85vh' }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              style={{
                position: 'absolute',
                top: '-32px',
                right: 0,
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '3px 10px',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
            >
              ✕ Close
            </button>
            <img 
              src={lightboxImage} 
              alt="Screenshot" 
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                borderRadius: '4px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
