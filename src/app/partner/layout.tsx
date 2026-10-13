"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useSession, signOut } from 'next-auth/react';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { userRole, userProfile } = useApp();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('partner-sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const handleToggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('partner-sidebar-collapsed', String(newVal));
  };

  const isLoggedIn = !!session || !!userProfile;
  const isPublicLegalRoute = pathname === '/partner/terms' || pathname === '/partner/privacy';

  if (isPublicLegalRoute) {
    return (
      <div className="partner-public-legal-wrap" style={{ minHeight: '100vh', background: 'var(--bg-dark, #f8fafc)' }}>
        {children}
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="partner-denied-container">
        <div className="glass-card restriction-card">
          <span className="restriction-icon">🔒</span>
          <h2>Access Denied</h2>
          <p>Please log in to access the partner portal.</p>
          <Link 
            href="/login" 
            style={{
              marginTop: '20px',
              padding: '8px 16px',
              background: 'var(--primary-color, #4f46e5)',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Go to Login
          </Link>
        </div>
        <style>{`
          .partner-denied-container {
            max-width: 800px;
            margin: 80px auto;
            padding: 0 24px;
            display: flex;
            justify-content: center;
          }
          .restriction-card {
            padding: 48px;
            text-align: center;
            max-width: 500px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .restriction-icon {
            font-size: 3rem;
            display: block;
            margin-bottom: 20px;
          }
          .restriction-card h2 {
            font-family: var(--font-display);
            font-size: 1.8rem;
            margin-bottom: 12px;
          }
          .restriction-card p {
            color: var(--text-secondary);
            line-height: 1.6;
          }
        `}</style>
      </main>
    );
  }

  if (userRole !== 'user') {
    return (
      <main className="partner-denied-container">
        <div className="glass-card restriction-card">
          <span className="restriction-icon">🔒</span>
          <h2>Access Denied</h2>
          <p>You must select the User role from the top-right account menu to access this partner campaign manager.</p>
        </div>
        <style>{`
          .partner-denied-container {
            max-width: 800px;
            margin: 80px auto;
            padding: 0 24px;
            display: flex;
            justify-content: center;
          }
          .restriction-card {
            padding: 48px;
            text-align: center;
            max-width: 500px;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: var(--shadow-md);
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .restriction-icon {
            font-size: 3rem;
            display: block;
            margin-bottom: 20px;
          }
          .restriction-card h2 {
            font-family: var(--font-display);
            font-size: 1.8rem;
            margin-bottom: 12px;
          }
          .restriction-card p {
            color: var(--text-secondary);
            line-height: 1.6;
          }
        `}</style>
      </main>
    );
  }

  const sidebarItems = [
    { id: 'overview', href: '/partner/overview', label: 'Overview', icon: '🏠' },
    { id: 'campaigns', href: '/partner/campaigns', label: 'My Campaigns', icon: '📋' },
    { id: 'verifications', href: '/partner/verifications', label: 'Verify Submissions', icon: '✅' },
    { id: 'create-campaign', href: '/partner/create-campaign', label: 'Create Campaign', icon: '➕' },
    { id: 'platforms', href: '/partner/platforms', label: 'Platforms', icon: '📱' },
    { id: 'account', href: '/partner/account', label: 'My Account', icon: '👤' },
    { id: 'help-center', href: '/partner/help-center', label: 'Help Center', icon: '❓' }
  ];

  const activeTitle = 
    pathname.includes('/create-campaign') ? 'Create Campaign' : 
    pathname.includes('/campaigns') ? 'My Campaigns' : 
    pathname.includes('/verifications') ? 'Verify Submissions' : 
    pathname.includes('/platforms') ? 'Platforms' : 
    pathname.includes('/account') ? 'My Account' :
    pathname.includes('/help-center') ? 'Help Center' : 'Overview';

  return (
    <div className="partner-portal-root">
      
      {/* 1. Left Navigation Sidebar */}
      <aside className={`partner-nav-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!isCollapsed && (
            <>
              <span className="sidebar-badge-icon">👤</span>
              <span className="sidebar-badge-text">PARTNER</span>
            </>
          )}
          <button 
            className="sidebar-toggle-btn"
            onClick={handleToggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? "»" : "«"}
          </button>
        </div>
        <nav className="sidebar-menu-list">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`menu-item-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="menu-item-icon">{item.icon}</span>
                {!isCollapsed && <span className="menu-item-lbl">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 2. Content viewport */}
      <div className="partner-content-viewport">
        {/* Top Header Bar */}
        <header className="viewport-header-bar">
          <h1 className="active-tab-title">{activeTitle}</h1>
          <div className="partner-profile-display" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {session && session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Partner avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <span className="partner-avatar">👤</span>
              )}
              <span className="partner-profile-name">Hi, {session?.user?.name || userProfile?.fullName || 'Partner User'}</span>
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="logout-btn-header"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              🚪 Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable contents */}
        <div className="viewport-scrollable-content">
          {children}
        </div>
      </div>

      {/* 3. Bottom Navigation Bar (Mobile only) */}
      <nav className="partner-bottom-nav">
        <div className="bottom-nav-list">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <span className="bottom-nav-icon">{item.icon}</span>
                <span className="bottom-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        .partner-portal-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg-dark);
          color: var(--text-primary);
        }
        
        /* Sidebar Navigation */
        .partner-nav-sidebar {
          width: 260px;
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow-y: auto;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s, border-color 0.2s;
        }
        .partner-nav-sidebar.collapsed {
          width: 70px;
        }
        .sidebar-header {
          height: 69px;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
          box-sizing: border-box;
        }
        .partner-nav-sidebar.collapsed .sidebar-header {
          padding: 0;
          justify-content: center;
        }
        .sidebar-badge-icon {
          font-size: 1.25rem;
        }
        .sidebar-badge-text {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-primary);
        }
        .sidebar-toggle-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s;
          padding: 0;
          margin-left: auto;
        }
        .sidebar-toggle-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
          border-color: var(--border-hover);
        }
        .partner-nav-sidebar.collapsed .sidebar-toggle-btn {
          margin-left: 0;
        }
        .sidebar-menu-list {
          padding: 16px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .menu-item-btn {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          padding: 10px 16px;
          border-radius: 8px;
          font-family: var(--font-primary);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
          transition: all 0.2s;
        }
        .partner-nav-sidebar.collapsed .menu-item-btn {
          justify-content: center;
          padding: 10px 0;
        }
        .menu-item-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }
        .menu-item-btn.active {
          background: rgba(79, 70, 229, 0.1);
          color: var(--accent-indigo);
          font-weight: 600;
        }
        .menu-item-icon {
          font-size: 1rem;
        }

        /* Viewport Panel */
        .partner-content-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.02);
        }
        body.light-theme .partner-content-viewport {
          background: #f1f5f9;
        }
        .viewport-header-bar {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 69px;
          flex-shrink: 0;
          box-sizing: border-box;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .active-tab-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .partner-profile-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .partner-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
        .partner-profile-name {
          font-weight: 600;
          color: var(--text-primary);
        }
        .logout-btn-header:hover {
          border-color: #ef4444 !important;
          color: #ef4444 !important;
          background: rgba(239, 68, 68, 0.05) !important;
        }
        .viewport-scrollable-content {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        /* Bottom Navigation (Mobile) */
        .partner-bottom-nav {
          display: none;
        }

        @media (max-width: 768px) {
          .partner-nav-sidebar {
            display: none !important;
          }
          .partner-bottom-nav {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-top: 1px solid var(--border-color);
            z-index: 9999;
            box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.25);
            box-sizing: border-box;
          }
          .bottom-nav-list {
            display: flex;
            height: 100%;
            width: 100%;
            justify-content: space-around;
            align-items: center;
            padding: 0 4px;
          }
          .bottom-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            height: 100%;
            text-decoration: none;
            color: var(--text-secondary);
            transition: all 0.2s ease;
            gap: 4px;
          }
          .bottom-nav-item.active {
            color: var(--accent-indigo);
            font-weight: 600;
          }
          .bottom-nav-icon {
            font-size: 1.25rem;
            transition: transform 0.2s ease;
          }
          .bottom-nav-item:active .bottom-nav-icon {
            transform: scale(0.85);
          }
          .bottom-nav-label {
            font-size: 0.65rem;
            font-weight: 500;
            letter-spacing: 0.01em;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 60px;
          }
          .viewport-header-bar {
            padding: 16px;
          }
          .viewport-scrollable-content {
            padding: 16px 16px 80px 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
