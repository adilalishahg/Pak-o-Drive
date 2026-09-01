'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { OrderData } from '@/types';


export function useAdminOrders() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [dispatchReady, setDispatchReady] = useState<Record<string, boolean>>({});
  const [courierStatus, setCourierStatus] = useState<Record<string, string>>({});
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<'TCS' | 'LEOPARDS' | 'TRAX'>('LEOPARDS');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [logs, setLogs] = useState<Array<{ text: string; type: string }>>([
    { text: 'Order #9870 TCS Tracking: Dispatched', type: 'TCS' },
    { text: 'Order #9869 Leopards Slips Generated', type: 'LEOPARDS' },
  ]);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setOrders(json.data);

        const readyMap: Record<string, boolean> = {};
        const courierMap: Record<string, string> = {};

        json.data.forEach((o: OrderData) => {
          readyMap[o._id] = o.status !== 'Pending' && o.status !== 'Cancelled';

          if (o.status === 'Shipped') {
            const index = o._id.charCodeAt(0) % 3;
            const cNames = ['TCS: Dispatched', 'Leopards: Slips Generated', 'TRAX: Created'];
            courierMap[o._id] = cNames[index];
          } else if (o.status === 'Delivered') {
            courierMap[o._id] = 'Delivered';
          } else if (o.status === 'Processing') {
            courierMap[o._id] = 'Leopards: Processing';
          } else {
            courierMap[o._id] = 'Not Booked';
          }
        });

        setDispatchReady(readyMap);
        setCourierStatus(courierMap);

        if (json.data.length > 0) {
          setSelectedOrder((prev) => {
            if (prev) {
              const stillExists = json.data.find((o: OrderData) => o._id === prev._id);
              if (stillExists) return stillExists;
            }
            return (
              json.data.find((o: OrderData) => o.status === 'Pending' || o.status === 'Processing') ||
              json.data[0]
            );
          });
        }
      } else {
        throw new Error(json.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error loading orders database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: string) => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        const json = await res.json();
        if (json.success) {
          setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o)));
          setSelectedOrder((prev) => (prev && prev._id === orderId ? { ...prev, status: newStatus as any } : prev));
          showToast(`Order status updated to "${newStatus}".`);
        }
      } catch {
        showToast('Failed to update status', 'error');
      }
    },
    [showToast]
  );

  const handleToggleReady = useCallback(
    (orderId: string) => {
      setDispatchReady((prev) => {
        const nextState = !prev[orderId];
        if (nextState) {
          handleStatusChange(orderId, 'Processing');
        }
        return { ...prev, [orderId]: nextState };
      });
    },
    [handleStatusChange]
  );

  const handleBookCourier = useCallback(async () => {
    if (!selectedOrder) return;
    setBookingLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const newStatusText = `${selectedCourier}: Booked (CN#${Math.floor(100000 + Math.random() * 900000)})`;

      setCourierStatus((prev) => ({ ...prev, [selectedOrder._id]: newStatusText }));
      setLogs((prev) => [{ text: `Order #${selectedOrder._id.slice(-4)} ${newStatusText}`, type: selectedCourier }, ...prev]);

      await handleStatusChange(selectedOrder._id, 'Shipped');
      showToast(`Consignment booked with ${selectedCourier}!`);
    } catch {
      showToast('Error booking courier', 'error');
    } finally {
      setBookingLoading(false);
    }
  }, [selectedOrder, selectedCourier, handleStatusChange, showToast]);

  const handlePrintReceipt = useCallback((order: OrderData) => {
    const printWindow = window.open('', '_blank', 'width=420,height=600');
    if (!printWindow) return;

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Order #${order._id.slice(-6).toUpperCase()}</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 20px; font-size: 13px; color: #000; line-height: 1.4; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .logo { font-size: 18px; font-weight: bold; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 8px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin: 8px 0; }
          .items-table th { text-align: left; border-bottom: 1px solid #000; font-size: 11px; }
          .items-table td { font-size: 12px; padding: 4px 0; }
          .footer { text-align: center; margin-top: 15px; font-size: 11px; border-top: 1px dashed #000; padding-top: 8px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">PAK-O-DRIVE</div>
          <div>Automotive Accessories & Tech</div>
          <div>Helpline: +92 318 5205667</div>
        </div>
        <div class="row"><span>Order ID:</span><span class="bold">#${order._id.slice(-6).toUpperCase()}</span></div>
        <div class="row"><span>Date:</span><span>${new Date(order.createdAt).toLocaleDateString()}</span></div>
        <div class="row"><span>Customer:</span><span class="bold">${order.customerDetails?.name || 'Customer'}</span></div>
        <div class="row"><span>Phone:</span><span>${order.customerDetails?.phone || ''}</span></div>
        <div class="row"><span>City:</span><span>${order.customerDetails?.city || ''}</span></div>
        <div class="divider"></div>
        <table class="items-table">
          <thead>
            <tr><th>ITEM</th><th style="text-align:center">QTY</th><th style="text-align:right">PKR</th></tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td>${item.name} ${item.variantName ? `(${item.variantName})` : ''}</td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:right">${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="row bold" style="font-size: 15px;">
          <span>TOTAL PAYABLE (${order.paymentMethod}):</span>
          <span>PKR ${order.totalAmount?.toLocaleString()}</span>
        </div>
        <div class="footer">
          <div>Thank you for choosing Pak-o-Drive!</div>
          <div>7-Day Checking Warranty Applied</div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === 'All' || o.status === filterStatus;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        o._id.toLowerCase().includes(q) ||
        o.customerDetails?.name?.toLowerCase().includes(q) ||
        o.customerDetails?.phone?.includes(q) ||
        o.customerDetails?.city?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [orders, filterStatus, searchQuery]);

  return {
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
  };
}
