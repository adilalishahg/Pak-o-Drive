'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console or error-reporting service
    console.error('Next.js App Router caught error boundary crash:', error);
  }, [error]);

  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light p-4 text-center"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="card border-0 shadow-sm rounded-4 p-5 bg-white max-w-md">
        <div 
          className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 text-danger mb-4"
          style={{ width: '72px', height: '72px' }}
        >
          <i className="fas fa-exclamation-triangle fa-2x" />
        </div>
        
        <h3 className="fw-bold text-dark mb-2">Something Went Wrong</h3>
        <p className="text-muted small mb-4">
          An unexpected error occurred while loading this page. Our technical team has been notified.
        </p>

        <div className="d-flex flex-column gap-2">
          <button
            onClick={() => reset()}
            className="btn btn-primary rounded-pill py-2.5 px-4 border-0"
            style={{ fontWeight: 600 }}
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="btn btn-outline-secondary rounded-pill py-2.5 px-4"
            style={{ fontWeight: 600 }}
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
