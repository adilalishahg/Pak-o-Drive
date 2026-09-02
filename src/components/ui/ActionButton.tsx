'use client';

import React from 'react';

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  loading?: boolean;
  icon?: string;
  children: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantStyles = (): string => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200';
      case 'outline':
        return 'border border-slate-300 hover:border-slate-400 bg-transparent text-slate-700 hover:bg-slate-50';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white shadow-sm';
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm';
      case 'primary':
      default:
        return 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-sm';
    }
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-bold rounded-xl px-4 py-2.5 text-sm transition-all active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none ${getVariantStyles()} ${className}`}
      {...props}
    >
      {loading ? (
        <i className="fas fa-spinner fa-spin text-xs" />
      ) : icon ? (
        <i className={`${icon} text-xs`} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
