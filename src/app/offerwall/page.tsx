"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/AppContext';
import { EarningApp } from '../../data/apps';

export default function Offerwall() {
  const { apps } = useApp();

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filtered Apps list for feed
  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      return selectedCategory === 'All' || app.category === selectedCategory;
    });
  }, [selectedCategory, apps]);

  // Helper to get styled SVG icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'App Install & Sign Up':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#06b6d4" d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99ZM17 19H7V5h10v14Zm-4-3h-2v-3H9l3-3 3 3h-2v3Z"/></svg>
        );
      case 'LinkedIn Followers':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#0a66c2" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.8v8.37h2.8v-4.67c0-.25.02-.5.1-.68a1.14 1.14 0 0 1 1-.77c.76 0 1 .58 1 1.42v4.7h2.8M6.5 8.37a1.37 1.37 0 0 0 0-2.75 1.37 1.37 0 0 0 0 2.75M8 18.5V10.1H5.2v8.4H8Z"/></svg>
        );
      case 'Google Maps Reviews':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#ea4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>
        );
      case 'Telegram Members':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#24a1de" d="M9.78 18.65l.28-4.28 7.78-7.03c.34-.3-.07-.47-.52-.18L7.7 13.06l-4.15-1.3c-.9-.28-.92-.9.19-1.34L20 4.15c.8-.3 1.5.18 1.25 1.25l-2.92 13.78c-.22 1.08-.87 1.34-1.78.83l-4.36-3.21-2.11 2.03c-.23.23-.43.43-.87.43z"/></svg>
        );
      case 'WhatsApp Members':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#25d366" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.817 9.817 0 0 0 12.04 2zm5.2 13.41c-.28.79-1.43 1.54-1.97 1.59-.49.05-1.13.07-1.81-.15-.43-.14-1-.34-2.22-.86-2.98-1.25-4.91-4.29-5.06-4.49-.15-.2-1.22-1.63-1.22-3.11 0-1.48.77-2.21 1.05-2.51.28-.3.61-.38.81-.38.2 0 .4 0 .58.01.18.01.43-.07.67.51.25.59.85 2.07.92 2.22.08.15.13.33.03.53-.1.2-.15.33-.3.51-.15.18-.32.4-.45.54-.15.15-.3.32-.13.62.17.3.77 1.27 1.65 2.05.88.78 1.63 1.02 1.93 1.15.3.13.48.11.66-.1.18-.21.77-.9 1-1.2.22-.3.45-.25.76-.14.3.11 1.93.91 2.26 1.07.33.16.55.24.63.38.08.14.08.81-.2 1.6z"/></svg>
        );
      case 'Instagram Followers':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#d62976" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
        );
      case 'Facebook Page Followers':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#1877f2" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
        );
      case 'Youtube Subscribers':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#ff0000" d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.388.556a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107C4.5 20.5 12 20.5 12 20.5s7.5 0 9.388-.556a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
        );
      case 'Trustpilot Reviews':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#00b67a" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        );
      case 'Justdial Reviews':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#ff6a00" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        );
      case 'Play Store Reviews':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#34a853" d="M3.6 2.26c-.3.3-.47.76-.47 1.35v16.79c0 .58.17 1.04.47 1.34l.07.07 9.8-9.8v-.2l-9.8-9.8-.07.07zm13.1 9.74 3.7-2.1c1-.6 1-1.5 0-2.1l-3.7-2.1-3.2 3.2 3.2 3.2zm-4.7 1.5-3.2-3.2-9.8 9.8c.2.2.6.2.9 0l12.1-6.6z"/></svg>
        );
      case 'Custom Task':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#8b5cf6" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
        );
      case 'Gaming':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="var(--accent-indigo)" d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2Zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2Zm4.5 3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm4-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Z"/></svg>
        );
      case 'Surveys':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="var(--accent-teal)" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Zm2 14H7v-2h7v2Zm3-4H7v-2h10v2Zm0-4H7V7h10v2Z"/></svg>
        );
      case 'App Testing':
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#3b82f6" d="M17 1.01 7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99ZM17 19H7V5h10v14Z"/></svg>
        );
      case 'Passive':
      default:
        return (
          <svg viewBox="0 0 24 24" className="svg-icon-offer"><path fill="#10b981" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96Z"/></svg>
        );
    }
  };

  return (
    <main className="app-main">

      {/* Main Container taking full space */}
      <section className="offerwall-dashboard-container">
        
        {/* Directory Feed */}
        <div className="directory-feed">
          
          {/* Category Dropdown */}
          <div className="category-select-container">
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-dropdown"
            >
              <option value="All">All Categories</option>
              <option value="App Install & Sign Up">App Install & Sign Up</option>
              <option value="LinkedIn Followers">LinkedIn Followers</option>
              <option value="Google Maps Reviews">Google Maps Reviews</option>
              <option value="Telegram Members">Telegram Members</option>
              <option value="WhatsApp Members">WhatsApp Members</option>
              <option value="Instagram Followers">Instagram Followers</option>
              <option value="Facebook Page Followers">Facebook Page Followers</option>
              <option value="Youtube Subscribers">Youtube Subscribers</option>
              <option value="Trustpilot Reviews">Trustpilot Reviews</option>
              <option value="Justdial Reviews">Justdial Reviews</option>
              <option value="Play Store Reviews">Play Store Reviews</option>
              <option value="Custom Task">Custom Task</option>
              <option value="Gaming">Gaming</option>
              <option value="Surveys">Surveys</option>
              <option value="App Testing">App Testing</option>
              <option value="Passive">Passive</option>
            </select>
          </div>

          <div id="apps" className="feed-header">
            <h2 className="feed-title">
              {selectedCategory === 'All' ? 'All Earning Campaigns' : `${selectedCategory} Campaigns`}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredApps.length} active listings
            </span>
          </div>

          {/* Grid Container containing the premium styled cards - 3 in each row on desktop */}
          <div className="offers-grid-custom">
            {filteredApps.length > 0 ? (
              filteredApps.map((app, index) => (
                <Link 
                  key={app.id} 
                  href={`/offerwall/taskdetails/${app.id}`}
                  className="offer-task-card"
                  style={{ textDecoration: 'none' }}
                >
                  <div className="offer-card-main">
                    {/* Left Icon with color-coded theme */}
                    <div className={`offer-icon-wrapper ${app.category.toLowerCase().replace(' ', '-')}`}>
                      {getCategoryIcon(app.category)}
                    </div>
                    
                    {/* Middle Info */}
                    <div className="offer-info-center">
                      <h4 className="offer-title">{app.name}</h4>
                      <p className="offer-desc">{app.description}</p>
                    </div>

                    {/* Right Payout Badge */}
                    <div className="offer-payout-pill">
                      <span className="payout-amount">
                        {app.earningRate}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer tags */}
                  <div className="offer-card-footer">
                    <div className="footer-left-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span className="offer-num-tag">Offer {index + 1}</span>
                      <span className="instant-paying-badge">Instant Paying</span>
                      <span className="country-badge" style={{
                        fontSize: '0.75rem',
                        background: 'rgba(13, 148, 136, 0.1)',
                        color: 'var(--accent-teal)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        border: '1px solid rgba(13, 148, 136, 0.15)'
                      }}>
                        🇮🇳 {app.targetCountry || 'India'} ({app.currency || 'INR'})
                      </span>
                    </div>
                    <div className="likes-counter">
                      <span className="like-thumb">👍</span>
                      <span className="like-count">{(app.reviewsCount || 1200 + index * 350).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: 'span 3' }}>
                No campaigns found matching your criteria.
              </div>
            )}
          </div>
        </div>

      </section>

      {/* CSS Stylesheet */}
      <style>{`
        .app-main {
          min-height: calc(100vh - 71px);
          background: var(--bg-dark);
          color: var(--text-primary);
          padding: 40px 0;
          display: flex;
          justify-content: center;
        }

        .offerwall-dashboard-container {
          width: 100%;
          max-width: 1400px;
          padding: 0 32px;
          box-sizing: border-box;
        }

        @media (max-width: 768px) {
          .offerwall-dashboard-container {
            padding: 0 16px;
          }
        }

        .directory-feed {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        /* Category Dropdown Container */
        .category-select-container {
          margin-bottom: 24px;
          max-width: 320px;
        }

        .category-dropdown {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          font-family: var(--font-primary);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='%239ca3af' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
          background-repeat: no-repeat;
          background-position: right 12px center;
          transition: border-color 0.15s;
        }

        .category-dropdown:focus {
          border-color: var(--accent-indigo);
        }

        .feed-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .feed-title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* Custom 3-column grid stretching across full space */
        .offers-grid-custom {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          width: 100%;
        }

        @media (max-width: 1024px) {
          .offers-grid-custom {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
        }

        @media (max-width: 640px) {
          .offers-grid-custom {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }

        /* Mockup Styled Cards */
        .offer-task-card {
          background: var(--bg-card);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px; /* balanced card height */
          box-shadow: var(--shadow-sm);
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.22s, border-color 0.22s;
          box-sizing: border-box;
        }

        .offer-task-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg), 0 12px 20px -8px rgba(79, 70, 229, 0.12);
          border-color: var(--border-hover);
        }

        .offer-card-main {
          display: flex;
          align-items: flex-start; /* align top to handle variable text lengths */
          gap: 16px;
          width: 100%;
        }

        .offer-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* Branded background variations */
        .offer-icon-wrapper.gaming {
          background: rgba(79, 70, 229, 0.1);
        }
        .offer-icon-wrapper.surveys {
          background: rgba(13, 148, 136, 0.1);
        }
        .offer-icon-wrapper.app-testing {
          background: rgba(59, 130, 246, 0.1);
        }
        .offer-icon-wrapper.passive {
          background: rgba(16, 185, 129, 0.1);
        }
        .offer-icon-wrapper.app-install-&-sign-up {
          background: rgba(6, 182, 212, 0.1);
        }
        .offer-icon-wrapper.linkedin-followers {
          background: rgba(10, 102, 194, 0.1);
        }
        .offer-icon-wrapper.google-maps-reviews {
          background: rgba(234, 67, 53, 0.1);
        }
        .offer-icon-wrapper.telegram-members {
          background: rgba(36, 161, 222, 0.1);
        }
        .offer-icon-wrapper.whatsapp-members {
          background: rgba(37, 211, 102, 0.1);
        }
        .offer-icon-wrapper.instagram-followers {
          background: rgba(214, 41, 118, 0.1);
        }
        .offer-icon-wrapper.facebook-page-followers {
          background: rgba(24, 119, 242, 0.1);
        }
        .offer-icon-wrapper.youtube-subscribers {
          background: rgba(255, 0, 0, 0.1);
        }
        .offer-icon-wrapper.trustpilot-reviews {
          background: rgba(0, 182, 122, 0.1);
        }
        .offer-icon-wrapper.justdial-reviews {
          background: rgba(255, 106, 0, 0.1);
        }
        .offer-icon-wrapper.play-store-reviews {
          background: rgba(52, 168, 83, 0.1);
        }
        .offer-icon-wrapper.custom-task {
          background: rgba(139, 92, 246, 0.1);
        }

        .svg-icon-offer {
          width: 26px;
          height: 26px;
        }

        .offer-info-center {
          flex: 1;
          min-width: 0; /* allows text truncation/wrapping */
        }

        .offer-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .offer-desc {
          font-size: 0.88rem;
          color: var(--text-secondary);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        .offer-payout-pill {
          background: rgba(16, 185, 129, 0.1);
          padding: 8px 14px;
          border-radius: 8px;
          font-weight: 800;
          color: var(--accent-emerald);
          font-size: 1.05rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(16, 185, 129, 0.2);
          flex-shrink: 0;
        }

        .offer-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-color);
          padding-top: 14px;
          margin-top: 14px;
          width: 100%;
        }

        .footer-left-tags {
          display: flex;
          gap: 8px;
        }

        .offer-num-tag {
          font-size: 0.75rem;
          background: var(--border-color);
          color: var(--text-secondary);
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
        }

        .instant-paying-badge {
          font-size: 0.75rem;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 700;
        }

        .likes-counter {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
      `}</style>
    </main>
  );
}
