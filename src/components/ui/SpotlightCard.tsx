'use client';

import React, { useRef, useCallback } from 'react';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
  size?: number; // size of the radial spotlight circle in px
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(234, 88, 12, 0.12)', // brand orange subtle glow
  borderColor = 'rgba(234, 88, 12, 0.3)',
  size = 350,
  style = {},
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty('--spotlight-x', `${x}px`);
    cardRef.current.style.setProperty('--spotlight-y', `${y}px`);
    cardRef.current.style.setProperty('--spotlight-opacity', '1');
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty('--spotlight-opacity', '0');
  }, []);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={`spotlight-card relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        '--spotlight-color': spotlightColor,
        '--spotlight-border': borderColor,
        '--spotlight-size': `${size}px`,
        '--spotlight-opacity': '0',
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: 'var(--spotlight-opacity)',
          background: `radial-gradient(var(--spotlight-size) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-color), transparent 70%)`,
        }}
      />
      {/* Border Spotlight Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 rounded-[inherit]"
        style={{
          opacity: 'var(--spotlight-opacity)',
          background: `radial-gradient(var(--spotlight-size) circle at var(--spotlight-x) var(--spotlight-y), var(--spotlight-border), transparent 70%)`,
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
