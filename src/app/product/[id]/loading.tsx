import React from 'react';

export default function ProductDetailLoading() {
  return (
    <div className="pd-detail-page bg-[#f4f4f4] min-h-screen">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b border-slate-100 py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 bg-slate-200 rounded-md w-48 animate-pulse" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto mt-3 px-3 sm:px-4">
        {/* Main Product Skeleton Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Gallery Skeleton */}
            <div>
              <div className="aspect-square w-full rounded-2xl bg-slate-100 animate-pulse relative overflow-hidden" />
              <div className="flex gap-2.5 mt-3 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-16 h-16 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                ))}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="h-5 bg-slate-200 rounded-full w-28 animate-pulse" />
              <div className="h-8 bg-slate-200 rounded-xl w-3/4 animate-pulse" />
              <div className="h-4 bg-slate-100 rounded-md w-36 animate-pulse" />

              <div className="h-14 bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div className="h-8 bg-slate-200 rounded-lg w-28 animate-pulse" />
                <div className="h-6 bg-slate-100 rounded-full w-20 animate-pulse" />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <div className="h-4 bg-slate-100 rounded w-full animate-pulse" />
                <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-slate-100 rounded w-4/6 animate-pulse" />
              </div>

              {/* Action Buttons Skeleton */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="h-12 bg-slate-200 rounded-xl animate-pulse" />
                <div className="h-12 bg-orange-200 rounded-xl animate-pulse" />
              </div>

              <div className="h-12 bg-green-100 rounded-xl mt-1 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
