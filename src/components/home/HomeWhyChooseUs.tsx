'use client';

import React from 'react';

const WHY_CARDS = [
  {
    icon: 'fa-shield-halved',
    title: 'Verified Genuine Stock',
    desc: 'Every item tested & certified before dispatch. No replicas or counterfeit parts.',
  },
  {
    icon: 'fa-truck-fast',
    title: 'Nationwide Express COD',
    desc: 'Cash on delivery across all cities in Pakistan via top courier partners.',
  },
  {
    icon: 'fa-headset',
    title: '24/7 WhatsApp Support',
    desc: 'Direct human assistance for order queries, tracking, and product advice.',
  },
  {
    icon: 'fa-rotate-left',
    title: '7-Day Easy Returns',
    desc: 'Hassle-free replacement guarantee if product arrives damaged or defective.',
  },
];

export const HomeWhyChooseUs: React.FC = () => {
  return (
    <section
      className="py-5"
      style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
      }}
      aria-label="Why Choose Us"
    >
      <div className="container py-4">
        <div className="text-center mb-5">
          <span
            className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2"
            style={{
              background: 'color-mix(in srgb, var(--pd-primary) 12%, transparent)',
              color: 'var(--pd-primary)',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            <i className="fas fa-award" /> The PAKODRIVE Standard
          </span>
          <h2
            className="fw-black mb-2"
            style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              color: 'var(--pd-text-main, #0f172a)',
              letterSpacing: '-0.02em',
            }}
          >
            Why Thousands of Pakistanis Trust Us
          </h2>
          <p className="text-muted mx-auto mb-0" style={{ maxWidth: '600px', fontSize: '0.95rem' }}>
            Delivering top-tier electronics and automotive accessories with unmatched service and reliability nationwide.
          </p>
        </div>

        <div className="row g-4">
          {WHY_CARDS.map((item, idx) => (
            <div key={idx} className="col-12 col-sm-6 col-lg-3">
              <div
                className="h-100 p-4 rounded-4 bg-white border d-flex flex-column align-items-start transition-all"
                style={{
                  borderColor: '#e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 20px -3px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '48px',
                    height: '48px',
                    background: 'color-mix(in srgb, var(--pd-primary) 10%, #fff)',
                    color: 'var(--pd-primary)',
                    fontSize: '1.2rem',
                  }}
                >
                  <i className={`fas ${item.icon}`} />
                </div>
                <h5 className="fw-bold mb-2 text-dark" style={{ fontSize: '1.05rem' }}>
                  {item.title}
                </h5>
                <p className="text-muted mb-0 small" style={{ lineHeight: '1.5' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
