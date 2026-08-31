'use client';

import React from 'react';

const STATUSES = ['All', 'Pending', 'Processing', 'Shipped', 'On the Way', 'Delivered', 'Cancelled'];

interface OrderFiltersBarProps {
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function OrderFiltersBar({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  onRefresh,
  loading,
}: OrderFiltersBarProps) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 p-3 bg-white">
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
        {/* Status Pills */}
        <div className="d-flex align-items-center gap-1.5 overflow-x-auto pb-1 flex-grow-1" style={{ scrollbarWidth: 'none' }}>
          {STATUSES.map((st) => {
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`btn btn-sm rounded-pill px-3 flex-shrink-0 transition-all ${
                  isActive ? 'btn-primary text-white shadow-xs fw-bold' : 'btn-light text-secondary border'
                }`}
                style={{ fontSize: '0.8rem' }}
              >
                {st}
              </button>
            );
          })}
        </div>

        {/* Search Input & Refresh Button */}
        <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
          <div className="input-group input-group-sm flex-grow-1" style={{ minWidth: '220px' }}>
            <span className="input-group-text bg-light border-end-0 text-muted">
              <i className="fas fa-search" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by ID, Phone, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 flex-shrink-0"
            title="Refresh Orders"
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
