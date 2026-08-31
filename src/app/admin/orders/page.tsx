'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminOrders } from '../../../hooks/useAdminOrders';
import { OrderMetricsBar } from '../../../components/admin/orders/OrderMetricsBar';
import { OrderFiltersBar } from '../../../components/admin/orders/OrderFiltersBar';
import { OrdersTable } from '../../../components/admin/orders/OrdersTable';
import { CourierBookingPanel } from '../../../components/admin/orders/CourierBookingPanel';

export default function AdminOrdersPage() {
  const {
    orders,
    filteredOrders,
    loading,
    error,
    toast,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    dispatchReady,
    courierStatus,
    selectedOrder,
    setSelectedOrder,
    selectedCourier,
    setSelectedCourier,
    bookingLoading,
    logs,
    fetchOrders,
    handleStatusChange,
    handleToggleReady,
    handleBookCourier,
    handlePrintReceipt,
  } = useAdminOrders();

  if (loading && orders.length === 0) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 min-vh-50">
        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading orders...</span>
        </div>
        <p className="text-muted fw-semibold">Loading orders database...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0 px-md-2">
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
            <i className="fas fa-boxes text-primary me-2" />
            Orders &amp; Courier Dispatch Center
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>
            Real-time COD customer ledger, 1-click Trax/Leopards/TCS courier booking &amp; live logistics tracking.
          </p>
        </div>
        <Link href="/admin" className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="fas fa-arrow-left me-1" /> Dashboard
        </Link>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger border-0 rounded-3 mb-4 d-flex align-items-center gap-2" role="alert">
          <i className="fas fa-exclamation-circle" />
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      {toast && (
        <div
          className={`alert border-0 rounded-3 mb-4 d-flex align-items-center gap-2 ${
            toast.type === 'success' ? 'alert-success' : 'alert-danger'
          }`}
          role="alert"
        >
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`} />
          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{toast.msg}</span>
        </div>
      )}

      {/* 1. Metric Summary KPIs */}
      <OrderMetricsBar orders={orders} />

      {/* 2. Filter & Search Controls */}
      <OrderFiltersBar
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={fetchOrders}
        loading={loading}
      />

      {/* 3. Main Grid: Orders Table (Left) + Logistics Booking (Right) */}
      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <OrdersTable
            orders={filteredOrders}
            selectedOrder={selectedOrder}
            dispatchReady={dispatchReady}
            courierStatus={courierStatus}
            onSelectOrder={(o) => setSelectedOrder(o)}
            onToggleReady={handleToggleReady}
            onStatusChange={handleStatusChange}
            onPrintReceipt={handlePrintReceipt}
          />
        </div>

        <div className="col-12 col-xl-4">
          <CourierBookingPanel
            selectedOrder={selectedOrder}
            selectedCourier={selectedCourier}
            setSelectedCourier={setSelectedCourier}
            bookingLoading={bookingLoading}
            onBookCourier={handleBookCourier}
            logs={logs}
          />
        </div>
      </div>
    </div>
  );
}
