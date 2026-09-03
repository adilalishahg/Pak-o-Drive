'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { IProduct } from '@/types';

export const POPULAR_PAKISTANI_CARS = [
  'Suzuki Mehran',
  'Suzuki Alto',
  'Suzuki Cultus',
  'Suzuki Wagon R',
  'Toyota Corolla',
  'Toyota Yaris',
  'Honda Civic',
  'Honda City',
  'Daihatsu Mira',
  'Changan Alsvin',
];

export type ProductDomainType =
  | 'car_specific'
  | 'car_universal'
  | 'electronics'
  | 'home_kitchen'
  | 'bikes'
  | 'kids_child'
  | 'daily_use';

export interface UseProductCompatibilityProps {
  product: IProduct;
}

export function useProductCompatibility({ product }: UseProductCompatibilityProps) {
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('pakodrive_user_vehicle');
      if (saved) setSelectedCar(saved);
    } catch {
      // Ignore
    }
  }, []);

  const handleSelectCar = useCallback((car: string) => {
    setSelectedCar(car);
    setIsPickerOpen(false);
    try {
      localStorage.setItem('pakodrive_user_vehicle', car);
    } catch {
      // Ignore
    }
  }, []);

  const handleClearCar = useCallback(() => {
    setSelectedCar(null);
    try {
      localStorage.removeItem('pakodrive_user_vehicle');
    } catch {
      // Ignore
    }
  }, []);

  // Detect product domain and build relevant compatibility/trust response
  const domainInfo = useMemo(() => {
    const rawSpecs = product.specifications || {};
    const specFitment = (
      rawSpecs['Vehicle Compatibility'] ||
      rawSpecs['Compatibility'] ||
      rawSpecs['Fitment'] ||
      ''
    ).toString().toLowerCase();

    const title = (product.name || '').toLowerCase();
    const category = (product.category || '').toLowerCase();

    // 1. Electronics & Smart Tech (Earbuds, Chargers, Powerbanks, Smartwatches)
    if (
      category.includes('mobile') ||
      category.includes('audio') ||
      category.includes('tech') ||
      category.includes('earbud') ||
      category.includes('smartwatch') ||
      title.includes('earbuds') ||
      title.includes('charger') ||
      title.includes('cable') ||
      title.includes('smartwatch') ||
      title.includes('bluetooth')
    ) {
      return {
        domain: 'electronics' as ProductDomainType,
        icon: 'fas fa-mobile-android-alt',
        color: '#2563eb',
        bg: '#eff6ff',
        borderColor: '#bfdbfe',
        title: 'Universal Device Compatibility',
        badgeText: '📱 100% Compatible with all Android, iPhone, Laptops & Bluetooth Devices (Plug & Play)',
        isCarSelectorNeeded: false,
      };
    }

    // 2. Bikes & Motorcycling
    if (
      category.includes('bike') ||
      category.includes('motorcycle') ||
      title.includes('bike') ||
      title.includes('motorcycle') ||
      title.includes('70cc') ||
      title.includes('125cc')
    ) {
      return {
        domain: 'bikes' as ProductDomainType,
        icon: 'fas fa-motorcycle',
        color: '#0891b2',
        bg: '#ecfeff',
        borderColor: '#a5f3fc',
        title: 'Universal Bike Compatibility',
        badgeText: '🏍️ Guaranteed Fit for 70cc, 125cc, 150cc & all standard Pakistani motorbikes',
        isCarSelectorNeeded: false,
      };
    }

    // 3. Home & Kitchen Smart Gadgets
    if (
      category.includes('home') ||
      category.includes('kitchen') ||
      title.includes('blender') ||
      title.includes('vacuum') ||
      title.includes('sensor light') ||
      title.includes('organizer')
    ) {
      return {
        domain: 'home_kitchen' as ProductDomainType,
        icon: 'fas fa-home-alt',
        color: '#059669',
        bg: '#f0fdf4',
        borderColor: '#bbf7d0',
        title: 'Home & Travel Ready',
        badgeText: '🏠 Ideal for Home, Kitchen & Travel: 100% Safe, Energy Efficient & Family Ready',
        isCarSelectorNeeded: false,
      };
    }

    // 4. Kids, Toys & Baby Products
    if (
      category.includes('kid') ||
      category.includes('child') ||
      category.includes('baby') ||
      category.includes('toy') ||
      title.includes('baby') ||
      title.includes('kids') ||
      title.includes('toy')
    ) {
      return {
        domain: 'kids_child' as ProductDomainType,
        icon: 'fas fa-child',
        color: '#db2777',
        bg: '#fdf2f8',
        borderColor: '#fbcfe8',
        title: 'Child-Safe & Non-Toxic',
        badgeText: '👶 100% Child-Safe, Non-Toxic & Rounded Corners: Certified for Everyday Safe Play',
        isCarSelectorNeeded: false,
      };
    }

    // 5. Car Universal (Perfumes, Polishes, Microfiber Towels, Wax, Foam Tape)
    const isCarUniversal =
      title.includes('perfume') ||
      title.includes('freshner') ||
      title.includes('polish') ||
      title.includes('wax') ||
      title.includes('towel') ||
      title.includes('tape') ||
      title.includes('spray') ||
      category.includes('perfume') ||
      category.includes('polish');

    if (isCarUniversal) {
      return {
        domain: 'car_universal' as ProductDomainType,
        icon: 'fas fa-check-circle',
        color: '#15803d',
        bg: '#f0fdf4',
        borderColor: '#bbf7d0',
        title: 'Universal Automotive Fit',
        badgeText: '🟢 Universal Fit: Compatible with all Pakistani cars, dashboards & 12V sockets',
        isCarSelectorNeeded: false,
      };
    }

    // 6. Car Specific Part (e.g. Mehran Side Mirrors, specific headlights/bumpers)
    const isCarPart =
      category.includes('car') ||
      category.includes('auto') ||
      title.includes('mirror') ||
      title.includes('light') ||
      title.includes('mehran') ||
      title.includes('corolla') ||
      title.includes('civic') ||
      title.includes('cultus') ||
      title.includes('alto');

    if (isCarPart) {
      if (!selectedCar) {
        let targetCar = 'Suzuki Mehran';
        for (const car of POPULAR_PAKISTANI_CARS) {
          if (title.includes(car.toLowerCase()) || specFitment.includes(car.toLowerCase())) {
            targetCar = car;
            break;
          }
        }
        return {
          domain: 'car_specific' as ProductDomainType,
          icon: 'fas fa-car-side',
          color: '#ea580c',
          bg: '#fff7ed',
          borderColor: '#fed7aa',
          title: 'Vehicle Fitment Verification',
          badgeText: `Designed for ${targetCar}. Tap to verify with your car:`,
          isCarSelectorNeeded: true,
          status: 'prompt',
          fitVehicleName: targetCar,
        };
      }

      const selectedLower = selectedCar.toLowerCase();
      const carModelOnly = selectedLower.replace('suzuki ', '').replace('toyota ', '').replace('honda ', '').replace('daihatsu ', '');
      const isMatch =
        title.includes(selectedLower) ||
        title.includes(carModelOnly) ||
        specFitment.includes(selectedLower) ||
        specFitment.includes(carModelOnly);

      if (isMatch) {
        return {
          domain: 'car_specific' as ProductDomainType,
          icon: 'fas fa-check-double',
          color: '#15803d',
          bg: '#f0fdf4',
          borderColor: '#bbf7d0',
          title: 'Guaranteed Exact Fit',
          badgeText: `✅ 100% Guaranteed Exact Fit for your ${selectedCar}`,
          isCarSelectorNeeded: true,
          status: 'exact_fit',
          fitVehicleName: selectedCar,
        };
      }

      return {
        domain: 'car_specific' as ProductDomainType,
        icon: 'fas fa-exclamation-triangle',
        color: '#b45309',
        bg: '#fffbeb',
        borderColor: '#fde68a',
        title: 'Fitment Notice',
        badgeText: `⚠️ Note: Specifically made for other models and may not fit your ${selectedCar}`,
        isCarSelectorNeeded: true,
        status: 'incompatible',
        fitVehicleName: selectedCar,
      };
    }

    // 7. General Daily Use / Lifestyle
    return {
      domain: 'daily_use' as ProductDomainType,
      icon: 'fas fa-badge-check',
      color: '#475569',
      bg: '#f8fafc',
      borderColor: '#e2e8f0',
      title: 'Quality Assured Item',
      badgeText: '✨ Premium Quality Inspected: Ready for Immediate Everyday Use Across Pakistan',
      isCarSelectorNeeded: false,
    };
  }, [product.category, product.name, product.specifications, selectedCar]);

  return {
    mounted,
    selectedCar,
    isPickerOpen,
    setIsPickerOpen,
    handleSelectCar,
    handleClearCar,
    popularCars: POPULAR_PAKISTANI_CARS,
    ...domainInfo,
  };
}
