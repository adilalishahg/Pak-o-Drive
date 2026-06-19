'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="bg-white">
        {/* Page Header */}
        <div className="container-fluid page-header py-5">
          <h1 className="text-center text-white display-6 wow fadeInUp animate-fade-in" data-wow-delay="0.1s">
            Cart Page
          </h1>
          <ol className="breadcrumb justify-content-center mb-0 wow fadeInUp" data-wow-delay="0.3s">
            <li className="breadcrumb-item">
              <Link href="/" className="text-white text-decoration-none">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item active text-white">Cart Page</li>
          </ol>
        </div>

        {/* Empty state content */}
        <div className="container py-5 text-center text-dark py-5 my-5">
          <i className="fas fa-shopping-bag fa-4x text-muted mb-4"></i>
          <h2 className="font-weight-bold mb-3">Your Cart is Empty</h2>
          <p className="text-muted mb-4">Explore our high-performance electronic products to start shopping.</p>
          <Link href="/shop" className="btn btn-primary rounded-pill py-3 px-5 border-0 text-white">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Page Header */}
      <div className="container-fluid page-header py-5">
        <h1 className="text-center text-white display-6 wow fadeInUp animate-fade-in" data-wow-delay="0.1s">
          Cart Page
        </h1>
        <ol className="breadcrumb justify-content-center mb-0 wow fadeInUp" data-wow-delay="0.3s">
          <li className="breadcrumb-item">
            <Link href="/" className="text-white text-decoration-none">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item active text-white">Cart Page</li>
        </ol>
      </div>

      {/* Cart Page Start */}
      <div className="container-fluid py-5">
        <div className="container py-5">
          {/* Table container */}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Name</th>
                  <th scope="col">Price</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Total</th>
                  <th scope="col">Handle</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => {
                  const prod = item.product;
                  const formattedId = prod._id ? prod._id.toString() : '';
                  return (
                    <tr key={formattedId}>
                      <th scope="row" className="align-middle">
                        <div className="relative" style={{ width: '80px', height: '80px', position: 'relative' }}>
                          <Image
                            src={prod.image}
                            alt={prod.name}
                            fill
                            className="img-fluid rounded object-contain p-1"
                          />
                        </div>
                      </th>
                      <td className="align-middle">
                        <Link
                          href={`/product/${formattedId}`}
                          className="mb-0 text-dark text-decoration-none font-weight-bold"
                        >
                          {prod.name}
                        </Link>
                      </td>
                      <td className="align-middle">
                        <p className="mb-0 py-4 font-weight-bold">PKR {prod.price.toLocaleString()}</p>
                      </td>
                      <td className="align-middle">
                        <div className="input-group quantity py-4" style={{ width: '120px' }}>
                          <div className="input-group-btn">
                            <button
                              type="button"
                              onClick={() => updateQuantity(formattedId, item.quantity - 1)}
                              className="btn btn-sm btn-minus rounded-circle bg-light border"
                            >
                              <i className="fa fa-minus"></i>
                            </button>
                          </div>
                          <input
                            type="text"
                            readOnly
                            className="form-control form-control-sm text-center border-0 bg-transparent font-weight-bold"
                            value={item.quantity}
                            style={{ width: '35px', boxShadow: 'none' }}
                          />
                          <div className="input-group-btn">
                            <button
                              type="button"
                              onClick={() => updateQuantity(formattedId, item.quantity + 1)}
                              disabled={item.quantity >= prod.stock}
                              className="btn btn-sm btn-plus rounded-circle bg-light border"
                            >
                              <i className="fa fa-plus"></i>
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <p className="mb-0 py-4 font-weight-bold">
                          PKR {(prod.price * item.quantity).toLocaleString()}
                        </p>
                      </td>
                      <td className="align-middle">
                        <button
                          onClick={() => removeFromCart(formattedId)}
                          className="btn btn-md rounded-circle bg-light border"
                        >
                          <i className="fa fa-times text-danger"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cart Subtotal & Checkout links */}
          <div className="row g-4 justify-content-end mt-5">
            <div className="col-lg-8"></div>
            <div className="col-sm-8 col-md-7 col-lg-6 col-xl-4">
              <div className="bg-light rounded">
                <div className="p-4">
                  <h1 className="display-6 mb-4">
                    Cart <span className="fw-normal">Total</span>
                  </h1>
                  <div className="d-flex justify-content-between mb-4">
                    <h5 className="mb-0 me-4">Subtotal:</h5>
                    <p className="mb-0 font-weight-bold text-dark">PKR {cartTotal.toLocaleString()}</p>
                  </div>
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0 me-4">Shipping:</h5>
                    <div>
                      <p className="mb-0 text-success font-weight-bold uppercase small">Free Delivery</p>
                    </div>
                  </div>
                </div>
                <div className="py-4 mb-4 border-top border-bottom d-flex justify-content-between">
                  <h5 className="mb-0 ps-4 me-4">Total:</h5>
                  <p className="mb-0 pe-4 font-weight-bold text-primary">PKR {cartTotal.toLocaleString()}</p>
                </div>
                
                <div className="px-4 mb-3">
                  <div className="alert alert-warning py-2 small m-0" role="alert">
                    Note: We support <strong>Cash on Delivery (COD)</strong>. You can verify your package before paying cash.
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn btn-primary rounded-pill px-4 py-3 text-uppercase mb-4 ms-4 border-0 text-white font-weight-bold"
                >
                  Proceed Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Cart Page End */}
    </div>
  );
}
