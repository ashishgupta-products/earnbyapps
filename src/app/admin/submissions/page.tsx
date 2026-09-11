"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';

export default function SubmissionsPage() {
  const { submissions, approveSubmission, rejectSubmission } = useApp();
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pending' | 'Paid' | 'Rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [paymentDetails, setPaymentDetails] = useState<{ method: string; details: string } | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Helper to reliably detect proof media (screenshot image, video, or URL in proof)
  const getProofMedia = (sub: any) => {
    if (!sub) return null;
    if (sub.proofUrl && typeof sub.proofUrl === 'string' && sub.proofUrl.trim().length > 0) {
      const isVid = sub.proofType === 'video' || sub.proofUrl.endsWith('.mp4') || sub.proofUrl.endsWith('.webm') || sub.proofUrl.includes('video');
      return { url: sub.proofUrl.trim(), type: isVid ? ('video' as const) : ('image' as const) };
    }
    const text = (sub.proof || '').trim();
    if (
      text.startsWith('http://') || 
      text.startsWith('https://') || 
      text.startsWith('data:image/') || 
      text.startsWith('/uploads/')
    ) {
      const isVid = text.endsWith('.mp4') || text.endsWith('.webm') || text.includes('video');
      return { url: text, type: isVid ? ('video' as const) : ('image' as const) };
    }
    // Check if proof text contains a URL
    const urlMatch = text.match(/(https?:\/\/[^\s]+)/);
    if (urlMatch) {
      const matchedUrl = urlMatch[1];
      if (
        /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(matchedUrl) || 
        matchedUrl.includes('cloudinary') || 
        matchedUrl.includes('images.unsplash.com') || 
        matchedUrl.includes('drive.google.com') || 
        matchedUrl.includes('imgur.com')
      ) {
        return { url: matchedUrl, type: 'image' as const };
      }
    }
    return null;
  };

  // Filter submissions by status and search
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
      const matchesSearch = 
        !searchQuery.trim() || 
        sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) || 
        sub.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [submissions, statusFilter, searchQuery]);

  // Keep selectedSub valid or default to first filtered
  const selectedSub = useMemo(() => {
    if (selectedSubId) {
      const found = filteredSubmissions.find(s => s.id === selectedSubId);
      if (found) return found;
    }
    return filteredSubmissions.length > 0 ? filteredSubmissions[0] : null;
  }, [filteredSubmissions, selectedSubId]);

  useEffect(() => {
    if (!selectedSub) {
      setPaymentDetails(null);
      return;
    }

    const email = selectedSub.userEmail;

    async function fetchUserPayment() {
      try {
        setLoadingPayment(true);
        const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          setPaymentDetails({
            method: data.paymentMethod || 'UPI',
            details: data.paymentDetails || 'N/A'
          });
        } else {
          setPaymentDetails({ method: 'N/A', details: 'N/A' });
        }
      } catch (err) {
        console.error(err);
        setPaymentDetails({ method: 'N/A', details: 'N/A' });
      } finally {
        setLoadingPayment(false);
      }
    }

    fetchUserPayment();
  }, [selectedSub]);

  const formatPaymentDetails = (detailsStr: string) => {
    if (!detailsStr || detailsStr === 'N/A') {
      return <strong className="meta-val">N/A</strong>;
    }
    if (detailsStr.trim().startsWith('{') || detailsStr.trim().startsWith('[')) {
      try {
        const parsed = JSON.parse(detailsStr);
        
        const renderEntry = (obj: any) => {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '6px' }}>
              {Object.entries(obj).map(([k, v]: [string, any]) => {
                const label = k
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .replace('Upi Id', 'UPI ID')
                  .replace('Ifsc', 'IFSC');
                return (
                  <div key={k} style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{label}:</span>{' '}
                    <strong style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{String(v)}</strong>
                  </div>
                );
              })}
            </div>
          );
        };

        if (Array.isArray(parsed)) {
          const preferred = parsed.find((p: any) => p.isPreferred) || parsed[0];
          if (!preferred) return <strong className="meta-val">N/A</strong>;
          return (
            <div>
              <strong className="meta-val" style={{ display: 'block', marginBottom: '4px' }}>{preferred.methodName}</strong>
              {renderEntry(preferred.details || {})}
            </div>
          );
        }
        return renderEntry(parsed);
      } catch (e) {
        return <strong className="meta-val" style={{ wordBreak: 'break-all' }}>{detailsStr}</strong>;
      }
    }
    return <strong className="meta-val" style={{ wordBreak: 'break-all' }}>{detailsStr}</strong>;
  };

  const handleCopy = (text: string, subId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(subId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Render proof text with clickable links if URLs are present
  const renderProofWithLinks = (text: string) => {
    if (!text) return 'No notes provided.';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#06b6d4', textDecoration: 'underline', wordBreak: 'break-all' }}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const pendingCount = submissions.filter(s => s.status === 'Pending').length;
  const paidCount = submissions.filter(s => s.status === 'Paid').length;
  const rejectedCount = submissions.filter(s => s.status === 'Rejected').length;

  const currentMedia = selectedSub ? getProofMedia(selectedSub) : null;

  return (
    <div className="admin-moderation-layout">
      {/* List Panel */}
      <div className="submissions-panel">
        <div className="card-header-section" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-heading" style={{ margin: 0 }}>All Submissions ({submissions.length})</h2>
            {pendingCount > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="card-subheading" style={{ marginTop: '4px' }}>Verify task completions, audit user screenshots, and release earnings.</p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All (${submissions.length})` },
            { id: 'Pending', label: `Pending (${pendingCount})` },
            { id: 'Paid', label: `Approved (${paidCount})` },
            { id: 'Rejected', label: `Rejected (${rejectedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                background: statusFilter === tab.id ? 'var(--accent-indigo)' : 'rgba(255,255,255,0.02)',
                color: statusFilter === tab.id ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search by earner, app, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'rgba(255,255,255,0.01)',
              color: 'var(--text-primary)',
              fontSize: '0.84rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div className="pending-moderation-list">
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((sub) => {
              const subMedia = getProofMedia(sub);
              const isSelected = selectedSub?.id === sub.id;

              return (
                <div 
                  key={sub.id}
                  onClick={() => setSelectedSubId(sub.id)}
                  className={`pending-item-card ${isSelected ? 'active' : ''}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: 0 }}>
                      {subMedia ? (
                        <div 
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            background: '#090d16',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <img 
                            src={subMedia.url} 
                            alt="Screenshot" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              // If image fails, fallback to icon
                              (e.currentTarget.parentElement as HTMLElement).innerHTML = '📸';
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          color: 'white',
                          flexShrink: 0
                        }}>
                          {sub.userName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.appName}
                        </strong>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>by {sub.userName}</span>
                          {subMedia ? (
                            <span style={{ fontSize: '0.68rem', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              📸 Screenshot
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '1px 6px', borderRadius: '4px' }}>
                              📝 Text
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                      <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.85rem' }}>+₹{sub.reward.toFixed(2)}</span>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 'bold',
                        background: 
                          sub.status === 'Pending' ? 'rgba(245,158,11,0.12)' : 
                          sub.status === 'Paid' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color: 
                          sub.status === 'Pending' ? '#f59e0b' : 
                          sub.status === 'Paid' ? 'var(--accent-emerald)' : '#ef4444'
                      }}>{sub.status}</span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-pending-banner">
              <span style={{ fontSize: '2rem' }}>✓</span>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>No task completions match your filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inspector Panel */}
      <div className="inspector-panel">
        {selectedSub ? (
          <div className="inspector-content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h3 className="inspector-title" style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'bold' }}>Submission Inspector</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Claim ID: {selectedSub.id}</span>
              </div>
              <span style={{
                fontSize: '0.75rem',
                padding: '4px 12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 
                  selectedSub.status === 'Pending' ? 'rgba(245,158,11,0.12)' : 
                  selectedSub.status === 'Paid' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                color: 
                  selectedSub.status === 'Pending' ? '#f59e0b' : 
                  selectedSub.status === 'Paid' ? 'var(--accent-emerald)' : '#ef4444'
              }}>{selectedSub.status}</span>
            </div>

            {/* Visual Media Proof Preview Panel */}
            <div className="inspector-field" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="meta-lbl" style={{ margin: 0 }}>Visual Media / Screenshot Proof</span>
                {currentMedia && (
                  <span style={{ fontSize: '0.72rem', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                    📸 User Attachment Verified
                  </span>
                )}
              </div>

              {currentMedia ? (
                <div style={{
                  background: '#090d16',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  {currentMedia.type === 'video' ? (
                    <video 
                      src={currentMedia.url} 
                      controls 
                      style={{ maxWidth: '100%', maxHeight: '280px', borderRadius: '6px', background: '#000' }}
                    />
                  ) : (
                    <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                      <img 
                        src={currentMedia.url} 
                        alt="Proof Screenshot"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '300px', 
                          borderRadius: '6px', 
                          cursor: 'zoom-in', 
                          objectFit: 'contain', 
                          border: '1px solid rgba(255,255,255,0.05)',
                          background: '#040711'
                        }}
                        onClick={() => setLightboxMedia({ type: 'image', url: currentMedia.url })}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.img-fallback');
                          if (fallback) (fallback as HTMLElement).style.display = 'block';
                        }}
                      />
                      <div className="img-fallback" style={{ display: 'none', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        ⚠️ Screenshot preview unavailable in current view.
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setLightboxMedia({ type: currentMedia.type, url: currentMedia.url })}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🔍 Fullscreen Zoom
                    </button>
                    <a
                      href={currentMedia.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        color: '#06b6d4',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ↗️ Open Original Image
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '20px',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <span style={{ fontSize: '1.8rem', display: 'block', marginBottom: '6px' }}>📝</span>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>
                    No Screenshot Image Attached
                  </strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    The earner completed this task using the reference notes / ID proof details below.
                  </p>
                </div>
              )}
            </div>

            {/* Description / Text Proof */}
            <div className="inspector-field" style={{ marginBottom: '20px' }}>
              <span className="meta-lbl">Description / Text Proof</span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '6px' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  padding: '12px 14px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  flex: 1,
                  wordBreak: 'break-all'
                }}>
                  {renderProofWithLinks(selectedSub.proof)}
                </div>
                <button 
                  onClick={() => handleCopy(selectedSub.proof, selectedSub.id)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    background: copiedId === selectedSub.id ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    color: copiedId === selectedSub.id ? 'black' : 'var(--text-primary)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {copiedId === selectedSub.id ? 'Copied!' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div className="meta-details-grid">
              <div>
                <span className="meta-lbl">Earner Name</span>
                <strong className="meta-val">{selectedSub.userName}</strong>
              </div>
              <div>
                <span className="meta-lbl">Earner Email</span>
                <strong className="meta-val" style={{ wordBreak: 'break-all' }}>{selectedSub.userEmail}</strong>
              </div>
              <div>
                <span className="meta-lbl">Campaign / App</span>
                <strong className="meta-val">{selectedSub.appName}</strong>
              </div>
              <div>
                <span className="meta-lbl">Reward Amount</span>
                <strong className="meta-val" style={{ color: 'var(--accent-emerald)' }}>+₹{selectedSub.reward.toFixed(2)}</strong>
              </div>
              <div>
                <span className="meta-lbl">Payment Method</span>
                <strong className="meta-val" style={{ color: 'var(--text-primary)' }}>
                  {loadingPayment ? 'Loading...' : paymentDetails?.method || 'UPI ID'}
                </strong>
              </div>
              <div>
                <span className="meta-lbl">Payment Details / UPI ID</span>
                <div style={{ wordBreak: 'break-all', minHeight: '24px' }}>
                  {loadingPayment ? (
                    <strong className="meta-val">Loading...</strong>
                  ) : (
                    formatPaymentDetails(paymentDetails?.details || 'N/A')
                  )}
                </div>
              </div>
              <div>
                <span className="meta-lbl">Submitted At</span>
                <strong className="meta-val">{selectedSub.time}</strong>
              </div>
              <div>
                <span className="meta-lbl">Assigned Verifier</span>
                <strong className="meta-val" style={{ fontSize: '0.82rem' }}>{selectedSub.verifierEmail || 'admin'}</strong>
              </div>
            </div>

            {selectedSub.status === 'Pending' && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button 
                  onClick={() => approveSubmission(selectedSub.id)}
                  className="glow-btn-cyan"
                  style={{ flex: 1, padding: '12px', background: 'var(--accent-emerald)', color: 'black', fontWeight: 'bold' }}
                >
                  ✓ Approve Completion (+₹{selectedSub.reward.toFixed(2)})
                </button>
                <button 
                  onClick={() => rejectSubmission(selectedSub.id)}
                  className="reject-moderation-btn"
                  style={{ flex: 1, padding: '12px', fontWeight: 'bold' }}
                >
                  ✕ Reject Completion
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-inspector-banner">
            <span style={{ fontSize: '2.5rem', opacity: 0.6 }}>✔️</span>
            <h4 style={{ margin: '12px 0 6px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Select Submission</h4>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '300px', lineHeight: 1.5 }}>
              Select a task completion claim from the list on the left to verify screenshots, media proofs, and approve payouts.
            </p>
          </div>
        )}
      </div>

      {/* Lightbox zoom modal */}
      {lightboxMedia && (
        <div 
          onClick={() => setLightboxMedia(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.88)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backdropFilter: 'blur(6px)'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '90%',
              maxHeight: '90%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Full-Resolution Proof Preview</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={lightboxMedia.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'rgba(6, 182, 212, 0.1)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    color: '#06b6d4',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    textDecoration: 'none'
                  }}
                >
                  ↗️ Open in Tab
                </a>
                <button
                  onClick={() => setLightboxMedia(null)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {lightboxMedia.type === 'video' ? (
              <video 
                src={lightboxMedia.url} 
                controls 
                autoPlay 
                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '6px' }}
              />
            ) : (
              <img 
                src={lightboxMedia.url} 
                alt="Zoomed proof" 
                style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '6px', objectFit: 'contain' }}
              />
            )}
          </div>
        </div>
      )}

      <style>{`
        .admin-moderation-layout {
          display: grid;
          grid-template-columns: 1.2fr 1.8fr;
          gap: 24px;
          align-items: flex-start;
          width: 100%;
        }

        .submissions-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
          box-shadow: var(--shadow-md);
        }

        .pending-moderation-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: calc(100vh - 280px);
          overflow-y: auto;
          padding-right: 4px;
        }

        .pending-item-card {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px 14px;
          transition: all 0.2s;
          cursor: pointer;
        }

        .pending-item-card:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border-hover);
        }

        .pending-item-card.active {
          border-color: var(--accent-indigo);
          background: rgba(79, 70, 229, 0.04);
          box-shadow: 0 0 12px rgba(79, 70, 229, 0.15);
        }

        .empty-pending-banner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          border: 1px dashed var(--border-color);
          border-radius: 8px;
          color: var(--text-muted);
          text-align: center;
        }

        .inspector-panel {
          position: sticky;
          top: 24px;
          max-height: calc(100vh - 160px);
          overflow-y: auto;
          padding-right: 4px;
        }

        .inspector-content-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
          box-shadow: var(--shadow-md);
        }

        .meta-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .meta-lbl {
          display: block;
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .meta-val {
          font-size: 0.88rem;
          color: var(--text-primary);
        }

        .reject-moderation-btn {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reject-moderation-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .empty-inspector-banner {
          background: var(--bg-card);
          border: 1px dashed var(--border-color);
          border-radius: 12px;
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 350px;
        }

        @media (max-width: 992px) {
          .admin-moderation-layout {
            grid-template-columns: 1fr;
          }
          .inspector-panel {
            position: static;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
}
