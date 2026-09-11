"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

interface PayoutRequest {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  amount: number;
  payoutRail: string;
  upi: string;
  status: 'Pending' | 'Processed' | 'Rejected';
  transactionRef?: string | null;
  adminNotes?: string | null;
  date: string;
  processedAt?: string | null;
}

interface EarnerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  balance: number;
  pendingPayout?: number;
  totalCashedOut?: number;
  tasksDone: number;
  role: string;
  upi: string;
}

export default function WalletPage() {
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'payouts' | 'wallets'>('payouts');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Processed' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Financial aggregates
  const [pendingSum, setPendingSum] = useState(0);
  const [disbursedSum, setDisbursedSum] = useState(0);
  const [rejectedSum, setRejectedSum] = useState(0);
  const [totalWalletBalance, setTotalWalletBalance] = useState(0);
  const [fundedUsersCount, setFundedUsersCount] = useState(0);

  // Earner directory
  const [earnerUsers, setEarnerUsers] = useState<EarnerUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modals & Action states
  const [actionId, setActionId] = useState<string | null>(null);
  const [releaseModalData, setReleaseModalData] = useState<PayoutRequest | null>(null);
  const [txRefInput, setTxRefInput] = useState('');
  const [noteInput, setNoteInput] = useState('');

  // Balance adjustment modal
  const [adjustUser, setAdjustUser] = useState<EarnerUser | null>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Notification
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payouts');
      if (res.ok) {
        const data = await res.json();
        setPayoutRequests(data.requests || []);
        setPendingSum(data.pendingSum || 0);
        setDisbursedSum(data.disbursedSum || 0);
        setRejectedSum(data.rejectedSum || 0);
        setTotalWalletBalance(data.totalWalletBalance || 0);
        setFundedUsersCount(data.fundedUsersCount || 0);
      }
    } catch (err) {
      console.error('Failed to load payouts:', err);
      notify('Failed to load payouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch('/api/users?page=1&limit=50&country=All%20Countries');
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.users || []).sort((a: EarnerUser, b: EarnerUser) => (b.balance || 0) - (a.balance || 0));
        setEarnerUsers(sorted);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  useEffect(() => {
    if (currentView === 'wallets' && earnerUsers.length === 0) {
      fetchUsers();
    }
  }, [currentView]);

  const handleConfirmRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModalData) return;

    try {
      setActionId(releaseModalData.id);
      const res = await fetch('/api/payouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: releaseModalData.id,
          status: 'Processed',
          transactionRef: txRefInput.trim() || undefined,
          adminNotes: noteInput.trim() || undefined
        })
      });

      if (res.ok) {
        notify(`Payout of ₹${releaseModalData.amount.toFixed(2)} marked as Processed.`);
        setReleaseModalData(null);
        setTxRefInput('');
        setNoteInput('');
        fetchPayouts();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (err) {
      alert('Network error while processing payout.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string, amount: number) => {
    if (!confirm(`Reject this payout request for ₹${amount.toFixed(2)} and refund the balance back to user's wallet?`)) {
      return;
    }

    try {
      setActionId(id);
      const res = await fetch('/api/payouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'Rejected' })
      });

      if (res.ok) {
        notify(`Payout rejected. ₹${amount.toFixed(2)} refunded to user.`);
        fetchPayouts();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (err) {
      alert('Error updating status.');
    } finally {
      setActionId(null);
    }
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustUser) return;

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const finalAmount = adjustType === 'credit' ? amt : -amt;

    try {
      setIsAdjusting(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: adjustUser.id,
          adjustAmount: finalAmount,
          note: adjustNote || `${adjustType === 'credit' ? 'Credit' : 'Debit'} adjustment by Admin`
        })
      });

      if (res.ok) {
        notify(`Adjusted balance by ${finalAmount > 0 ? '+' : ''}₹${finalAmount.toFixed(2)}.`);
        setAdjustUser(null);
        setAdjustAmount('');
        setAdjustNote('');
        fetchPayouts();
        fetchUsers();
      } else {
        const err = await res.json();
        alert(`Failed: ${err.error}`);
      }
    } catch (err) {
      alert('Network error adjusting balance.');
    } finally {
      setIsAdjusting(false);
    }
  };

  const getCleanUpi = (upiString: string) => {
    if (!upiString || upiString === 'N/A') return 'N/A';
    try {
      if (upiString.trim().startsWith('{')) {
        const parsed = JSON.parse(upiString);
        return parsed.upiId || parsed.upi || parsed.accountNumber || upiString;
      }
    } catch {}
    return upiString;
  };

  const filteredRequests = useMemo(() => {
    return payoutRequests.filter(req => {
      const matchStatus = statusFilter === 'All' || req.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        req.name.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.upi.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q) ||
        String(req.amount).includes(q);

      return matchStatus && matchSearch;
    });
  }, [payoutRequests, statusFilter, searchQuery]);

  const pendingCount = payoutRequests.filter(p => p.status === 'Pending').length;
  const processedCount = payoutRequests.filter(p => p.status === 'Processed').length;
  const rejectedCount = payoutRequests.filter(p => p.status === 'Rejected').length;

  return (
    <div style={{ width: '100%', maxWidth: '1180px', margin: '0 auto', padding: '16px 20px 60px', color: 'var(--text-primary)', fontFamily: 'inherit' }}>
      
      {/* Toast Alert */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 9999,
          background: toast.type === 'success' ? '#065f46' : '#991b1b',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '6px',
          fontSize: '0.84rem',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          border: '1px solid ' + (toast.type === 'success' ? '#10b981' : '#ef4444')
        }}>
          {toast.type === 'success' ? '✓ ' : '✕ '} {toast.text}
        </div>
      )}

      {/* Header bar: Simple, utilitarian */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Wallet & Payouts
          </h1>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Manage earner cashout requests and monitor wallet balances
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => {
              fetchPayouts();
              if (currentView === 'wallets') fetchUsers();
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Economical KPI Summary Strip: 4 concise metrics */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '12px 18px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '14px',
        alignItems: 'center'
      }}>
        {/* Metric 1: Pending */}
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Pending to Disburse
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: pendingCount > 0 ? '#f59e0b' : 'var(--text-primary)', margin: '2px 0' }}>
            ₹{pendingSum.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {pendingCount} claim{pendingCount === 1 ? '' : 's'} awaiting payment
          </span>
        </div>

        {/* Metric 2: Total Disbursed */}
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Total Disbursed
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
            ₹{disbursedSum.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {processedCount} payout{processedCount === 1 ? '' : 's'} completed
          </span>
        </div>

        {/* Metric 3: User Wallet Balances */}
        <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Total Earner Balances
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981', margin: '2px 0' }}>
            ₹{totalWalletBalance.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Across {fundedUsersCount} earner{fundedUsersCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Metric 4: Rejected / Refunded */}
        <div>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
            Rejected & Refunded
          </span>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-secondary)', margin: '2px 0' }}>
            ₹{rejectedSum.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {rejectedCount} claim{rejectedCount === 1 ? '' : 's'} returned
          </span>
        </div>
      </div>

      {/* View Switcher & Filter Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '12px'
      }}>
        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setCurrentView('payouts')}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: currentView === 'payouts' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: currentView === 'payouts' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            Payout Requests ({payoutRequests.length})
          </button>
          <button
            onClick={() => setCurrentView('wallets')}
            style={{
              padding: '5px 12px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: currentView === 'wallets' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: currentView === 'wallets' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            Earner Balances
          </button>
        </div>

        {/* Search & Status Filters for Payouts */}
        {currentView === 'payouts' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {(['All', 'Pending', 'Processed', 'Rejected'] as const).map(st => {
                const count = st === 'All' ? payoutRequests.length :
                              st === 'Pending' ? pendingCount :
                              st === 'Processed' ? processedCount : rejectedCount;
                const active = statusFilter === st;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      border: '1px solid ' + (active ? 'var(--text-primary)' : 'var(--border-color)'),
                      background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: active ? 600 : 400
                    }}
                  >
                    {st} {count > 0 ? `(${count})` : ''}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              placeholder="Search earner, UPI, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                width: '180px',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* VIEW 1: PAYOUT REQUESTS TABLE */}
      {currentView === 'payouts' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '10px 14px' }}>Earner</th>
                  <th style={{ padding: '10px 14px' }}>Amount</th>
                  <th style={{ padding: '10px 14px' }}>Rail</th>
                  <th style={{ padding: '10px 14px' }}>Payment Address</th>
                  <th style={{ padding: '10px 14px' }}>Status</th>
                  <th style={{ padding: '10px 14px' }}>Date</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Loading requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} requests found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const cleanUpi = getCleanUpi(req.upi);
                    return (
                      <tr 
                        key={req.id} 
                        style={{ 
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          background: req.status === 'Pending' ? 'rgba(245,158,11,0.02)' : 'transparent'
                        }}
                      >
                        {/* Earner Profile */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{req.name}</strong>
                            {req.userId && (
                              <Link 
                                href={`/admin/users/${req.userId}`} 
                                target="_blank"
                                title="Open user details"
                                style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.72rem' }}
                              >
                                ↗
                              </Link>
                            )}
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>{req.email}</span>
                        </td>

                        {/* Amount */}
                        <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                          ₹{req.amount.toFixed(2)}
                        </td>

                        {/* Rail */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                            {req.payoutRail || 'UPI'}
                          </span>
                        </td>

                        {/* UPI / Details */}
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <code style={{ fontSize: '0.78rem', color: 'var(--text-primary)', background: 'rgba(255,255,255,0.04)', padding: '2px 6px', borderRadius: '4px' }}>
                              {cleanUpi}
                            </code>
                            <button
                              onClick={() => copyText(cleanUpi, req.id)}
                              title="Copy to clipboard"
                              style={{
                                background: copiedId === req.id ? '#10b981' : 'transparent',
                                border: '1px solid var(--border-color)',
                                color: copiedId === req.id ? 'black' : 'var(--text-muted)',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontSize: '0.68rem',
                                cursor: 'pointer'
                              }}
                            >
                              {copiedId === req.id ? 'Copied' : 'Copy'}
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            background: req.status === 'Pending' ? 'rgba(245,158,11,0.12)' : (req.status === 'Processed' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'),
                            color: req.status === 'Pending' ? '#f59e0b' : (req.status === 'Processed' ? '#10b981' : '#ef4444')
                          }}>
                            {req.status}
                          </span>
                          {req.transactionRef && (
                            <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              UTR: {req.transactionRef}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {req.date}
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          {req.status === 'Pending' ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => {
                                  setReleaseModalData(req);
                                  setTxRefInput('');
                                  setNoteInput('');
                                }}
                                disabled={actionId === req.id}
                                style={{
                                  background: '#10b981',
                                  color: 'black',
                                  border: 'none',
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                Mark Paid
                              </button>

                              <button
                                onClick={() => handleReject(req.id, req.amount)}
                                disabled={actionId === req.id}
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
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {req.status === 'Processed' ? 'Settled' : 'Refunded'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: EARNER BALANCES TABLE */}
      {currentView === 'wallets' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '10px 14px' }}>Earner</th>
                  <th style={{ padding: '10px 14px' }}>Wallet Balance</th>
                  <th style={{ padding: '10px 14px' }}>Pending Claim</th>
                  <th style={{ padding: '10px 14px' }}>Total Paid</th>
                  <th style={{ padding: '10px 14px' }}>Tasks</th>
                  <th style={{ padding: '10px 14px' }}>Saved Address</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      Loading earner balances...
                    </td>
                  </tr>
                ) : earnerUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                      No earner accounts found.
                    </td>
                  </tr>
                ) : (
                  earnerUsers.map((u) => {
                    const cleanUpi = getCleanUpi(u.upi);
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <strong style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{u.name}</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>{u.email}</span>
                        </td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: '0.92rem', color: u.balance > 0 ? '#10b981' : 'var(--text-secondary)' }}>
                          ₹{u.balance.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: u.pendingPayout && u.pendingPayout > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                          ₹{(u.pendingPayout || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          ₹{(u.totalCashedOut || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {u.tasksDone}
                        </td>
                        <td style={{ padding: '10px 14px', fontSize: '0.76rem' }}>
                          <code style={{ color: 'var(--text-secondary)' }}>{cleanUpi}</code>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setAdjustUser(u);
                                setAdjustAmount('');
                                setAdjustNote('');
                              }}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                cursor: 'pointer'
                              }}
                            >
                              Adjust
                            </button>
                            <Link
                              href={`/admin/users/${u.id}`}
                              target="_blank"
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                textDecoration: 'none'
                              }}
                            >
                              Inspect ↗
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Mark Paid / Release */}
      {releaseModalData && (
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
            maxWidth: '420px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
              Confirm Payout Release
            </h3>
            
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Earner:</span>
                <strong>{releaseModalData.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount:</span>
                <strong style={{ color: '#10b981', fontSize: '1rem' }}>₹{releaseModalData.amount.toFixed(2)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>UPI / Account:</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <code>{getCleanUpi(releaseModalData.upi)}</code>
                  <button
                    type="button"
                    onClick={() => copyText(getCleanUpi(releaseModalData.upi), 'modal-upi')}
                    style={{ background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '1px 5px', fontSize: '0.65rem', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    {copiedId === 'modal-upi' ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleConfirmRelease}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Transaction UTR / Reference ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 429810439281"
                  value={txRefInput}
                  onChange={(e) => setTxRefInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                  Admin Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Disbursed via PhonePe"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    color: 'white',
                    fontSize: '0.82rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReleaseModalData(null)}
                  style={{ padding: '6px 12px', borderRadius: '4px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionId === releaseModalData.id}
                  style={{ padding: '6px 14px', borderRadius: '4px', background: '#10b981', color: 'black', border: 'none', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {actionId === releaseModalData.id ? 'Processing...' : 'Confirm Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Balance */}
      {adjustUser && (
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
            maxWidth: '380px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
              Adjust Balance: {adjustUser.name}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 14px 0' }}>
              Current balance: <strong style={{ color: '#10b981' }}>₹{adjustUser.balance.toFixed(2)}</strong>
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
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
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
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
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
                    fontSize: '0.8rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setAdjustUser(null)}
                  style={{ padding: '6px 12px', borderRadius: '4px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.78rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  style={{ padding: '6px 14px', borderRadius: '4px', background: adjustType === 'credit' ? '#10b981' : '#ef4444', color: adjustType === 'credit' ? 'black' : 'white', border: 'none', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer' }}
                >
                  {isAdjusting ? 'Saving...' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
