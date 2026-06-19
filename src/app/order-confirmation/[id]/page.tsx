'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { IOrder } from '../../../types';

export default function OrderConfirmationPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923185205667';

  // Fetch order details
  useEffect(() => {
    if (!id) return;
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.data);
          // Confetti celebration!
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F28B00', '#F92400', '#484848', '#25D366'],
          });
        } else {
          setError(data.error || 'Failed to load order.');
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Connection failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleShareToWhatsApp = () => {
    if (!order) return;

    const itemsText = order.items
      .map((item) => `- ${item.quantity}x ${item.name} (PKR ${item.price.toLocaleString()})`)
      .join('\n');

    const message = `*New Order Confirmation - PAKODRIVE*\n` +
      `*Order ID:* #${order._id}\n` +
      `*Customer Name:* ${order.customerDetails.name}\n` +
      `*Phone Number:* ${order.customerDetails.phone}\n` +
      `*City:* ${order.customerDetails.city}\n` +
      `*Shipping Address:* ${order.customerDetails.address}\n\n` +
      `*Items Ordered:*\n${itemsText}\n\n` +
      `*Total Amount:* PKR ${order.totalAmount.toLocaleString()}\n` +
      `*Payment Method:* Cash on Delivery (COD)\n\n` +
      `Please confirm my order and shipping coordinates. Thank you!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${encoded}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container py-5 text-center bg-white">
        <div className="py-5">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="text-muted font-weight-bold">Generating your order receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-5 text-center bg-white">
        <div className="py-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="text-danger mb-4">Order Error</h2>
          <p className="mb-4 text-muted">{error || 'Receipt generation failed.'}</p>
          <Link href="/" className="btn btn-primary rounded-pill py-3 px-5 border-0">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6 wow fadeInUp" data-wow-delay="0.1s">
          Order Confirmation
        </h1>
        <ol className="breadcrumb justify-content-center mb-0 wow fadeInUp" data-wow-delay="0.3s">
          <li className="breadcrumb-item">
            <Link href="/" className="text-white text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active text-white">Confirmation</li>
        </ol>
      </div>
      {/* Single Page Header End */}

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Success alert message */}
            <div className="text-center p-5 bg-light rounded border mb-5 print-none">
              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center mb-4 mx-auto"
                style={{ width: '80px', height: '80px' }}
              >
                <i className="fas fa-check fa-3x text-white"></i>
              </div>
              <h2 className="mb-3 text-dark">Order Placed Successfully!</h2>
              <p className="mb-4 text-muted">
                Thank you for shopping at PAKODRIVE. Your order has been placed successfully and is pending verification. Please click the button below to confirm your order details instantly via WhatsApp.
              </p>
              
              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <button
                  onClick={handleShareToWhatsApp}
                  className="btn btn-primary rounded-pill py-3 px-4 border-0 d-flex align-items-center justify-content-center"
                >
                  <i className="fab fa-whatsapp fa-lg me-2"></i> Confirm Order on WhatsApp
                </button>
                <button
                  onClick={handlePrint}
                  className="btn btn-secondary rounded-pill py-3 px-4"
                >
                  <i className="fas fa-print me-2"></i> Print Invoice
                </button>
              </div>
            </div>

            {/* Invoice Printable Section */}
            <div className="p-5 border rounded bg-white shadow-sm position-relative" style={{ borderTop: '6px solid var(--bs-primary) !important' }}>
              <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
                <div>
                  <h2 className="text-primary m-0"><i className="fas fa-shopping-bag text-secondary me-2"></i>Electro</h2>
                  <p className="text-muted small mt-2">
                    123 Street Karachi, Pakistan<br />
                    support@pakodrive.com | +0123 456 7890
                  </p>
                </div>
                <div className="text-end">
                  <h4 className="text-dark uppercase tracking-wide m-0">Invoice Receipt</h4>
                  <p className="text-muted small mt-2 font-weight-bold">
                    Order ID: <span className="text-dark font-mono">#{order._id}</span><br />
                    Placed On: {new Date(order.createdAt || '').toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <h6 className="text-muted uppercase tracking-wider small font-weight-bold mb-2">Shipping Information</h6>
                  <p className="m-0 font-weight-bold text-dark">{order.customerDetails.name}</p>
                  <p className="text-muted mt-1 leading-normal">
                    {order.customerDetails.address}<br />
                    {order.customerDetails.city}, Pakistan
                  </p>
                </div>
                <div className="col-md-6 mb-3 text-md-end">
                  <h6 className="text-muted uppercase tracking-wider small font-weight-bold mb-2">Payment Details</h6>
                  <p className="m-0 text-dark">
                    Method: <strong className="text-primary">Cash on Delivery (COD)</strong>
                  </p>
                  <p className="text-muted mt-1">
                    Contact: {order.customerDetails.phone}<br />
                    {order.customerDetails.email && `Email: ${order.customerDetails.email}`}
                  </p>
                </div>
              </div>

              {/* Items Purchased List */}
              <div className="border-bottom pb-4 mb-4">
                <h6 className="text-muted uppercase tracking-wider small font-weight-bold mb-3">Purchased Items</h6>
                <div className="table-responsive">
                  <table className="table table-borderless align-middle m-0">
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.productId} className="border-bottom border-light">
                          <td style={{ width: '60px' }}>
                            <div className="position-relative bg-light rounded" style={{ width: '50px', height: '50px' }}>
                              <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                            </div>
                          </td>
                          <td>
                            <p className="m-0 font-weight-bold text-dark">{item.name}</p>
                            <span className="text-muted small">Qty: {item.quantity} × PKR {item.price.toLocaleString()}</span>
                          </td>
                          <td className="text-end font-weight-bold text-dark">
                            PKR {(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Invoice totals */}
              <div className="row justify-content-end">
                <div className="col-md-5">
                  <table className="table table-borderless m-0 text-dark small">
                    <tbody>
                      <tr>
                        <td className="text-muted py-1 ps-0">Subtotal</td>
                        <td className="text-end font-weight-bold py-1 pe-0">PKR {order.totalAmount.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="text-muted py-1 ps-0">Delivery Charges</td>
                        <td className="text-end text-success font-weight-bold py-1 pe-0 uppercase">Free Delivery</td>
                      </tr>
                      <tr className="border-top">
                        <td className="font-weight-bold py-2 ps-0 text-uppercase">Grand Total</td>
                        <td className="text-end font-weight-bold text-primary py-2 pe-0 fs-5">
                          PKR {order.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center mt-4 print-none">
              <Link href="/" className="btn btn-secondary rounded-pill py-2 px-4">
                <i className="fas fa-arrow-left me-2"></i> Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
