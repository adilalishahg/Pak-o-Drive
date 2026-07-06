import React from 'react';

// Tells Next.js Turbopack to skip instant navigation validation check for this route segment
export const instant = false;

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
