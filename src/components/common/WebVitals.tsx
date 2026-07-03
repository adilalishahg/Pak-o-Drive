'use client';

import { useReportWebVitals } from 'next/web-vitals';

const METRIC_DETAILS: Record<string, { title: string; desc: string; unit: string; goodRange: string; poorRange: string }> = {
  FCP: {
    title: 'First Contentful Paint ⏳',
    desc: 'Measures the time from when the page starts loading to when any part of the page\'s content is rendered on the screen.',
    unit: 'ms',
    goodRange: '≤ 1.8s',
    poorRange: '> 3.0s'
  },
  LCP: {
    title: 'Largest Contentful Paint 🖼️',
    desc: 'Measures the time from when the page starts loading to when the largest text block or image element is rendered on the screen.',
    unit: 'ms',
    goodRange: '≤ 2.5s',
    poorRange: '> 4.0s'
  },
  CLS: {
    title: 'Cumulative Layout Shift 📐',
    desc: 'Measures the visual stability of the page by quantifying how much elements shift layout during render.',
    unit: '',
    goodRange: '≤ 0.1',
    poorRange: '> 0.25'
  },
  FID: {
    title: 'First Input Delay ⚡',
    desc: 'Measures the time from when a user first interacts with the page to when the browser is able to respond to that interaction.',
    unit: 'ms',
    goodRange: '≤ 100ms',
    poorRange: '> 300ms'
  },
  INP: {
    title: 'Interaction to Next Paint 🖱️',
    desc: 'Measures the latency of all user interactions (clicks, taps, key presses) during the lifecycle of a page.',
    unit: 'ms',
    goodRange: '≤ 200ms',
    poorRange: '> 500ms'
  },
  TTFB: {
    title: 'Time to First Byte 📡',
    desc: 'Measures the time it takes for the browser to receive the first byte of data from the web server.',
    unit: 'ms',
    goodRange: '≤ 800ms',
    poorRange: '> 1800ms'
  }
};

export function WebVitals() {
  useReportWebVitals((metric) => {
    const info = METRIC_DETAILS[metric.name] || { title: metric.name, desc: '', unit: '', goodRange: '', poorRange: '' };
    const isGood = metric.rating === 'good';
    const isNeedsImp = metric.rating === 'needs-improvement';

    const color = isGood ? '#10b981' : isNeedsImp ? '#f59e0b' : '#ef4444';
    const ratingEmoji = isGood ? '🟢' : isNeedsImp ? '🟡' : '🔴';
    const ratingText = isGood ? 'GOOD' : isNeedsImp ? 'NEEDS IMPROVEMENT' : 'POOR';

    // Formatted value display
    const formattedValue = metric.name === 'CLS' 
      ? metric.value.toFixed(4) 
      : `${metric.value.toFixed(2)}${info.unit}`;

    // Collapsed header
    console.groupCollapsed(
      `%c[Web Vitals] %c${metric.name} %c${formattedValue} %c${ratingEmoji} ${ratingText}`,
      'color: #2563eb; font-weight: bold; font-family: system-ui;',
      'color: #111827; font-weight: 800; font-family: system-ui;',
      `color: ${color}; font-weight: 800; font-family: system-ui;`,
      `color: ${color}; font-weight: bold; font-family: system-ui;`
    );

    // Detailed metrics dashboard
    console.log(
      `%c📊 METRIC DETAILS FOR: %c${info.title}`,
      'font-weight: 700; color: #4b5563; font-family: system-ui;',
      'font-weight: 800; color: #1e3a8a; font-family: system-ui; font-size: 1.1em;'
    );
    console.log(
      `%cDescription: %c${info.desc}`,
      'font-weight: bold; color: #6b7280; font-family: system-ui;',
      'color: #4b5563; font-family: system-ui; font-style: italic;'
    );
    console.log(
      `%cValue:       %c${formattedValue}`,
      'font-weight: bold; color: #6b7280; font-family: system-ui;',
      `color: ${color}; font-weight: 800; font-family: system-ui; font-size: 1.05em;`
    );
    console.log(
      `%cRating:      %c${ratingText} ${ratingEmoji}`,
      'font-weight: bold; color: #6b7280; font-family: system-ui;',
      `color: ${color}; font-weight: 800; font-family: system-ui;`
    );
    console.log(
      `%cTarget:      %cGood: ${info.goodRange} | Poor: ${info.poorRange}`,
      'font-weight: bold; color: #6b7280; font-family: system-ui;',
      'color: #9ca3af; font-weight: bold; font-family: system-ui;'
    );
    console.groupEnd();
  });

  return null;
}
