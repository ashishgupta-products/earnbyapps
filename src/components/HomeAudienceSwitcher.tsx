"use client";

import React from 'react';

export interface HomeAudienceSwitcherProps {
  activeMode: 'earn' | 'grow';
  onModeChange: (mode: 'earn' | 'grow') => void;
}

export default function HomeAudienceSwitcher({
  activeMode,
  onModeChange,
}: HomeAudienceSwitcherProps) {
  return (
    <div className="home-audience-switcher-wrap">
      <div className="home-audience-switcher" role="tablist" aria-label="Audience Selector">
        {/* Animated Sliding Glider Background */}
        <div 
          className={`switcher-glider ${activeMode === 'grow' ? 'glider-grow' : 'glider-earn'}`} 
          aria-hidden="true" 
        />

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'earn'}
          className={`switcher-tab tab-earn ${activeMode === 'earn' ? 'is-active' : ''}`}
          onClick={() => onModeChange('earn')}
          id="switcher-to-earn"
        >
          <span className="tab-icon">💰</span>
          <span className="tab-title">To Earn</span>
          <span className="tab-badge">For Users</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeMode === 'grow'}
          className={`switcher-tab tab-grow ${activeMode === 'grow' ? 'is-active' : ''}`}
          onClick={() => onModeChange('grow')}
          id="switcher-to-grow"
        >
          <span className="tab-icon">🚀</span>
          <span className="tab-title">To Grow</span>
          <span className="tab-badge">For Businesses</span>
        </button>
      </div>

      <style>{`
        .home-audience-switcher-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 22px 16px 10px;
          box-sizing: border-box;
          position: relative;
          z-index: 20;
        }
        .home-audience-switcher {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 9999px;
          padding: 5px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 480px;
          user-select: none;
        }

        /* Smooth Sliding Glider */
        .switcher-glider {
          position: absolute;
          top: 5px;
          bottom: 5px;
          left: 5px;
          width: calc(50% - 5px);
          border-radius: 9999px;
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      background 0.35s ease,
                      box-shadow 0.35s ease;
          pointer-events: none;
          z-index: 1;
        }
        .switcher-glider.glider-earn {
          transform: translateX(0%);
          background: linear-gradient(135deg, #3A5998 0%, #2b4374 100%);
          box-shadow: 0 4px 14px rgba(58, 89, 152, 0.35);
        }
        .switcher-glider.glider-grow {
          transform: translateX(100%);
          background: linear-gradient(135deg, #EAA812 0%, #c98a08 100%);
          box-shadow: 0 4px 14px rgba(234, 168, 18, 0.38);
        }

        /* Interactive Tabs */
        .switcher-tab {
          position: relative;
          z-index: 2;
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 9999px;
          border: none;
          background: transparent;
          color: var(--text-secondary, #475569);
          cursor: pointer;
          transition: color 0.25s ease, transform 0.15s ease;
          outline: none;
          user-select: none;
          text-decoration: none;
          white-space: nowrap;
        }
        .switcher-tab:active {
          transform: scale(0.97);
        }
        .switcher-tab:hover:not(.is-active) {
          color: var(--text-primary, #0f172a);
        }
        .switcher-tab.is-active {
          color: #ffffff;
        }
        .switcher-tab.tab-earn.is-active {
          text-shadow: 0 1px 2px rgba(15, 23, 42, 0.3);
        }
        .switcher-tab.tab-grow.is-active {
          text-shadow: 0 1px 2px rgba(120, 53, 15, 0.35);
        }

        .tab-icon {
          font-size: 1.1rem;
          line-height: 1;
          transition: transform 0.25s ease;
        }
        .switcher-tab.is-active .tab-icon {
          transform: scale(1.1);
        }
        .tab-title {
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .tab-badge {
          font-size: 0.72rem;
          padding: 2.5px 8px;
          border-radius: 9999px;
          font-weight: 700;
          transition: all 0.25s ease;
        }
        .switcher-tab.is-active .tab-badge {
          background: rgba(0, 0, 0, 0.25);
          color: #ffffff;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.15);
        }
        .switcher-tab:not(.is-active) .tab-badge {
          background: var(--bg-card-hover, #f1f5f9);
          color: var(--text-muted, #64748b);
          border: 1px solid var(--border-color, #e2e8f0);
        }

        @media (max-width: 640px) {
          .home-audience-switcher-wrap {
            padding: 14px 12px 6px;
          }
          .home-audience-switcher {
            max-width: 100%;
            padding: 4px;
          }
          .switcher-glider {
            top: 4px;
            bottom: 4px;
            left: 4px;
            width: calc(50% - 4px);
          }
          .switcher-tab {
            padding: 8px 10px;
            gap: 6px;
          }
          .tab-icon {
            font-size: 1rem;
          }
          .tab-title {
            font-size: 0.88rem;
          }
          .tab-badge {
            font-size: 0.65rem;
            padding: 2px 6px;
          }
        }

        @media (max-width: 360px) {
          .switcher-tab {
            padding: 7px 6px;
            gap: 4px;
          }
          .tab-icon {
            display: none;
          }
          .tab-title {
            font-size: 0.82rem;
          }
          .tab-badge {
            font-size: 0.62rem;
            padding: 1.5px 5px;
          }
        }
      `}</style>
    </div>
  );
}
