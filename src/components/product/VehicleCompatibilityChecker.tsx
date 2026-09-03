'use client';

import React from 'react';
import { IProduct } from '@/types';
import { useProductCompatibility } from '@/hooks/useVehicleCompatibility';

export interface VehicleCompatibilityCheckerProps {
  product: IProduct;
}

export const VehicleCompatibilityChecker: React.FC<VehicleCompatibilityCheckerProps> = ({ product }) => {
  const {
    mounted,
    selectedCar,
    isPickerOpen,
    setIsPickerOpen,
    handleSelectCar,
    handleClearCar,
    popularCars,
    domain,
    icon,
    color,
    bg,
    borderColor,
    title,
    badgeText,
    isCarSelectorNeeded,
    status,
  } = useProductCompatibility({ product });

  if (!mounted) return null;

  return (
    <div
      className="p-2.5 rounded-3 mb-3 border transition-all"
      style={{
        background: bg,
        borderColor: borderColor,
      }}
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2" style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: '#fff',
              color: color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <i className={icon} />
          </span>
          <div style={{ minWidth: 0 }}>
            <span
              className="fw-bold d-block text-truncate"
              style={{ fontSize: '0.76rem', color: color, lineHeight: 1.3 }}
            >
              {badgeText}
            </span>
          </div>
        </div>

        {/* If this is a vehicle part, show car selector toggle */}
        {isCarSelectorNeeded && (
          <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
            {selectedCar ? (
              <div className="d-flex align-items-center gap-1">
                <span className="badge bg-white text-dark border" style={{ fontSize: '0.68rem', padding: '4px 8px' }}>
                  🚗 {selectedCar}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(!isPickerOpen)}
                  className="btn btn-sm btn-link p-0 text-decoration-none fw-semibold text-secondary"
                  style={{ fontSize: '0.68rem' }}
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                className="btn btn-sm btn-outline-dark rounded-pill px-2.5 py-0.5 fw-bold"
                style={{ fontSize: '0.68rem' }}
              >
                Select Car ▾
              </button>
            )}
          </div>
        )}
      </div>

      {/* Car Selector Dropdown / Quick Pills */}
      {isCarSelectorNeeded && isPickerOpen && (
        <div className="mt-2.5 pt-2 border-top" style={{ borderColor: 'rgba(0,0,0,0.08)' }}>
          <span className="d-block small text-muted mb-1.5 fw-semibold" style={{ fontSize: '0.68rem' }}>
            Select your car model to confirm exact fitment:
          </span>
          <div className="d-flex flex-wrap gap-1.5">
            {popularCars.map((car) => {
              const isSelected = selectedCar === car;
              return (
                <button
                  key={car}
                  type="button"
                  onClick={() => handleSelectCar(car)}
                  className={`btn btn-sm rounded-pill px-2.5 py-0.5 ${
                    isSelected ? 'btn-dark' : 'btn-white border'
                  }`}
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    background: isSelected ? '#0f172a' : '#fff',
                    color: isSelected ? '#fff' : '#334155',
                  }}
                >
                  {car}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
