'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface OfferItem {
  sub: string;
  title: string;
  disc: string;
  img: string;
  link: string;
  imgAlt: string;
  bg: string;
}

interface HomeOfferBannersProps {
  offers: OfferItem[];
}

export function HomeOfferBanners({ offers }: HomeOfferBannersProps) {
  return (
    <section className="py-4">
      <div className="container-fluid px-3 px-lg-5">
        <div className="row g-4">
          {offers.map((o, idx) => (
            <div key={idx} className="col-12 col-md-6">
              <div
                className="offer-card animate-on-scroll p-4 rounded-4 position-relative overflow-hidden"
                style={{ background: o.bg, border: '1px solid #e2e8f0', minHeight: '180px' }}
              >
                <div className="row align-items-center h-100">
                  <div className="col-7 z-1">
                    <span className="badge bg-danger rounded-pill px-2.5 py-1 mb-2 fw-bold" style={{ fontSize: '0.72rem' }}>
                      {o.disc.includes('Off') ? o.disc : `${o.disc}% OFF`}
                    </span>
                    <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.05rem' }}>{o.title}</h5>
                    <p className="text-muted small mb-3" style={{ fontSize: '0.78rem' }}>{o.sub}</p>
                    <Link
                      href={o.link}
                      className="btn btn-sm btn-dark rounded-pill px-3.5 py-1.5 fw-semibold text-decoration-none shadow-sm"
                      style={{ fontSize: '0.8rem' }}
                    >
                      Shop Now <i className="fas fa-arrow-right ms-1.5 small" />
                    </Link>
                  </div>
                  <div className="col-5 text-end position-relative" style={{ height: '140px' }}>
                    <Image
                      src={o.img}
                      alt={o.imgAlt}
                      fill
                      sizes="200px"
                      style={{ objectFit: 'contain' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/img/product-1.png';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
