'use client';

import React from 'react';
import Link from 'next/link';

export interface ShimmerButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  variant?: 'primary' | 'whatsapp' | 'dark' | 'outline';
  asSpan?: boolean;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  onClick,
  href,
  className = '',
  style = {},
  shimmerColor = 'rgba(255, 255, 255, 0.4)',
  shimmerSize = '0.1em',
  borderRadius = '10px',
  shimmerDuration = '2.5s',
  background,
  disabled = false,
  type = 'button',
  icon,
  variant = 'primary',
  asSpan = false,
}) => {
  // Preset styles by variant
  let defaultBg = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)';
  let defaultColor = '#ffffff';
  let defaultShadow = '0 4px 15px rgba(234, 88, 12, 0.35)';

  if (variant === 'whatsapp') {
    defaultBg = 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)';
    defaultShadow = '0 4px 15px rgba(37, 211, 102, 0.35)';
  } else if (variant === 'dark') {
    defaultBg = 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
    defaultShadow = '0 4px 15px rgba(15, 23, 42, 0.35)';
  } else if (variant === 'outline') {
    defaultBg = '#ffffff';
    defaultColor = '#0f172a';
    defaultShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
  }

  const baseStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    borderRadius,
    background: background || defaultBg,
    color: defaultColor,
    boxShadow: defaultShadow,
    overflow: 'hidden',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: variant === 'outline' ? '1.5px solid #e2e8f0' : 'none',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    textDecoration: 'none',
    fontWeight: 700,
    ...style,
  };

  const content = (
    <>
      {/* Moving Shimmer Beam */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ borderRadius }}
      >
        <span
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
            animation: `shimmerSlide ${shimmerDuration} infinite cubic-bezier(0.4, 0, 0.2, 1)`,
            width: '200%',
            transform: 'translateX(-100%)',
          }}
        />
      </span>

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon}
        <span>{children}</span>
      </span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`shimmer-btn-hover ${className}`}
        style={baseStyle}
      >
        {content}
      </Link>
    );
  }

  if (asSpan) {
    return (
      <span
        className={`shimmer-btn-hover ${className}`}
        style={baseStyle}
      >
        {content}
      </span>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`shimmer-btn-hover ${className}`}
      style={baseStyle}
    >
      {content}
    </button>
  );
};
