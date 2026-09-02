'use client';

import React from 'react';

export type BadgeVariant = 'discount' | 'new' | 'stock' | 'outOfStock' | 'cod' | 'primary' | 'secondary';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  children,
  className = '',
  style = {},
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'discount':
        return 'bg-gradient-to-r from-red-600 to-rose-500 text-white font-extrabold shadow-sm';
      case 'new':
        return 'bg-amber-600 text-white font-bold shadow-sm';
      case 'stock':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold';
      case 'outOfStock':
        return 'bg-red-50 text-red-700 border border-red-200 font-bold';
      case 'cod':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold';
      case 'secondary':
        return 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold';
      case 'primary':
      default:
        return 'bg-orange-500 text-white font-bold shadow-sm';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider leading-normal py-0.5 select-none ${getVariantStyles()} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
};
