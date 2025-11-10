'use strict';

const http = require('http');
const url = require('url');
const {
  warehouse,
  warehouses,
  pickupPoints,
  businessPickupPoints,
  warehouseBusinessLinks
} = require('./data');

/**
 * Helper to send JSON response
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {unknown} data
 */
function sendJson(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '/', true);
  const method = (req.method || 'GET').toUpperCase();

  // -------- Geocode proxy with in-memory cache --------
  // Simple cache: address -> { lon, lat, t }
  const GEOCODE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  // Store on global object to persist across requests within process
  if (!global.__GEOCODE_CACHE__) global.__GEOCODE_CACHE__ = new Map();
  /** @type {Map<string, {lon:number, lat:number, t:number}>} */
  const geocodeCache = global.__GEOCODE_CACHE__;
  const getGeocodeCache = (addr) => {
    const it = geocodeCache.get(addr);
    if (!it) return null;
    if (Date.now() - it.t > GEOCODE_TTL_MS) return null;
    return it;
  };
  const setGeocodeCache = (addr, lon, lat) => {
    geocodeCache.set(addr, { lon, lat, t: Date.now() });
  };
  async function geocodeViaNominatim(address) {
    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=ru&q=${encodeURIComponent(address)}`;
    const r = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        // Provide UA per Nominatim policy
        'User-Agent': 'pvz-demo/1.0 (+https://localhost)'
      }
    });
    if (!r.ok) return null;
    const j = await r.json().catch(() => null);
    if (!Array.isArray(j) || !j[0]) return null;
    const lat = Number(j[0].lat);
    const lon = Number(j[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
    return { lon, lat };
  }
  if (method === 'GET' && parsed.pathname === '/geocode') {
    const address = (parsed.query && parsed.query.address) ? String(parsed.query.address) : '';
    if (!address) return sendJson(res, 400, { error: 'address required' });
    const cached = getGeocodeCache(address);
    if (cached) return sendJson(res, 200, cached);
    geocodeViaNominatim(address)
      .then((ans) => {
        if (!ans) return sendJson(res, 404, { error: 'not found' });
        setGeocodeCache(address, ans.lon, ans.lat);
        return sendJson(res, 200, ans);
      })
      .catch(() => sendJson(res, 502, { error: 'geocode failed' }));
    return;
  }

  if (method === 'GET' && parsed.pathname === '/warehouses') {
    return sendJson(res, 200, warehouses);
  }

  if (method === 'GET' && parsed.pathname === '/warehouse') {
    return sendJson(res, 200, warehouse);
  }

  if (method === 'GET' && parsed.pathname === '/pickup-points') {
    return sendJson(res, 200, pickupPoints);
  }

  if (method === 'GET' && parsed.pathname && parsed.pathname.startsWith('/pickup-points/')) {
    const id = parsed.pathname.split('/')[2];
    const found = pickupPoints.find(p => p.id === id);
    if (!found) return sendJson(res, 404, { error: 'Pickup point not found' });
    return sendJson(res, 200, found);
  }

  // Business Pickup Points API (no UI yet)
  if (method === 'GET' && parsed.pathname === '/business-pickup-points') {
    return sendJson(res, 200, businessPickupPoints);
  }

  // Get all warehouse-business links
  if (method === 'GET' && parsed.pathname === '/warehouse-business-links') {
    return sendJson(res, 200, warehouseBusinessLinks);
  }

  if (method === 'GET' && parsed.pathname && parsed.pathname.startsWith('/business-pickup-points/')) {
    const id = parsed.pathname.split('/')[2];
    const found = businessPickupPoints.find(p => p.id === id);
    if (!found) return sendJson(res, 404, { error: 'Business pickup point not found' });
    return sendJson(res, 200, found);
  }

  // List business points attached to a warehouse
  if (method === 'GET' && parsed.pathname && /^\/warehouses\/[^/]+\/business-pickup-points$/.test(parsed.pathname)) {
    const wid = parsed.pathname.split('/')[2];
    const ids = warehouseBusinessLinks
      .filter(link => link.warehouseId === wid && link.enabled !== false)
      .map(link => link.businessPickupPointId);
    const list = businessPickupPoints.filter(p => ids.includes(p.id));
    return sendJson(res, 200, list);
  }

  // Attach business point to warehouse
  if (method === 'POST' && parsed.pathname && /^\/warehouses\/[^/]+\/business-pickup-points\/[^/]+$/.test(parsed.pathname)) {
    const [, , wid, , bppId] = parsed.pathname.split('/');
    if (!warehouses.find(w => w.id === wid)) return sendJson(res, 404, { error: 'Warehouse not found' });
    if (!businessPickupPoints.find(p => p.id === bppId)) return sendJson(res, 404, { error: 'Business pickup point not found' });
    const exists = warehouseBusinessLinks.find(l => l.warehouseId === wid && l.businessPickupPointId === bppId);
    if (!exists) warehouseBusinessLinks.push({ warehouseId: wid, businessPickupPointId: bppId, enabled: true });
    return sendJson(res, 200, { ok: true });
  }

  // Detach business point from warehouse
  if (method === 'DELETE' && parsed.pathname && /^\/warehouses\/[^/]+\/business-pickup-points\/[^/]+$/.test(parsed.pathname)) {
    const [, , wid, , bppId] = parsed.pathname.split('/');
    const idx = warehouseBusinessLinks.findIndex(l => l.warehouseId === wid && l.businessPickupPointId === bppId);
    if (idx === -1) return sendJson(res, 404, { error: 'Link not found' });
    warehouseBusinessLinks.splice(idx, 1);
    return sendJson(res, 200, { ok: true });
  }

  // Create business pickup point
  if (method === 'POST' && parsed.pathname === '/business-pickup-points') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const errors = validateBusinessPickupPayload(payload, warehouses);
        if (errors.length) return sendJson(res, 400, { errors });
        const id = `bpp-${Date.now()}`;
        /** @type {import('./models').BusinessPickupPoint} */
        const point = {
          id,
          name: payload.name,
          address: payload.address,
          identifier: payload.identifier,
          phone: payload.phone,
          extension: payload.extension || '',
          directions_comment: payload.directions_comment,
          schedule: payload.schedule,
          max_weight: payload.max_weight,
          max_length: payload.max_length,
          storage_period: payload.storage_period
        };
        businessPickupPoints.push(point);
        // links
        (payload.connections || []).forEach((conn) => {
          if (conn.enabled) {
            warehouseBusinessLinks.push({
              warehouseId: conn.warehouseId,
              businessPickupPointId: id,
              enabled: true,
              delivery_time: conn.delivery_time,
              delivery_cost_mgt: conn.delivery_cost_mgt,
              delivery_cost_kgt: conn.delivery_cost_kgt
            });
          }
        });
        return sendJson(res, 201, { id });
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // Update business pickup point
  if (method === 'PUT' && parsed.pathname && parsed.pathname.startsWith('/business-pickup-points/')) {
    const id = parsed.pathname.split('/')[2];
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const idx = businessPickupPoints.findIndex(p => p.id === id);
        if (idx === -1) return sendJson(res, 404, { error: 'Business pickup point not found' });
        
        // Update point data (excluding connections)
        const { connections, ...pointData } = payload;
        const next = { ...businessPickupPoints[idx], ...pointData, id };
        const errors = validateBusinessPickupPayload(next, warehouses, true);
        if (errors.length) return sendJson(res, 400, { errors });
        businessPickupPoints[idx] = next;
        
        // Update warehouse connections
        if (connections) {
          // Remove old links for this point
          for (let i = warehouseBusinessLinks.length - 1; i >= 0; i--) {
            if (warehouseBusinessLinks[i].businessPickupPointId === id) {
              warehouseBusinessLinks.splice(i, 1);
            }
          }
          
          // Add new links
          connections.forEach((conn) => {
            if (conn.enabled) {
              warehouseBusinessLinks.push({
                warehouseId: conn.warehouseId,
                businessPickupPointId: id,
                enabled: true,
                delivery_time: conn.delivery_time,
                delivery_cost_mgt: conn.delivery_cost_mgt,
                delivery_cost_kgt: conn.delivery_cost_kgt
              });
            }
          });
        }
        
        return sendJson(res, 200, next);
      } catch {
        return sendJson(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  // Delete business pickup point (cascade unlink)
  if (method === 'DELETE' && parsed.pathname && parsed.pathname.startsWith('/business-pickup-points/')) {
    const id = parsed.pathname.split('/')[2];
    const idx = businessPickupPoints.findIndex(p => p.id === id);
    if (idx === -1) return sendJson(res, 404, { error: 'Business pickup point not found' });
    // remove links
    for (let i = warehouseBusinessLinks.length - 1; i >= 0; i--) {
      if (warehouseBusinessLinks[i].businessPickupPointId === id) {
        warehouseBusinessLinks.splice(i, 1);
      }
    }
    businessPickupPoints.splice(idx, 1);
    return sendJson(res, 200, { ok: true });
  }

  sendJson(res, 404, { error: 'Not found' });
});

// ------- Validation helpers -------
/**
 * @param {any} payload
 * @param {import('./models').Warehouse[]} warehouses
 * @param {boolean=} isUpdate
 */
function validateBusinessPickupPayload(payload, warehouses, isUpdate) {
  const errors = [];
  const required = ['address', 'name', 'identifier', 'phone', 'directions_comment', 'max_weight', 'max_length', 'storage_period', 'schedule'];
  required.forEach((k) => {
    if (payload[k] === undefined || payload[k] === null || payload[k] === '') {
      errors.push({ field: k, message: 'required' });
    }
  });
  if (typeof payload.storage_period !== 'number' || payload.storage_period < 5) {
    errors.push({ field: 'storage_period', message: 'must be >= 5' });
  }
  // schedule
  const days = ['mon','tue','wed','thu','fri','sat','sun'];
  if (!Array.isArray(payload.schedule) || payload.schedule.length === 0) {
    errors.push({ field: 'schedule', message: 'at least one interval required' });
  } else if (payload.schedule.length > 7) {
    errors.push({ field: 'schedule', message: 'maximum 7 intervals' });
  } else {
    payload.schedule.forEach((it, idx) => {
      if (!Array.isArray(it.selected_days) || it.selected_days.length === 0) {
        errors.push({ field: `schedule[${idx}].selected_days`, message: 'required' });
      } else if (!it.selected_days.every(d => days.includes(d))) {
        errors.push({ field: `schedule[${idx}].selected_days`, message: 'invalid day' });
      }
      if (!isValidTime(it.work_from)) errors.push({ field: `schedule[${idx}].work_from`, message: 'invalid time' });
      if (!isValidTime(it.work_to)) errors.push({ field: `schedule[${idx}].work_to`, message: 'invalid time' });
    });
  }
  // sizes
  ['max_weight','max_length'].forEach(f => {
    if (typeof payload[f] !== 'number' || isNaN(payload[f])) errors.push({ field: f, message: 'must be number' });
  });
  // connections
  if (payload.connections) {
    if (!Array.isArray(payload.connections)) errors.push({ field: 'connections', message: 'must be array' });
    else {
      const knownWarehouseIds = new Set(warehouses.map(w => w.id));
      payload.connections.forEach((conn, idx) => {
        if (!knownWarehouseIds.has(conn.warehouseId)) {
          errors.push({ field: `connections[${idx}].warehouseId`, message: 'unknown warehouse' });
        }
        if (conn.enabled) {
          ['delivery_time','delivery_cost_mgt','delivery_cost_kgt'].forEach(f => {
            if (conn[f] === undefined || conn[f] === null || conn[f] === '') {
              errors.push({ field: `connections[${idx}].${f}`, message: 'required' });
            } else if (typeof conn[f] !== 'number' || isNaN(conn[f])) {
              errors.push({ field: `connections[${idx}].${f}`, message: 'must be number' });
            }
          });
        }
      });
    }
  }
  return errors;
}

function isValidTime(s) {
  return typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PVZ demo backend running on http://localhost:${PORT}`);
});


