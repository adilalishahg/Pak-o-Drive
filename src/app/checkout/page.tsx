'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { logInteraction } from '../../components/common/AnalyticsTracker';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States (Matches original template field styles)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  if (cart.length === 0) {
    return (
      <div className="container py-5 text-center bg-white">
        <div className="py-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 className="mb-4">Your Cart is Empty</h2>
          <p className="mb-4 text-muted">Add products to your cart before proceeding to checkout.</p>
          <Link href="/shop" className="btn btn-primary rounded-pill py-3 px-5 border-0">
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const name = `${firstName} ${lastName}`.trim();
    if (!name || !phone.trim() || !address.trim() || !city.trim()) {
      setError('Please fill in all mandatory shipping information.');
      return;
    }

    try {
      setLoading(true);

      const utmSource = sessionStorage.getItem('utm_source') || '';
      const utmMedium = sessionStorage.getItem('utm_medium') || '';
      const utmCampaign = sessionStorage.getItem('utm_campaign') || '';

      const orderPayload = {
        customerDetails: {
          name,
          email: email.trim() || undefined,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          notes: orderNotes.trim() || undefined,
        },
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        utmSource: utmSource || undefined,
        utmMedium: utmMedium || undefined,
        utmCampaign: utmCampaign || undefined,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'An error occurred while creating your order.');
      }

      // Log tracking checkout success interaction
      logInteraction('checkout_success', window.location.pathname, {
        orderId: data.orderId,
        amount: cartTotal,
        itemsCount: cart.length,
      });

      clearCart();
      router.push(`/order-confirmation/${data.orderId}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Single Page Header start */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6 wow fadeInUp" data-wow-delay="0.1s">
          Checkout
        </h1>
        <ol className="breadcrumb justify-content-center mb-0 wow fadeInUp" data-wow-delay="0.3s">
          <li className="breadcrumb-item">
            <Link href="/" className="text-white text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active text-white">Checkout</li>
        </ol>
      </div>
      {/* Single Page Header End */}

      {/* Checkout Page Start */}
      <div className="container-fluid bg-light overflow-hidden py-5">
        <div className="container py-5">
          <h1 className="mb-4 wow fadeInUp" data-wow-delay="0.1s">
            Billing details
          </h1>
          {error && (
            <div className="alert alert-danger rounded mb-4 py-3 px-4" role="alert">
              ⚠ {error}
            </div>
          )}
          <form onSubmit={handleCheckoutSubmit}>
            <div className="row g-5">
              <div className="col-md-12 col-lg-6 col-xl-6 wow fadeInUp" data-wow-delay="0.1s">
                <div className="row">
                  <div className="col-md-12 col-lg-6">
                    <div className="form-item w-100">
                      <label className="form-label my-3">First Name<sup>*</sup></label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-md-12 col-lg-6">
                    <div className="form-item w-100">
                      <label className="form-label my-3">Last Name<sup>*</sup></label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-item">
                  <label className="form-label my-3">Address <sup>*</sup></label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="form-control"
                    placeholder="House Number Street Name"
                  />
                </div>
                <div className="form-item">
                  <label className="form-label my-3">Town/City<sup>*</sup></label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-item">
                  <label className="form-label my-3">Mobile<sup>*</sup></label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="form-control"
                    placeholder="e.g. +923001234567"
                  />
                </div>
                <div className="form-item">
                  <label className="form-label my-3">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    placeholder="e.g. email@example.com (optional)"
                  />
                </div>
                <div className="form-item mt-4">
                  <textarea
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="form-control"
                    spellCheck="false"
                    cols={30}
                    rows={11}
                    placeholder="Order Notes (Optional)"
                  ></textarea>
                </div>
              </div>
              
              <div className="col-md-12 col-lg-6 col-xl-6 wow fadeInUp" data-wow-delay="0.3s">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr className="text-center">
                        <th scope="col" className="text-start">Name</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item.product._id} className="text-center">
                          <th scope="row" className="text-start py-4 font-weight-normal">
                            {item.product.name}
                          </th>
                          <td className="py-4">PKR {item.product.price.toLocaleString()}</td>
                          <td className="py-4">{item.quantity}</td>
                          <td className="py-4">PKR {(item.product.price * item.quantity).toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr>
                        <th scope="row"></th>
                        <td className="py-4"></td>
                        <td className="py-4">
                          <p className="mb-0 text-dark py-2 font-weight-bold">Subtotal</p>
                        </td>
                        <td className="py-4">
                          <div className="py-2 text-center border-bottom border-top">
                            <p className="mb-0 text-dark font-weight-bold">PKR {cartTotal.toLocaleString()}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row"></th>
                        <td className="py-4">
                          <p className="mb-0 text-dark py-4 font-weight-bold">Shipping</p>
                        </td>
                        <td colSpan={2} className="py-4">
                          <div className="form-check text-start my-2">
                            <input
                              type="radio"
                              className="form-check-input bg-primary border-0"
                              id="Shipping-1"
                              name="Shipping-1"
                              checked
                              readOnly
                            />
                            <label className="form-check-label" htmlFor="Shipping-1">
                              Free Shipping
                            </label>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row"></th>
                        <td className="py-4">
                          <p className="mb-0 text-dark text-uppercase py-2 font-weight-bold">TOTAL</p>
                        </td>
                        <td className="py-4"></td>
                        <td className="py-4">
                          <div className="py-2 text-center border-bottom border-top">
                            <p className="mb-0 text-dark font-weight-bold text-primary">PKR {cartTotal.toLocaleString()}</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="row g-0 text-center align-items-center justify-content-center border-bottom py-2 mt-4">
                  <div className="col-12">
                    <div className="form-check text-start my-2">
                      <input
                        type="radio"
                        className="form-check-input bg-primary border-0"
                        id="Delivery-1"
                        name="Delivery"
                        checked
                        readOnly
                      />
                      <label className="form-check-label font-weight-bold" htmlFor="Delivery-1">
                        Cash On Delivery (COD)
                      </label>
                    </div>
                    <p className="text-start text-muted small">
                      Pay with cash upon delivery of your items to your shipping address.
                    </p>
                  </div>
                </div>
                
                <div className="row g-4 text-center align-items-center justify-content-center pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary border-secondary py-3 px-4 text-uppercase w-100 border-0"
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Checkout Page End */}
    </div>
  );
}
