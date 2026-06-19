'use client';

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { IProduct } from '../../types';

interface ProductActionsProps {
  product: IProduct;
}

export const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+923001234567';

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleWhatsAppInquiry = () => {
    const siteUrl = typeof window !== 'undefined' ? window.location.href : '';
    const text = encodeURIComponent(
      `Hi Pakodrive, I would like to inquire about "${product.name}" priced at PKR ${product.price.toLocaleString()}.\n\nProduct Link: ${siteUrl}`
    );
    window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${text}`, '_blank');
  };

  return (
    <div className="font-sans">
      <div className="d-flex align-items-center gap-3 mb-4">
        {/* Quantity control */}
        <div className="input-group quantity" style={{ width: '120px' }}>
          <div className="input-group-btn">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="btn btn-sm btn-minus rounded-circle bg-light border"
            >
              <i className="fa fa-minus"></i>
            </button>
          </div>
          <input
            type="text"
            readOnly
            className="form-control form-control-sm text-center border-0 bg-transparent font-weight-bold"
            value={quantity}
            style={{ width: '35px', boxShadow: 'none' }}
          />
          <div className="input-group-btn">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={quantity >= product.stock}
              className="btn btn-sm btn-plus rounded-circle bg-light border"
            >
              <i className="fa fa-plus"></i>
            </button>
          </div>
        </div>

        <small className="text-muted font-weight-bold ms-2">
          ({product.stock} items remaining)
        </small>
      </div>

      {/* Button Actions */}
      <div className="d-flex flex-wrap gap-2.5 mb-4">
        <button
          onClick={() => addToCart(product, quantity)}
          className="btn btn-primary border border-secondary rounded-pill px-4 py-2 text-white border-0"
        >
          <i className="fa fa-shopping-bag me-2 text-white"></i> Add to Cart
        </button>

        <button
          onClick={handleWhatsAppInquiry}
          className="btn btn-success rounded-pill px-4 py-2 border-0"
          style={{ background: '#25D366', color: '#fff' }}
        >
          <i className="fab fa-whatsapp me-2 text-white"></i> Inquire on WhatsApp
        </button>
      </div>
    </div>
  );
};
