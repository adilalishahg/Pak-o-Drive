/**
 * Common & Reusable UI Component Types for Pak-o-Drive Platform
 */

import { ImageProps } from 'next/image';

export interface MetricCardProps {
  title: string;
  metricType: string;
  initialValue: number;
  formatValue: (val: number) => string;
  iconClass: string;
  iconBg: string;
  iconColor: string;
  footerContent?: React.ReactNode;
  globalRange?: string;
  className?: string;
  label?: string;
  value?: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
}

export interface OptimizedImageProps extends Omit<ImageProps, 'loader'> {
  fallbackSrc?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'auto';
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  ambientBlur?: boolean;
}

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface MarkerData {
  lat: number;
  lng: number;
  popupText?: string;
  city?: string;
  orders?: number;
  revenue?: number;
  topProduct?: string;
}

export interface InteractiveMapProps {
  center: [number, number];
  zoom: number;
  markers?: MarkerData[];
  circle?: {
    lat: number;
    lng: number;
    radius: number;
    color?: string;
  };
  routes?: Array<{
    path: [number, number][];
    color?: string;
    weight?: number;
    opacity?: number;
  }>;
  selectedCity?: string;
  onCityClick?: (city: string) => void;
  className?: string;
  height?: string;
}


export interface HeroSlide {
  badge: string;
  tagline: string;
  title: string;
  desc: string;
  btnLink: string;
  btnLabel: string;
  accent: string;
  bg: string;
  productImage?: string;
  productImageAlt?: string;
  id?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  price?: number;
  originalPrice?: number;
}

export interface HeroSliderProps {
  slides: HeroSlide[];
  autoPlayMs?: number;
  autoPlayEnabled?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  engine?: 'classic' | 'smooothy';
}

export interface TimeSeriesItem {
  name: string;
  Revenue: number;
  Pageviews: number;
  Conversion: number;
}

export interface DeviceItem {
  name: string;
  value: number;
  color: string;
}

export interface AgeItem {
  name: string;
  count: number;
}


export interface NotificationItem {
  customerName: string;
  city: string;
  productName: string;
  productImage: string;
  productLink: string;
  timeAgo: string;
}


export interface SearchableCitySelectProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  required?: boolean;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  inputStyle?: React.CSSProperties;
  popularCities?: string[];
  error?: string;
  label?: string;
}


export interface ProductViewLoggerProps {
  id: string;
  name: string;
  category: string;
  price: number;
}


export interface ThemeIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}
