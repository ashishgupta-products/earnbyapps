"use client";

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../../../context/AppContext';
import { getCategoryIcon } from '../../../../data/apps';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetails({ params }: PageProps) {
  const resolvedParams = use(params);
  const { apps, completedTaskIds, submissions, submitTaskCompletion } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [showProofInput, setShowProofInput] = useState(false);
  const [proofText, setProofText] = useState<string>('');
  const [proofMediaType, setProofMediaType] = useState<'image' | 'video'>('image');
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const renderDescriptionWithCode = (text: string, code?: string) => {
    if (!code || !text.includes('{referral_code}')) return text;
    const parts = text.split('{referral_code}');
    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <span 
                onClick={() => {
                  navigator.clipboard.writeText(code);
                  setToastMessage('Referral code copied!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                title="Click to copy code"
                style={{
                  background: 'rgba(79, 70, 229, 0.15)',
                  border: '1px dashed var(--accent-indigo)',
                  color: 'var(--accent-indigo)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  margin: '0 4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {code} 📋
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  // Find the current app/campaign
  const app = apps.find(a => a.id === resolvedParams.id);

  if (!app) {
    return (
      <div className="error-container">
        <div className="glass-card error-card">
          <h2>Task Not Found</h2>
          <p>The campaign task details you requested could not be resolved or found.</p>
          <Link href="/offerwall" className="glow-btn-purple">
            Back to Offerwall
          </Link>
        </div>
        <style>{`
          .error-container {
            min-height: calc(100vh - 71px);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-dark);
            padding: 24px;
          }
          .error-card {
            padding: 40px;
            text-align: center;
            max-width: 450px;
          }
          .error-card h2 {
            font-family: var(--font-display);
            margin-bottom: 12px;
          }
          .error-card p {
            color: var(--text-secondary);
            margin-bottom: 24px;
            line-height: 1.5;
          }
        `}</style>
      </div>
    );
  }

  const isCompleted = completedTaskIds.includes(app.id);
  const pendingSub = submissions.find(s => s.appId === app.id && s.status === 'Pending');
  const rejectedSub = submissions.find(s => s.appId === app.id && s.status === 'Rejected');

  let buttonText = 'Start Task ↗';
  let isDisabled = false;

  if (isCompleted) {
    buttonText = 'Claimed ✓';
    isDisabled = true;
  } else if (pendingSub) {
    buttonText = 'Awaiting Approval ⏳';
    isDisabled = true;
  } else if (rejectedSub) {
    buttonText = 'Resubmit Proof 🔄';
  }

  // Start Task Trigger
  const handleStartTask = () => {
    if (isCompleted || pendingSub) return;

    // Resolve active redirect URL
    let targetUrl = app.externalUrl || 'https://google.com';
    if (app.referralPool && app.referralPool.length > 0) {
      const activeSlot = app.referralPool.find(s => s.completedCount < s.limit);
      if (activeSlot) {
        targetUrl = activeSlot.referralUrl;
      }
    }

    window.open(targetUrl, '_blank');

    setToastMessage(`Redirecting to ${app.name}... Complete the task and submit proof below!`);
    setShowProofInput(true);
    setProofText('');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSubmitProof = async () => {
    if (!proofText.trim() && !selectedFile) {
      setToastMessage('Error: Please enter proof details or upload a screenshot/video.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsUploading(true);
    let finalFileUrl = '';

    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Upload failed');
        }

        const data = await response.json();
        finalFileUrl = data.url;
      } catch (error: any) {
        console.error('Upload error:', error);
        setToastMessage(`Upload Error: ${error.message}. Using placeholder fallback.`);
        // Fallback to placeholder if upload fails
        finalFileUrl = proofMediaType === 'image' 
          ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
          : 'https://www.w3schools.com/html/mov_bbb.mp4';
      }
    } else {
      // Premium placeholders for testing
      finalFileUrl = proofMediaType === 'image' 
        ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
        : 'https://www.w3schools.com/html/mov_bbb.mp4';
    }

    submitTaskCompletion(app.id, proofText || `Uploaded ${proofMediaType} proof`, proofMediaType, finalFileUrl);
    setShowProofInput(false);
    setProofText('');
    setSelectedFile(null);
    setSelectedFileUrl('');
    setSelectedFileName('');
    setIsUploading(false);
    setToastMessage('Success: Proof submitted! Awaiting verifier approval.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <main className="task-details-main">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-banner">
          <span>ℹ️</span> {toastMessage}
        </div>
      )}

      <div className="details-container">
        {/* Back navigation */}
        <div className="back-nav-row">
          <Link href="/offerwall" className="back-link-btn">
            ← Back to Offerwall
          </Link>
        </div>

        {/* Info Card header */}
        <div className="glass-card main-info-card">
          <div className="app-detail-header-row">
            <div className="header-left">
              <div className="app-category-badge">{getCategoryIcon(app.category)} {app.category}</div>
              <h1 className="detail-app-title">{app.name}</h1>
              <div className="meta-stats-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <span>Rating: <strong className="highlight-amber">★ {app.rating}</strong></span>
                <span>Difficulty: <strong>{app.difficulty}</strong></span>
                <span>Target Regions: <strong style={{ color: 'var(--accent-teal)' }}>🇮🇳 {app.targetCountry || 'India'} ({app.currency || 'INR'})</strong></span>
              </div>
            </div>
            
            <div className="header-right">
              <span className="est-earning-lbl">Reward Payout</span>
              <strong className="est-earning-val">
                {app.currencySymbol ? `${app.currencySymbol} ${app.reward?.toFixed(2) || app.earningRate}` : `₹ ${(app.reward || 50).toFixed(2)}`}
              </strong>
            </div>
          </div>

          <p className="app-detail-desc" style={{ whiteSpace: 'pre-wrap' }}>{renderDescriptionWithCode(app.longDescription || app.description || '', app.referralCode)}</p>

          {rejectedSub && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.88rem', color: '#ef4444', fontWeight: 600 }}>
              ⚠️ Previous proof submission was rejected. Please review task requirements and resubmit with correct media proof below.
            </div>
          )}

          {app.referralCode && (
            <div className="referral-code-box" style={{
              background: 'rgba(79, 70, 229, 0.05)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>Referral Code (Optional)</span>
                <strong style={{ fontSize: '1.2rem', color: '#fff', fontFamily: 'monospace', letterSpacing: '1px' }}>{app.referralCode}</strong>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(app.referralCode || '');
                  setToastMessage('Referral code copied to clipboard!');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="glow-btn-cyan"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Copy Code
              </button>
            </div>
          )}

          {/* Action Trigger Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                disabled={isDisabled}
                onClick={handleStartTask}
                className="glow-btn-purple"
                style={{
                  padding: '14px 28px',
                  fontSize: '1.05rem',
                  borderRadius: '8px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  background: isCompleted ? 'rgba(16, 185, 129, 0.1)' : pendingSub ? 'rgba(245, 158, 11, 0.1)' : 'var(--accent-indigo)',
                  color: isCompleted ? 'var(--accent-emerald)' : pendingSub ? 'var(--accent-amber)' : 'white',
                  border: isCompleted ? '1px solid var(--accent-emerald)' : pendingSub ? '1px solid var(--accent-amber)' : 'none',
                  fontWeight: 'bold',
                  boxShadow: 'none'
                }}
              >
                {buttonText}
              </button>

              {!isCompleted && !pendingSub && !showProofInput && (
                <button
                  onClick={() => setShowProofInput(true)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Submit Proof Directly
                </button>
              )}
            </div>

            {/* Proof submission form */}
            {showProofInput && !isCompleted && !pendingSub && (
              <div className="proof-submission-box" style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '16px'
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  📝 Submit Completion Proof
                </div>

                {/* Media type selector */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => { setProofMediaType('image'); setSelectedFileUrl(''); setSelectedFileName(''); }} 
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      background: proofMediaType === 'image' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                      color: proofMediaType === 'image' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                      fontWeight: 600
                    }}
                  >
                    📸 Screenshot (Image)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setProofMediaType('video'); setSelectedFileUrl(''); setSelectedFileName(''); }} 
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      background: proofMediaType === 'video' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                      color: proofMediaType === 'video' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                      fontWeight: 600
                    }}
                  >
                    🎥 Screen Recording (Video)
                  </button>
                </div>

                {/* File Dropzone */}
                <div style={{
                  border: '1px dashed var(--border-color)',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.005)'
                }} onClick={() => document.getElementById(`file-input-app`)?.click()}>
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '8px' }}>
                    {proofMediaType === 'image' ? '📁' : '📹'}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 600 }}>
                    {selectedFileName ? `Selected: ${selectedFileName}` : `Click to upload completion ${proofMediaType === 'image' ? 'screenshot' : 'recording'}`}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    (If empty, a demo placeholder will be submitted automatically)
                  </span>
                  <input 
                    type="file" 
                    id={`file-input-app`}
                    accept={proofMediaType === 'image' ? 'image/*' : 'video/*'} 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        setSelectedFile(file);
                        setSelectedFileName(file.name);
                        setSelectedFileUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Enter details (e.g. registered username, account email or transaction ID)..."
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  className="search-input"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    onClick={() => {
                      setShowProofInput(false);
                      setSelectedFileUrl('');
                      setSelectedFileName('');
                    }}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitProof}
                    className="glow-btn-cyan"
                    disabled={isUploading}
                    style={{
                      padding: '10px 24px',
                      fontSize: '0.9rem',
                      border: 'none',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      opacity: isUploading ? 0.7 : 1
                    }}
                  >
                    {isUploading ? 'Uploading...' : 'Submit Verification Proof'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {app.externalUrl && (
            <div className="external-flow-note" style={{ marginTop: '24px' }}>
              <span className="info-icon">ℹ️</span>
              <p>
                <strong>Important Note:</strong> Task is completed on the target application. Clicking <strong>Start Task</strong> opens the referral link. Once done, capture your screenshot/video proof and submit it here.
              </p>
            </div>
          )}
        </div>

        {/* Tutorial Video Section */}
        {app.videoUrl && (
          <div className="glass-card video-tutorial-card" style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(251, 191, 36, 0.04)', border: '1px solid rgba(251, 191, 36, 0.15)', padding: '20px', borderRadius: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '2.2rem' }}>🎥</span>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Need help? Watch the video tutorial!</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>A short video walkthrough explaining step-by-step how to complete this task correctly.</p>
            </div>
            <a href={app.videoUrl} target="_blank" rel="noopener noreferrer" className="glow-btn-cyan" style={{ textDecoration: 'none', padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', borderRadius: '8px' }}>
              Watch Tutorial ↗
            </a>
          </div>
        )}
      </div>

      <style>{`
        .task-details-main {
          min-height: calc(100vh - 71px);
          background: var(--bg-dark);
          color: var(--text-primary);
          padding: 40px 24px;
        }

        .details-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .back-nav-row {
          display: flex;
          align-items: center;
        }

        .back-link-btn {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: color 0.15s;
        }
        .back-link-btn:hover {
          color: var(--accent-indigo);
        }

        /* Info Card */
        .main-info-card {
          padding: 32px;
          border-radius: 16px;
        }

        .app-detail-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 24px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .detail-app-title {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 8px 0;
        }

        .app-category-badge {
          display: inline-block;
          font-size: 0.8rem;
          background: var(--border-color);
          padding: 4px 12px;
          border-radius: 6px;
          color: var(--text-secondary);
          font-weight: 600;
        }

        .meta-stats-row {
          display: flex;
          gap: 16px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .highlight-amber {
          color: var(--accent-amber);
        }

        .est-earning-lbl {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          text-align: right;
        }

        .est-earning-val {
          font-family: var(--font-display);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--accent-emerald);
          display: block;
          margin-top: 4px;
        }

        .app-detail-desc {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .external-flow-note {
          background: rgba(79, 70, 229, 0.08);
          border: 1px solid rgba(79, 70, 229, 0.15);
          padding: 16px;
          border-radius: 8px;
          display: flex;
          gap: 12px;
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .external-flow-note .info-icon {
          font-size: 1.25rem;
        }
        .external-flow-note a {
          color: var(--accent-indigo);
          text-decoration: underline;
        }

        .toast-banner {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #1e293b;
          border: 1px solid var(--accent-indigo);
          padding: 16px 24px;
          border-radius: 8px;
          color: var(--text-primary);
          box-shadow: var(--shadow-lg);
          z-index: 2000;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.9rem;
          max-width: 400px;
        }

        .glow-btn-purple {
          background: var(--accent-indigo);
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: white !important;
          padding: 12px 24px;
          border-radius: 8px;
          font-family: var(--font-primary);
          font-weight: 600;
          text-decoration: none;
          display: inline-block;
        }
      `}</style>
    </main>
  );
}
