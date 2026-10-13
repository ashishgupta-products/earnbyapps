"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Hide the footer in admin, partner dashboards, homepage, and business page (which have dedicated rich footers)
  if (pathname.startsWith('/admin') || pathname.startsWith('/partner') || pathname === '/' || pathname === '/business') {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} EarnByApps. All rights reserved.</p>
        <div className="footer-links">
          <a href="/partner/privacy">Privacy Policy</a>
          <a href="/partner/terms">Terms of Service</a>
          <a href="/partner/help-center">Support</a>
        </div>
      </div>
      <style>{`
        .site-footer {
          border-top: 1px solid var(--border-color);
          background: var(--bg-card);
          padding: 40px 24px;
          margin-top: 60px;
        }
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .footer-links {
          display: flex;
          gap: 24px;
        }
        .footer-links a {
          color: var(--text-muted);
          transition: color 0.2s ease;
        }
        .footer-links a:hover {
          color: var(--text-secondary);
        }
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
