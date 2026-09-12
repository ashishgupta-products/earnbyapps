"use client";

import React from 'react';
import AppLogo from './AppLogo';

export interface BrandLogoProps {
  /** Font size for the text logo (e.g. '1.4rem' or 24). Default is '1.4rem' */
  fontSize?: string | number;
  /** Whether to show the AppLogo badge alongside the text */
  showIcon?: boolean;
  /** Size in pixels for the AppLogo badge if shown */
  iconSize?: number;
  /** Whether to show the sparkle badge on the AppLogo if shown */
  showSparkle?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
}

export default function BrandLogo({
  fontSize = '1.4rem',
  showIcon = false,
  iconSize,
  showSparkle = false,
  className = '',
  style = {},
}: BrandLogoProps) {
  const formattedFontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
  const calculatedIconSize = iconSize ?? (typeof fontSize === 'number' ? Math.round(fontSize * 1.5) : 38);

  return (
    <span
      className={`brand-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        lineHeight: 1,
        textDecoration: 'none',
        userSelect: 'none',
        ...style,
      }}
    >
      {showIcon && (
        <AppLogo size={calculatedIconSize} showSparkle={showSparkle} />
      )}

      <span
        className="brand-logo-text"
        style={{
          fontFamily: 'var(--font-display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
          fontSize: formattedFontSize,
          letterSpacing: '-0.02em',
          display: 'inline-flex',
          alignItems: 'baseline',
          fontWeight: 800,
        }}
      >
        <span style={{ color: '#4f46e5', fontWeight: 800 }}>EarnBy</span>
        <span style={{ color: '#EAA812', fontWeight: 800 }}>Apps</span>
      </span>
    </span>
  );
}
