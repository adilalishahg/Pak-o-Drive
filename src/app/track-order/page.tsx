'use client';

import React from 'react';
import { useOrderTracking } from '@/hooks/useOrderTracking';
import { TrackOrderBreadcrumb } from '@/components/track-order/TrackOrderBreadcrumb';
import { OrderSearchCard } from '@/components/track-order/OrderSearchCard';
import { OrderTrackingCard } from '@/components/track-order/OrderTrackingCard';
import { OrderEmptyState } from '@/components/track-order/OrderEmptyState';

export default function TrackOrderPage() {
  const {
    searchType,
    setSearchType,
    inputValue,
    setInputValue,
    orders,
    loading,
    error,
    setError,
    searched,
    expandedId,
    toggleExpand,
    handleSearch,
  } = useOrderTracking();

  return (
    <div style={{ background: '#f4f4f4', minHeight: '100vh', paddingBottom: '32px' }}>
      {/* Breadcrumb Navigation */}
      <TrackOrderBreadcrumb />

      {/* Main Container */}
      <div style={{ maxWidth: '680px', margin: '16px auto 0', padding: '0 12px' }}>
        {/* Search Card */}
        <OrderSearchCard
          searchType={searchType}
          setSearchType={setSearchType}
          inputValue={inputValue}
          setInputValue={setInputValue}
          loading={loading}
          error={error}
          setError={setError}
          onSubmit={handleSearch}
        />

        {/* Search Results */}
        {searched && orders.length > 0 && (
          <div>
            <h5 className="fw-bold text-dark mb-3">
              <i className="fas fa-box-open me-2 text-primary" />
              {orders.length} Order{orders.length > 1 ? 's' : ''} Found
            </h5>

            <div className="d-flex flex-column gap-4">
              {orders.map((order) => (
                <OrderTrackingCard
                  key={order._id}
                  order={order}
                  isExpanded={expandedId === order._id}
                  onToggleExpand={toggleExpand}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {searched && orders.length === 0 && !error && (
          <OrderEmptyState />
        )}
      </div>
    </div>
  );
}
