"use client";

import React, { useState, useEffect } from 'react';

interface DirectTask {
  id: string;
  appName: string;
  appImage: string;
  description: string;
  referralCode: string;
  appLink: string;
  createdAt: string;
  category?: string;
  rewardBadge?: string;
}

const INITIAL_TASKS: DirectTask[] = [
  {
    id: 'dt-1',
    appName: 'Angel One Demat & Trading',
    appImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=160&auto=format&fit=crop&q=80',
    description: 'Complete online paperless Aadhaar & PAN KYC verification to open a Demat account and receive instant rewards credited directly to you.',
    referralCode: 'ANGELDIRECT',
    appLink: 'https://angelone.in/referral?ref=ANGELDIRECT',
    createdAt: '2026-09-12',
    category: 'Finance & Trading',
    rewardBadge: '₹250 Direct Cash'
  },
  {
    id: 'dt-2',
    appName: 'Swagbucks India Surveys',
    appImage: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=160&auto=format&fit=crop&q=80',
    description: 'Share feedback on everyday consumer brands. Zero waiting signup with this code and earn direct wallet credits instantly.',
    referralCode: 'SWAG2026',
    appLink: 'https://www.swagbucks.com/register?r=SWAG2026',
    createdAt: '2026-09-11',
    category: 'Opinion Surveys',
    rewardBadge: '₹150 Instant Credit'
  },
  {
    id: 'dt-3',
    appName: 'WinZO Super Gaming Pass',
    appImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=160&auto=format&fit=crop&q=80',
    description: 'Play casual skill-based mobile games. Sign up with promo code for instant ₹50 initial wallet balance credited on first round.',
    referralCode: 'WINZO50',
    appLink: 'https://winzo.com/direct-join?code=WINZO50',
    createdAt: '2026-09-10',
    category: 'Mobile Gaming',
    rewardBadge: '₹50 Signup Bonus'
  }
];

export default function AdminDirectPage() {
  const [tasks, setTasks] = useState<DirectTask[]>(INITIAL_TASKS);

  // Form states
  const [appName, setAppName] = useState('');
  const [appImage, setAppImage] = useState('');
  const [description, setDescription] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [appLink, setAppLink] = useState('');
  const [rewardBadge, setRewardBadge] = useState('');

  // UI interaction states
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'with-code' | 'recent'>('all');
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  // Load from localStorage for static persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eb_static_direct_tasks');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read static direct tasks from localStorage', e);
    }
  }, []);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3200);
  };

  const saveTasks = (newTasks: DirectTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem('eb_static_direct_tasks', JSON.stringify(newTasks));
    } catch (e) {
      console.warn('Could not save static direct tasks to localStorage', e);
    }
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAppImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!appName.trim() || !appLink.trim()) {
      alert('Please fill in both the App Name and the App Link.');
      return;
    }

    const newTask: DirectTask = {
      id: `task-${Date.now()}`,
      appName: appName.trim(),
      appImage: appImage.trim() || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80',
      description: description.trim(),
      referralCode: referralCode.trim(),
      appLink: appLink.trim().startsWith('http') ? appLink.trim() : `https://${appLink.trim()}`,
      rewardBadge: rewardBadge.trim() || 'Direct Reward',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);

    // Reset form
    setAppName('');
    setAppImage('');
    setDescription('');
    setReferralCode('');
    setAppLink('');
    setRewardBadge('');

    showToast(`"${newTask.appName}" published to Direct tasks below!`);
  };

  const handleDeleteTask = (id: string, name: string) => {
    if (confirm(`Remove "${name}" from Direct tasks?`)) {
      const updated = tasks.filter(t => t.id !== id);
      saveTasks(updated);
      showToast(`Removed "${name}"`, 'info');
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    showToast(`Referral code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.referralCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterMode === 'with-code') return Boolean(t.referralCode);
    return true;
  });

  return (
    <div className="admin-direct-root">
      
      {/* Floating Toast Alert */}
      {toastMessage && (
        <div className={`direct-floating-toast ${toastMessage.type}`}>
          <span className="toast-icon">{toastMessage.type === 'success' ? '✓' : 'ℹ'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 1. Hero Showcase Banner */}
      <section className="direct-hero-card">
        <div className="hero-glow-blob" />
        <div className="hero-content">
          <div className="hero-badge-pill">
            <span className="pulse-dot" />
            <span className="hero-badge-text">⚡ DIRECT APPS & INSTANT REWARDS</span>
          </div>
          
          <h1 className="hero-title">
            Direct Deals <span className="gradient-text">&amp; Instant Offers</span>
          </h1>

          {/* User's exact requested line in a glowing callout */}
          <div className="hero-quote-box">
            <div className="quote-accent-bar" />
            <div className="quote-text-wrap">
              <span className="quote-icon">🎁</span>
              <p className="hero-quote-text">
                Instant page contain apps that pay directly to their users , direct reward zero waiting signup with these codes and the apps will send your rewards directly to you
              </p>
            </div>
          </div>
        </div>

        {/* Metric Counter Badges */}
        <div className="hero-stats-panel">
          <div className="hero-stat-card">
            <span className="stat-num">{tasks.length}</span>
            <span className="stat-lbl">Active Direct Apps</span>
          </div>
          <div className="hero-stat-card">
            <span className="stat-num">{tasks.filter(t => t.referralCode).length}</span>
            <span className="stat-lbl">Bonus Promo Codes</span>
          </div>
          <div className="hero-stat-card accent">
            <span className="stat-num">0s</span>
            <span className="stat-lbl">Direct Pay Waiting</span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Two-Column Creator Section */}
      <div className="direct-workspace-grid">
        
        {/* Left / Main: Task Creation Form */}
        <div className="direct-form-card">
          <div className="form-card-header">
            <div>
              <h2 className="form-card-title">
                <span>➕</span> Create New Direct Offer
              </h2>
              <p className="form-card-subtitle">
                Publish an instant payout app with promo referral links
              </p>
            </div>
            <button
              type="button"
              className="toggle-form-btn"
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              title={isFormCollapsed ? "Expand Form" : "Collapse Form"}
            >
              {isFormCollapsed ? 'Show Form ▼' : 'Hide Form ▲'}
            </button>
          </div>

          {!isFormCollapsed && (
            <form onSubmit={handleCreateTask} className="direct-form">
              <div className="form-row-2col">
                
                {/* Field 1: App Name */}
                <div className="input-group">
                  <label className="input-label">
                    <span>📱 App Name</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="e.g. Angel One, Groww, WinZO"
                    required
                    className="styled-input"
                  />
                </div>

                {/* Field 2: App Link */}
                <div className="input-group">
                  <label className="input-label">
                    <span>🔗 App Direct Link</span>
                    <span className="required-star">*</span>
                  </label>
                  <input
                    type="url"
                    value={appLink}
                    onChange={(e) => setAppLink(e.target.value)}
                    placeholder="https://app.link/direct-bonus"
                    required
                    className="styled-input"
                  />
                </div>
              </div>

              <div className="form-row-2col">
                {/* Field 3: Referral Code */}
                <div className="input-group">
                  <label className="input-label">
                    <span>🏷️ Referral Code</span>
                    <span className="hint-label">(Applies at signup)</span>
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BONUS2026, DIRECT100"
                    className="styled-input uppercase-code"
                  />
                </div>

                {/* Field 4: Reward Highlight Badge */}
                <div className="input-group">
                  <label className="input-label">
                    <span>💰 Reward Highlight</span>
                    <span className="hint-label">(Optional badge)</span>
                  </label>
                  <input
                    type="text"
                    value={rewardBadge}
                    onChange={(e) => setRewardBadge(e.target.value)}
                    placeholder="e.g. ₹200 Direct Cash, Instant Bonus"
                    className="styled-input"
                  />
                </div>
              </div>

              {/* Field 5: App Image (URL or Browse) */}
              <div className="input-group">
                <label className="input-label">
                  <span>🖼️ App Icon / Thumbnail Image</span>
                  <span className="hint-label">(URL or Upload image)</span>
                </label>
                <div className="image-input-split">
                  <input
                    type="text"
                    value={appImage}
                    onChange={(e) => setAppImage(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="styled-input image-url-input"
                  />
                  <label className="file-upload-btn">
                    <span>📁 Browse</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden-file-input"
                    />
                  </label>
                </div>
              </div>

              {/* Field 6: Description */}
              <div className="input-group">
                <label className="input-label">
                  <span>📝 Offer Description</span>
                  <span className="hint-label">(How earner receives reward)</span>
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Complete Aadhaar KYC verification. Zero waiting signup with this code and the app credits direct reward to your bank or UPI."
                  className="styled-textarea"
                />
              </div>

              {/* Form Action Controls */}
              <div className="form-actions-row">
                <button type="submit" className="submit-task-btn">
                  <span>⚡</span>
                  <span>Create Direct Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppName('');
                    setAppImage('');
                    setDescription('');
                    setReferralCode('');
                    setAppLink('');
                    setRewardBadge('');
                  }}
                  className="clear-form-btn"
                >
                  Clear Form
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right: Live Interactive Card Preview */}
        <div className="live-preview-panel">
          <div className="preview-panel-header">
            <span className="preview-indicator" />
            <span className="preview-title">LIVE PREVIEW</span>
            <span className="preview-badge">What users see</span>
          </div>

          <div className="preview-card-wrap">
            <div className="task-card preview-active">
              <div className="task-card-top">
                <div className="task-avatar-wrap">
                  <img
                    src={appImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=160&auto=format&fit=crop&q=80'}
                    alt={appName || 'App Preview'}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/120x120/4f46e5/ffffff?text=App';
                    }}
                    className="task-avatar-img"
                  />
                </div>
                <div className="task-title-group">
                  <div className="task-tag-row">
                    <span className="reward-tag">
                      {rewardBadge || 'Direct Reward'}
                    </span>
                    <span className="instant-badge">⚡ Instant</span>
                  </div>
                  <h3 className="task-app-title">
                    {appName || 'Sample App Name'}
                  </h3>
                </div>
              </div>

              <p className="task-desc">
                {description || 'Direct reward zero waiting signup with these codes and the apps will send your rewards directly to you.'}
              </p>

              {/* Promo Code Box */}
              <div className="task-code-box">
                <div className="code-info">
                  <span className="code-label">PROMO CODE</span>
                  <strong className="code-text">
                    {referralCode || 'YOURCODE'}
                  </strong>
                </div>
                <button type="button" className="mock-copy-btn">
                  📋 Copy
                </button>
              </div>

              {/* CTA link */}
              <div className="task-cta-row">
                <button type="button" className="mock-open-btn">
                  <span>Open Direct Link</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Created Tasks List Section */}
      <section className="created-tasks-section">
        <div className="section-header-row">
          <div>
            <div className="title-with-badge">
              <h2 className="section-heading">Published Direct Tasks</h2>
              <span className="tasks-count-pill">{filteredTasks.length} Offers</span>
            </div>
            <p className="section-subheading">
              Apps listed below are currently available in the Direct module.
            </p>
          </div>

          {/* Controls: Search & Filter Tabs */}
          <div className="tasks-filter-controls">
            <div className="filter-pill-group">
              <button
                type="button"
                className={`filter-tab ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                className={`filter-tab ${filterMode === 'with-code' ? 'active' : ''}`}
                onClick={() => setFilterMode('with-code')}
              >
                With Codes ({tasks.filter(t => t.referralCode).length})
              </button>
            </div>

            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search direct tasks..."
                className="search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="clear-search-btn"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks-card">
            <div className="empty-icon-circle">⚡</div>
            <h3 className="empty-title">No Direct Tasks Found</h3>
            <p className="empty-desc">
              {searchTerm ? 'No tasks match your search filter.' : 'Use the creator form above to add your first direct payout app.'}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="reset-filter-btn"
              >
                Reset Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map((task) => (
              <div key={task.id} className="task-card">
                {/* Card Top: Logo, Tags & Name */}
                <div className="task-card-top">
                  <div className="task-avatar-wrap">
                    <img
                      src={task.appImage}
                      alt={task.appName}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/120x120/4f46e5/ffffff?text=App';
                      }}
                      className="task-avatar-img"
                    />
                  </div>
                  
                  <div className="task-title-group">
                    <div className="task-tag-row">
                      <span className="reward-tag">
                        {task.rewardBadge || 'Direct Reward'}
                      </span>
                      <span className="instant-badge">⚡ Instant</span>
                      {task.createdAt && (
                        <span className="date-tag">{task.createdAt}</span>
                      )}
                    </div>
                    <h3 className="task-app-title">{task.appName}</h3>
                  </div>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="task-desc">{task.description}</p>
                )}

                {/* Referral Code Pill Bar */}
                {task.referralCode ? (
                  <div className="task-code-box">
                    <div className="code-info">
                      <span className="code-label">PROMO CODE</span>
                      <strong className="code-text">{task.referralCode}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(task.referralCode, task.id)}
                      className={`copy-code-btn ${copiedCodeId === task.id ? 'is-copied' : ''}`}
                    >
                      {copiedCodeId === task.id ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                ) : (
                  <div className="task-code-box no-code">
                    <span className="no-code-text">✨ No referral code needed — Direct link reward</span>
                  </div>
                )}

                {/* Card Bottom CTA Actions */}
                <div className="task-actions-footer">
                  <a
                    href={task.appLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="visit-link-btn"
                  >
                    <span>Open Direct Link</span>
                    <span className="arrow-icon">↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id, task.appName)}
                    className="delete-task-btn"
                    title="Remove Task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scoped CSS styling for ultra-rich visuals */}
      <style>{`
        .admin-direct-root {
          display: flex;
          flex-direction: column;
          gap: 28px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          padding-bottom: 40px;
        }

        /* Floating Toast Alert */
        .direct-floating-toast {
          position: fixed;
          top: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #ffffff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
          animation: slideToastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .direct-floating-toast.success {
          background: linear-gradient(135deg, #10b981, #059669);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .direct-floating-toast.info {
          background: linear-gradient(135deg, #4f46e5, #3b82f6);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .toast-icon {
          font-size: 1.1rem;
          font-weight: 800;
        }
        @keyframes slideToastIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* 1. Hero Card */
        .direct-hero-card {
          position: relative;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%), var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 28px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        .hero-glow-blob {
          position: absolute;
          top: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.22) 0%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 1;
        }
        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          border-radius: 999px;
          background: rgba(79, 70, 229, 0.14);
          border: 1px solid rgba(79, 70, 229, 0.3);
          width: fit-content;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 8px #10b981;
          animation: pulseGlow 1.8s infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .hero-badge-text {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: var(--accent-indigo, #4f46e5);
        }
        .hero-title {
          font-family: var(--font-display);
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: -0.02em;
        }
        .gradient-text {
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-quote-box {
          display: flex;
          align-items: stretch;
          background: rgba(79, 70, 229, 0.06);
          border: 1px solid rgba(79, 70, 229, 0.2);
          border-radius: 12px;
          overflow: hidden;
          max-width: 780px;
          margin-top: 4px;
        }
        .quote-accent-bar {
          width: 4px;
          background: linear-gradient(180deg, #4f46e5, #06b6d4);
          flex-shrink: 0;
        }
        .quote-text-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
        }
        .quote-icon {
          font-size: 1.3rem;
          flex-shrink: 0;
        }
        .hero-quote-text {
          margin: 0;
          font-size: 0.92rem;
          color: var(--text-primary);
          line-height: 1.55;
          font-weight: 500;
        }

        /* Stats Panel */
        .hero-stats-panel {
          display: flex;
          flex-direction: column;
          gap: 10px;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .hero-stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 12px 20px;
          min-width: 170px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
          transition: transform 0.2s, border-color 0.2s;
        }
        .hero-stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(79, 70, 229, 0.4);
        }
        .hero-stat-card.accent {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.05));
          border-color: rgba(16, 185, 129, 0.25);
        }
        .stat-num {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .hero-stat-card.accent .stat-num {
          color: var(--accent-emerald, #10b981);
        }
        .stat-lbl {
          font-size: 0.76rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* 2. Workspace Two-Column Grid */
        .direct-workspace-grid {
          display: grid;
          grid-template-columns: 1fr 370px;
          gap: 24px;
          align-items: start;
        }

        .direct-form-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }
        .form-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 22px;
          gap: 16px;
        }
        .form-card-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .form-card-subtitle {
          margin: 0;
          font-size: 0.86rem;
          color: var(--text-secondary);
        }
        .toggle-form-btn {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-form-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }

        .direct-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .form-row-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .input-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .required-star {
          color: #ef4444;
          font-weight: 700;
        }
        .hint-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 400;
        }
        .styled-input {
          width: 100%;
          padding: 11px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 9px;
          color: var(--text-primary);
          font-size: 0.88rem;
          outline: none;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .styled-input:focus {
          border-color: var(--accent-indigo, #4f46e5);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
          background: rgba(79, 70, 229, 0.02);
        }
        .uppercase-code {
          font-family: monospace;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .image-input-split {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .image-url-input {
          flex: 1;
        }
        .file-upload-btn {
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          border-radius: 9px;
          color: var(--text-primary);
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .file-upload-btn:hover {
          background: rgba(79, 70, 229, 0.1);
          border-color: rgba(79, 70, 229, 0.3);
          color: var(--accent-indigo, #4f46e5);
        }
        .hidden-file-input {
          display: none;
        }

        .styled-textarea {
          width: 100%;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 9px;
          color: var(--text-primary);
          font-size: 0.88rem;
          outline: none;
          resize: vertical;
          box-sizing: border-box;
          font-family: inherit;
          line-height: 1.5;
          transition: all 0.2s ease;
        }
        .styled-textarea:focus {
          border-color: var(--accent-indigo, #4f46e5);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        }

        .form-actions-row {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-top: 6px;
        }
        .submit-task-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
          color: #ffffff;
          border: none;
          padding: 12px 26px;
          border-radius: 9px;
          font-weight: 700;
          font-size: 0.92rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);
          transition: all 0.25s ease;
        }
        .submit-task-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(79, 70, 229, 0.45);
        }
        .submit-task-btn:active {
          transform: translateY(0);
        }
        .clear-form-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 12px 20px;
          border-radius: 9px;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .clear-form-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text-primary);
        }

        /* Live Preview Panel */
        .live-preview-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          position: sticky;
          top: 24px;
        }
        .preview-panel-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }
        .preview-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--accent-indigo, #4f46e5);
        }
        .preview-title {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--text-primary);
        }
        .preview-badge {
          margin-left: auto;
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .preview-card-wrap {
          display: flex;
          flex-direction: column;
        }
        .task-card.preview-active {
          border-color: rgba(79, 70, 229, 0.35);
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.12);
        }

        /* 3. Created Tasks Section */
        .created-tasks-section {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        .section-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
        }
        .title-with-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-heading {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }
        .tasks-count-pill {
          background: rgba(79, 70, 229, 0.12);
          color: var(--accent-indigo, #4f46e5);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid rgba(79, 70, 229, 0.25);
        }
        .section-subheading {
          margin: 4px 0 0;
          font-size: 0.86rem;
          color: var(--text-secondary);
        }

        .tasks-filter-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .filter-pill-group {
          display: flex;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 3px;
          gap: 2px;
        }
        .filter-tab {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 6px 14px;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-tab.active {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .search-input-wrap {
          position: relative;
          min-width: 240px;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.85rem;
          opacity: 0.6;
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 9px 32px 9px 34px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 9px;
          color: var(--text-primary);
          font-size: 0.86rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .search-input:focus {
          border-color: var(--accent-indigo, #4f46e5);
        }
        .clear-search-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 0.75rem;
          cursor: pointer;
        }

        /* Tasks Grid & Card */
        .tasks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 20px;
        }

        .task-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 14px;
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          position: relative;
        }
        .task-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border-color: rgba(79, 70, 229, 0.35);
        }

        .task-card-top {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .task-avatar-wrap {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          box-shadow: 0 3px 10px rgba(0,0,0,0.06);
        }
        .task-avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .task-title-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }
        .task-tag-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .reward-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(16, 185, 129, 0.12);
          color: var(--accent-emerald, #10b981);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .instant-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 6px;
          background: rgba(79, 70, 229, 0.1);
          color: var(--accent-indigo, #4f46e5);
          border: 1px solid rgba(79, 70, 229, 0.2);
        }
        .date-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-left: auto;
        }
        .task-app-title {
          font-family: var(--font-display);
          font-size: 1.08rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.35;
        }

        .task-desc {
          margin: 0;
          font-size: 0.86rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Code box */
        .task-code-box {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(79, 70, 229, 0.06);
          border: 1px dashed rgba(79, 70, 229, 0.35);
          border-radius: 10px;
          padding: 8px 14px;
        }
        .task-code-box.no-code {
          background: rgba(255, 255, 255, 0.02);
          border-style: solid;
          border-color: var(--border-color);
          justify-content: center;
        }
        .no-code-text {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .code-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .code-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.05em;
        }
        .code-text {
          font-family: monospace;
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--accent-indigo, #4f46e5);
          letter-spacing: 0.06em;
        }
        .copy-code-btn {
          background: rgba(79, 70, 229, 0.12);
          border: 1px solid rgba(79, 70, 229, 0.25);
          color: var(--accent-indigo, #4f46e5);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .copy-code-btn:hover {
          background: var(--accent-indigo, #4f46e5);
          color: #ffffff;
        }
        .copy-code-btn.is-copied {
          background: #10b981;
          color: #ffffff;
          border-color: #10b981;
        }

        .mock-copy-btn {
          background: rgba(79, 70, 229, 0.12);
          border: 1px solid rgba(79, 70, 229, 0.25);
          color: var(--accent-indigo, #4f46e5);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 7px;
          pointer-events: none;
        }

        /* Card Footer Actions */
        .task-actions-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: auto;
          padding-top: 4px;
        }
        .visit-link-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(6, 182, 212, 0.12));
          color: var(--accent-indigo, #4f46e5);
          border: 1px solid rgba(79, 70, 229, 0.25);
          padding: 9px 16px;
          border-radius: 9px;
          font-size: 0.86rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .visit-link-btn:hover {
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          color: #ffffff;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.3);
        }
        .arrow-icon {
          font-size: 0.95rem;
          transition: transform 0.2s;
        }
        .visit-link-btn:hover .arrow-icon {
          transform: translate(2px, -2px);
        }

        .mock-open-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: rgba(79, 70, 229, 0.12);
          color: var(--accent-indigo, #4f46e5);
          border: 1px solid rgba(79, 70, 229, 0.25);
          padding: 9px 16px;
          border-radius: 9px;
          font-size: 0.86rem;
          font-weight: 600;
          pointer-events: none;
        }

        .delete-task-btn {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 9px 13px;
          border-radius: 9px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .delete-task-btn:hover {
          background: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        /* Empty state */
        .empty-tasks-card {
          background: var(--bg-card);
          border: 1px dashed var(--border-color);
          border-radius: 16px;
          padding: 56px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-icon-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: rgba(79, 70, 229, 0.1);
          color: var(--accent-indigo, #4f46e5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }
        .empty-title {
          font-family: var(--font-display);
          font-size: 1.2rem;
          color: var(--text-primary);
          margin: 0;
        }
        .empty-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          max-width: 420px;
          margin: 0;
          line-height: 1.5;
        }
        .reset-filter-btn {
          margin-top: 6px;
          background: rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(79, 70, 229, 0.25);
          color: var(--accent-indigo, #4f46e5);
          padding: 8px 18px;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .direct-hero-card {
            flex-direction: column;
            align-items: flex-start;
          }
          .hero-stats-panel {
            flex-direction: row;
            width: 100%;
          }
          .hero-stat-card {
            flex: 1;
            min-width: 0;
          }
          .direct-workspace-grid {
            grid-template-columns: 1fr;
          }
          .live-preview-panel {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .hero-stats-panel {
            flex-direction: column;
          }
          .form-row-2col {
            grid-template-columns: 1fr;
          }
          .tasks-grid {
            grid-template-columns: 1fr;
          }
          .section-header-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .tasks-filter-controls {
            width: 100%;
          }
          .search-input-wrap {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
