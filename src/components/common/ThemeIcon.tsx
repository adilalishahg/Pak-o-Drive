'use client';

import React from 'react';
import { useSiteTheme } from './DynamicThemeProvider';

interface ThemeIconProps {
  name: string;
  className?: string;
  style?: React.CSSProperties;
}

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
