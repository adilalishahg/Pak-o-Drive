'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRecentSales } from '@/hooks/useRecentSales';
import { isBlogPath } from '@/lib/constants';

export default function LiveSalesNotification() {
  const pathname = usePathname();
  const { currentSale, visible, dismiss } = useRecentSales();

  // Hide completely on blog, checkout, admin, or tracking pages to prevent distraction
  if (
    !currentSale ||
    !visible ||
    isBlogPath(pathname) ||
    pathname.startsWith('/admin') ||
    pathname === '/checkout' ||
    pathname === '/order-confirmation'
  ) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-5 z-[1040] hidden sm:flex items-center gap-3 max-w-[340px] bg-white border border-slate-200 rounded-2xl p-3 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
      style={{
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
      }}
    >
      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
        <i className="fas fa-shopping-bag text-sm" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="m-0 text-xs font-bold text-slate-900 leading-tight">
          {currentSale.customer} from {currentSale.city}
        </p>
        <p className="m-0 mt-0.5 text-[11px] text-slate-600 truncate">
          Purchased <strong className="text-[var(--pd-primary,#ea580c)] font-semibold">{currentSale.product}</strong>
        </p>
        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
          <i className="fas fa-check-circle text-emerald-500 text-[9px]" /> Verified COD Order • {currentSale.timeAgo}
        </span>
      </div>

      <button
        onClick={dismiss}
        type="button"
        className="text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer p-1 text-xs"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </aside>
  );
}
