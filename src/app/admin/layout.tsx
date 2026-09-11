"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useSession, signOut } from 'next-auth/react';
import AppLogo from '../../components/AppLogo';
import BrandLogo from '../../components/BrandLogo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userRole } = useApp();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingPayoutsCount, setPendingPayoutsCount] = useState<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  useEffect(() => {
    async function loadPendingPayouts() {
      try {
        const res = await fetch('/api/payouts');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.pendingCount === 'number') {
            setPendingPayoutsCount(data.pendingCount);
          }
        }
      } catch (e) {
        // silent
      }
    }
    loadPendingPayouts();
  }, [pathname]);

  const handleToggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem('admin-sidebar-collapsed', String(newVal));
  };

  if (userRole !== 'admin') {
    return (
      <main className="admin-denied-container">
        <div className="glass-card restriction-card">
          <span className="restriction-icon">🔒</span>
          <h2>Access Denied</h2>
          <p>You must select the <strong>Administrator</strong> role from the top-right account menu to access this moderation dashboard.</p>
        </div>
        <style>{`
          .admin-denied-container {
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

  const menuItems = [
    { id: 'Overview', label: 'Overview', href: '/admin', icon: '🏠' },
    { id: 'Analytics', label: 'Analytics', href: '/admin/analytics', icon: '📊' },
    { id: 'New Campaign', label: 'New Campaign', href: '/admin/new-campaign', icon: '➕' },
    { id: 'All Campaigns', label: 'All Campaigns', href: '/admin/all-campaigns', icon: '📁' },
    { id: 'New Leads for Partnership', label: 'New Leads for Partnership', href: '/admin/partnership-leads', icon: '📝' },
    { id: 'All Submissions', label: 'All Submissions', href: '/admin/submissions', icon: '✔️' },
    { id: 'Manage Users', label: 'Manage Users', href: '/admin/users', icon: '👤' },
    { id: 'Wallet & Payouts', label: 'Wallet & Payouts', href: '/admin/wallet', icon: '💰', badge: pendingPayoutsCount > 0 ? pendingPayoutsCount : undefined },
    { id: 'Partner Support', label: 'Partner Support', href: '/admin/support', icon: '💬' },
    { id: 'Manage Banners', label: 'Manage Banners', href: '/admin/banners', icon: '🖼️' },
    { id: 'Manage Blog', label: 'Manage Blog', href: '/admin/blog', icon: '📰' },
    { id: 'Manage Referrals', label: 'Manage Referrals', href: '/admin/referrals', icon: '🔗' }
  ];

  const activeItem = menuItems.find(item => {
    if (item.href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(item.href);
  });

  const activeTitle = activeItem ? activeItem.label : 'Overview';

  return (
    <div className="admin-dashboard-root">
      
      {/* Sidebar Navigation */}
      <aside className={`admin-nav-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '16px 8px' : '16px 20px' }}>
          {!isCollapsed ? (
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AppLogo size={28} />
              <BrandLogo fontSize="1.05rem" />
            </Link>
          ) : (
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
              <AppLogo size={28} />
            </Link>
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
          {menuItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`menu-item-btn ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="menu-item-icon">{item.icon}</span>
                {!isCollapsed && (
                  <span className="menu-item-lbl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span style={{
                        background: '#f59e0b',
                        color: 'black',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '8px',
                        marginLeft: 'auto'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content viewport */}
      <div className="admin-content-viewport">
        {/* Top Header Bar */}
        <header className="viewport-header-bar">
          <h1 className="active-tab-title">{activeTitle}</h1>
          <div className="admin-profile-display" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {session && session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Admin avatar" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <span className="admin-avatar">👤</span>
              )}
              <span className="admin-profile-name">Hi, {session?.user?.name || 'Admin User'}</span>
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

        {/* Scrollable Content */}
        <div className="viewport-scrollable-content">
          {children}
        </div>
      </div>

      <style>{`
        .admin-dashboard-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg-dark);
          color: var(--text-primary);
        }
        
        /* Navigation Sidebar */
        .admin-nav-sidebar {
          width: 260px;
          background: var(--bg-card);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          overflow-y: auto;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s, border-color 0.2s;
        }
        .admin-nav-sidebar.collapsed {
          width: 70px;
        }
        .sidebar-header {
          height: 69px !important;
          padding: 0 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 10px !important;
          border-bottom: 1px solid var(--border-color) !important;
          box-sizing: border-box !important;
        }
        .admin-nav-sidebar.collapsed .sidebar-header {
          padding: 0 !important;
          justify-content: center !important;
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
        .admin-nav-sidebar.collapsed .sidebar-toggle-btn {
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
        .admin-nav-sidebar.collapsed .menu-item-btn {
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
        .admin-content-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.02);
        }
        body.light-theme .admin-content-viewport {
          background: #f1f5f9;
        }
        .viewport-header-bar {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 69px !important;
          flex-shrink: 0;
          box-sizing: border-box !important;
          transition: background-color 0.2s, border-color 0.2s;
        }
        .active-tab-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .admin-profile-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .admin-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
        .admin-profile-name {
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
        
        @media (max-width: 768px) {
          .admin-nav-sidebar {
            width: 70px !important;
          }
          .admin-nav-sidebar .menu-item-lbl,
          .admin-nav-sidebar .sidebar-badge-text,
          .admin-nav-sidebar .sidebar-badge-icon {
            display: none !important;
          }
          .admin-nav-sidebar .sidebar-header {
            padding: 0 !important;
            justify-content: center !important;
          }
          .admin-nav-sidebar .menu-item-btn {
            justify-content: center !important;
            padding: 10px 0 !important;
          }
          .admin-nav-sidebar .sidebar-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
