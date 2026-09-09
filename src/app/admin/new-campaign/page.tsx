"use client";

import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { countries, getCountryCurrency } from '../../../data/countries';
import { getCategoryIcon } from '../../../data/apps';

const COUNTRY_CURRENCIES: Record<string, { currency: string; symbol: string }> = {
  'Global': { currency: 'USD', symbol: '$' },
  'India': { currency: 'INR', symbol: '₹' },
  'United States': { currency: 'USD', symbol: '$' },
  'United Kingdom': { currency: 'GBP', symbol: '£' },
  'Europe': { currency: 'EUR', symbol: '€' }
};

export default function AdminNewCampaign() {
  const { submitOffer } = useApp();

  const [taskName, setTaskName] = useState('');
  const [category, setCategory] = useState<'Gaming' | 'Surveys' | 'App Testing' | 'App Store Reviews' | 'App Install & Sign Up' | 'LinkedIn Followers' | 'Google Maps Reviews' | 'Telegram Members' | 'WhatsApp Members' | 'Instagram Followers' | 'Facebook Page Followers' | 'Youtube Subscribers' | 'Trustpilot Reviews' | 'Justdial Reviews' | 'Play Store Reviews' | 'Custom Task'>('Gaming');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [targetCountry, setTargetCountry] = useState('India');
  const [payout, setPayout] = useState('50.00');
  const [taskLink, setTaskLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [platforms, setPlatforms] = useState<('iOS' | 'Android' | 'Web')[]>([]);
  const [description, setDescription] = useState('');
  const [allowedSubmissions, setAllowedSubmissions] = useState('1000');
  
  // Custom Campaign Details
  const [logoUrl, setLogoUrl] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [tagsInput, setTagsInput] = useState('New, Promoted');
  const [referralCode, setReferralCode] = useState('');

  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const [success, setSuccess] = useState(false);

  const getCurrencyDetails = (countryName: string) => {
    return getCountryCurrency(countryName);
  };

  const handleTogglePlatform = (plat: 'iOS' | 'Android' | 'Web') => {
    if (platforms.includes(plat)) {
      setPlatforms(platforms.filter(p => p !== plat));
    } else {
      setPlatforms([...platforms, plat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskName || !taskLink || platforms.length === 0 || !description || !allowedSubmissions) {
      alert('Please fill out all required fields and select at least one platform.');
      return;
    }

    const payoutNum = parseFloat(payout) || 50.00;
    const details = getCurrencyDetails(targetCountry);
    const rateString = `${details.symbol}${payoutNum.toFixed(2)} / action`;
    const submissionsCount = parseInt(allowedSubmissions) || 1000;
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    submitOffer({
      name: taskName,
      category: category,
      platforms: platforms,
      earningRate: rateString,
      averageEarningsPerDay: payoutNum,
      description: description,
      longDescription: description,
      tags: parsedTags.length > 0 ? parsedTags : ['Admin direct', 'Promoted'],
      actionText: `Launch ${taskName}`,
      externalUrl: taskLink,
      targetCountry: targetCountry,
      currency: details.currency,
      currencySymbol: details.symbol,
      targetCompletions: submissionsCount,
      videoUrl: videoUrl || undefined,
      reward: payoutNum,
      logoUrl: logoUrl || undefined,
      referralCode: referralCode || undefined
    });

    setSuccess(true);
  };

  const handleReset = () => {
    setTaskName('');
    setCategory('Gaming');
    setTargetCountry('India');
    setPayout('50.00');
    setTaskLink('');
    setVideoUrl('');
    setPlatforms([]);
    setDescription('');
    setAllowedSubmissions('1000');
    setLogoUrl('');
    setDifficulty('Easy');
    setTagsInput('New, Promoted');
    setReferralCode('');
    setSuccess(false);
  };

  const details = getCurrencyDetails(targetCountry);

  return (
    <div className="admin-content-card">
      {success ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🎉</span>
          <h3 className="card-heading" style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Direct Campaign Configured!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            The campaign for <strong>{taskName}</strong> has been configured and is live in the Offerwall directory immediately.
          </p>
          <button onClick={handleReset} className="glow-btn-cyan">Create Another Offer</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card-header-section" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h2 className="card-heading">Post New Direct Campaign</h2>
            <p className="card-subheading">Configure system offers directly into the directory queue.</p>
          </div>

          <div className="form-group">
            <label htmlFor="task-name">Task Name *</label>
            <input 
              id="task-name"
              type="text" 
              value={taskName} 
              onChange={(e) => setTaskName(e.target.value)} 
              placeholder="e.g. Swagbucks Direct, Prime Survey Extra"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive">
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Category *</label>
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
                        { value: 'Gaming', label: 'Gaming' },
                        { value: 'Surveys', label: 'Surveys' },
                        { value: 'App Testing', label: 'App Testing' }
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
                    { value: 'Gaming', label: 'Gaming' },
                    { value: 'Surveys', label: 'Surveys' },
                    { value: 'App Testing', label: 'App Testing' }
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
              <label>Target Market & Currency</label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-color)',
                padding: '10px 14px',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem'
              }}>
                <span>🇮🇳</span>
                <span>India (INR - ₹)</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--accent-teal)', background: 'rgba(13, 148, 136, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>Pan-India Users</span>
              </div>
              <span className="input-helper">Campaign will run exclusively for verified users across India.</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive">
            <div className="form-group">
              <label htmlFor="payout">Payout per Conversion ({details.currency} {details.symbol}) *</label>
              <input 
                id="payout"
                type="number" 
                step="0.01"
                min="0.01"
                value={payout} 
                onChange={(e) => setPayout(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="allowed-submissions">Total Number of Allowed Submission *</label>
              <input 
                id="allowed-submissions"
                type="number" 
                min="1"
                value={allowedSubmissions} 
                onChange={(e) => setAllowedSubmissions(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="grid-responsive">
            <div className="form-group">
              <label htmlFor="task-link">Task Link *</label>
              <input 
                id="task-link"
                type="url" 
                value={taskLink} 
                onChange={(e) => setTaskLink(e.target.value)} 
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="video-link">Video Tutorial Link (Optional)</label>
              <input 
                id="video-link"
                type="url" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
                placeholder="e.g. YouTube Shorts or tutorial URL"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="logo-url">Campaign Logo URL (Optional)</label>
            <input 
              id="logo-url"
              type="url" 
              value={logoUrl} 
              onChange={(e) => setLogoUrl(e.target.value)} 
              placeholder="e.g. https://example.com/logo.png"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tags-input">Tags / Badges (Comma-separated)</label>
            <input 
              id="tags-input"
              type="text" 
              value={tagsInput} 
              onChange={(e) => setTagsInput(e.target.value)} 
              placeholder="e.g. Popular, Fast Payout, New"
            />
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
          </div>

          <div className="form-group">
            <label>Platform *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['iOS', 'Android'].map(plat => (
                <button
                  type="button"
                  key={plat}
                  onClick={() => handleTogglePlatform(plat as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: platforms.includes(plat as any) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    color: platforms.includes(plat as any) ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea 
              id="description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter simple instructions or conversion details..."
              style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', minHeight: '100px', resize: 'vertical' }}
              required
            />
            <span className="input-helper">Tip: Insert <code>{"{referral_code}"}</code> anywhere in the steps/description to display a copyable referral code badge inline.</span>
          </div>

          <button type="submit" className="glow-btn-cyan" style={{ padding: '12px 24px', width: '100%', marginTop: '20px' }}>
            Publish Campaign to Offerwall
          </button>
        </form>
      )}

      <style>{`
        .admin-content-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 32px;
          box-shadow: var(--shadow-md);
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
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }
        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .form-group input, .form-group select {
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 10px 14px;
          border-radius: 6px;
          color: var(--text-primary);
          outline: none;
          font-size: 0.9rem;
        }
        .form-group input:focus, .form-group select:focus {
          border-color: var(--accent-indigo);
        }
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
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
