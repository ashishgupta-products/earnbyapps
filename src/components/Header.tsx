"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp, UserRole } from '../context/AppContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import AppLogo from './AppLogo';
import BrandLogo from './BrandLogo';

export default function Header() {
  const pathname = usePathname();
  const { userRole, userProfile, walletBalance, login, logout } = useApp();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const { data: session } = useSession();

  // Hide global navbar on dashboard pages ONLY IF the user has access to them.
  // If access is denied (wrong role), show the navbar so they can switch roles.
  const hasAdminAccess = pathname.startsWith('/admin') && userRole === 'admin';
  const hasPartnerAccess = pathname.startsWith('/partner') && userRole === 'user';
  if (hasAdminAccess || hasPartnerAccess) {
    return null;
  }


  return (
    <header className="site-header">
      <div className="nav-container">
        <Link href="/" className="logo-wrapper">
          <AppLogo size={36} showSparkle />
          <BrandLogo fontSize="1.35rem" />
        </Link>
        
        <div className="header-actions">
          {/* Earner Live Wallet Balance Badge */}
          {((session && session.user) || userProfile) && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-wallet-modal'))}
              className="wallet-header-btn"
              title="View Wallet Balance & Request Withdrawal"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '20px',
                color: 'var(--accent-emerald)',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>👛</span>
              <span>₹{((userProfile as any)?.balance ?? (session?.user as any)?.balance ?? walletBalance ?? 0).toFixed(2)}</span>
            </button>
          )}

          {/* User role menu (Auth dropdown) */}
          <div className="auth-menu-container">
            {(session && session.user) || userProfile ? (
              <>
                <button 
                  className="role-selector-btn" 
                  onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {session?.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="User avatar" 
                      style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span>👤</span>
                  )}
                  <span className="role-text-lbl">
                    {session?.user?.name || userProfile?.fullName || 'My Account'}
                  </span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
                </button>

                {showAuthDropdown && (
                  <div className="glass-card auth-dropdown">
                    <div style={{ padding: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)', margin: '4px 0' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {session?.user ? 'Google Account' : 'Account Profile'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '4px' }}>
                        {session?.user?.image ? (
                          <img 
                            src={session.user.image} 
                            alt="Google avatar" 
                            style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }} 
                          />
                        ) : (
                          <span>🇮🇳</span>
                        )}
                        <span>{session?.user?.name || userProfile?.fullName || 'Earner'}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📧 {session?.user?.email || userProfile?.email || 'N/A'}
                      </div>
                      <button 
                        onClick={() => {
                          setShowAuthDropdown(false);
                          if (session) signOut();
                          logout();
                        }}
                        className="dropdown-item link-item"
                        style={{ padding: '6px 0 0', marginTop: '8px', border: 'none', background: 'transparent', width: '100%', textAlign: 'left', fontSize: '0.78rem', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        🚪 Sign Out
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setShowAuthDropdown(false);
                        window.dispatchEvent(new CustomEvent('open-wallet-modal'));
                      }}
                      className="dropdown-item link-item"
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        font: 'inherit',
                        color: 'var(--accent-emerald)',
                        fontWeight: 600
                      }}
                    >
                      👛 Wallet & Withdrawals (Min ₹20)
                    </button>

                    <button
                      onClick={() => {
                        setShowAuthDropdown(false);
                        window.dispatchEvent(new CustomEvent('open-profile-modal'));
                      }}
                      className="dropdown-item link-item"
                      style={{
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        font: 'inherit'
                      }}
                    >
                      💳 Payout & Profile Settings
                    </button>

                    {userRole === 'user' && (
                      <Link href="/partner/create-campaign" onClick={() => setShowAuthDropdown(false)} className="dropdown-item link-item">
                        ➡️ Go to Partner Portal
                      </Link>
                    )}

                    {userRole === 'admin' && (
                      <Link href="/admin" onClick={() => setShowAuthDropdown(false)} className="dropdown-item link-item">
                        ➡️ Go to Admin Moderation
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="role-selector-btn"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-indigo), #0ea5e9)',
                  color: 'white',
                  fontWeight: 'bold',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                👤 My Account
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
          transition: background-color 0.2s, border-color 0.2s;
        }
        .nav-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px 24px;
        }
        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          transition: opacity 0.2s ease;
        }
        .logo-wrapper:hover {
          opacity: 0.9;
        }
        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .offerwall-btn {
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-primary);
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }
        .offerwall-btn:hover, .offerwall-btn.active {
          background: var(--bg-card-hover);
          border-color: var(--border-hover);
        }
        .auth-menu-container {
          position: relative;
        }
        .role-selector-btn {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          padding: 8px 12px;
          border-radius: 6px;
          font-family: var(--font-primary);
          font-weight: 500;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .role-selector-btn:hover {
          border-color: var(--border-hover);
          background: var(--bg-card-hover);
        }
        .role-text-lbl {
          text-transform: capitalize;
        }
        .auth-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 250px;
          padding: 12px;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: var(--shadow-premium);
          z-index: 110;
        }
        .dropdown-title {
          font-family: var(--font-display);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .dropdown-item {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-secondary);
          padding: 8px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: left;
          transition: all 0.2s;
          display: block;
          text-decoration: none;
        }
        .dropdown-item:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary);
        }
        .dropdown-item.active {
          background: rgba(79, 70, 229, 0.08);
          color: var(--accent-indigo);
          border-color: rgba(79, 70, 229, 0.15);
        }
        .link-item {
          color: var(--accent-indigo);
          font-weight: 600;
        }
        .logout-btn {
          margin-top: 4px;
          color: rgba(239, 68, 68, 0.8);
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.05);
          color: rgba(239, 68, 68, 1);
        }
        @media (max-width: 768px) {
          .nav-container {
            padding: 12px 16px;
          }
          .role-selector-btn .role-text-lbl {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
