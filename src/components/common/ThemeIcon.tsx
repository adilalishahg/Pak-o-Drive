'use client';

import React from 'react';
import { useSiteTheme } from './DynamicThemeProvider';
import { ThemeIconProps } from '@/types/common';

export const ThemeIcon: React.FC<ThemeIconProps> = ({ name, className = '', style }) => {

  const { theme } = useSiteTheme();
  const lib = theme.iconLibrary ?? 'fontawesome';

  // Map of abstract icon names to library-specific classes/values
  const iconMap: Record<string, Record<string, string>> = {
    phone: {
      fontawesome: 'fas fa-phone',
      bootstrap: 'bi bi-telephone-fill',
      material: 'phone',
      remix: 'ri-phone-fill',
      phosphor: 'ph-fill ph-phone',
    },
    sync: {
      fontawesome: 'fas fa-sync',
      bootstrap: 'bi bi-arrow-repeat',
      material: 'sync',
      remix: 'ri-refresh-line',
      phosphor: 'ph ph-arrows-counter-clockwise',
    },
    shipping: {
      fontawesome: 'fas fa-shipping-fast',
      bootstrap: 'bi bi-truck',
      material: 'local_shipping',
      remix: 'ri-truck-line',
      phosphor: 'ph ph-truck',
    },
    headset: {
      fontawesome: 'fas fa-headset',
      bootstrap: 'bi bi-headset',
      material: 'headset_mic',
      remix: 'ri-customer-service-2-line',
      phosphor: 'ph ph-headset',
    },
    gift: {
      fontawesome: 'fas fa-gift',
      bootstrap: 'bi bi-gift',
      material: 'card_giftcard',
      remix: 'ri-gift-line',
      phosphor: 'ph ph-gift',
    },
    shield: {
      fontawesome: 'fas fa-shield-alt',
      bootstrap: 'bi bi-shield-check',
      material: 'verified_user',
      remix: 'ri-shield-check-line',
      phosphor: 'ph ph-shield-check',
    },
    star: {
      fontawesome: 'fas fa-star',
      bootstrap: 'bi bi-star-fill',
      material: 'star',
      remix: 'ri-star-fill',
      phosphor: 'ph-fill ph-star',
    },
    smile: {
      fontawesome: 'fas fa-smile',
      bootstrap: 'bi bi-emoji-smile',
      material: 'sentiment_satisfied_alt',
      remix: 'ri-emotion-happy-line',
      phosphor: 'ph ph-smiley',
    },
    box: {
      fontawesome: 'fas fa-boxes-stacked',
      bootstrap: 'bi bi-boxes',
      material: 'inventory_2',
      remix: 'ri-archive-line',
      phosphor: 'ph ph-package',
    },
    award: {
      fontawesome: 'fas fa-award',
      bootstrap: 'bi bi-award',
      material: 'emoji_events',
      remix: 'ri-award-line',
      phosphor: 'ph ph-award',
    },
    search: {
      fontawesome: 'fas fa-search',
      bootstrap: 'bi bi-search',
      material: 'search',
      remix: 'ri-search-line',
      phosphor: 'ph ph-magnifying-glass',
    },
    heart: {
      fontawesome: 'fas fa-heart',
      bootstrap: 'bi bi-heart-fill',
      material: 'favorite',
      remix: 'ri-heart-fill',
      phosphor: 'ph-fill ph-heart',
    },
    cart: {
      fontawesome: 'fas fa-shopping-cart',
      bootstrap: 'bi bi-cart-fill',
      material: 'shopping_cart',
      remix: 'ri-shopping-cart-fill',
      phosphor: 'ph-fill ph-shopping-cart',
    },
    random: {
      fontawesome: 'fas fa-random',
      bootstrap: 'bi bi-shuffle',
      material: 'compare_arrows',
      remix: 'ri-shuffle-line',
      phosphor: 'ph ph-arrows-left-right',
    },
    categories: {
      fontawesome: 'fas fa-th-large',
      bootstrap: 'bi bi-grid-fill',
      material: 'grid_view',
      remix: 'ri-grid-fill',
      phosphor: 'ph ph-squares-four',
    },
    bars: {
      fontawesome: 'fas fa-bars',
      bootstrap: 'bi bi-list',
      material: 'menu',
      remix: 'ri-menu-line',
      phosphor: 'ph ph-list',
    },
    times: {
      fontawesome: 'fas fa-xmark',
      bootstrap: 'bi bi-x-lg',
      material: 'close',
      remix: 'ri-close-line',
      phosphor: 'ph ph-x',
    },
    'shopping-bag': {
      fontawesome: 'fas fa-shopping-bag',
      bootstrap: 'bi bi-bag-fill',
      material: 'local_mall',
      remix: 'ri-shopping-bag-fill',
      phosphor: 'ph-fill ph-shopping-bag',
    },
    'chevron-down': {
      fontawesome: 'fas fa-chevron-down',
      bootstrap: 'bi bi-chevron-down',
      material: 'keyboard_arrow_down',
      remix: 'ri-arrow-down-s-line',
      phosphor: 'ph ph-caret-down',
    },
    'arrow-right': {
      fontawesome: 'fas fa-arrow-right',
      bootstrap: 'bi bi-arrow-right',
      material: 'arrow_forward',
      remix: 'ri-arrow-right-line',
      phosphor: 'ph ph-arrow-right',
    },
    'arrow-up': {
      fontawesome: 'fas fa-arrow-up',
      bootstrap: 'bi bi-arrow-up',
      material: 'arrow_upward',
      remix: 'ri-arrow-up-line',
      phosphor: 'ph ph-arrow-up',
    },
    home: {
      fontawesome: 'fas fa-home',
      bootstrap: 'bi bi-house-fill',
      material: 'home',
      remix: 'ri-home-fill',
      phosphor: 'ph-fill ph-house',
    },
    fire: {
      fontawesome: 'fas fa-fire',
      bootstrap: 'bi bi-fire',
      material: 'whatshot',
      remix: 'ri-fire-fill',
      phosphor: 'ph-fill ph-fire',
    },
  };

  const currentDef = iconMap[name];
  if (!currentDef) {
    // If the name is already a class pattern, use it directly as fallback
    return <i className={`${name} ${className}`} style={style} />;
  }

  const value = currentDef[lib] || currentDef['fontawesome'];

  if (lib === 'material') {
    return (
      <span className={`material-icons-round ${className}`} style={{ ...style, fontSize: style?.fontSize || 'inherit' }}>
        {value}
      </span>
    );
  }

  return <i className={`${value} ${className}`} style={style} />;
};

/**
 * Universal Category Icon Component:
 * Automatically adapts any category icon (FontAwesome, etc.) to whichever
 * of the 5 icon libraries is currently active in Theme Settings!
 */
export const CategoryIcon: React.FC<{
  icon?: string;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
}> = ({ icon, className = '', style, fallback = 'fas fa-tag' }) => {
  const { theme } = useSiteTheme();
  const lib = theme.iconLibrary ?? 'fontawesome';

  const rawIcon = (icon && icon !== 'fas fa-tag' && icon !== 'fas fa-box') ? icon : fallback;

  // Cross-library category icon translation map
  const categoryLibraryMap: Record<string, Record<string, string>> = {
    'fas fa-car': {
      fontawesome: 'fas fa-car',
      bootstrap: 'bi bi-car-front-fill',
      material: 'directions_car',
      remix: 'ri-car-fill',
      phosphor: 'ph-fill ph-car',
    },
    'fas fa-mobile-alt': {
      fontawesome: 'fas fa-mobile-alt',
      bootstrap: 'bi bi-phone-fill',
      material: 'smartphone',
      remix: 'ri-smartphone-line',
      phosphor: 'ph-fill ph-device-mobile',
    },
    'fas fa-spray-can': {
      fontawesome: 'fas fa-spray-can',
      bootstrap: 'bi bi-droplet-fill',
      material: 'air',
      remix: 'ri-spray-line',
      phosphor: 'ph-fill ph-drop',
    },
    'fas fa-headphones': {
      fontawesome: 'fas fa-headphones',
      bootstrap: 'bi bi-headphones',
      material: 'headphones',
      remix: 'ri-headphone-line',
      phosphor: 'ph ph-headphones',
    },
    'fas fa-bolt': {
      fontawesome: 'fas fa-bolt',
      bootstrap: 'bi bi-lightning-charge-fill',
      material: 'bolt',
      remix: 'ri-flashlight-line',
      phosphor: 'ph-fill ph-lightning',
    },
    'fas fa-clock': {
      fontawesome: 'fas fa-clock',
      bootstrap: 'bi bi-smartwatch',
      material: 'watch',
      remix: 'ri-time-line',
      phosphor: 'ph ph-clock',
    },
    'fas fa-tools': {
      fontawesome: 'fas fa-tools',
      bootstrap: 'bi bi-tools',
      material: 'build',
      remix: 'ri-tools-line',
      phosphor: 'ph ph-wrench',
    },
    'fas fa-soap': {
      fontawesome: 'fas fa-soap',
      bootstrap: 'bi bi-water',
      material: 'cleaning_services',
      remix: 'ri-sparkling-line',
      phosphor: 'ph ph-sparkle',
    },
    'fas fa-lightbulb': {
      fontawesome: 'fas fa-lightbulb',
      bootstrap: 'bi bi-lightbulb-fill',
      material: 'lightbulb',
      remix: 'ri-lightbulb-line',
      phosphor: 'ph-fill ph-lightbulb',
    },
    'fas fa-video': {
      fontawesome: 'fas fa-video',
      bootstrap: 'bi bi-camera-video-fill',
      material: 'videocam',
      remix: 'ri-video-line',
      phosphor: 'ph-fill ph-video-camera',
    },
    'fas fa-car-side': {
      fontawesome: 'fas fa-car-side',
      bootstrap: 'bi bi-car-front',
      material: 'drive_eta',
      remix: 'ri-car-line',
      phosphor: 'ph ph-car',
    },
    'fas fa-battery-full': {
      fontawesome: 'fas fa-battery-full',
      bootstrap: 'bi bi-battery-full',
      material: 'battery_full',
      remix: 'ri-battery-fill',
      phosphor: 'ph-fill ph-battery-full',
    },
    'fas fa-motorcycle': {
      fontawesome: 'fas fa-motorcycle',
      bootstrap: 'bi bi-bicycle',
      material: 'two_wheeler',
      remix: 'ri-motorbike-line',
      phosphor: 'ph ph-motorcycle',
    },
    'fas fa-shield-alt': {
      fontawesome: 'fas fa-shield-alt',
      bootstrap: 'bi bi-shield-check',
      material: 'verified_user',
      remix: 'ri-shield-check-line',
      phosphor: 'ph ph-shield-check',
    },
    'fas fa-home': {
      fontawesome: 'fas fa-home',
      bootstrap: 'bi bi-house-fill',
      material: 'home',
      remix: 'ri-home-fill',
      phosphor: 'ph-fill ph-house',
    },
    'fas fa-cut': {
      fontawesome: 'fas fa-cut',
      bootstrap: 'bi bi-scissors',
      material: 'content_cut',
      remix: 'ri-scissors-line',
      phosphor: 'ph ph-scissors',
    },
    'fas fa-blender': {
      fontawesome: 'fas fa-blender',
      bootstrap: 'bi bi-cup-straw',
      material: 'blender',
      remix: 'ri-cup-line',
      phosphor: 'ph ph-cooking-pot',
    },
    'fas fa-broom': {
      fontawesome: 'fas fa-broom',
      bootstrap: 'bi bi-brush',
      material: 'cleaning_services',
      remix: 'ri-brush-line',
      phosphor: 'ph ph-broom',
    },
    'fas fa-boxes': {
      fontawesome: 'fas fa-boxes',
      bootstrap: 'bi bi-boxes',
      material: 'inventory_2',
      remix: 'ri-archive-line',
      phosphor: 'ph ph-package',
    },
    'fas fa-gamepad': {
      fontawesome: 'fas fa-gamepad',
      bootstrap: 'bi bi-controller',
      material: 'sports_esports',
      remix: 'ri-gamepad-line',
      phosphor: 'ph ph-game-controller',
    },
    'fas fa-tshirt': {
      fontawesome: 'fas fa-tshirt',
      bootstrap: 'bi bi-person-badge',
      material: 'checkroom',
      remix: 'ri-t-shirt-line',
      phosphor: 'ph ph-t-shirt',
    },
    'fas fa-laptop': {
      fontawesome: 'fas fa-laptop',
      bootstrap: 'bi bi-laptop',
      material: 'laptop_mac',
      remix: 'ri-macbook-line',
      phosphor: 'ph ph-laptop',
    },
    'fas fa-gift': {
      fontawesome: 'fas fa-gift',
      bootstrap: 'bi bi-gift-fill',
      material: 'card_giftcard',
      remix: 'ri-gift-line',
      phosphor: 'ph-fill ph-gift',
    },
    'fas fa-heartbeat': {
      fontawesome: 'fas fa-heartbeat',
      bootstrap: 'bi bi-activity',
      material: 'monitor_heart',
      remix: 'ri-heart-pulse-line',
      phosphor: 'ph ph-heartbeat',
    },
    'fas fa-couch': {
      fontawesome: 'fas fa-couch',
      bootstrap: 'bi bi-inbox',
      material: 'weekend',
      remix: 'ri-armchair-line',
      phosphor: 'ph ph-armchair',
    },
    'fas fa-camera': {
      fontawesome: 'fas fa-camera',
      bootstrap: 'bi bi-camera-fill',
      material: 'photo_camera',
      remix: 'ri-camera-fill',
      phosphor: 'ph-fill ph-camera',
    },
    'fas fa-wifi': {
      fontawesome: 'fas fa-wifi',
      bootstrap: 'bi bi-wifi',
      material: 'wifi',
      remix: 'ri-wifi-line',
      phosphor: 'ph ph-wifi-high',
    },
  };

  const matched = categoryLibraryMap[rawIcon];
  if (matched) {
    const val = matched[lib] || matched['fontawesome'];
    if (lib === 'material') {
      return (
        <span className={`material-icons-round ${className}`} style={{ ...style, fontSize: style?.fontSize || 'inherit' }}>
          {val}
        </span>
      );
    }
    return <i className={`${val} ${className}`} style={style} />;
  }

  return <i className={`${rawIcon} ${className}`} style={style} />;
};

