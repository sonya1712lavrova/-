import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { geocodeAddress, getCachedCoords, primeGeocodes } from '../utils/geocode';
import { BuiSearchField } from './BuiSearchField';

type Point = {
  id: string;
  name: string;
  address: string;
};

interface BusinessPickupMapProps {
  points: Point[];
  getConnectedCount?: (id: string) => number | 'all';
  highlightedIds?: string[];
}

export const BusinessPickupMap: React.FC<BusinessPickupMapProps> = ({ points, getConnectedCount, highlightedIds = [] }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [search, setSearch] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [YMapComponents, setYMapComponents] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.618423, 55.751244]);

  const visiblePoints = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return points;
    return points.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );
  }, [points, search]);

  // Prime geocodes for all points to speed up marker rendering - only after map is ready
  useEffect(() => {
    if (isReady && points.length > 0) {
      primeGeocodes(points.map(p => p.address)).catch(() => {});
      // Center map on first point
      geocodeAddress(points[0].address).then((coords) => {
        if (coords) {
          setMapCenter(coords);
        }
      });
    }
  }, [points, isReady]);

  // Load Yandex Maps API v3 and initialize React components
  useEffect(() => {
    // Prevent duplicate loading
    if ((window as any).__YMAP_LOADING__) {
      console.log('[Map] Already loading, skipping...');
      return;
    }

    const initMap = async () => {
      try {
        console.log('[Map] Waiting for ymaps3.ready...');
        // Wait for ymaps3 to be ready
        await (window as any).ymaps3.ready;

        console.log('[Map] Importing @yandex/ymaps3-reactify...');
        // Import reactify module
        const ymaps3React = await (window as any).ymaps3.import('@yandex/ymaps3-reactify');
        const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);

        console.log('[Map] Getting core map components...');
        // Get core map components
        const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = reactify.module((window as any).ymaps3);

        console.log('[Map] All components loaded successfully');
        setYMapComponents({
          YMap,
          YMapDefaultSchemeLayer,
          YMapDefaultFeaturesLayer,
          YMapMarker
        });
        setIsReady(true);
        (window as any).__YMAP_LOADING__ = false;
      } catch (error) {
        console.error('[Map] Initialization error:', error);
        setIsReady(false);
        (window as any).__YMAP_LOADING__ = false;
      }
    };

    // Check if ymaps3 is already loaded
    if ((window as any).ymaps3) {
      console.log('[Map] ymaps3 already loaded');
      initMap();
    } else {
      // Mark as loading
      (window as any).__YMAP_LOADING__ = true;

      // Load script with API key (without modules parameter)
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/v3/?apikey=b3dc0c6c-cacb-45ad-a186-4a7cd94e6d28&lang=ru_RU';
      script.async = true;
      console.log('[Map] Loading v3 API...');
      script.onload = () => {
        console.log('[Map] v3 API loaded successfully');
        initMap();
      };
      script.onerror = (error) => {
        console.error('[Map] Failed to load v3 API:', error);
        (window as any).__YMAP_LOADING__ = false;
        setIsReady(false);
      };
      document.head.appendChild(script);
    }
  }, []);

  const geocode = async (addr: string): Promise<[number, number] | null> => {
    return (getCachedCoords(addr) ?? await geocodeAddress(addr)) as any;
  };

  const connectedText = (id: string) => {
    if (!getConnectedCount) return '';
    const c = getConnectedCount(id);
    if (c === 'all') return 'Все склады';
    if (typeof c === 'number') {
      return `${c} склад${c === 1 ? '' : c <= 4 ? 'а' : 'ов'}`;
    }
    return '';
  };

  const handleMarkerClick = useCallback((p: Point) => {
    setActiveId(p.id);
    const el = document.getElementById(`bpp-map-item-${p.id}`);
    if (el && listRef.current) {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, []);

  const focusPoint = async (p: Point) => {
    setActiveId(p.id);
  };

  if (!isReady || !YMapComponents) {
    return (
      <div className="bpp-map-wrapper">
        <div className="bpp-map-list" ref={listRef}>
          <div className="bpp-map-list__title">{points.length} точек самовывоза</div>
        </div>
        <div className="bpp-map-canvas">
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
        </div>
      </div>
    );
  }

  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = YMapComponents;

  return (
    <div className="bpp-map-wrapper">
      <div className="bpp-map-list" ref={listRef}>
        {/* Search */}
        <div style={{ alignSelf: 'stretch' }}>
          <BuiSearchField
            value={search}
            onChange={setSearch}
            placeholder="Поиск по названию или адресу"
          />
        </div>
        {/* Divider */}
        <div className="bpp-map-divider" style={{ margin: '4px -20px' }} />
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
        <div ref={mapContainerRef} className="bpp-map-viewport" style={{ width: '100%', height: '100%' }}>
          <YMap
            location={{ center: mapCenter, zoom: 14 }}
            mode="vector"
          >
            <YMapDefaultSchemeLayer />
            <YMapDefaultFeaturesLayer />

            {visiblePoints.map((p) => (
              <PickupMarker
                key={p.id}
                point={p}
                YMapMarker={YMapMarker}
                geocode={geocode}
                connectedText={connectedText}
                onClick={handleMarkerClick}
                isActive={activeId === p.id}
              />
            ))}
          </YMap>
        </div>
      </div>
    </div>
  );
};

// Separate marker component
const PickupMarker: React.FC<{
  point: Point;
  YMapMarker: any;
  geocode: (addr: string) => Promise<[number, number] | null>;
  connectedText: (id: string) => string;
  onClick: (p: Point) => void;
  isActive: boolean;
}> = ({ point, YMapMarker, geocode, connectedText, onClick }) => {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    geocode(point.address)
      .then((result) => {
        if (mounted) {
          setCoords(result);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(`[Marker] Geocoding failed for ${point.address}:`, error);
        if (mounted) {
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [point.address, geocode]);

  if (loading || !coords) return null;

  return (
    <YMapMarker coordinates={coords} draggable={false} onClick={() => onClick(point)}>
      <div style={{
        position: 'relative',
        transform: 'translate(-50%, -100%)'
      }}>
        {/* Pin marker */}
        <svg width="32" height="40" viewBox="0 0 32 40" style={{ display: 'block' }}>
          <path
            d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 24 16 24s16-15.163 16-24C32 7.163 24.837 0 16 0z"
            fill="#E63946"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <circle cx="16" cy="16" r="6" fill="#ffffff" />
        </svg>

        {/* Balloon popup always visible above the marker */}
        <div style={{
          position: 'absolute',
          bottom: '45px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '16px',
          minWidth: '220px',
          maxWidth: '300px',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          pointerEvents: 'auto'
        }}>
          {/* Arrow */}
          <div style={{
            position: 'absolute',
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #ffffff'
          }} />

          <div style={{
            fontWeight: 600,
            fontSize: '15px',
            marginBottom: '10px',
            color: '#31220C',
            lineHeight: 1.4
          }}>
            {point.name}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#8C8A87',
            marginBottom: '10px',
            lineHeight: 1.4
          }}>
            {point.address}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#31220C',
            paddingTop: '8px',
            borderTop: '1px solid #F5F3F0'
          }}>
            <span style={{ color: '#8C8A87' }}>Подключена к:</span> {connectedText(point.id)}
          </div>
        </div>
      </div>
    </YMapMarker>
  );
};