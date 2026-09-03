'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SuggestionItem {
  id: string;
  name: string;
  subText: string;
  fullAddress: string;
  city?: string;
  lat?: string | number;
  lng?: string | number;
}

interface AddressLocationPickerProps {
  address: string;
  onChangeAddress: (address: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  required?: boolean;
}

export const AddressLocationPicker: React.FC<AddressLocationPickerProps> = ({
  address,
  onChangeAddress,
  selectedCity,
  onSelectCity,
  required = true,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Autocomplete Suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    try {
      setIsSearching(true);
      const res = await fetch(
        `/api/locations/autocomplete?q=${encodeURIComponent(query)}&city=${encodeURIComponent(
          selectedCity || ''
        )}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setIsOpen(true);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    } catch (err) {
      console.warn('Address autocomplete fetch error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [selectedCity]);

  // Handle User Input Change with Debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChangeAddress(val);
    setLocationSuccess(null);
    setLocationError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 350);
  };

  // Select a Suggestion
  const handleSelectSuggestion = (item: SuggestionItem) => {
    // Preserve house/flat number if user typed one at the beginning
    const houseMatch = address.match(/^(?:House|Flat|Apartment|Plot|H#|F#)\s*[^,]+/i);
    const prefix = houseMatch ? `${houseMatch[0]}, ` : '';

    onChangeAddress(`${prefix}${item.fullAddress}`);
    if (item.city) {
      onSelectCity(item.city);
    }
    setIsOpen(false);
    setSuggestions([]);
    setLocationSuccess(`Selected: ${item.name}`);
    setTimeout(() => setLocationSuccess(null), 4000);
  };

  // 1-Click GPS Detect Location
  const handleDetectGPSLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    setLocationSuccess(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/locations/reverse?lat=${latitude}&lng=${longitude}`);
          const result = await res.json();

          if (result.success && result.data) {
            const { formattedAddress, city, landmark, suburb, road } = result.data;

            // Preserve house/apartment number if user already typed one
            const houseMatch = address.match(/^(?:House|Flat|Apartment|Plot|H#|F#|Shop)\s*[^,]+/i);
            const prefix = houseMatch ? `${houseMatch[0]}, ` : '';

            const finalAddr = formattedAddress
              ? `${prefix}${formattedAddress}`
              : [prefix, landmark, road, suburb].filter(Boolean).join(', ');

            onChangeAddress(finalAddr);

            if (city) {
              onSelectCity(city);
            }

            setLocationSuccess(
              `📍 Location Detected: ${formattedAddress || 'Your Area'}, ${city || 'Pakistan'}`
            );
          } else {
            throw new Error(result.error || 'Could not resolve address from GPS coordinates.');
          }
        } catch (err: any) {
          setLocationError(err.message || 'Failed to detect location. Please type manually.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setLocationError('Location permission denied. Please allow GPS access in browser.');
        } else {
          setLocationError('GPS signal weak or timed out. Please enter address manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Force fresh satellite hardware GPS lock, never use cached coordinates
      }
    );
  };

  return (
    <div className="col-12" ref={containerRef}>
      {/* Label and GPS Detect Button Row */}
      <div className="d-flex align-items-center justify-content-between mb-1.5 flex-wrap gap-2">
        <label
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#334155',
            margin: 0,
          }}
        >
          Complete Delivery Address (گھر یا دکان کا مکمل پتہ){' '}
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>

        {/* 1-Tap GPS Auto-Detect Button */}
        <button
          type="button"
          onClick={handleDetectGPSLocation}
          disabled={isLocating}
          className="btn btn-xs d-inline-flex align-items-center gap-1.5 px-2.5 py-1 rounded-pill shadow-xs transition-all"
          style={{
            background: isLocating ? '#f1f5f9' : '#ecfdf5',
            border: '1px solid #10b981',
            color: isLocating ? '#64748b' : '#059669',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: isLocating ? 'not-allowed' : 'pointer',
          }}
          title="Detect my current location using GPS"
        >
          {isLocating ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                style={{ width: '11px', height: '11px', borderWidth: '1.5px' }}
                role="status"
              />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <i className="fas fa-crosshairs text-success" style={{ fontSize: '11px' }} />
              <span>📍 Detect My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Input Field with Relative Positioning for Dropdown */}
      <div className="position-relative">
        <textarea
          required={required}
          rows={2}
          placeholder="House / Flat No., Street, Sector / Area (e.g. House 14, St 5, Bahria Phase 4)"
          value={address}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          style={{
            width: '100%',
            border: '1.5px solid #cbd5e1',
            borderRadius: '8px',
            padding: '11px 14px',
            fontSize: '0.92rem',
            outline: 'none',
            color: '#0f172a',
            background: '#ffffff',
            resize: 'vertical',
            transition: 'border-color 0.2s ease',
          }}
        />

        {/* Searching Indicator Icon inside Input */}
        {isSearching && (
          <div
            className="position-absolute end-3 top-3"
            style={{ pointerEvents: 'none' }}
          >
            <span
              className="spinner-border spinner-border-sm text-secondary"
              style={{ width: '14px', height: '14px', borderWidth: '1.5px' }}
            />
          </div>
        )}

        {/* Predictive Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div
            className="position-absolute start-0 end-0 bg-white border rounded-3 shadow-lg overflow-hidden"
            style={{
              top: 'calc(100% + 4px)',
              zIndex: 1000,
              maxHeight: '260px',
              overflowY: 'auto',
              borderColor: '#e2e8f0',
            }}
          >
            <div
              className="px-3 py-1.5 bg-light border-bottom d-flex align-items-center justify-content-between"
              style={{ fontSize: '0.7rem', color: '#64748b' }}
            >
              <span className="fw-semibold">💡 Select Exact Pakistani Location:</span>
              <span>Google Maps / OSM Accuracy</span>
            </div>

            <div className="list-group list-group-flush">
              {suggestions.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="list-group-item list-group-item-action p-2.5 px-3 d-flex align-items-start gap-2.5 border-0 border-bottom text-start"
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="rounded-circle bg-orange-50 d-flex align-items-center justify-content-center flex-shrink-0 mt-0.5"
                    style={{ width: '26px', height: '26px', background: '#fff7ed' }}
                  >
                    <i className="fas fa-map-marker-alt" style={{ color: '#ea580c', fontSize: '11px' }} />
                  </div>
                  <div className="min-w-0 flex-grow-1">
                    <div
                      className="fw-bold text-dark text-truncate leading-normal py-0.5"
                      style={{ fontSize: '0.84rem' }}
                    >
                      {item.name}
                    </div>
                    <div
                      className="text-muted text-truncate"
                      style={{ fontSize: '0.72rem', marginTop: '-1px' }}
                    >
                      {item.subText}
                    </div>
                  </div>
                  {item.city && (
                    <span
                      className="badge rounded-pill bg-light text-secondary border flex-shrink-0"
                      style={{ fontSize: '0.68rem' }}
                    >
                      {item.city}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* GPS Detection Success Notification */}
      {locationSuccess && (
        <div
          className="d-flex align-items-center gap-1.5 mt-1.5 text-success small fw-semibold leading-normal py-0.5"
          style={{ fontSize: '0.76rem' }}
        >
          <i className="fas fa-check-circle" />
          <span>{locationSuccess}</span>
        </div>
      )}

      {/* GPS Error Notification */}
      {locationError && (
        <div
          className="d-flex align-items-center gap-1.5 mt-1.5 text-danger small leading-normal py-0.5"
          style={{ fontSize: '0.74rem' }}
        >
          <i className="fas fa-exclamation-triangle" />
          <span>{locationError}</span>
        </div>
      )}
    </div>
  );
};
