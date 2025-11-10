import React, { useEffect, useMemo, useRef, useState } from 'react';
import { geocodeAddress, getCachedCoords, primeGeocodes } from '../utils/geocode';

type Point = {
  id: string;
  name: string;
  address: string;
};

// no global declarations needed for Leaflet-only mode

interface BusinessPickupMapProps {
  points: Point[];
  getConnectedCount?: (id: string) => number | 'all';
  highlightedIds?: string[];
}

export const BusinessPickupMap: React.FC<BusinessPickupMapProps> = ({ points, getConnectedCount, highlightedIds = [] }) => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const coordsRef = useRef<Map<string, [number, number]>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);

  const visiblePoints = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return points;
    return points.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  }, [points, search]);

  // Ensure Leaflet (OSM) is loaded
  useEffect(() => {
    const ensureLeaflet = async () => {
      if ((window as any).L) return;
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      await new Promise<void>((res, rej) => {
        const s = document.createElement('script');
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.onload = () => res();
        s.onerror = rej;
        document.body.appendChild(s);
      });
    };
    ensureLeaflet().then(() => setIsMapReady(true)).catch(() => setIsMapReady(false));
  }, []);

  // Prime geocodes for all points to speed up marker rendering
  useEffect(() => {
    if (points.length > 0) {
      primeGeocodes(points.map(p => p.address)).catch(() => {});
    }
  }, [points]);

  // Init map
  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      // Initialize Leaflet with OSM tiles
      const L = (window as any).L;
      if (!L) return;
      const map = L.map(mapRef.current!, {
        center: [55.751244, 37.618423],
        zoom: 11,
        zoomControl: true,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapInstance.current = map;
    };

    initMap().catch(console.error);
  }, [isMapReady]);

  // Geocode helper with sessionStorage cache using OSM Nominatim.
  const geocode = async (addr: string): Promise<[number, number] | null> => {
    return (getCachedCoords(addr) ?? await geocodeAddress(addr)) as any;
  };

  // Place markers for points
  useEffect(() => {
    if (!isMapReady || !mapInstance.current) return;

    const updateMarkers = async () => {
      const L = (window as any).L;
      if (!L) return;
      // Clear previous markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      coordsRef.current.clear();

      if (visiblePoints.length === 0) return;

      const bounds = L.latLngBounds([]);
      for (const p of visiblePoints) {
        const lonlat = await geocode(p.address);
        if (!lonlat) continue;
        const latlng: [number, number] = [lonlat[1], lonlat[0]];
        // Default Leaflet marker
        const marker = L.marker(latlng, { title: p.name }).addTo(mapInstance.current).bindTooltip(p.name);
        // Draw a small circle to ensure visibility even if default icon doesn't load
        L.circleMarker(latlng, {
          radius: 6,
          color: '#12993B',
          weight: 2,
          fillColor: '#12993B',
          fillOpacity: 0.9
        }).addTo(mapInstance.current);
        if (highlightedIds.includes(p.id)) {
          try { marker.setZIndexOffset(1000); } catch {}
        }
        marker.on('click', () => {
          setActiveId(p.id);
          const el = document.getElementById(`bpp-map-item-${p.id}`);
          if (el && listRef.current) el.scrollIntoView({ block: 'nearest' });
        });
        markersRef.current.set(p.id, marker);
        coordsRef.current.set(p.id, lonlat);
        bounds.extend(latlng as any);
      }
      if (bounds.isValid()) {
        mapInstance.current.fitBounds(bounds.pad(0.1));
      }
    };

    updateMarkers();
    return () => { 
      markersRef.current.clear();
      coordsRef.current.clear();
    };
  }, [visiblePoints, isMapReady]);

  // Center on active from list click
  const focusPoint = async (p: Point) => {
    setActiveId(p.id);
    const map = mapInstance.current;
    if (!map) return;

    // Try to get cached coordinates first
    const cached = coordsRef.current.get(p.id) || await geocode(p.address);
    if (!cached) return;

    // Ensure marker exists in Leaflet
    const L = (window as any).L;
    if (L && !markersRef.current.get(p.id)) {
      const latlng: [number, number] = [cached[1], cached[0]];
      const marker = L.marker(latlng, { title: p.name }).addTo(map);
      try { marker.setZIndexOffset(1000); } catch {}
      marker.bindTooltip(p.name);
      markersRef.current.set(p.id, marker);
      coordsRef.current.set(p.id, cached);
    }
    map.setView([cached[1], cached[0]], 15);
  };

  // Geolocation
  const locateMe = () => {
    if (!navigator.geolocation || !mapInstance.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapInstance.current.setView([pos.coords.latitude, pos.coords.longitude], 14);
    });
  };

  const connectedText = (id: string) => {
    if (!getConnectedCount) return '';
    const c = getConnectedCount(id);
    if (c === 'all') return 'Подключена ко всем складам';
    return `Подключена к ${c} складам`;
  };

  return (
    <div className="bpp-map-wrapper">
      <div className="bpp-map-list" ref={listRef}>
        {/* Search (only if > 10 точек) */}
        {points.length > 10 && (
          <div className="bpp-map-search" style={{ alignSelf: 'stretch' }}>
            <input
              className="bui-search__input"
              placeholder="Поиск"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: 40,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid rgba(49,34,12,0.16)'
              }}
            />
          </div>
        )}
        {/* Title */}
        <div className="bpp-map-list__title" style={{ alignSelf: 'stretch' }}>{visiblePoints.length} точек самовывоза</div>
        {visiblePoints.map((p, idx) => (
          <React.Fragment key={p.id}>
            <div
              id={`bpp-map-item-${p.id}`}
              className={`bpp-map-item ${activeId === p.id ? 'active' : ''}`}
              onClick={() => focusPoint(p)}
            >
              <div className="bpp-map-item__line" title={`${p.name} · ${p.address}`}>
                <span className="name">{p.name}</span>
                <span className="dot"> · </span>
                <span className="addr">{p.address}</span>
              </div>
              <div className="bpp-map-item__caption">{connectedText(p.id)}</div>
            </div>
            {idx < visiblePoints.length - 1 && <div className="bpp-map-divider" />}
          </React.Fragment>
        ))}
      </div>
      
      <div className="bpp-map-canvas">
        {!isMapReady && (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#8C8A87'
          }}>
            Загрузка карты...
          </div>
        )}
        <div ref={mapRef} className="bpp-map-viewport" style={{ display: isMapReady ? 'block' : 'none' }} />
        {isMapReady && (
          <button className="map-locate-button" onClick={locateMe} aria-label="Найти мое местоположение">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2.667a.667.667 0 0 1 .667.667v.708A4.666 4.666 0 0 1 11.958 7.333h.708a.667.667 0 1 1 0 1.334h-.708A4.666 4.666 0 0 1 8.667 11.958v.708a.667.667 0 1 1-1.334 0v-.708A4.666 4.666 0 0 1 4.042 8.667h-.708a.667.667 0 1 1 0-1.334h.708A4.666 4.666 0 0 1 7.333 4.042v-.708A.667.667 0 0 1 8 2.667Zm0 2.666A2.667 2.667 0 1 0 10.667 8 2.667 2.667 0 0 0 8 5.333Z" fill="#191817"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
