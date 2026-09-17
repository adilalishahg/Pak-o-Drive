import React from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface BlogSearchBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filterCategory: string;
  onFilterCategoryChange: (val: string) => void;
  filterStatus: string;
  onFilterStatusChange: (val: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const BlogSearchBar: React.FC<BlogSearchBarProps> = ({
  search,
  onSearchChange,
  filterCategory,
  onFilterCategoryChange,
  filterStatus,
  onFilterStatusChange,
  onRefresh,
  loading = false,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center gap-3">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search blogs by title, slug, or keywords..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <select
          value={filterCategory}
          onChange={(e) => onFilterCategoryChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Categories</option>
          <option value="Technology & AI">Technology & AI</option>
          <option value="Global & World">Global & World</option>
          <option value="Health & Wellness">Health & Wellness</option>
          <option value="Fashion & Lifestyle">Fashion & Lifestyle</option>
          <option value="Trending & Viral News">Trending & Viral News</option>
          <option value="Automotive & Gadgets">Automotive & Gadgets</option>
          <option value="Car Maintenance">Car Maintenance</option>
          <option value="Auto Electronics">Auto Electronics</option>
          <option value="Driving Tips">Driving Tips</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => onFilterStatusChange(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
          title="Refresh list"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};
