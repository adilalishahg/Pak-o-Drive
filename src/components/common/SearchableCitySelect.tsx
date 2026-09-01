'use client';

import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { PAKISTAN_MAJOR_CITIES, DEFAULT_POPULAR_CITIES } from '../../lib/constants';
import { SearchableCitySelectProps } from '@/types/common';
export type { SearchableCitySelectProps };


export function SearchableCitySelect({
  value,
  onChange,
  placeholder = 'Search or select your city...',
  required = false,
  name = 'city',
  id,
  disabled = false,
  className = '',
  inputStyle = {},
  popularCities = DEFAULT_POPULAR_CITIES,
}: SearchableCitySelectProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on search term
  const filteredCities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return Array.from(PAKISTAN_MAJOR_CITIES);

    return PAKISTAN_MAJOR_CITIES.filter(city =>
      city.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const hasExactMatch = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return false;
    return PAKISTAN_MAJOR_CITIES.some(c => c.toLowerCase() === term);
  }, [searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle city selection
  const handleSelect = (city: string) => {
    onChange(city);
    setIsOpen(false);
    setSearchTerm('');
    setHighlightedIndex(-1);
  };

  // Keyboard navigation inside search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const totalOptions = filteredCities.length + (!hasExactMatch && searchTerm.trim().length > 0 ? 1 : 0);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < totalOptions - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
        handleSelect(filteredCities[highlightedIndex]);
      } else if (highlightedIndex === filteredCities.length && !hasExactMatch && searchTerm.trim()) {
        handleSelect(searchTerm.trim());
      } else if (filteredCities.length > 0) {
        handleSelect(filteredCities[0]);
      } else if (searchTerm.trim()) {
        handleSelect(searchTerm.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div ref={containerRef} className={`searchable-city-select-wrapper ${className}`} style={{ position: 'relative', width: '100%' }}>
      {/* Hidden real input for form semantics */}
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />

      {/* Main Trigger Button / Field */}
      <div
        id={inputId}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen(prev => !prev);
        }}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        style={{
          width: '100%',
          border: isOpen ? '1.5px solid var(--pd-primary, #0284c7)' : '1.5px solid #cbd5e1',
          borderRadius: '8px',
          padding: '11px 14px',
          fontSize: '0.92rem',
          outline: 'none',
          color: value ? '#0f172a' : '#94a3b8',
          background: disabled ? '#f8fafc' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          boxShadow: isOpen ? '0 0 0 3px rgba(2, 132, 199, 0.15)' : 'none',
          transition: 'all 0.18s ease',
          ...inputStyle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <i
            className="fas fa-map-marker-alt"
            style={{
              color: value ? 'var(--pd-primary, #0284c7)' : '#94a3b8',
              fontSize: '15px',
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: value ? 600 : 400, color: value ? '#0f172a' : '#94a3b8' }}>
            {value || placeholder}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {value && !disabled && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onChange('');
                setSearchTerm('');
              }}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontSize: '10px',
                cursor: 'pointer',
              }}
              title="Clear selection"
            >
              <i className="fas fa-times" />
            </button>
          )}
          <i
            className="fas fa-chevron-down"
            style={{
              fontSize: '11px',
              color: '#64748b',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s ease',
            }}
          />
        </div>
      </div>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 32px -4px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(0,0,0,0.06)',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'cityDropdownFadeIn 0.16s ease-out',
          }}
        >
          {/* Search Header Input */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <i
                className="fas fa-search"
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: '#94a3b8',
                  fontSize: '13px',
                }}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type city name (e.g. Lahore, Karachi, Rawalpindi)..."
                style={{
                  width: '100%',
                  padding: '9px 34px 9px 34px',
                  borderRadius: '8px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.86rem',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#fff',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04) inset',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: '4px',
                  }}
                >
                  <i className="fas fa-times" />
                </button>
              )}
            </div>

            {/* Quick Popular Cities Chips (when not actively searching) */}
            {!searchTerm && popularCities.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '5px' }}>
                  ⚡ Popular Hubs:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {popularCities.map(pc => {
                    const isSelected = value === pc;
                    return (
                      <button
                        key={pc}
                        type="button"
                        onClick={() => handleSelect(pc)}
                        style={{
                          border: isSelected ? '1px solid var(--pd-primary, #0284c7)' : '1px solid #e2e8f0',
                          background: isSelected ? 'rgba(2, 132, 199, 0.1)' : '#fff',
                          color: isSelected ? 'var(--pd-primary, #0284c7)' : '#334155',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '0.74rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          transition: 'all 0.12s ease',
                        }}
                      >
                        {pc}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* City Options List */}
          <div
            ref={listRef}
            role="listbox"
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px',
            }}
          >
            {filteredCities.map((city, idx) => {
              const isSelected = value === city;
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={city}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(city)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isHighlighted ? '#f1f5f9' : isSelected ? '#f0f9ff' : 'transparent',
                    color: isSelected ? 'var(--pd-primary, #0284c7)' : '#1e293b',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    transition: 'background 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i
                      className="fas fa-city"
                      style={{
                        fontSize: '12px',
                        color: isSelected ? 'var(--pd-primary, #0284c7)' : '#94a3b8',
                      }}
                    />
                    <span>{city}</span>
                  </div>

                  {isSelected && (
                    <i className="fas fa-check" style={{ color: 'var(--pd-primary, #0284c7)', fontSize: '13px' }} />
                  )}
                </div>
              );
            })}

            {/* Custom City typing option if not found or typing any other town */}
            {searchTerm.trim().length > 0 && !hasExactMatch && (
              <div
                role="option"
                onClick={() => handleSelect(searchTerm.trim())}
                onMouseEnter={() => setHighlightedIndex(filteredCities.length)}
                style={{
                  padding: '10px 12px',
                  marginTop: '4px',
                  borderRadius: '6px',
                  borderTop: '1px dashed #cbd5e1',
                  background: highlightedIndex === filteredCities.length ? '#f0fdf4' : '#fafafa',
                  color: '#15803d',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <i className="fas fa-plus-circle" style={{ color: '#16a34a' }} />
                <span>
                  Deliver to custom city: <strong>&ldquo;{searchTerm.trim()}&rdquo;</strong>
                </span>
              </div>
            )}

            {filteredCities.length === 0 && searchTerm.trim().length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No cities found.
              </div>
            )}
          </div>

          {/* Delivery Note footer */}
          <div
            style={{
              padding: '6px 12px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              fontSize: '0.72rem',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <i className="fas fa-truck-moving" style={{ color: 'var(--pd-primary, #0284c7)' }} />
              <span>Nationwide Express COD Coverage</span>
            </span>
            <span>{filteredCities.length} cities</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableCitySelect;
