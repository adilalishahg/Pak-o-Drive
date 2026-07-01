'use client';

import React, { useEffect, useState } from 'react';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import InteractiveMap from '@/components/common/InteractiveMap';

interface OrderData {
  _id: string;
  customerDetails: {
    name: string;
    email?: string;
    phone: string;
    address: string;
    city: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variantName?: string;
  }>;
  totalAmount: number;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'On the Way' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
  whatsappSent: boolean;
}

const cityCoordinates: Record<string, [number, number]> = {
  islamabad: [33.6844, 73.0479],
  rawalpindi: [33.5651, 73.0169],
  lahore: [31.5204, 74.3587],
  karachi: [24.8607, 67.0011],
  faisalabad: [31.4504, 73.1350],
  multan: [30.1575, 71.5249],
  peshawar: [34.0151, 71.5805],
  quetta: [30.1798, 66.9750],
  sialkot: [32.4945, 74.5228],
  gujranwala: [32.1877, 74.1945],
};

const deliveryRoutes: Array<{ path: [number, number][]; color?: string; weight?: number }> = [
  // Primary green hub lines
  { path: [[24.8607, 67.0011], [27.7244, 68.8228], [30.1575, 71.5249], [31.5204, 74.3587], [33.6844, 73.0479]], color: '#10b981', weight: 3 },
  // Secondary orange link lines
  { path: [[24.8607, 67.0011], [30.1798, 66.9750]], color: '#f97316', weight: 2 },
  { path: [[25.3960, 68.3578], [27.7244, 68.8228]], color: '#f97316', weight: 2 },
  { path: [[30.1798, 66.9750], [27.7244, 68.8228]], color: '#f97316', weight: 2 },
  { path: [[30.1798, 66.9750], [30.1575, 71.5249]], color: '#f97316', weight: 2 },
  { path: [[30.1575, 71.5249], [31.4504, 73.1350], [31.5204, 74.3587]], color: '#f97316', weight: 2 },
  { path: [[33.6844, 73.0479], [34.0151, 71.5805]], color: '#f97316', weight: 2 },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Interactive UI states matching "Order Center" screenshot
  const [dispatchReady, setDispatchReady] = useState<Record<string, boolean>>({});
  const [courierStatus, setCourierStatus] = useState<Record<string, string>>({});
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<'TCS' | 'LEOPARDS' | 'TRAX'>('LEOPARDS');
  const [logs, setLogs] = useState<Array<{ text: string; type: string }>>([
    { text: 'Order #9870 TCS Tracking: Dispatched', type: 'TCS' },
    { text: 'Order #9869 Leopards Slips Generated', type: 'LEOPARDS' }
  ]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch('/api/orders');
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
        
        // Auto-initialize toggles and courier states
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

        // Default selected order for side courier panel
        if (json.data.length > 0) {
          const firstBookable = json.data.find((o: OrderData) => o.status === 'Pending' || o.status === 'Processing') || json.data[0];
          setSelectedOrder(firstBookable);
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
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setOrders(prev => prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as any } : o)));
        
        // Sync selected order state
        setSelectedOrder(prev => {
          if (prev && prev._id === orderId) {
            return { ...prev, status: newStatus as any };
          }
          return prev;
        });

        if (newStatus === 'Cancelled' || newStatus === 'Pending') {
          setDispatchReady(prev => ({ ...prev, [orderId]: false }));
        } else {
          setDispatchReady(prev => ({ ...prev, [orderId]: true }));
        }
      } else {
        alert(json.error || 'Failed to update order status.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status.');
    }
  };

  const handleToggleDispatchReady = (orderId: string) => {
    setDispatchReady(prev => {
      const newVal = !prev[orderId];
      const order = orders.find(o => o._id === orderId);
      if (order) {
        const shortId = order._id.substring(order._id.length - 8).toUpperCase();
        addLog(`Order #${shortId} set to dispatch ready: ${newVal ? 'TRUE' : 'FALSE'}`, 'INFO');
      }
      return { ...prev, [orderId]: newVal };
    });
  };

  const addLog = (text: string, type: string) => {
    setLogs(prev => [{ text, type }, ...prev].slice(0, 10));
  };

  const handleBookCourier = async () => {
    if (!selectedOrder) return;
    
    const orderId = selectedOrder._id;
    const shortId = orderId.substring(orderId.length - 8).toUpperCase();
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Shipped' }),
      });
      
      const json = await res.json();
      if (json.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'Shipped' } : o));
        
        // Sync selected order state
        setSelectedOrder(prev => {
          if (prev && prev._id === orderId) {
            return { ...prev, status: 'Shipped' };
          }
          return prev;
        });

        setDispatchReady(prev => ({ ...prev, [orderId]: true }));
        
        const trackingCode = `TRK-${shortId}`;
        const newCourierStatus = `${selectedCourier === 'TCS' ? 'TCS' : selectedCourier === 'LEOPARDS' ? 'Leopards' : 'Trax'}: Dispatched (${trackingCode})`;
        setCourierStatus(prev => ({ ...prev, [orderId]: newCourierStatus }));
        
        addLog(`Order #${shortId} Booked with ${selectedCourier}. tracking: ${trackingCode}`, selectedCourier);
        alert(`Successfully booked with ${selectedCourier}! Tracking Code: ${trackingCode}`);
      } else {
        alert(json.error || 'Failed to book courier.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while booking courier.');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setOrders(prev => prev.filter(o => o._id !== orderId));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(null);
        }
        alert('Order deleted successfully.');
      } else {
        alert(json.error || 'Failed to delete order.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting order.');
    }
  };

  const handleBulkPrint = () => {
    const readyCount = Object.values(dispatchReady).filter(Boolean).length;
    alert(`Generating bulk dispatch slips for ${readyCount} orders configured as "Dispatch Ready"...`);
  };

  const handleVerifyCityQueue = () => {
    alert(`Verifying addresses and city coordinates for the City Validation Queue (8 Orders)...`);
  };

  const handleBulkCourierBookings = () => {
    alert(`Initiating automated batch courier bookings for all verified dispatch-ready orders...`);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'All') return true;
    return o.status === filterStatus;
  });

  // Calculate live order coordinates map markers (jittered for visibility)
  const mapMarkers = orders
    .map(order => {
      const city = order.customerDetails.city.toLowerCase().trim();
      const coords = cityCoordinates[city];
      if (coords) {
        const randomJitterLat = (Math.random() - 0.5) * 0.15;
        const randomJitterLng = (Math.random() - 0.5) * 0.15;
        return {
          lat: coords[0] + randomJitterLat,
          lng: coords[1] + randomJitterLng,
          popupText: `Order #${order._id.substring(order._id.length - 8).toUpperCase()} - ${order.customerDetails.name} (${order.customerDetails.city}) - PKR ${order.totalAmount.toLocaleString()}`
        };
      }
      return null;
    })
    .filter(Boolean) as any[];

  // Solve coordinates for selected order city (or fallback to default Islamabad center)
  const selectedCityName = selectedOrder?.customerDetails.city.toLowerCase().trim() || 'islamabad';
  const selectedCityCoords = cityCoordinates[selectedCityName] || [33.6844, 73.0479];

  if (loading && orders.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center p-5" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="fade-in px-2">
      
      {/* ── UPPER LOGISTICS GRID ── */}
      <div className="row g-3 mb-4">
        {/* Fulfillment & Dispatch Logistics (Left 8 columns) */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <h5 className="fw-black text-dark border-bottom pb-2 mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Fulfillment & Dispatch Logistics
            </h5>
            
            {/* Logistics stats Row */}
            <div className="row g-2 mb-3 text-center">
              <div className="col-12 col-sm-4">
                <div className="p-3 rounded-4 border" style={{ background: '#ecfdf5' }}>
                  <p className="text-muted fw-bold mb-1" style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>RTO Ratio</p>
                  <h4 className="fw-black text-success mb-0" style={{ fontSize: '1.25rem' }}>4.8% <i className="fas fa-arrow-down" style={{ fontSize: '12px' }} /></h4>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="p-3 rounded-4 border" style={{ background: '#fffbeb' }}>
                  <p className="text-muted fw-bold mb-1" style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>City Validation Queue</p>
                  <h4 className="fw-black text-warning mb-0" style={{ fontSize: '1.25rem' }}>8 Orders</h4>
                </div>
              </div>
              <div className="col-12 col-sm-4">
                <div className="p-3 rounded-4 border" style={{ background: '#eff6ff' }}>
                  <p className="text-muted fw-bold mb-1" style={{ fontSize: '0.62rem', textTransform: 'uppercase' }}>Delivery Efficiency</p>
                  <h4 className="fw-black text-primary mb-0" style={{ fontSize: '1.25rem' }}>96%</h4>
                </div>
              </div>
            </div>

            {/* Map visualizer container */}
            <div className="border rounded-4 overflow-hidden mb-3 position-relative" style={{ height: '180px' }}>
              <InteractiveMap
                center={[30.3753, 69.3451]} // Center of Pakistan
                zoom={5}
                markers={mapMarkers}
                routes={deliveryRoutes}
                height="180px"
              />
              <div className="position-absolute top-2 start-2 p-1.5 rounded bg-dark bg-opacity-70 text-white" style={{ fontSize: '0.62rem', zIndex: 1000 }}>
                <i className="fas fa-map-marker-alt text-danger me-1" /> Pakistan Delivery Coverage Grid
              </div>
            </div>

            {/* Action buttons list */}
            <div className="d-flex gap-2 flex-wrap mb-3">
              <button onClick={handleBulkPrint} className="btn btn-sm text-white fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', border: 'none', fontSize: '0.72rem' }}>
                <i className="fas fa-copy me-1" /> Generate Bulk Dispatch Slips
              </button>
              <button onClick={handleVerifyCityQueue} className="btn btn-sm text-white fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', border: 'none', fontSize: '0.72rem' }}>
                <i className="fas fa-map me-1" /> Verify City Queue (8)
              </button>
              <button onClick={handleBulkCourierBookings} className="btn btn-sm text-white fw-bold px-3 py-2 rounded-pill shadow-sm" style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', border: 'none', fontSize: '0.72rem' }}>
                <i className="fas fa-truck me-1" /> Create Courier Bookings (3)
              </button>
            </div>

            {/* Latest updates logs */}
            <h6 className="fw-bold text-secondary mb-2" style={{ fontSize: '0.75rem' }}>Latest Logistics Status Updates</h6>
            <div className="d-flex flex-column gap-2">
              <div className="p-2.5 rounded-3 d-flex align-items-center justify-content-between border" style={{ background: '#f8fafc', fontSize: '0.75rem' }}>
                <span className="fw-medium text-dark d-flex align-items-center gap-2">
                  <span className="rounded-circle bg-success" style={{ width: '8px', height: '8px' }} />
                  Order #09870 - Teh TCS Tracking: Dispatched
                </span>
                <div className="d-flex gap-1">
                  <button className="btn btn-xs btn-outline-success p-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}><i className="fab fa-whatsapp" style={{ fontSize: '10px' }} /></button>
                  <button className="btn btn-xs btn-outline-primary p-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}><i className="fas fa-phone" style={{ fontSize: '10px' }} /></button>
                </div>
              </div>
              <div className="p-2.5 rounded-3 d-flex align-items-center justify-content-between border" style={{ background: '#f8fafc', fontSize: '0.75rem' }}>
                <span className="fw-medium text-dark d-flex align-items-center gap-2">
                  <span className="rounded-circle bg-warning" style={{ width: '8px', height: '8px' }} />
                  City Validation Queue: 8 orders to verify
                </span>
                <div className="d-flex gap-1">
                  <button className="btn btn-xs btn-outline-success p-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}><i className="fab fa-whatsapp" style={{ fontSize: '10px' }} /></button>
                  <button className="btn btn-xs btn-outline-primary p-1 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px' }}><i className="fas fa-phone" style={{ fontSize: '10px' }} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pakistan Courier Integration (Right 4 columns) */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100 d-flex flex-column">
            <h5 className="fw-black text-dark border-bottom pb-2 mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Pakistan Courier Integration
            </h5>
            <p className="text-muted mb-3" style={{ fontSize: '0.72rem' }}>Order entry releases automatic tracking integrations:</p>
            
            {/* Courier Logos */}
            <div className="row g-2 mb-4 text-center">
              <div className="col-4">
                <div className={`p-2 rounded-3 border d-flex align-items-center justify-content-center ${selectedCourier === 'TCS' ? 'border-danger bg-danger bg-opacity-10' : ''}`} style={{ height: '48px', cursor: 'pointer' }} onClick={() => setSelectedCourier('TCS')}>
                  <span className="fw-bold text-danger" style={{ fontSize: '12px' }}><i className="fas fa-shipping-fast me-1" /> TCS</span>
                </div>
              </div>
              <div className="col-4">
                <div className={`p-2 rounded-3 border d-flex align-items-center justify-content-center ${selectedCourier === 'LEOPARDS' ? 'border-warning bg-warning bg-opacity-10' : ''}`} style={{ height: '48px', cursor: 'pointer' }} onClick={() => setSelectedCourier('LEOPARDS')}>
                  <span className={`fw-bold ${selectedCourier === 'LEOPARDS' ? 'text-dark' : 'text-warning'}`} style={{ fontSize: '11px' }}><i className="fas fa-shipping-fast me-1" /> LEOPARDS</span>
                </div>
              </div>
              <div className="col-4">
                <div className={`p-2 rounded-3 border d-flex align-items-center justify-content-center ${selectedCourier === 'TRAX' ? 'border-primary bg-primary bg-opacity-10' : ''}`} style={{ height: '48px', cursor: 'pointer' }} onClick={() => setSelectedCourier('TRAX')}>
                  <span className="fw-bold text-primary" style={{ fontSize: '12px' }}><i className="fas fa-truck-moving me-1" /> TRAX</span>
                </div>
              </div>
            </div>

            {/* Selected Booking Order UI Box */}
            <div className="p-3 rounded-4 border bg-light mb-3">
              {selectedOrder ? (
                <>
                  <h6 className="fw-black text-dark mb-1" style={{ fontSize: '0.8rem' }}>
                    ORDER #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()} - {selectedOrder.customerDetails.city}
                  </h6>
                  <p className="text-muted mb-2 small">Customer: {selectedOrder.customerDetails.name}</p>
                  
                  <label className="form-label text-muted small mb-1" style={{ fontSize: '0.65rem' }}>Select Courier Service</label>
                  <select 
                    value={selectedCourier} 
                    onChange={(e) => setSelectedCourier(e.target.value as any)} 
                    className="form-select form-select-sm rounded-3 mb-3 border-0 bg-white shadow-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <option value="TCS">TCS Courier Services</option>
                    <option value="LEOPARDS">Leopards Courier Service</option>
                    <option value="TRAX">TRAX Express Logistics</option>
                  </select>

                  <button 
                    onClick={handleBookCourier}
                    className="btn btn-sm w-100 text-white fw-bold py-2 rounded-pill shadow-sm" 
                    style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', border: 'none', fontSize: '0.75rem' }}
                  >
                    BOOK WITH {selectedCourier}
                  </button>
                </>
              ) : (
                <p className="text-muted text-center py-4 small mb-0">Select an order from the list below to book with a courier provider.</p>
              )}
            </div>

            {/* Operations Log */}
            <h6 className="fw-bold text-secondary mb-2 mt-auto" style={{ fontSize: '0.75rem' }}>Courier Dispatch Log</h6>
            <div className="d-flex flex-column gap-2" style={{ maxHeight: '110px', overflowY: 'auto' }}>
              {logs.map((log, idx) => (
                <div key={idx} className="p-2 rounded border bg-light d-flex align-items-center justify-content-between" style={{ fontSize: '0.68rem', fontFamily: 'monospace' }}>
                  <span className="text-dark">{log.text}</span>
                  <span className="badge bg-secondary rounded">{log.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ORDERS LIST TABLE PANEL ── */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4 mb-4">
        <h5 className="fw-black text-dark border-bottom pb-2 mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Order Fulfillment & Status
        </h5>

        {/* Filter Row */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div className="d-flex gap-1.5 overflow-x-auto pb-1 flex-nowrap" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {['All', 'Pending', 'Processing', 'On the Way', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`btn btn-xs rounded-pill px-3 py-1 border-0 ${filterStatus === status ? 'btn-primary text-white' : 'btn-light text-muted'}`}
                style={{
                  background: filterStatus === status ? 'linear-gradient(to right, #ea580c, #f97316)' : undefined,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                }}
              >
                {status === 'Processing' ? 'Confirmed' : status}
              </button>
            ))}
          </div>
          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>

        {error && (
          <div className="alert alert-danger border-0 mb-3" role="alert" style={{ fontSize: '0.82rem' }}>
            {error}
          </div>
        )}

        {/* Orders Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.78rem' }}>
            <thead className="table-light text-muted small uppercase">
              <tr>
                <th style={{ color: '#64748b', fontWeight: 700 }}>ORDER ID</th>
                <th style={{ color: '#64748b', fontWeight: 700 }}>CUSTOMER NAME</th>
                <th style={{ color: '#64748b', fontWeight: 700 }}>CITY</th>
                <th style={{ color: '#64748b', fontWeight: 700, textAlign: 'center' }}>ITEMS</th>
                <th style={{ color: '#64748b', fontWeight: 700 }}>TOTAL AMOUNT</th>
                <th style={{ color: '#64748b', fontWeight: 700 }}>STATUS</th>
                <th style={{ color: '#64748b', fontWeight: 700, textAlign: 'center' }}>DISPATCH READY</th>
                <th style={{ color: '#64748b', fontWeight: 700 }}>COURIER STATUS</th>
                <th style={{ color: '#64748b', fontWeight: 700, textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-4 text-muted">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  let badgeBgColor = '#eab308'; // pending yellow
                  let badgeTextColor = '#000000';
                  if (order.status === 'Processing') {
                    badgeBgColor = '#ea580c'; // primary orange
                    badgeTextColor = '#ffffff';
                  } else if (order.status === 'On the Way') {
                    badgeBgColor = '#8b5cf6'; // purple
                    badgeTextColor = '#ffffff';
                  } else if (order.status === 'Shipped') {
                    badgeBgColor = '#06b6d4'; // info cyan
                    badgeTextColor = '#ffffff';
                  } else if (order.status === 'Delivered') {
                    badgeBgColor = '#10b981'; // success green
                    badgeTextColor = '#ffffff';
                  } else if (order.status === 'Cancelled') {
                    badgeBgColor = '#ef4444'; // danger red
                    badgeTextColor = '#ffffff';
                  }

                  const arrowColor = badgeTextColor === '#ffffff' ? '%23ffffff' : '%23212529';

                  const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
                  const isSelected = selectedOrder?._id === order._id;

                  return (
                    <tr 
                      key={order._id} 
                      onClick={() => setSelectedOrder(order)} 
                      style={{ cursor: 'pointer' }}
                      className={isSelected ? 'table-active' : ''}
                    >
                      <td className="fw-bold text-secondary">#{orderIdShort}</td>
                      <td className="fw-semibold text-dark">{order.customerDetails.name}</td>
                      <td>{order.customerDetails.city}</td>
                      <td style={{ textAlign: 'center' }}>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="fw-bold text-dark">PKR {order.totalAmount.toLocaleString()}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value as any)}
                          onClick={(e) => e.stopPropagation()}
                          className="form-select form-select-sm rounded-pill fw-bold text-center"
                          style={{
                            fontSize: '0.68rem',
                            padding: '4px 24px 4px 12px',
                            border: 'none',
                            backgroundColor: badgeBgColor,
                            color: badgeTextColor,
                            cursor: 'pointer',
                            width: 'fit-content',
                            minWidth: '110px',
                            appearance: 'none',
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='${arrowColor}' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 8px center',
                            backgroundSize: '10px 10px',
                            display: 'inline-block',
                          }}
                        >
                          <option value="Pending" className="bg-white text-dark">Pending</option>
                          <option value="Processing" className="bg-white text-dark">Confirmed</option>
                          <option value="On the Way" className="bg-white text-dark">On the Way</option>
                          <option value="Shipped" className="bg-white text-dark">Shipped</option>
                          <option value="Delivered" className="bg-white text-dark">Delivered</option>
                          <option value="Cancelled" className="bg-white text-dark">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div className="form-check form-switch d-inline-block">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={!!dispatchReady[order._id]}
                            onChange={() => handleToggleDispatchReady(order._id)}
                            className="form-check-input"
                            style={{ cursor: 'pointer' }}
                          />
                        </div>
                      </td>
                      <td className="fw-semibold text-muted" style={{ fontSize: '0.72rem' }}>
                        {courierStatus[order._id] || 'Not Booked'}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex gap-1.5 justify-content-center">
                          <a
                            href={`https://wa.me/${order.customerDetails.phone.replace('+', '')}?text=${encodeURIComponent(
                              `Hi ${order.customerDetails.name}, your order #${orderIdShort} status has been updated to "${order.status === 'Processing' ? 'Confirmed' : order.status}".`
                            )}`}
                            target="_blank"
                            className="btn btn-xs btn-success rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '24px', height: '24px' }}
                          >
                            <i className="fab fa-whatsapp" style={{ fontSize: '10px' }} />
                          </a>
                          <a
                            href={`tel:${order.customerDetails.phone}`}
                            className="btn btn-xs btn-primary rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '24px', height: '24px' }}
                          >
                            <i className="fas fa-phone" style={{ fontSize: '10px' }} />
                          </a>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="btn btn-xs btn-danger rounded-circle d-flex align-items-center justify-content-center text-white border-0"
                            style={{ width: '24px', height: '24px' }}
                          >
                            <i className="fas fa-trash-alt" style={{ fontSize: '10px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── BOTTOM DISPATCH VERIFICATION QUEUE & METROPOLITAN DELIVERIES ── */}
      <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
        <h5 className="fw-black text-dark border-bottom pb-2 mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Dispatch Verification Queue
        </h5>
        <div className="row g-3">
          {/* Coverage Map */}
          <div className="col-12 col-md-5">
            <div className="border rounded-4 overflow-hidden position-relative" style={{ height: '180px' }}>
              <InteractiveMap
                center={selectedCityCoords}
                zoom={11}
                markers={[{
                  lat: selectedCityCoords[0],
                  lng: selectedCityCoords[1],
                  popupText: selectedOrder ? `Delivery Center: ${selectedOrder.customerDetails.city}` : 'Base Delivery Center: Islamabad'
                }]}
                circle={{
                  lat: selectedCityCoords[0],
                  lng: selectedCityCoords[1],
                  radius: 12000,
                  color: '#ea580c'
                }}
                height="180px"
              />
              <div className="position-absolute top-2 start-2 p-1.5 rounded bg-dark bg-opacity-70 text-white" style={{ fontSize: '0.62rem', zIndex: 1000 }}>
                <i className="fas fa-bullseye text-warning me-1" /> Metropolitan Delivery Radius
              </div>
            </div>
          </div>
          
          {/* Verification List */}
          <div className="col-12 col-md-7 d-flex flex-column gap-2" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {orders.filter(o => o.status === 'Pending').length === 0 ? (
              <p className="text-muted text-center py-4 small my-auto">All orders call-verified. No items in verification queue.</p>
            ) : (
              orders.filter(o => o.status === 'Pending').map((order) => {
                const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
                return (
                  <div key={order._id} className="p-3 rounded-4 border bg-light d-flex align-items-center justify-content-between" style={{ fontSize: '0.78rem' }}>
                    <div>
                      <strong className="text-dark">Order #{orderIdShort}</strong>
                      <span className="text-muted ms-2">&bull; Call verification pending ({order.customerDetails.name} - {order.customerDetails.city})</span>
                    </div>
                    <div className="d-flex gap-2">
                      <a
                        href={`https://wa.me/${order.customerDetails.phone.replace('+', '')}?text=${encodeURIComponent(
                          `Hi ${order.customerDetails.name}, please verify your order #${orderIdShort} with PAKODRIVE. Thank you!`
                        )}`}
                        target="_blank"
                        className="btn btn-sm btn-success border-0 text-white rounded-pill px-3"
                        style={{ fontSize: '0.72rem' }}
                      >
                        <i className="fab fa-whatsapp me-1" /> WhatsApp
                      </a>
                      <button 
                        onClick={() => handleStatusChange(order._id, 'Processing')}
                        className="btn btn-sm btn-primary border-0 text-white rounded-pill px-3"
                        style={{ background: 'linear-gradient(to right, #ea580c, #f97316)', fontSize: '0.72rem' }}
                      >
                        <i className="fas fa-phone-alt me-1" /> Call Verified
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
