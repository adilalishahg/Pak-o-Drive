/**
 * Theme & UI Customization Constants for Pak-o-Drive Platform
 */

import { SiteTheme, SvgLogoSettings, IHeroSlideItem } from '../types/theme';

export const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Poppins', 'Montserrat', 'Plus Jakarta Sans',
  'Nunito', 'Raleway', 'DM Sans', 'Lato', 'Open Sans',
  'Outfit', 'Figtree', 'Sora', 'Space Grotesk', 'Josefin Sans',
] as const;

export const FONT_SIZE_OPTIONS = ['13px', '14px', '15px', '16px', '17px', '18px', '20px'] as const;

export const LOGO_PRESETS = [
  {
    name: '⚡ Cyber Cyan & Neon Orange (Default)',
    primaryColor: '#00A8E8',
    secondaryColor: '#0066CC',
    accentColor: '#FF7A00',
  },
  {
    name: '🏎️ Flame Red & Pitch Black',
    primaryColor: '#EF4444',
    secondaryColor: '#991B1B',
    accentColor: '#F97316',
  },
  {
    name: '👑 Royal Gold & Deep Navy',
    primaryColor: '#D4AF37',
    secondaryColor: '#0F172A',
    accentColor: '#F59E0B',
  },
  {
    name: '🌿 Emerald Green & Lime Glow',
    primaryColor: '#10B981',
    secondaryColor: '#065F46',
    accentColor: '#84CC16',
  },
  {
    name: '💎 Electric Violet & Hot Pink',
    primaryColor: '#A855F7',
    secondaryColor: '#6B21A8',
    accentColor: '#EC4899',
  },
  {
    name: '⚪ Minimalist Clean Monochrome',
    primaryColor: '#F8FAFC',
    secondaryColor: '#94A3B8',
    accentColor: '#38BDF8',
  },
] as const;

export const DEFAULT_SVG_LOGO: SvgLogoSettings = {
  enabled: true,
  primaryColor: '#00A8E8',
  secondaryColor: '#0066CC',
  accentColor: '#FF7A00',
  text1: 'PAKO',
  text2: 'DRIVE',
  fontFamily: 'Montserrat',
  fontWeight: '900',
  letterSpacing: 5,
  fontSize: 105,
  fontStyle: 'normal',
  showIcon: true,
  showText: true,
  height: 38,
  brandName: 'PAK-O-DRIVE',
  tagline: 'PREMIUM AUTO ACCENTS',
  glowEffect: true,
  scale: 1,
  boldness: '800',
  iconStyle: 'turbo-shield',
};

export const DEFAULT_HERO_SLIDES: IHeroSlideItem[] = [
  {
    enabled: true,
    badge: '🔥 #1 BESTSELLER IN PAKISTAN',
    title: 'Transform Your Car Into a Luxury Cockpit',
    subtitle: 'Upgrade your daily drive with genuine viral automotive gadgets, solar fragrances & neon ambient systems.',
    buttonText: 'Shop Trending Deals ➔',
    buttonLink: '/shop',
    imageType: 'custom',
    imageUrl: '/img/carousel-1.jpg',
  },
];

export const DEFAULT_THEME: SiteTheme = {
  primaryColor: '#ea580c',
  secondaryColor: '#0f172a',
  accentColor: '#3b82f6',
  successColor: '#10b981',
  fontFamily: 'Inter',
  fontSizeBase: '16px',
  borderRadius: '16px',
  buttonRadius: '50px',
  cardRadius: '16px',
  animationsEnabled: true,
  glassmorphismEnabled: true,
  shadowIntensity: 'medium',
  navbarStyle: 'dark',
  footerStyle: 'dark',
  heroGradientStart: '#fff7ed',
  heroGradientEnd: '#ffffff',
  iconLibrary: 'fontawesome',
  siteTagline: "Pakistan's Trusted Electronics Store",
  announcementBarText: '🎉 Free Shipping on orders above PKR 5,000 | 📦 30-Day Easy Returns | Shop Now →',
  announcementBarEnabled: true,
  layoutTheme: 'classic',
  svgLogo: DEFAULT_SVG_LOGO,
  homepageSections: {
    heroSlides: DEFAULT_HERO_SLIDES,
    heroSliderSettings: {
      autoSlideEnabled: true,
      autoSlideIntervalSec: 5,
      showArrows: true,
      showDots: true,
    },
    heroBig: {
      enabled: true,
      badge: 'Featured Product',
      title: 'Smart Speakers With Google Assistant',
      subtitle: 'Experience room-filling sound and intelligent voice assistance. Control your smart home with ease.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=600&q=80',
    },
    heroSmall: {
      enabled: true,
      badge: 'Special Discount',
      title: 'TWS Earbuds',
      highlight: '50% Off',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
    },
    trendingProducts: { enabled: true, title: 'Trending Products', limit: 4 },
    collections: { enabled: true, title: 'The Top Collections' },
    weeklyDeal: {
      enabled: true,
      label: 'The Big Deal This Week',
      title: 'Apple iPhone 12 Pro Max 128GB Blue Edition',
      description: 'Get the ultimate photography and performance package. Limited stock available at a special discount.',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
      imageUrl: 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?auto=format&fit=crop&w=500&q=80',
    },
    moreDeals: { enabled: true, title: 'More Active Deals', limit: 4 },
    featuredSection: { enabled: true, title: 'Featured Products', limit: 8 },
    valueProps: { enabled: true },
    offerBanner1: {
      enabled: true,
      subtitle: 'Special Discount',
      title: 'TWS Earbuds',
      discount: '50% Off',
      buttonLink: '/shop?category=headphones',
      imageUrl: '/img/product-1.png',
    },
    offerBanner2: {
      enabled: true,
      subtitle: 'Find The Best Smartwatches for You!',
      title: 'Smart Wearables',
      discount: '20% Off',
      buttonLink: '/shop?category=smartwatches',
      imageUrl: '/img/product-2.png',
    },
  },
};
