import React from 'react';
import { BookOpen, CheckCircle, Clock, ShoppingBag } from 'lucide-react';

interface BlogKpiStatsProps {
  total: number;
  totalPublished: number;
  totalDrafts: number;
  totalMonetized: number;
}

export const BlogKpiStats: React.FC<BlogKpiStatsProps> = ({
  total,
  totalPublished,
  totalDrafts,
  totalMonetized,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Articles</span>
          <BookOpen className="w-4 h-4 text-orange-600" />
        </div>
        <span className="text-2xl font-black text-slate-900 block mt-2">{total}</span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-600">Published Live</span>
          <CheckCircle className="w-4 h-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-black text-slate-900 block mt-2">{totalPublished}</span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-600">Drafts / In Progress</span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <span className="text-2xl font-black text-slate-900 block mt-2">{totalDrafts}</span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-indigo-600">Monetized Guides</span>
          <ShoppingBag className="w-4 h-4 text-indigo-600" />
        </div>
        <span className="text-2xl font-black text-slate-900 block mt-2">{totalMonetized}</span>
      </div>
    </div>
  );
};
