"use client";

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { getCategoryIcon } from '../../../data/apps';

export default function CreatePartnerCampaign() {
  const { submitPartnershipLead } = useApp();
  const [success, setSuccess] = useState(false);

  // Form states
  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState<'Gaming' | 'Surveys' | 'App Testing' | 'Passive' | 'App Install & Sign Up' | 'LinkedIn Followers' | 'Google Maps Reviews' | 'Telegram Members' | 'WhatsApp Members' | 'Instagram Followers' | 'Facebook Page Followers' | 'Youtube Subscribers' | 'Trustpilot Reviews' | 'Justdial Reviews' | 'Play Store Reviews' | 'App Store Reviews' | 'Custom Task'>('Gaming');
  const [taskLink, setTaskLink] = useState('');
  const [platforms, setPlatforms] = useState<('iOS' | 'Android' | 'Web')[]>([]);
  const [payout, setPayout] = useState<number>(50.00);
  const [targetCompletions, setTargetCompletions] = useState<number>(1000);
  const [referralCode, setReferralCode] = useState('');
  const [description, setDescription] = useState('');

  const renderDescriptionWithCode = (text: string, code: string) => {
    if (!text) return 'Get rewarded for completing actions. Start task to redirect and begin.';
    if (!code || !text.includes('{referral_code}')) return text;
    const parts = text.split('{referral_code}');
    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && (
              <span 
                style={{
                  background: 'rgba(79, 70, 229, 0.15)',
                  border: '1px dashed rgba(165, 180, 252, 0.5)',
                  color: '#a5b4fc',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  fontSize: '0.62rem',
                  margin: '0 2px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                {code}
              </span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const togglePlatform = (plat: 'iOS' | 'Android' | 'Web') => {
    if (platforms.includes(plat)) {
      setPlatforms(platforms.filter(p => p !== plat));
    } else {
      setPlatforms([...platforms, plat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !taskLink || !category || platforms.length === 0 || payout <= 0 || targetCompletions <= 0) {
      alert("Please fill in all fields and select at least one platform.");
      return;
    }

    const displayEarningRate = `₹${payout.toFixed(2)} / action`;

    // Map simplified fields to the partnership lead model with sensible defaults
    submitPartnershipLead({
      appName: taskName,
      category,
      platforms,
      earningRate: displayEarningRate,
      averageEarningsPerDay: payout,
      description: description || `Complete tasks in ${taskName} to earn rewards.`,
      longDescription: description || `Get rewarded for completing actions on ${taskName}. Click start task to redirect and begin.`,
      tags: [category, 'Promoted'],
      actionText: `Open ${taskName}`,
      externalUrl: taskLink,
      suggestedTasks: [],
      targetCompletions: targetCompletions,
      costPerCompletion: payout,
      totalBudget: parseFloat((targetCompletions * payout).toFixed(2)),
      targetCountry: 'India',
      currency: 'INR',
      currencySymbol: '₹',
      referralCode: referralCode || undefined
    });

    setSuccess(true);
  };

  const handleReset = () => {
    setTaskName('');
    setCategory('Gaming');
    setTaskLink('');
    setPlatforms([]);
    setPayout(50.00);
    setTargetCompletions(1000);
    setReferralCode('');
    setDescription('');
    setSuccess(false);
  };

  const symbol = '₹';

  return (
    <div className="partner-form-viewport">
      {success ? (
        <div className="partner-content-card success-card" style={{ textAlign: 'center', padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '20px' }}>🎉</span>
          <h2 className="card-heading" style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Campaign Lead Submitted!</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Your campaign details for <strong>{taskName}</strong> have been submitted successfully. An administrator will review your campaign details and verify it shortly.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={handleReset} className="glow-btn-cyan">Create Another Campaign</button>
            <a href="/partner/overview" className="glow-btn-purple" style={{ textDecoration: 'none', display: 'inline-block', lineHeight: '40px', padding: '0 24px', borderRadius: '8px', fontWeight: 600 }}>Go to Overview</a>
          </div>
        </div>
      ) : (
        <div className="builder-split-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left Builder Form */}
          <div className="partner-content-card">
            <div className="card-header-section" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
              <h2 className="card-heading">Launch Campaign</h2>
              <p className="card-subheading">Submit your campaign details to get conversions and installations from our global earning community.</p>
            </div>

            <form onSubmit={handleSubmit} className="offer-form">
              
              <div className="form-group">
                <label htmlFor="task-name">Task Name *</label>
                <input 
                  id="task-name"
                  type="text" 
                  value={taskName} 
                  onChange={(e) => setTaskName(e.target.value)} 
                  placeholder="e.g. Swagbucks Review, CoinMaster Install" 
                  required
                />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label>Campaign Category *</label>
                <button
                  type="button"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    padding: '10px',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    height: '40px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getCategoryIcon(category)}
                    <span>{
                      (() => {
                        const categoriesList = [
                          { value: 'App Install & Sign Up', label: 'App Install & Sign Up' },
                          { value: 'LinkedIn Followers', label: 'LinkedIn Followers' },
                          { value: 'Google Maps Reviews', label: 'Google Maps Reviews' },
                          { value: 'Telegram Members', label: 'Telegram Members' },
                          { value: 'WhatsApp Members', label: 'WhatsApp Members' },
                          { value: 'Instagram Followers', label: 'Instagram Followers' },
                          { value: 'Facebook Page Followers', label: 'Facebook Page Followers' },
                          { value: 'Youtube Subscribers', label: 'Youtube Subscribers' },
                          { value: 'Trustpilot Reviews', label: 'Trustpilot Reviews' },
                          { value: 'Justdial Reviews', label: 'Justdial Reviews' },
                          { value: 'Play Store Reviews', label: 'Play Store Reviews' },
                          { value: 'App Store Reviews', label: 'App Store Reviews' },
                          { value: 'Custom Task', label: 'Custom Task' },
                          { value: 'Gaming', label: 'Gaming (Game Installs & Levels)' },
                          { value: 'Surveys', label: 'Surveys (Demographics Opinion)' },
                          { value: 'App Testing', label: 'App Testing (User Feedback)' }
                        ];
                        return categoriesList.find(c => c.value === category)?.label || category;
                      })()
                    }</span>
                  </span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>▼</span>
                </button>

                {isCategoryDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 205,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    boxShadow: 'var(--shadow-premium)',
                    marginTop: '4px',
                    padding: '8px',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    {[
                      { value: 'App Install & Sign Up', label: 'App Install & Sign Up' },
                      { value: 'LinkedIn Followers', label: 'LinkedIn Followers' },
                      { value: 'Google Maps Reviews', label: 'Google Maps Reviews' },
                      { value: 'Telegram Members', label: 'Telegram Members' },
                      { value: 'WhatsApp Members', label: 'WhatsApp Members' },
                      { value: 'Instagram Followers', label: 'Instagram Followers' },
                      { value: 'Facebook Page Followers', label: 'Facebook Page Followers' },
                      { value: 'Youtube Subscribers', label: 'Youtube Subscribers' },
                      { value: 'Trustpilot Reviews', label: 'Trustpilot Reviews' },
                      { value: 'Justdial Reviews', label: 'Justdial Reviews' },
                      { value: 'Play Store Reviews', label: 'Play Store Reviews' },
                      { value: 'App Store Reviews', label: 'App Store Reviews' },
                      { value: 'Custom Task', label: 'Custom Task' },
                      { value: 'Gaming', label: 'Gaming (Game Installs & Levels)' },
                      { value: 'Surveys', label: 'Surveys (Demographics Opinion)' },
                      { value: 'App Testing', label: 'App Testing (User Feedback)' }
                    ].map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => {
                          setCategory(cat.value as any);
                          setIsCategoryDropdownOpen(false);
                        }}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-primary)',
                          padding: '8px 10px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          transition: 'all 0.15s'
                        }}
                        className="country-item-btn"
                      >
                        {getCategoryIcon(cat.value)}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="task-link">Task Link (Redirect URL) *</label>
                <input 
                  id="task-link"
                  type="url" 
                  value={taskLink} 
                  onChange={(e) => setTaskLink(e.target.value)} 
                  placeholder="https://play.google.com/store/apps/details?id=..." 
                  required
                />
                <span className="input-helper">The destination link where users will execute the campaign.</span>
              </div>

              <div className="form-group">
                <label htmlFor="referral-code">Referral Code (Optional)</label>
                <input 
                  id="referral-code"
                  type="text" 
                  value={referralCode} 
                  onChange={(e) => setReferralCode(e.target.value)} 
                  placeholder="e.g. REFER100, BONUSFREE"
                />
                <span className="input-helper">Optional referral or promo code that users should copy/use during sign-up.</span>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description / Steps *</label>
                <textarea 
                  id="description"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="e.g. Step 1: Click start task. Step 2: Use code {referral_code}."
                  required
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
                <span className="input-helper">Detailed steps for users. Use <code>{"{referral_code}"}</code> to show a copyable badge inline.</span>
              </div>

              <div className="form-group">
                <label>Conversion Platform *</label>
                <div className="checkbox-row" style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  {[
                    { value: 'iOS', label: 'App Store (iOS)' },
                    { value: 'Android', label: 'Play Store (Android)' }
                  ].map((plat) => (
                    <div 
                      key={plat.value} 
                      onClick={() => togglePlatform(plat.value as any)}
                      className={`checkbox-selector ${platforms.includes(plat.value as any) ? 'active' : ''}`}
                      style={{ padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', background: platforms.includes(plat.value as any) ? 'rgba(79,70,229,0.08)' : 'rgba(255,255,255,0.01)', color: platforms.includes(plat.value as any) ? 'var(--accent-indigo)' : 'var(--text-secondary)', fontWeight: 600, transition: 'all 0.2s' }}
                    >
                      {platforms.includes(plat.value as any) ? '✓' : '+'} {plat.label}
                    </div>
                  ))}
                </div>
              </div>

               <div className="form-group">
                <label htmlFor="payout-per-conversion">Payout to Users per Conversion ({symbol}) *</label>
                <input 
                  id="payout-per-conversion"
                  type="number" 
                  min="0.01"
                  step="any"
                  value={payout} 
                  onChange={(e) => setPayout(parseFloat(e.target.value) || 0)} 
                  required
                />
                <span className="input-helper">Reward distributed directly to users for completing the conversion.</span>
              </div>

              <div className="form-group">
                <label htmlFor="target-completions">Target Conversions (Completions) *</label>
                <input 
                  id="target-completions"
                  type="number" 
                  min="100"
                  step="any"
                  value={targetCompletions} 
                  onChange={(e) => setTargetCompletions(parseInt(e.target.value) || 0)} 
                  required
                />
                <span className="input-helper">Minimum 100 completions.</span>
              </div>

              <div className="glass-card budget-calculator-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(79, 70, 229, 0.03)', border: '1px solid rgba(79, 70, 229, 0.12)', borderRadius: '8px', padding: '16px', marginTop: '4px' }}>
                <span className="budget-lbl" style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', fontWeight: 600 }}>Estimated Campaign Cost</span>
                <strong className="budget-total-val" style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--accent-indigo)', margin: '4px 0' }}>{symbol}{(targetCompletions * payout).toFixed(2)}</strong>
                <span className="budget-calc-formula" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({targetCompletions.toLocaleString()} conversions &times; {symbol}{payout.toFixed(2)} payout)</span>
              </div>

              {/* Submit Button */}
              <button type="submit" className="glow-btn-purple" style={{ width: '100%', padding: '16px', fontSize: '1.1rem', marginTop: '16px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Submit Campaign Details
              </button>
            </form>
          </div>

          {/* Right Live Mobile Offerwall Simulator */}
          <div className="sticky-mobile-simulator" style={{ position: 'sticky', top: '10px' }}>
            <div className="phone-device-mockup" style={{
              width: '320px',
              height: '500px',
              background: '#090d16',
              border: '12px solid #1f293d',
              borderRadius: '36px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              margin: '0 auto',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              {/* iPhone Notch */}
              <div style={{
                width: '120px',
                height: '18px',
                background: '#1f293d',
                borderRadius: '0 0 14px 14px',
                margin: '0 auto',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10
              }} />

              {/* iOS Status Bar */}
              <div style={{
                height: '38px',
                background: '#111827',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                padding: '0 20px 6px 20px',
                fontSize: '0.72rem',
                color: '#fff',
                fontWeight: 600,
                borderBottom: '1px solid #1f293d',
                userSelect: 'none'
              }}>
                <span style={{ fontSize: '0.7rem' }}>9:41</span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem' }}>📶</span>
                  <span style={{ fontSize: '0.75rem' }}>📶</span>
                  <span style={{ fontSize: '0.8rem', lineHeight: 1 }}>🔋</span>
                </div>
              </div>

              {/* Scrollable Screen Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }} className="phone-screen-scroll">
                
                {/* Mock Campaign Card */}
                <div style={{
                  background: '#1f293d',
                  borderRadius: '12px',
                  padding: '14px',
                  border: '1px solid rgba(79, 70, 229, 0.2)'
                }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      color: 'white'
                    }}>
                      {getCategoryIcon(category)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: 0, fontSize: '0.85rem', color: '#fff', fontWeight: 700 }}>{taskName || 'Your App Name'}</h5>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '1px 5px',
                        background: 'rgba(79, 70, 229, 0.2)',
                        color: '#a5b4fc',
                        borderRadius: '3px',
                        fontWeight: 600
                      }}>{getCategoryIcon(category)} {category}</span>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>
                    Complete tasks in {taskName || 'your campaign'} to earn rewards.
                  </p>
                </div>

                {/* Simulated Campaign Parameters */}
                <div style={{
                  background: '#111827',
                  border: '1px solid #1f293d',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <h6 style={{ margin: 0, fontSize: '0.78rem', color: '#e5e7eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offer details</h6>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#9ca3af' }}>Payout Rate:</span>
                    <strong style={{ color: '#10b981' }}>{symbol}{payout.toFixed(2)} / action</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#9ca3af' }}>Target Audience:</span>
                    <strong style={{ color: '#fff' }}>🇮🇳 India Users</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <span style={{ color: '#9ca3af' }}>Platforms:</span>
                    <strong style={{ color: '#fff' }}>
                      {platforms.length > 0 
                        ? platforms.map(p => p === 'iOS' ? 'App Store' : p === 'Android' ? 'Android' : p).join(', ') 
                        : 'Select above'}
                    </strong>
                  </div>

                  <div style={{ borderTop: '1px solid #1f293d', paddingTop: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Guidelines / Steps</span>
                    <p style={{ margin: 0, fontSize: 0.72 + "rem", color: '#9ca3af', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {renderDescriptionWithCode(description, referralCode)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action Button inside mobile simulator */}
              <div style={{
                padding: '12px 16px',
                background: '#111827',
                borderTop: '1px solid #1f293d'
              }}>
                <button type="button" style={{
                  width: '100%',
                  background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}>
                  {taskName ? `Get ${taskName}` : 'Download App'}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      <style>{`
        .partner-content-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 32px;
          box-shadow: var(--shadow-md);
          transition: background-color 0.2s, border-color 0.2s;
        }
        .card-header-section {
          margin-bottom: 24px;
        }
        .card-heading {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 6px;
        }
        .card-subheading {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .offer-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .form-group input, 
        .form-group select, 
        .form-group textarea {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 10px 14px;
          border-radius: 6px;
          color: var(--text-primary);
          outline: none;
          font-size: 0.9rem;
          font-family: var(--font-primary);
          transition: all 0.2s;
        }
        .form-group input:focus, 
        .form-group select:focus, 
        .form-group textarea:focus {
          border-color: var(--accent-indigo);
          background: rgba(255, 255, 255, 0.04);
        }
        @media (max-width: 768px) {
          .builder-split-layout {
            grid-template-columns: 1fr !important;
          }
          .sticky-mobile-simulator {
            position: relative !important;
            top: 0 !important;
            margin-top: 24px;
          }
        }
        .input-helper {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .checkbox-row {
          display: flex;
          gap: 10px;
        }
        .checkbox-selector {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.2s;
          color: var(--text-secondary);
        }
        .checkbox-selector:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: var(--border-hover);
        }
        .checkbox-selector.active {
          border-color: var(--accent-indigo) !important;
          background: rgba(79, 70, 229, 0.06) !important;
          color: var(--accent-indigo) !important;
        }
        .phone-screen-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .phone-screen-scroll::-webkit-scrollbar-thumb {
          background: #1f293d;
          border-radius: 2px;
        }
        /* Disable number input spinners */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
        .country-item-btn:hover {
          background: rgba(79, 70, 229, 0.08) !important;
          color: var(--accent-indigo) !important;
        }
      `}</style>
    </div>
  );
}
