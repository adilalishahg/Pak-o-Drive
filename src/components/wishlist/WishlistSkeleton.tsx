import React from 'react';

export function WishlistSkeleton() {
  return (
    <div className="row g-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-3">
          <div
            className="skeleton bg-white border border-slate-100 rounded-4"
            style={{ height: '320px' }}
          />
        </div>
      ))}
    </div>
  );
}
