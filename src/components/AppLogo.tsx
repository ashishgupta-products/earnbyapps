"use client";

import React from 'react';

export interface AppLogoProps {
  /** Size in pixels (width and height). Default is 40px */
  size?: number;
  /** Whether to show the top-right amber sparkle badge */
  showSparkle?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline style overrides */
  style?: React.CSSProperties;
}

export default function AppLogo({
  size = 40,
  showSparkle = false,
  className = '',
  style = {},
}: AppLogoProps) {
  const iconSize = Math.round(size * 0.6);
  const sparkleSize = Math.max(12, Math.round(size * 0.36));
  const sparkleOffset = Math.round(sparkleSize * 0.28);
  const starSize = Math.max(7, Math.round(sparkleSize * 0.65));

  return (
    <div
      className={`app-logo-squircle ${className}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        backgroundColor: '#0F172A', // Midnight Slate
        borderRadius: '30%',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
        boxSizing: 'border-box',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Centered pure white vector Indian Rupee symbol (₹) */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="#FFFFFF"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        <path d="M13.66 7C13.1 5.82 11.9 5 10.5 5L6 5V3H18V5H14.74C15.22 5.58 15.58 6.26 15.79 7H18V9H16C15.73 11.8 13.37 14 10.5 14H9.61L15.89 21H13.11L6.89 14V12H10.5C12.43 12 14 10.43 14 8.5C14 7.96 13.88 7.46 13.66 7Z" />
      </svg>

      {/* Optional top-right circular sparkle badge */}
      {showSparkle && (
        <span
          style={{
            position: 'absolute',
            top: `-${sparkleOffset}px`,
            right: `-${sparkleOffset}px`,
            width: `${sparkleSize}px`,
            height: `${sparkleSize}px`,
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            border: '2px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.12)',
            lineHeight: 1,
            pointerEvents: 'none',
            zIndex: 2,
          }}
          title="Verified Earner Badge"
        >
          {/* Amber 4-point star icon */}
          <svg
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            fill="#D97706"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
        </span>
      )}
    </div>
  );
}
