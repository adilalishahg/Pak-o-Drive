'use client';

import React from 'react';

export interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  speed?: number; // duration in seconds
  gap?: string; // e.g. '1.5rem'
  fadeEdges?: boolean;
}

export const Marquee: React.FC<MarqueeProps> = ({
  children,
  className = '',
  reverse = false,
  pauseOnHover = true,
  speed = 35,
  gap = '2rem',
  fadeEdges = true,
}) => {
  return (
    <div
      className={`relative w-full overflow-hidden flex ${className}`}
      style={{
        maskImage: fadeEdges
          ? 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
          : undefined,
        WebkitMaskImage: fadeEdges
          ? 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)'
          : undefined,
      }}
    >
      <div
        className={`flex shrink-0 items-center justify-around ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          gap,
          animation: `${reverse ? 'marqueeReverse' : 'marquee'} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-around ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          gap,
          animation: `${reverse ? 'marqueeReverse' : 'marquee'} ${speed}s linear infinite`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};
