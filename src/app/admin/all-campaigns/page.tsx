"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { getCategoryIcon, EarningApp } from '../../../data/apps';
import { countries, getCountryCurrency } from '../../../data/countries';

const COUNTRY_CURRENCIES: Record<string, { currency: string; symbol: string }> = {
  'Global': { currency: 'USD', symbol: '$' },
  'India': { currency: 'INR', symbol: '₹' },
  'United States': { currency: 'USD', symbol: '$' },
  'United Kingdom': { currency: 'GBP', symbol: '£' },
  'Europe': { currency: 'EUR', symbol: '€' }
};

export default function AdminAllCampaigns() {
  const { submissions, updateOffer, deleteOffer } = useApp();

  const [dbApps, setDbApps] = useState<EarningApp[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCountry, setFilterCountry] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  // Edit campaign states
  const [editingApp, setEditingApp] = useState<EarningApp | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<any>('Gaming');
  const [editPayout, setEditPayout] = useState('50.00');
  const [editCountry, setEditCountry] = useState('India');
  const [editCompletions, setEditCompletions] = useState('1000');
  const [editLink, setEditLink] = useState('');
  const [editVideo, setEditVideo] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editPlatforms, setEditPlatforms] = useState<('iOS' | 'Android' | 'Web')[]>([]);
  const [editAssignedEmail, setEditAssignedEmail] = useState('');
  const [editReferralCode, setEditReferralCode] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Search state for country inside edit modal
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/campaigns?page=${currentPage}&limit=${itemsPerPage}&search=${encodeURIComponent(searchQuery)}&country=${encodeURIComponent(filterCountry)}`);
      if (res.ok) {
        const data = await res.json();
        setDbApps(data.campaigns || []);
        setTotalCount(data.totalCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, searchQuery, filterCountry]);

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCountry]);

  useEffect(() => {
    if (editingApp) {
      setEditName(editingApp.name);
      setEditCategory(editingApp.category);
      setEditPayout(editingApp.reward?.toString() || '50.00');
      setEditCountry(editingApp.targetCountry || 'India');
      setEditCompletions(editingApp.targetCompletions?.toString() || '1000');
      setEditLink(editingApp.externalUrl || '');
      setEditVideo(editingApp.videoUrl || '');
      setEditLogo(editingApp.logoUrl || '');
      setEditTags(editingApp.tags?.join(', ') || '');
      setEditPlatforms(editingApp.platforms || []);
      setEditAssignedEmail(editingApp.assignedEmail || '');
      setEditReferralCode(editingApp.referralCode || '');
      setEditDescription(editingApp.longDescription || editingApp.description || '');
    }
  }, [editingApp]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(tempSearchQuery);
  };

  const handleToggleDeactivate = async (id: string) => {
    const campaign = dbApps.find(a => a.id === id);
    if (!campaign) return;
    const updated = {
      ...campaign,
      isActive: campaign.isActive === false ? true : false
    };
    updateOffer(updated);
    
    // Optimistic UI state toggle, followed by a slight delay refresh
    setDbApps(prev => prev.map(a => a.id === id ? updated : a));
    setTimeout(fetchCampaigns, 500);
  };

  const getCurrencyDetails = (countryName: string) => {
    return getCountryCurrency(countryName);
  };

  const handleTogglePlatform = (plat: 'iOS' | 'Android' | 'Web') => {
    if (editPlatforms.includes(plat)) {
      setEditPlatforms(editPlatforms.filter(p => p !== plat));
    } else {
      setEditPlatforms([...editPlatforms, plat]);
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    const payoutNum = parseFloat(editPayout) || 0.50;
    const details = getCurrencyDetails(editCountry);
    const rateString = `${details.symbol}${payoutNum.toFixed(2)} / action`;
    const submissionsCount = parseInt(editCompletions) || 1000;
    const parsedTags = editTags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const updatedApp: EarningApp = {
      ...editingApp,
      name: editName,
      category: editCategory,
      platforms: editPlatforms,
      earningRate: rateString,
      averageEarningsPerDay: payoutNum,
      tags: parsedTags.length > 0 ? parsedTags : ['Admin direct', 'Promoted'],
      actionText: `Launch ${editName}`,
      externalUrl: editLink,
      targetCountry: editCountry,
      currency: details.currency,
      currencySymbol: details.symbol,
      targetCompletions: submissionsCount,
      videoUrl: editVideo || undefined,
      reward: payoutNum,
      logoUrl: editLogo || undefined,
      assignedEmail: editAssignedEmail || undefined,
      referralCode: editReferralCode || undefined,
      description: editDescription,
      longDescription: editDescription
    };

    updateOffer(updatedApp);
    setEditingApp(null);
    setTimeout(fetchCampaigns, 500);
  };

  const handleDeleteCampaign = (id: string, name: string) => {
    if (confirm(`Are you sure you want to permanently delete campaign "${name}"?`)) {
      deleteOffer(id);
      setTimeout(fetchCampaigns, 500);
    }
  };

  // Filter countries list inside search dropdown
  const filteredCountries = useMemo(() => {
    return countries.filter(c => 
      c.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
    );
  }, [countrySearchQuery]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="admin-content-card">
      <div className="card-header-section">
        <h2 className="card-heading">Earning Apps Directory Manager ({totalCount})</h2>
        <p className="card-subheading">Enable/disable or modify active campaigns currently published on the Offerwall.</p>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '250px' }}>
          <input 
            type="text" 
            placeholder="Search by name, category..." 
            value={tempSearchQuery}
            onChange={(e) => setTempSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-color)',
              padding: '10px 14px',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '10px 24px', 
              fontSize: '0.9rem', 
              borderRadius: '6px', 
              cursor: 'pointer',
              background: '#06b6d4',
              color: 'black',
              border: 'none',
              fontWeight: '600'
            }}
          >
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>Target Country:</span>
          <select 
            value={filterCountry} 
            onChange={(e) => setFilterCountry(e.target.value)}
            style={{ padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '0.82rem', outline: 'none' }}
          >
            <option value="All">🌐 All Countries</option>
            <option value="Global">🌐 Global</option>
            <option value="India">🇮🇳 India</option>
            <option value="United States">🇺🇸 United States</option>
            <option value="United Kingdom">🇬🇧 United Kingdom</option>
            <option value="Europe">🇪🇺 Europe</option>
          </select>
        </div>
      </div>

      <div className="table-responsive-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p>Loading campaigns...</p>
          </div>
        ) : dbApps.length > 0 ? (
          <table className="user-table">
            <thead>
              <tr>
                <th>Earning App</th>
                <th>Category</th>
                <th>Platform</th>
                <th>Earning Rate</th>
                <th>Conversions / Cap</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dbApps.map((app) => {
                const isDeactivated = app.isActive === false;
                const completedCount = submissions.filter(s => s.appId === app.id && s.status === 'Paid').length;
                const target = app.targetCompletions || 1000;
                const progressPercentage = Math.min(100, (completedCount / target) * 100);
                const matchedCountryObj = countries.find(c => c.name === app.targetCountry);
                const flag = app.targetCountry === 'Global' ? '🌐' : (matchedCountryObj?.flag || '🏳️');

                return (
                  <tr key={app.id}>
                    <td>
                      <strong style={{ display: 'block' }}>{app.name}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.7rem', padding: '1px 6px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {flag} {app.targetCountry || 'India'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="app-cat-badge">{getCategoryIcon(app.category)} {app.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem' }}>{app.platforms.join(', ')}</span>
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 700 }}>
                      {app.earningRate}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                          {completedCount.toLocaleString()} / {target.toLocaleString()}
                        </span>
                        <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'var(--accent-indigo)' }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 'bold',
                        background: isDeactivated ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                        color: isDeactivated ? '#ef4444' : 'var(--accent-emerald)'
                      }}>
                        {isDeactivated ? 'Paused' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleToggleDeactivate(app.id)}
                          style={{
                            background: isDeactivated ? 'var(--accent-emerald)' : 'transparent',
                            border: '1px solid ' + (isDeactivated ? 'transparent' : 'var(--border-color)'),
                            color: isDeactivated ? 'black' : 'var(--text-primary)',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          {isDeactivated ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          onClick={() => setEditingApp(app)}
                          style={{
                            background: 'var(--accent-indigo)',
                            border: 'none',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(app.id, app.name)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '0.78rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-pending-banner">
            <span style={{ fontSize: '2rem' }}>🔍</span>
            <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>No campaigns found.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '24px' }}>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-color)',
              color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{
              background: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-color)',
              color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Drawer Editor */}
      {editingApp && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(10, 11, 14, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }} onClick={() => setEditingApp(null)}>
          <div 
            className="edit-slide-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Modify Campaign</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configuring parameters for: {editingApp.name}</span>
              </div>
              <button 
                onClick={() => setEditingApp(null)}
                className="drawer-close-btn"
                title="Close drawer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="drawer-form-group">
                <label>Campaign Name *</label>
                <input 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  required
                  className="drawer-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="drawer-form-group">
                  <label>Category *</label>
                  <select 
                    value={editCategory} 
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="drawer-select"
                  >
                    <option value="Gaming">🎮 Gaming</option>
                    <option value="Surveys">📋 Surveys</option>
                    <option value="App Testing">🧪 App Testing</option>
                    <option value="Passive">💸 Passive</option>
                    <option value="App Install & Sign Up">📲 App Install & Sign Up</option>
                    <option value="LinkedIn Followers">👔 LinkedIn Followers</option>
                    <option value="Google Maps Reviews">📍 Google Maps Reviews</option>
                    <option value="Telegram Members">✈️ Telegram Members</option>
                    <option value="WhatsApp Members">💬 WhatsApp Members</option>
                    <option value="Instagram Followers">📸 Instagram Followers</option>
                    <option value="Facebook Page Followers">👍 Facebook Page Followers</option>
                    <option value="Youtube Subscribers">▶️ Youtube Subscribers</option>
                    <option value="Trustpilot Reviews">⭐ Trustpilot Reviews</option>
                    <option value="Justdial Reviews">📞 Justdial Reviews</option>
                    <option value="Play Store Reviews">🤖 Play Store Reviews</option>
                    <option value="Custom Task">⚙️ Custom Task</option>
                  </select>
                </div>

                <div className="drawer-form-group" style={{ position: 'relative' }}>
                  <label>Target Country *</label>
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    style={{
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border-color)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>
                      {countries.find(c => c.name === editCountry)?.flag || '🌐'}{' '}
                      {editCountry}
                    </span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>▼</span>
                  </button>

                  {isCountryDropdownOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      marginTop: '4px',
                      zIndex: 10000,
                      boxShadow: 'var(--shadow-lg)',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      padding: '8px'
                    }}>
                      <input 
                        type="text" 
                        placeholder="Search country..."
                        value={countrySearchQuery}
                        onChange={(e) => setCountrySearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-color)',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontSize: '0.82rem',
                          outline: 'none',
                          marginBottom: '8px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div 
                          onClick={() => {
                            setEditCountry('Global');
                            setIsCountryDropdownOpen(false);
                            setCountrySearchQuery('');
                          }}
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.85rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            background: editCountry === 'Global' ? 'rgba(6,182,212,0.1)' : 'transparent',
                            color: editCountry === 'Global' ? '#06b6d4' : 'var(--text-secondary)'
                          }}
                        >
                          🌐 Global
                        </div>
                        {filteredCountries.map((co) => (
                          <div 
                            key={co.name}
                            onClick={() => {
                              setEditCountry(co.name);
                              setIsCountryDropdownOpen(false);
                              setCountrySearchQuery('');
                            }}
                            style={{
                              padding: '6px 10px',
                              fontSize: '0.85rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              background: editCountry === co.name ? 'rgba(6,182,212,0.1)' : 'transparent',
                              color: editCountry === co.name ? '#06b6d4' : 'var(--text-secondary)',
                              display: 'flex',
                              gap: '6px',
                              alignItems: 'center'
                            }}
                          >
                            <span>{co.flag}</span>
                            <span>{co.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="drawer-form-group">
                  <label>Payout Reward (₹/$) *</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={editPayout} 
                    onChange={(e) => setEditPayout(e.target.value)} 
                    required
                    className="drawer-input"
                  />
                </div>

                <div className="drawer-form-group">
                  <label>Completions Cap (Total Budget) *</label>
                  <input 
                    type="number" 
                    value={editCompletions} 
                    onChange={(e) => setEditCompletions(e.target.value)} 
                    required
                    className="drawer-input"
                  />
                </div>
              </div>

              <div className="drawer-form-group">
                <label>External Campaign Action Link *</label>
                <input 
                  type="url" 
                  value={editLink} 
                  onChange={(e) => setEditLink(e.target.value)} 
                  required
                  className="drawer-input"
                  placeholder="https://example.com/p/referral"
                />
              </div>

              <div className="drawer-form-group">
                <label>Campaign Video Link (Optional)</label>
                <input 
                  type="url" 
                  value={editVideo} 
                  onChange={(e) => setEditVideo(e.target.value)} 
                  className="drawer-input"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div className="drawer-form-group">
                <label>Developer Logo URL (Optional)</label>
                <input 
                  type="text" 
                  value={editLogo} 
                  onChange={(e) => setEditLogo(e.target.value)} 
                  className="drawer-input"
                  placeholder="earnbyapps_proofs/logo.png"
                />
              </div>

              <div className="drawer-form-group">
                <label>Associated Developer Partner (Email)</label>
                <input 
                  type="email" 
                  value={editAssignedEmail} 
                  onChange={(e) => setEditAssignedEmail(e.target.value)} 
                  className="drawer-input"
                  placeholder="partner@example.com"
                />
              </div>

              <div className="drawer-form-group">
                <label>Tags (Comma separated)</label>
                <input 
                  type="text" 
                  value={editTags} 
                  onChange={(e) => setEditTags(e.target.value)} 
                  className="drawer-input"
                  placeholder="Fast, Sign Up, No KYC"
                />
              </div>

              <div className="drawer-form-group">
                <label>Referral Code (Optional)</label>
                <input 
                  type="text" 
                  value={editReferralCode} 
                  onChange={(e) => setEditReferralCode(e.target.value)} 
                  className="drawer-input"
                  placeholder="e.g. REFER100"
                />
              </div>

              <div className="drawer-form-group">
                <label>Description / Steps *</label>
                <textarea 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  required
                  className="drawer-input"
                  style={{ minHeight: '80px', resize: 'vertical', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '10px 14px', borderRadius: '6px', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem' }}
                  placeholder="Steps..."
                />
                <span className="input-helper" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Use <code>{"{referral_code}"}</code> for inline copyable badge.</span>
              </div>

              <div className="drawer-form-group">
                <label style={{ marginBottom: '8px', display: 'block' }}>Target Platforms *</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['iOS', 'Android', 'Web'].map((plat: any) => (
                    <label key={plat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={editPlatforms.includes(plat)}
                        onChange={() => handleTogglePlatform(plat)}
                        style={{ accentColor: 'var(--accent-indigo)' }}
                      />
                      {plat}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button 
                  type="submit" 
                  className="glow-btn-cyan"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Save Campaign
                </button>
                <button 
                  type="button" 
                  onClick={() => setEditingApp(null)}
                  className="drawer-btn-secondary"
                  style={{ flex: 1, padding: '12px' }}
                >
                  Discard Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-responsive-container {
          overflow-x: auto;
          margin-top: 10px;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .user-table th {
          border-bottom: 1px solid var(--border-color);
          padding: 12px 16px;
          font-size: 0.72rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .user-table td {
          border-bottom: 1px solid var(--border-color);
          padding: 16px;
          font-size: 0.88rem;
          color: var(--text-primary);
          vertical-align: middle;
        }

        .app-cat-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          padding: 4px 10px;
          border-radius: 20px;
          color: var(--text-secondary);
          white-space: nowrap;
        }

        /* Drawer Slide-in styling */
        .edit-slide-drawer {
          width: 100%;
          max-width: 460px;
          height: 100%;
          background: var(--bg-card);
          border-left: 1px solid var(--border-color);
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
          padding: 32px;
          overflow-y: auto;
          box-sizing: border-box;
          animation: slideIn 0.3s ease-out forwards;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .drawer-close-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
          transition: color 0.2s;
        }

        .drawer-close-btn:hover {
          color: #ef4444;
        }

        .drawer-form-group {
          margin-bottom: 14px;
        }

        .drawer-form-group label {
          display: block;
          font-size: 0.76rem;
          text-transform: uppercase;
          color: var(--text-muted);
          font-weight: 600;
          letter-spacing: 0.03em;
          margin-bottom: 6px;
        }

        .drawer-input, .drawer-select {
          width: 100%;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid var(--border-color);
          padding: 10px 14px;
          border-radius: 6px;
          color: 'var(--text-primary)';
          font-size: 0.9rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .drawer-input:focus, .drawer-select:focus {
          border-color: var(--accent-indigo);
        }

        .drawer-btn-secondary {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          font-weight: bold;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .drawer-btn-secondary:hover {
          background: rgba(255,255,255,0.02);
          border-color: var(--border-hover);
        }

        .empty-pending-banner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          border: 1px dashed var(--border-color);
          border-radius: 8px;
          color: var(--text-muted);
          text-align: center;
        }
      `}</style>
    </div>
  );
}
