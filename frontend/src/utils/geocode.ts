// Simple geocoding helper powered by OSM Nominatim with localStorage cache
// Exposes:
// - geocodeAddress(address): Promise<[number, number] | null>  // [lon, lat]
// - getCachedCoords(address): [number, number] | null
// - primeGeocodes(addresses, concurrency=4): Promise<void>
//
// Cache TTL: 30 days

const CACHE_PREFIX = 'geo:';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const API_BASE = '/api';
const USE_PUBLIC_FALLBACK = false; // disable browser direct calls to avoid CORS

type LonLat = [number, number];

function now(): number {
  return Date.now();
}

function makeKey(address: string): string {
  return `${CACHE_PREFIX}${address}`;
}

export function getCachedCoords(address: string): LonLat | null {
  try {
    const key = makeKey(address);
    const raw = localStorage.getItem(key) ?? sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { v: LonLat; t: number };
    if (!parsed || !Array.isArray(parsed.v) || typeof parsed.t !== 'number') return null;
    if (now() - parsed.t > CACHE_TTL_MS) return null;
    return parsed.v;
  } catch {
    return null;
  }
}

function saveCache(address: string, coords: LonLat): void {
  const payload = JSON.stringify({ v: coords, t: now() });
  try {
    localStorage.setItem(makeKey(address), payload);
  } catch {
    try {
      sessionStorage.setItem(makeKey(address), payload);
    } catch {
      // ignore storage failure
    }
  }
}

export async function geocodeAddress(address: string): Promise<LonLat | null> {
  const cached = getCachedCoords(address);
  if (cached) return cached;
  // 0) Try backend proxy first (handles UA/CORS/rate limits)
  try {
    const r = await fetch(`${API_BASE}/geocode?address=${encodeURIComponent(address)}`, { headers: { Accept: 'application/json' } });
    if (r.ok) {
      const j = await r.json();
      if (j && typeof j.lon === 'number' && typeof j.lat === 'number') {
        const pair: LonLat = [j.lon, j.lat];
        saveCache(address, pair);
        return pair;
      }
    }
  } catch {
    // ignore and fallback to public providers below
  }
  if (!USE_PUBLIC_FALLBACK) {
    return null;
  }
  // 1) Try multiple public geocoders (order: OSM → maps.co → Photon)
  const attempts: Array<() => Promise<LonLat | null>> = [
    async () => {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&accept-language=ru&q=${encodeURIComponent(address)}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return [lon, lat];
      }
      return null;
    },
    async () => {
      const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&limit=1`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return [lon, lat];
      }
      return null;
    },
    async () => {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}&limit=1&lang=ru`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) return null;
      const data = await res.json();
      const feature = data?.features?.[0];
      if (feature?.geometry?.coordinates) {
        const [lon, lat] = feature.geometry.coordinates as [number, number];
        return [lon, lat];
      }
      return null;
    }
  ];
  for (const attempt of attempts) {
    try {
      const coords = await attempt();
      if (coords) {
        saveCache(address, coords);
        return coords;
      }
    } catch {
      // continue
    }
  }
  return null;
}

export async function primeGeocodes(addresses: string[], concurrency = 4): Promise<void> {
  const queue = addresses.filter(Boolean);
  let idx = 0;
  async function worker() {
    while (idx < queue.length) {
      const current = idx++;
      const addr = queue[current];
      if (!getCachedCoords(addr)) {
        await geocodeAddress(addr);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
}

export type PinData = {
  id: string;
  name: string;
  address: string;
  status?: 'active' | 'inactive';
  coords: LonLat | null;
};


