'use client';

import React, { useState, useMemo } from 'react';
import { CategoryIcon } from '@/components/common/ThemeIcon';

export interface IconOption {
  icon: string;
  name: string;
  category: 'Automotive' | 'Electronics' | 'Audio & Media' | 'Tools & Hardware' | 'Home & Lifestyle' | 'General';
  keywords: string[];
}

export const CURATED_ICON_PALETTE: IconOption[] = [
  // Automotive
  { icon: 'fas fa-car', name: 'Car / Auto', category: 'Automotive', keywords: ['car', 'auto', 'vehicle', 'drive', 'sedan'] },
  { icon: 'fas fa-car-side', name: 'Car Side / Interior', category: 'Automotive', keywords: ['car', 'side', 'profile', 'interior', 'door'] },
  { icon: 'fas fa-spray-can', name: 'Car Perfume / Scent', category: 'Automotive', keywords: ['perfume', 'scent', 'freshener', 'spray', 'fragrance', 'aroma'] },
  { icon: 'fas fa-soap', name: 'Car Wash & Detailing', category: 'Automotive', keywords: ['wash', 'soap', 'cleaner', 'detail', 'shampoo', 'polish'] },
  { icon: 'fas fa-tools', name: 'Car Tools & Repair', category: 'Automotive', keywords: ['tools', 'repair', 'wrench', 'fix', 'mechanic'] },
  { icon: 'fas fa-video', name: 'Dashcam & Cameras', category: 'Automotive', keywords: ['dashcam', 'camera', 'dvr', 'video', 'recorder'] },
  { icon: 'fas fa-lightbulb', name: 'LED Lights & Bulbs', category: 'Automotive', keywords: ['led', 'light', 'bulb', 'ambient', 'lamp', 'headlight'] },
  { icon: 'fas fa-motorcycle', name: 'Bikes & Motor', category: 'Automotive', keywords: ['bike', 'motorcycle', 'scooter', 'two-wheeler'] },
  { icon: 'fas fa-gas-pump', name: 'Fuel & Fluids', category: 'Automotive', keywords: ['fuel', 'gas', 'oil', 'petrol', 'diesel'] },
  { icon: 'fas fa-tachometer-alt', name: 'Meters & Gauges', category: 'Automotive', keywords: ['speedometer', 'gauge', 'meter', 'tacho'] },
  { icon: 'fas fa-shield-alt', name: 'Car Security & Care', category: 'Automotive', keywords: ['security', 'shield', 'protect', 'alarm'] },
  { icon: 'fas fa-key', name: 'Key & Remotes', category: 'Automotive', keywords: ['key', 'remote', 'fob', 'lock'] },

  // Electronics & Mobile
  { icon: 'fas fa-mobile-alt', name: 'Mobile Phones', category: 'Electronics', keywords: ['phone', 'mobile', 'smartphone', 'iphone', 'android'] },
  { icon: 'fas fa-bolt', name: 'Fast Chargers & Cables', category: 'Electronics', keywords: ['charger', 'cable', 'fast', 'lightning', 'type-c', 'usb', 'power'] },
  { icon: 'fas fa-battery-full', name: 'Power Banks & Batteries', category: 'Electronics', keywords: ['powerbank', 'battery', 'charge', 'accumulator'] },
  { icon: 'fas fa-laptop', name: 'Laptops & Computers', category: 'Electronics', keywords: ['laptop', 'macbook', 'pc', 'computer'] },
  { icon: 'fas fa-tablet-alt', name: 'Tablets & iPads', category: 'Electronics', keywords: ['tablet', 'ipad', 'screen'] },
  { icon: 'fas fa-clock', name: 'Smartwatches & Bands', category: 'Electronics', keywords: ['watch', 'smartwatch', 'band', 'clock', 'time'] },
  { icon: 'fas fa-wifi', name: 'WiFi & Networking', category: 'Electronics', keywords: ['wifi', 'router', 'network', 'wireless', 'internet'] },
  { icon: 'fas fa-gamepad', name: 'Gaming & Joysticks', category: 'Electronics', keywords: ['game', 'gaming', 'joystick', 'console', 'controller'] },
  { icon: 'fas fa-plug', name: 'Adapters & Plugs', category: 'Electronics', keywords: ['plug', 'socket', 'adapter', 'connector'] },
  { icon: 'fas fa-microchip', name: 'Processors & Tech', category: 'Electronics', keywords: ['chip', 'cpu', 'board', 'circuit', 'tech'] },

  // Audio & Media
  { icon: 'fas fa-headphones', name: 'Headphones & Earbuds', category: 'Audio & Media', keywords: ['headphone', 'earbud', 'airpod', 'earphone', 'handsfree', 'audio'] },
  { icon: 'fas fa-volume-up', name: 'Speakers & Bass', category: 'Audio & Media', keywords: ['speaker', 'sound', 'bass', 'audio', 'bluetooth-speaker'] },
  { icon: 'fas fa-microphone', name: 'Microphones & Mics', category: 'Audio & Media', keywords: ['mic', 'microphone', 'voice', 'record'] },
  { icon: 'fas fa-camera', name: 'DSLR & Photography', category: 'Audio & Media', keywords: ['camera', 'photo', 'picture', 'lens'] },
  { icon: 'fas fa-tv', name: 'Displays & TVs', category: 'Audio & Media', keywords: ['tv', 'screen', 'monitor', 'display'] },
  { icon: 'fas fa-music', name: 'Music & Sounds', category: 'Audio & Media', keywords: ['music', 'song', 'tune', 'audio'] },

  // Tools & Hardware
  { icon: 'fas fa-wrench', name: 'Wrenches & Spanners', category: 'Tools & Hardware', keywords: ['wrench', 'spanner', 'tighten', 'tool'] },
  { icon: 'fas fa-screwdriver', name: 'Screwdrivers & Sets', category: 'Tools & Hardware', keywords: ['screwdriver', 'hardware', 'bits'] },
  { icon: 'fas fa-hammer', name: 'Hammers & Mallets', category: 'Tools & Hardware', keywords: ['hammer', 'mallet', 'build'] },
  { icon: 'fas fa-cog', name: 'Gears & Parts', category: 'Tools & Hardware', keywords: ['gear', 'settings', 'part', 'mechanical'] },
  { icon: 'fas fa-cogs', name: 'Engines & Assemblies', category: 'Tools & Hardware', keywords: ['engine', 'parts', 'machinery'] },

  // Home & Lifestyle
  { icon: 'fas fa-home', name: 'Home & Living', category: 'Home & Lifestyle', keywords: ['home', 'house', 'living', 'decor'] },
  { icon: 'fas fa-blender', name: 'Kitchen & Appliances', category: 'Home & Lifestyle', keywords: ['kitchen', 'blender', 'appliance', 'cooking'] },
  { icon: 'fas fa-couch', name: 'Furniture & Comfort', category: 'Home & Lifestyle', keywords: ['sofa', 'couch', 'chair', 'seat', 'cushion'] },
  { icon: 'fas fa-tshirt', name: 'Apparel & Fashion', category: 'Home & Lifestyle', keywords: ['shirt', 'cloth', 'apparel', 'wear', 'fashion'] },
  { icon: 'fas fa-shoe-prints', name: 'Footwear & Shoes', category: 'Home & Lifestyle', keywords: ['shoe', 'footwear', 'sneakers'] },
  { icon: 'fas fa-cut', name: 'Grooming & Trimmers', category: 'Home & Lifestyle', keywords: ['trimmer', 'grooming', 'shaver', 'scissors', 'hair'] },
  { icon: 'fas fa-heartbeat', name: 'Health & Fitness', category: 'Home & Lifestyle', keywords: ['health', 'fitness', 'medical', 'gym'] },

  // General & Commerce
  { icon: 'fas fa-box', name: 'Single Package', category: 'General', keywords: ['box', 'package', 'parcel'] },
  { icon: 'fas fa-boxes', name: 'Bulk Inventory', category: 'General', keywords: ['inventory', 'stock', 'warehouse', 'boxes'] },
  { icon: 'fas fa-gift', name: 'Gifts & Combos', category: 'General', keywords: ['gift', 'present', 'deal', 'combo'] },
  { icon: 'fas fa-tag', name: 'Generic Tag', category: 'General', keywords: ['tag', 'category', 'item', 'label'] },
  { icon: 'fas fa-tags', name: 'Multiple Tags', category: 'General', keywords: ['tags', 'offers', 'labels'] },
  { icon: 'fas fa-star', name: 'Featured / Special', category: 'General', keywords: ['star', 'featured', 'top', 'favorite'] },
  { icon: 'fas fa-crown', name: 'VIP / Luxury', category: 'General', keywords: ['crown', 'vip', 'premium', 'luxury'] },
  { icon: 'fas fa-fire', name: 'Hot / Trending', category: 'General', keywords: ['hot', 'trend', 'fire', 'viral'] },
];

export interface IconPalettePickerProps {
  selectedIcon: string;
  onSelectIcon: (iconClass: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const IconPalettePicker: React.FC<IconPalettePickerProps> = ({
  selectedIcon,
  onSelectIcon,
  isOpen,
  onToggle,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categoriesList = ['All', 'Automotive', 'Electronics', 'Audio & Media', 'Tools & Hardware', 'Home & Lifestyle', 'General'];

  const filteredIcons = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return CURATED_ICON_PALETTE.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      if (!matchCat) return false;

      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.icon.toLowerCase().includes(q) ||
        item.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="icon-palette-picker-container mt-2">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <button
          type="button"
          onClick={onToggle}
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 rounded-pill px-3 py-1"
          style={{ fontSize: '0.78rem', fontWeight: 600 }}
        >
          <i className="fas fa-icons" />
          <span>{isOpen ? 'Close Icon Palette' : '🎨 Browse Visual Icon Palette'}</span>
        </button>
      </div>

      {isOpen && (
        <div
          className="bg-white border rounded-3 p-3 shadow-sm"
          style={{ maxHeight: '340px', overflowY: 'auto' }}
        >
          {/* Search Input */}
          <div className="position-relative mb-2.5">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons... e.g. car, perfume, phone, led, watch, tools"
              className="form-control form-control-sm rounded-pill pe-5 ps-3"
              style={{ fontSize: '0.8rem' }}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-muted"
                style={{ fontSize: '0.75rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="d-flex gap-1 mb-3 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`btn btn-sm py-0.5 px-2 rounded-pill ${
                  activeCategory === cat ? 'btn-dark' : 'btn-light text-muted'
                }`}
                style={{ fontSize: '0.70rem', fontWeight: 600 }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Icon Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
              gap: '8px',
            }}
          >
            {filteredIcons.map((opt) => {
              const isSelected = selectedIcon === opt.icon;
              return (
                <button
                  key={opt.icon}
                  type="button"
                  onClick={() => {
                    onSelectIcon(opt.icon);
                    onToggle();
                  }}
                  className={`btn p-2 d-flex flex-column align-items-center justify-content-center text-center rounded-3 border transition-all ${
                    isSelected ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold' : 'border-light bg-light bg-opacity-50 text-dark'
                  }`}
                  style={{
                    height: '62px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px var(--pd-primary, #ea580c)' : 'none',
                  }}
                  title={`${opt.name} (${opt.icon})`}
                >
                  <div style={{ fontSize: '16px', marginBottom: '3px' }}>
                    <CategoryIcon icon={opt.icon} />
                  </div>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      lineHeight: 1.1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '56px',
                    }}
                  >
                    {opt.name.split('/')[0].trim()}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredIcons.length === 0 && (
            <div className="text-center py-4 text-muted small">
              <i className="fas fa-search mb-1 d-block" style={{ fontSize: '18px', opacity: 0.5 }} />
              No icons found matching &quot;{searchQuery}&quot;.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
