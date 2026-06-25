'use client';

import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

interface MarkerData {
  lat: number;
  lng: number;
  popupText: string;
}

interface InteractiveMapProps {
  center: [number, number];
  zoom: number;
  markers?: MarkerData[];
  circle?: {
    lat: number;
    lng: number;
    radius: number; // in meters
    color?: string;
  };
  routes?: Array<{
    path: [number, number][];
    color?: string;
    weight?: number;
  }>;
  height?: string;
}

export default function InteractiveMap({
  center,
  zoom,
  markers = [],
  circle,
  routes = [],
  height = '180px'
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const routesGroupRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Leaflet CDN script & styles
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Initialize Map Instance
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.L) return;

    const L = window.L;

    // Resolve default icon issues in Leaflet packages
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!leafletMapInstance.current) {
      const map = L.map(mapRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: true,
      });

      // Use Dark Matter tile layer for dark styling matching the screenshot
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      leafletMapInstance.current = map;
      markersGroupRef.current = L.featureGroup().addTo(map);
      routesGroupRef.current = L.layerGroup().addTo(map);
    } else {
      leafletMapInstance.current.setView(center, zoom);
    }

    const map = leafletMapInstance.current;
    const markersGroup = markersGroupRef.current;
    const routesGroup = routesGroupRef.current;

    // Clear old layers
    markersGroup.clearLayers();
    routesGroup.clearLayers();

    // Map polylines routes
    if (routes && routes.length > 0) {
      routes.forEach(r => {
        L.polyline(r.path, {
          color: r.color || '#10b981',
          weight: r.weight || 3,
          opacity: 0.85
        }).addTo(routesGroup);
      });
    }

    // Map new markers
    markers.forEach(m => {
      // Create a green/orange glowing divIcon or standard marker
      L.marker([m.lat, m.lng])
        .bindPopup(m.popupText)
        .addTo(markersGroup);
    });

    // Handle Radius Circle
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (circle) {
      circleRef.current = L.circle([circle.lat, circle.lng], {
        color: circle.color || '#3b82f6',
        fillColor: circle.color || '#3b82f6',
        fillOpacity: 0.15,
        weight: 2,
        radius: circle.radius
      }).addTo(map);
    }

    // Refresh size on load/render
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

  }, [mapLoaded, center, zoom, markers, circle, routes]);

  // Re-adjust size when toggle is triggered
  useEffect(() => {
    if (leafletMapInstance.current) {
      setTimeout(() => {
        leafletMapInstance.current.invalidateSize();
        if (circleRef.current && circle) {
          leafletMapInstance.current.setView([circle.lat, circle.lng]);
        } else {
          leafletMapInstance.current.setView(center, zoom);
        }
      }, 300);
    }
  }, [isEnlarged]);

  return (
    <div style={isEnlarged ? {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 9999,
      background: '#35373aff', // dark slate bg for full view
      padding: '20px',
      display: 'flex',
      flexDirection: 'column'
    } : {
      position: 'relative',
      width: '100%',
      height: height
    }}>
      {isEnlarged && (
        <div className="d-flex align-items-center justify-content-between mb-3 border-bottom border-secondary pb-2">
          <h5 className="fw-black mb-0 text-white">Logistics Operations Map (Dark Mode Vector Map)</h5>
          <button
            onClick={() => setIsEnlarged(false)}
            className="btn btn-sm btn-light rounded-pill px-3 fw-bold"
          >
            <i className="fas fa-compress-alt me-1" /> Minimize Map
          </button>
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: isEnlarged ? 'calc(100% - 50px)' : '100%',
          borderRadius: isEnlarged ? '12px' : '0px',
          background: '#424447ff'
        }}
      />

      {!isEnlarged && (
        <button
          onClick={() => setIsEnlarged(true)}
          className="btn btn-xs btn-dark rounded-circle shadow-sm position-absolute"
          style={{
            bottom: '10px',
            right: '10px',
            zIndex: 1000,
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #444',
            background: '#222'
          }}
          title="Enlarge Map"
          type="button"
        >
          <i className="fas fa-expand-alt text-white" style={{ fontSize: '11px' }} />
        </button>
      )}
    </div>
  );
}
