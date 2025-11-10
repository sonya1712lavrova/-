import React, { useEffect, useRef, useState } from 'react';
import { getBusinessPickupPoints, getWarehouseBusinessLinks, getWarehouses, getPickupPoints } from '../api';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu';
import { Checkbox } from './Checkbox';
import { FormInput } from './FormInput';
import { TextArea } from './TextArea';

interface ScheduleInterval {
  id: string;
  selected_days: string[];
  work_from: string;
  work_to: string;
}

interface WarehouseConnection {
  warehouseId: string;
  warehouseName: string;
  warehouseAddress: string;
  enabled: boolean;
  delivery_time: string;
  delivery_cost_mgt: string;
  delivery_cost_kgt: string;
}

interface AddPickupPointFormProps {
  warehouses: Array<{ id: string; name: string; address: string }>;
  editingPoint?: any;
  onClose: () => void;
  onSave: (data: any) => void;
  onConfirmSave?: (data: any) => void;
  initialLinks?: Array<{
    warehouseId: string;
    enabled?: boolean;
    delivery_time?: number;
    delivery_cost_mgt?: number;
    delivery_cost_kgt?: number;
  }>;
}

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const AddPickupPointForm: React.FC<AddPickupPointFormProps> = ({
  warehouses,
  editingPoint,
  onClose,
  onSave,
  onConfirmSave,
  initialLinks,
}) => {
  const isEditMode = !!editingPoint;
  const contentRef = useRef<HTMLFormElement | null>(null);
  const initialSerializedRef = useRef<string | null>(null);
  
  // Helper to convert backend days to frontend format
  const convertDaysToFrontend = (backendDays: string[]): string[] => {
    const dayMap: Record<string, string> = {
      'mon': 'Пн', 'tue': 'Вт', 'wed': 'Ср', 'thu': 'Чт', 
      'fri': 'Пт', 'sat': 'Сб', 'sun': 'Вс',
    };
    return backendDays.map(d => dayMap[d] || d);
  };

  const [address, setAddress] = useState(editingPoint?.address || '');
  const [name, setName] = useState(editingPoint?.name || '');
  const [identifier, setIdentifier] = useState(editingPoint?.identifier || '');
  const [phone, setPhone] = useState(editingPoint?.phone || '');
  const [extension, setExtension] = useState(editingPoint?.extension || '');
  const [directionsComment, setDirectionsComment] = useState(editingPoint?.directions_comment || '');
  // Address suggestions
  const [mapAddresses, setMapAddresses] = useState<string[]>([]);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addrFocused, setAddrFocused] = useState(false);
  const addrInputRef = useRef<HTMLInputElement | null>(null);
  
  const [scheduleIntervals, setScheduleIntervals] = useState<ScheduleInterval[]>(() => {
    if (editingPoint?.schedule && editingPoint.schedule.length > 0) {
      return editingPoint.schedule.map((interval: any, idx: number) => ({
        id: String(idx + 1),
        selected_days: convertDaysToFrontend(interval.selected_days || []),
        work_from: interval.work_from || '',
        work_to: interval.work_to || '',
      }));
    }
    return [{
      id: '1',
      selected_days: DAYS,
      work_from: '',
      work_to: '',
    }];
  });
  
  const [maxWeight, setMaxWeight] = useState(editingPoint?.max_weight?.toString() || '');
  const [maxLength, setMaxLength] = useState(editingPoint?.max_length?.toString() || '');
  const [storagePeriod, setStoragePeriod] = useState(editingPoint?.storage_period?.toString() || '');
  
  const [warehouseConnections, setWarehouseConnections] = useState<WarehouseConnection[]>(() => {
    const byWarehouse = new Map<string, any>();
    (initialLinks || []).forEach((l) => byWarehouse.set(l.warehouseId, l));
    return warehouses.map((w) => {
      const link = byWarehouse.get(w.id);
      return {
        warehouseId: w.id,
        warehouseName: w.name,
        warehouseAddress: w.address,
        enabled: link ? link.enabled !== false : false,
        delivery_time: link && link.delivery_time != null ? String(link.delivery_time) : '',
        delivery_cost_mgt: link && link.delivery_cost_mgt != null ? String(link.delivery_cost_mgt) : '',
        delivery_cost_kgt: link && link.delivery_cost_kgt != null ? String(link.delivery_cost_kgt) : '',
      };
    });
  });

  // Re-sync connections each time initialLinks or warehouses change (ensures UI reflects latest links)
  useEffect(() => {
    if (!isEditMode) return;
    const byWarehouse = new Map<string, any>();
    (initialLinks || []).forEach((l) => byWarehouse.set(l.warehouseId, l));
    setWarehouseConnections((prev) =>
      warehouses.map((w) => {
        const link = byWarehouse.get(w.id);
        const prevConn = prev.find((c) => c.warehouseId === w.id);
        return {
          warehouseId: w.id,
          warehouseName: w.name,
          warehouseAddress: w.address,
          enabled: link ? link.enabled !== false : (prevConn?.enabled ?? false),
          delivery_time:
            link && link.delivery_time != null
              ? String(link.delivery_time)
              : (prevConn?.delivery_time ?? ''),
          delivery_cost_mgt:
            link && link.delivery_cost_mgt != null
              ? String(link.delivery_cost_mgt)
              : (prevConn?.delivery_cost_mgt ?? ''),
          delivery_cost_kgt:
            link && link.delivery_cost_kgt != null
              ? String(link.delivery_cost_kgt)
              : (prevConn?.delivery_cost_kgt ?? ''),
        };
      })
    );
  }, [isEditMode, initialLinks, warehouses]);

  // Hydrate connections in edit mode from parent-provided links (preferred)
  useEffect(() => {
    if (!isEditMode || !editingPoint?.id || !initialLinks || initialLinks.length === 0) return;
    const byWarehouse = new Map<string, any>();
    initialLinks.forEach((l) => byWarehouse.set(l.warehouseId, l));
    setWarehouseConnections((prev) =>
      prev.map((conn) => {
        const link = byWarehouse.get(conn.warehouseId);
        if (!link) return conn;
        return {
          ...conn,
          enabled: link.enabled !== false,
          delivery_time: link.delivery_time != null ? String(link.delivery_time) : '',
          delivery_cost_mgt: link.delivery_cost_mgt != null ? String(link.delivery_cost_mgt) : '',
          delivery_cost_kgt: link.delivery_cost_kgt != null ? String(link.delivery_cost_kgt) : '',
        };
      })
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editingPoint?.id, initialLinks && initialLinks.length]);

  // Fallback: fetch links if parent didn't pass
  useEffect(() => {
    if (!isEditMode || !editingPoint?.id || warehouses.length === 0) return;
    if (initialLinks && initialLinks.length > 0) return;
    let cancelled = false;
    (async () => {
      try {
        const links = await getWarehouseBusinessLinks();
        if (!Array.isArray(links)) return;
        const byWarehouse = new Map<string, any>();
        links
          .filter((l: any) => l.businessPickupPointId === editingPoint.id)
          .forEach((l: any) => byWarehouse.set(l.warehouseId, l));
        if (cancelled) return;
        setWarehouseConnections((prev) =>
          prev.map((conn) => {
            const link = byWarehouse.get(conn.warehouseId);
            if (!link) return conn;
            return {
              ...conn,
              enabled: link.enabled !== false,
              delivery_time: link.delivery_time != null ? String(link.delivery_time) : '',
              delivery_cost_mgt: link.delivery_cost_mgt != null ? String(link.delivery_cost_mgt) : '',
              delivery_cost_kgt: link.delivery_cost_kgt != null ? String(link.delivery_cost_kgt) : '',
            };
          })
        );
      } catch {
        // ignore hydration errors; keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editingPoint?.id, warehouses.length]);
  
  // Fetch suggestions from map service (Nominatim) with debounce
  useEffect(() => {
    const q = address.trim();
    if (q.length < 3) {
      setMapAddresses([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        // Prefer Yandex Suggest API if key provided
        const yKey = (import.meta as any).env?.VITE_YANDEX_API_KEY;
        if (yKey) {
          try {
            const yUrl = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${encodeURIComponent(yKey)}&text=${encodeURIComponent(q)}&lang=ru_RU&print_address=1&types=geo,street,house&results=8`;
            const yRes = await fetch(yUrl, { signal: ctrl.signal });
            if (!yRes.ok) throw new Error('yandex suggest failed');
            const yData = await yRes.json();
            const items: string[] = (yData?.results || []).map((it: any) => {
              // Prefer formatted address if present
              const addr = it?.address?.formatted_address || '';
              const title = it?.title?.text || '';
              const subtitle = it?.subtitle?.text || '';
              const combined = addr || [title, subtitle].filter(Boolean).join(', ');
              return combined;
            }).filter(Boolean);
            if (items.length) {
              setMapAddresses(items.slice(0, 8));
              return; // stop here if yandex succeeded
            }
          } catch {}
        }
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=8&addressdetails=1&accept-language=ru&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error('geocode failed');
        const data = await res.json();
        const formatted: string[] = (data || []).map((it: any) => {
          const a = it.address || {};
          const city = a.city || a.town || a.village || a.hamlet || '';
          const road = a.road || a.pedestrian || a.footway || a.highway || '';
          const house = a.house_number ? `, д. ${a.house_number}` : '';
          const cityPart = city ? `г. ${city}` : '';
          const roadPart = road ? (cityPart ? `, ${road}` : road) : '';
          const assembled = `${cityPart}${roadPart}${house}`.trim();
          return assembled || it.display_name;
        }).filter(Boolean);
        setMapAddresses(formatted);
      } catch (e) {
        if (!(e instanceof DOMException)) {
          setMapAddresses([]);
        }
      }
    }, 350);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [address]);
  
  // Helper: build payload from current state (same shape as backend expects)
  const buildPayload = () => {
    const dayMap: Record<string, string> = {
      'Пн': 'mon', 'Вт': 'tue', 'Ср': 'wed', 'Чт': 'thu', 'Пт': 'fri', 'Сб': 'sat', 'Вс': 'sun',
    };
    const schedulePayload = scheduleIntervals.map(it => ({
      selected_days: (it.selected_days || []).map(d => dayMap[d] || d).filter(Boolean),
      work_from: it.work_from,
      work_to: it.work_to,
    }));
    const connectionsPayload = warehouseConnections
      .filter(c => c.enabled)
      .map(c => ({
        warehouseId: c.warehouseId,
        enabled: true,
        delivery_time: c.delivery_time === '' ? undefined : Number(c.delivery_time),
        delivery_cost_mgt: c.delivery_cost_mgt === '' ? undefined : Number(c.delivery_cost_mgt),
        delivery_cost_kgt: c.delivery_cost_kgt === '' ? undefined : Number(c.delivery_cost_kgt),
      }));
    return {
      address,
      name,
      identifier,
      phone,
      extension,
      directions_comment: directionsComment,
      schedule: schedulePayload,
      max_weight: maxWeight === '' ? undefined : Number(maxWeight),
      max_length: maxLength === '' ? undefined : Number(maxLength),
      storage_period: storagePeriod === '' ? undefined : Number(storagePeriod),
      connections: connectionsPayload,
    };
  };

  // Capture initial serialized payload in edit mode (once)
  useEffect(() => {
    if (isEditMode && initialSerializedRef.current == null) {
      const initial = buildPayload();
      initialSerializedRef.current = JSON.stringify(initial);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);
  
  const filteredAddresses = mapAddresses;

  const isFullAddress = (s: string) => {
    const hasCity = /\bг\./i.test(s) || /город/i.test(s);
    const hasStreet = /(ул\.|улица|пр\.|просп|ш\.|шоссе|пер\.|переулок|бул\.|бульвар)/i.test(s);
    const hasHouse = /(д\.|дом|корп\.|корп|стр\.|стр|\b\d+)/i.test(s);
    return hasCity && hasStreet && hasHouse;
  };

  // Normalize and deduplicate suggestions
  const normalize = (s: string) => s
    .replace(/\s+/g, ' ')
    .replace(/город\s/ig, 'г. ')
    .replace(/улица\s/ig, 'ул. ')
    .replace(/проспект\s/ig, 'пр. ')
    .replace(/бульвар\s/ig, 'бул. ')
    .replace(/переулок\s/ig, 'пер. ')
    .trim()
    .toLowerCase();

  const dedupedAddresses = React.useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const a of filteredAddresses) {
      const key = normalize(a);
      if (!seen.has(key)) {
        seen.add(key);
        out.push(a);
      }
      if (out.length >= 8) break;
    }
    return out;
  }, [filteredAddresses]);

  type IntervalErrors = Record<string, { work_from?: string; work_to?: string }>;
  type ConnectionErrors = Record<string, { delivery_time?: string; delivery_cost_mgt?: string; delivery_cost_kgt?: string }>;
  const [errors, setErrors] = useState<{
    address?: string;
    name?: string;
    identifier?: string;
    phone?: string;
    directionsComment?: string;
    maxWeight?: string;
    maxLength?: string;
    storagePeriod?: string;
    intervals?: IntervalErrors;
    connections?: ConnectionErrors;
  }>({});

  const allSelected = warehouseConnections.every((c) => c.enabled);
  const someSelected = warehouseConnections.some((c) => c.enabled);

  const toggleDay = (intervalId: string, day: string) => {
    setScheduleIntervals((intervals) => {
      const target = intervals.find((i) => i.id === intervalId);
      const isSelectedInTarget = target?.selected_days.includes(day);
      return intervals.map((interval) => {
        if (interval.id === intervalId) {
          // Toggle in current interval
          const selected = isSelectedInTarget
            ? interval.selected_days.filter((d) => d !== day)
            : [...interval.selected_days, day];
          return { ...interval, selected_days: selected };
        }
        // Ensure mutual exclusivity: remove this day from other intervals
        return {
          ...interval,
          selected_days: interval.selected_days.filter((d) => d !== day),
        };
      });
    });
  };

  const addInterval = () => {
    if (scheduleIntervals.length < 7) {
      setScheduleIntervals([
        ...scheduleIntervals,
        {
          id: Date.now().toString(),
          selected_days: [],
          work_from: '',
          work_to: '',
        },
      ]);
    }
  };

  const removeInterval = (id: string) => {
    if (scheduleIntervals.length > 1) {
      setScheduleIntervals(scheduleIntervals.filter((i) => i.id !== id));
    }
  };

  const updateInterval = (id: string, field: string, value: string) => {
    setScheduleIntervals((intervals) =>
      intervals.map((interval) =>
        interval.id === id ? { ...interval, [field]: value } : interval
      )
    );
  };

  const toggleWarehouse = (warehouseId: string) => {
    setWarehouseConnections((connections) =>
      connections.map((conn) =>
        conn.warehouseId === warehouseId
          ? { ...conn, enabled: !conn.enabled }
          : conn
      )
    );
  };

  const updateWarehouseConnection = (
    warehouseId: string,
    field: string,
    value: string
  ) => {
    setWarehouseConnections((connections) =>
      connections.map((conn) =>
        conn.warehouseId === warehouseId ? { ...conn, [field]: value } : conn
      )
    );
  };

  const toggleAllWarehouses = (checked: boolean) => {
    setWarehouseConnections((connections) =>
      connections.map((conn) => ({ ...conn, enabled: checked }))
    );
  };

  const parseTime = (t: string): number | null => {
    if (!t) return null;
    const [h, m] = t.split(':').map((x) => Number(x));
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  // Robust formatter: +7 (XXX) XXX-XX-XX, idempotent on already-formatted input
  const formatRuPhone = (input: string): string => {
    let d = (input || '').replace(/\D/g, '');
    // Drop country prefix if present
    if (d.startsWith('8')) d = d.slice(1);
    else if (d.startsWith('7')) d = d.slice(1);
    // Keep only first 10 digits of local number
    d = d.slice(0, 10);
    const p1 = d.slice(0, 3);
    const p2 = d.slice(3, 6);
    const p3 = d.slice(6, 8);
    const p4 = d.slice(8, 10);
    let out = '+7';
    if (p1) {
      out += ` (${p1}`;
      if (p1.length === 3) out += ')';
    }
    if (p2) out += ` ${p2}`;
    if (p3) out += `-${p3}`;
    if (p4) out += `-${p4}`;
    return out;
  };

  // Helpers to clear concrete error entries as user edits values
  const clearFieldError = (key: keyof typeof errors) => {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev } as any;
      delete next[key];
      return next;
    });
  };

  const clearIntervalError = (intervalId: string, key: 'work_from' | 'work_to') => {
    setErrors((prev) => {
      if (!prev.intervals || !prev.intervals[intervalId] || !(key in prev.intervals[intervalId]!)) return prev;
      const next = { ...prev, intervals: { ...(prev.intervals || {}) } } as typeof prev;
      const entry = { ...(next.intervals![intervalId] || {}) } as any;
      delete entry[key];
      if (Object.keys(entry).length === 0) {
        const { [intervalId]: _omit, ...rest } = next.intervals!;
        next.intervals = rest;
      } else {
        next.intervals![intervalId] = entry;
      }
      if (Object.keys(next.intervals || {}).length === 0) {
        delete (next as any).intervals;
      }
      return next;
    });
  };

  const clearConnectionError = (
    warehouseId: string,
    key: 'delivery_time' | 'delivery_cost_mgt' | 'delivery_cost_kgt'
  ) => {
    setErrors((prev) => {
      if (!prev.connections || !prev.connections[warehouseId] || !(key in prev.connections[warehouseId]!)) return prev;
      const next = { ...prev, connections: { ...(prev.connections || {}) } } as typeof prev;
      const entry = { ...(next.connections![warehouseId] || {}) } as any;
      delete entry[key];
      if (Object.keys(entry).length === 0) {
        const { [warehouseId]: _omit, ...rest } = next.connections!;
        next.connections = rest;
      } else {
        next.connections![warehouseId] = entry;
      }
      if (Object.keys(next.connections || {}).length === 0) {
        delete (next as any).connections;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {
      address?: string;
      name?: string;
      identifier?: string;
      phone?: string;
      directionsComment?: string;
      maxWeight?: string;
      maxLength?: string;
      storagePeriod?: string;
      intervals?: IntervalErrors;
      connections?: ConnectionErrors;
    } = {};

    // Required fields
    if (!address.trim()) newErrors.address = 'Обязательное поле';
    if (!name.trim()) newErrors.name = 'Обязательное поле';
    if (!identifier.trim()) newErrors.identifier = 'Обязательное поле';
    if (!phone.trim()) newErrors.phone = 'Обязательное поле';
    if (!directionsComment.trim()) newErrors.directionsComment = 'Обязательное поле';
    if (!maxWeight) newErrors.maxWeight = 'Обязательное поле';
    if (!maxLength) newErrors.maxLength = 'Обязательное поле';
    if (!storagePeriod) newErrors.storagePeriod = 'Обязательное поле';

    // Storage period min 5
    if (storagePeriod) {
      const val = Number(storagePeriod);
      if (!Number.isNaN(val) && val < 5) {
        newErrors.storagePeriod = 'Минимальный срок хранения - 5 дней';
      }
    }

    // Intervals: required and time order
    const intErrors: IntervalErrors = {};
    scheduleIntervals.forEach((it) => {
      const eInt: { work_from?: string; work_to?: string } = {};
      if (!it.work_from) eInt.work_from = 'Обязательное поле';
      if (!it.work_to) eInt.work_to = 'Обязательное поле';
      const fromMin = parseTime(it.work_from);
      const toMin = parseTime(it.work_to);
      if (fromMin != null && toMin != null && fromMin > toMin) {
        eInt.work_from = 'Начало работы превышает время окончания';
      }
      if (Object.keys(eInt).length) intErrors[it.id] = eInt;
    });
    if (Object.keys(intErrors).length) newErrors.intervals = intErrors;

    // Connections: required when enabled
    const connErrors: ConnectionErrors = {};
    warehouseConnections.forEach((c) => {
      if (!c.enabled) return;
      const ec: { delivery_time?: string; delivery_cost_mgt?: string; delivery_cost_kgt?: string } = {};
      if (!c.delivery_time) ec.delivery_time = 'Обязательное поле';
      if (!c.delivery_cost_mgt) ec.delivery_cost_mgt = 'Обязательное поле';
      if (!c.delivery_cost_kgt) ec.delivery_cost_kgt = 'Обязательное поле';
      if (Object.keys(ec).length) connErrors[c.warehouseId] = ec;
    });
    if (Object.keys(connErrors).length) newErrors.connections = connErrors;

    // Duplicates: name + identifier (exclude current point when editing)
    try {
      const existing = await getBusinessPickupPoints();
      if (Array.isArray(existing)) {
        const currentPointId = editingPoint?.id;
        
        if (name.trim() && existing.some((p: any) => 
          p?.id !== currentPointId && 
          (p?.name ?? '').trim().toLowerCase() === name.trim().toLowerCase()
        )) {
          newErrors.name = 'Точка самовывоза с таким названием уже существует';
        }
        
        if (identifier.trim() && existing.some((p: any) => 
          p?.id !== currentPointId && 
          (p?.identifier ?? '').trim().toLowerCase() === identifier.trim().toLowerCase()
        )) {
          newErrors.identifier = 'Точка самовывоза с таким идентификатором уже существует';
        }
      }
    } catch {
      // ignore connectivity errors for validation
    }

    setErrors(newErrors);
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      // Scroll first error into view
      const container = contentRef.current;
      if (container) {
        const el = container.querySelector('.error');
        if (el && 'scrollIntoView' in el) {
          try {
            (el as HTMLElement).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          } catch {}
        }
      }
      return;
    }

    const payload = buildPayload();
    // If editing and changed, ask for confirmation
    if (isEditMode && initialSerializedRef.current && JSON.stringify(payload) !== initialSerializedRef.current) {
      if (onConfirmSave) {
        onConfirmSave(payload);
        return;
      }
    }
    onSave(payload);
  };

  // Keep focused inputs in view inside the scroll container without jumping the whole page
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Try to scroll the nearest input wrapper
      const wrapper = target.closest('.form-input-container') as HTMLElement | null;
      const node = wrapper ?? target;
      try {
        node.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
      } catch {
        // no-op
      }
    };
    el.addEventListener('focusin', onFocusIn);
    return () => el.removeEventListener('focusin', onFocusIn);
  }, []);

  return (
    <div className="add-pickup-point-form">
      <div className="form-head">
        <button className="breadcrumb-link" onClick={onClose}>Назад</button>
        <h1 className="form-title">
          {isEditMode ? 'Редактирование точки самовывоза' : 'Добавление точки самовывоза'}
        </h1>
      </div>

      <form noValidate onSubmit={handleSubmit} className="form-content-wrapper" ref={contentRef}>
        {/* Блок: Информация о точке */}
        <section className="form-section">
          <h2 className="section-title">Информация о точке</h2>
          <div className="form-fields-group">
            {/* Адрес с кнопкой */}
            <DropdownMenu open={addrOpen && filteredAddresses.length > 0} onOpenChange={setAddrOpen}>
              <DropdownMenuTrigger asChild toggleOnClick={false}>
                <div className="input-with-button">
                  <div className="form-input-root w-auto-flex">
                    <div className={`form-input-container ${addrFocused ? 'focused' : ''} ${errors.address ? 'error' : ''}`}>
                      <label className="form-input-label">Адрес *</label>
                      <input
                        className="form-input-field"
                        ref={addrInputRef}
                        value={address}
                        placeholder="Адрес"
                        onChange={(e) => {
                          const v = e.target.value;
                          setAddress(v);
                          if (errors.address) setErrors({ ...errors, address: undefined });
                          setAddrOpen(v.trim().length >= 3);
                        }}
                        onFocus={() => { setAddrFocused(true); setAddrOpen(address.trim().length >= 3); }}
                        onBlur={() => { setAddrFocused(false); if (isFullAddress(address)) setAddrOpen(false); }}
                      />
                    </div>
                    {errors.address && <div className="form-input-caption">{errors.address}</div>}
                  </div>
                  <button type="button" className="btn-secondary--md" aria-label="Геолокация">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M8 1.333c3.129 0 5.667 2.538 5.667 5.667 0 3.077-2.167 5.177-5.077 7.512-.338.266-.842.266-1.18 0C4.5 12.177 2.333 10.077 2.333 7c0-3.129 2.538-5.667 5.667-5.667Zm0 2c-2.024 0-3.667 1.643-3.667 3.667 0 2.487 1.84 4.249 3.667 5.734 1.827-1.485 3.667-3.247 3.667-5.734 0-2.024-1.643-3.667-3.667-3.667Zm0 2.334a1.333 1.333 0 1 1 0 2.666 1.333 1.333 0 0 1 0-2.666Z" fill="#191817"/>
                    </svg>
                  </button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" matchTriggerWidth className="addr-menu">
                {dedupedAddresses.map((a) => (
                  <DropdownMenuItem
                    key={a}
                    closeOnSelect={isFullAddress(a)}
                    onClick={() => {
                      const full = isFullAddress(a);
                      // For partial address keep assisting: add comma+space to continue typing
                      const next = full ? a : (a.endsWith(',') ? `${a} ` : `${a}, `);
                      setAddress(next);
                      if (!full) {
                        setTimeout(() => {
                          const node = addrInputRef.current;
                          node?.focus({ preventScroll: true } as any);
                          if (node) {
                            const len = node.value.length;
                            try { node.setSelectionRange(len, len); } catch {}
                          }
                        }, 0);
                        setAddrOpen(true);
                      } else {
                        setAddrOpen(false);
                        // Place caret at end for consistency
                        setTimeout(() => {
                          const node = addrInputRef.current;
                          node?.focus({ preventScroll: true } as any);
                          if (node) {
                            const len = node.value.length;
                            try { node.setSelectionRange(len, len); } catch {}
                          }
                        }, 0);
                      }
                    }}
                  >
                    {a}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <FormInput
              value={name}
              onChange={(v) => { setName(v); if (errors.name) clearFieldError('name'); }}
              placeholder="Название"
              required
              error={!!errors.name}
              errorText={errors.name}
            />
            <FormInput
              value={identifier}
              onChange={(v) => { setIdentifier(v); if (errors.identifier) clearFieldError('identifier'); }}
              placeholder="Идентификатор"
              required
              error={!!errors.identifier}
              errorText={errors.identifier}
            />
            <div className="form-row form-row--top">
              <FormInput
                value={phone}
                onChange={(v) => { setPhone(formatRuPhone(v)); if (errors.phone) clearFieldError('phone'); }}
                placeholder="Телефон"
                type="tel"
                focusPlaceholder="+7 (___) ___-__-__"
                required
                className="w-388"
                error={!!errors.phone}
                errorText={errors.phone}
              />
              <FormInput
                value={extension}
                onChange={setExtension}
                placeholder="Добавочный"
                className="w-280"
              />
            </div>
            <TextArea
              value={directionsComment}
              onChange={(v) => { setDirectionsComment(v); if (errors.directionsComment) clearFieldError('directionsComment'); }}
              placeholder="Комментарий как добраться до точки"
              required
              error={!!errors.directionsComment}
              errorText={errors.directionsComment}
            />
          </div>
        </section>

        {/* Блок: График работы */}
        <section className="form-section">
          <h2 className="section-title">График работы</h2>
          {scheduleIntervals.map((interval, index) => {
            const intervalHasError =
              !!errors.intervals?.[interval.id]?.work_from ||
              !!errors.intervals?.[interval.id]?.work_to;
            return (
            <div key={interval.id} className="schedule-interval">
              <div className={`interval-row ${scheduleIntervals.length > 1 ? 'with-btn' : ''} ${intervalHasError ? 'has-error' : ''}`}>
                <div className="day-chips">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`day-chip ${
                        interval.selected_days.includes(day) ? 'selected' : ''
                      }`}
                      onClick={() => toggleDay(interval.id, day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <div className="time-group">
                  <div className="time-inputs">
                    <FormInput
                      value={interval.work_from}
                      onChange={(v) => { updateInterval(interval.id, 'work_from', v); clearIntervalError(interval.id, 'work_from'); }}
                      placeholder="Работа с"
                      type="time"
                      required
                      className="no-picker"
                      error={!!errors.intervals?.[interval.id]?.work_from}
                      errorText={errors.intervals?.[interval.id]?.work_from}
                    />
                    <FormInput
                      value={interval.work_to}
                      onChange={(v) => { updateInterval(interval.id, 'work_to', v); clearIntervalError(interval.id, 'work_to'); }}
                      placeholder="Работа до"
                      type="time"
                      required
                      className="no-picker"
                      error={!!errors.intervals?.[interval.id]?.work_to}
                      errorText={errors.intervals?.[interval.id]?.work_to}
                    />
                  </div>
                </div>
                {scheduleIntervals.length > 1 && (
                  <button
                    type="button"
                    className="remove-interval-button"
                    onClick={() => removeInterval(interval.id)}
                    aria-label="Удалить интервал"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M5.00012 3.99902V2.99902C5.00012 1.89445 5.89555 0.999023 7.00012 0.999023H9.00012C10.1047 0.999023 11.0001 1.89445 11.0001 2.99902V3.99902H13.1601L14 4V5.5H13.0018L12.2833 12.3137C12.1223 13.8402 10.8349 14.999 9.29981 14.999H6.70034C5.16528 14.999 3.87787 13.8402 3.71689 12.3136L2.99837 5.5H2V4L5.00012 3.99902ZM7.00012 2.49902H9.00012C9.27626 2.49902 9.50012 2.72288 9.50012 2.99902V3.99902H6.50012V2.99902C6.50012 2.72288 6.72398 2.49902 7.00012 2.49902ZM5.20862 12.1563L4.50669 5.5H11.4935L10.7915 12.1563C10.711 12.9196 10.0673 13.499 9.29981 13.499H6.70034C5.93281 13.499 5.28911 12.9196 5.20862 12.1563Z" fill="#191817"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )})}
          {scheduleIntervals.length < 7 && (
            <button
              type="button"
              className="add-interval-button"
              onClick={addInterval}
            >
              Добавить интервал
            </button>
          )}
        </section>

        {/* Блок: Допустимые габариты */}
        <section className="form-section">
          <h2 className="section-title">Допустимые габариты товара для точки</h2>
          <div className="form-row">
            <FormInput
              value={maxWeight}
              onChange={(v) => { setMaxWeight(v); if (errors.maxWeight) clearFieldError('maxWeight'); }}
              placeholder="Вес до, кг"
              type="number"
              required
              className="w-334"
                error={!!errors.maxWeight}
                errorText={errors.maxWeight}
            />
            <FormInput
              value={maxLength}
              onChange={(v) => { setMaxLength(v); if (errors.maxLength) clearFieldError('maxLength'); }}
              placeholder="Длина до, см"
              type="number"
              required
              className="w-334"
                error={!!errors.maxLength}
                errorText={errors.maxLength}
            />
          </div>
        </section>

        {/* Блок: Хранение */}
        <section className="form-section">
          <h2 className="section-title">Хранение</h2>
          <div className="form-fields-group">
            <FormInput
              value={storagePeriod}
              onChange={(v) => { setStoragePeriod(v); if (errors.storagePeriod) clearFieldError('storagePeriod'); }}
              placeholder="Срок хранения заказов, от 5 дней"
              type="number"
              min="5"
              required
              error={!!errors.storagePeriod}
              errorText={errors.storagePeriod}
            />
          </div>
        </section>

        {/* Divider between Storage and Warehouse Connection */}
        <div className="form-divider" aria-hidden="true" />

        {/* Блок: Подключение к складам */}
        <section className="form-section">
          <h2 className="section-title">
            Подключение точки к складам · <span className="text-secondary">{warehouseConnections.filter((c) => c.enabled).length}</span>
          </h2>
          <div className="warehouse-table">
            <table>
              <thead>
                <tr>
                  <th className="col-checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={(checked) => toggleAllWarehouses(checked)}
                    />
                  </th>
                  <th className="col-name-address">Название и адрес склада</th>
                  <th className="col-delivery-term">Срок доставки до точки</th>
                  <th className="col-cost-mgt">Стоимость доставки для МГТ</th>
                  <th className="col-cost-kgt">Стоимость доставки для КГТ</th>
                </tr>
              </thead>
              <tbody>
                {warehouseConnections.map((conn) => (
                  <tr key={conn.warehouseId}>
                    <td className="col-checkbox">
                      <Checkbox
                        checked={!!conn.enabled}
                        onChange={() => toggleWarehouse(conn.warehouseId)}
                      />
                    </td>
                    <td className="col-name-address">
                      <div className="warehouse-cell">
                        <div className="warehouse-name">{conn.warehouseName}</div>
                        <div className="warehouse-address">{conn.warehouseAddress}</div>
                      </div>
                    </td>
                    <td className="col-delivery-term">
                      <FormInput
                        value={conn.delivery_time}
                        onChange={(value) => { updateWarehouseConnection(conn.warehouseId, 'delivery_time', value); clearConnectionError(conn.warehouseId, 'delivery_time'); }}
                        placeholder="Срок, дней"
                        disabled={!conn.enabled}
                        required={conn.enabled}
                        error={!!errors.connections?.[conn.warehouseId]?.delivery_time}
                        errorText={errors.connections?.[conn.warehouseId]?.delivery_time}
                      />
                    </td>
                    <td className="col-cost-mgt">
                      <FormInput
                        value={conn.delivery_cost_mgt}
                        onChange={(value) => { updateWarehouseConnection(conn.warehouseId, 'delivery_cost_mgt', value); clearConnectionError(conn.warehouseId, 'delivery_cost_mgt'); }}
                        placeholder="Стоимость, ₽"
                        disabled={!conn.enabled}
                        required={conn.enabled}
                        error={!!errors.connections?.[conn.warehouseId]?.delivery_cost_mgt}
                        errorText={errors.connections?.[conn.warehouseId]?.delivery_cost_mgt}
                      />
                    </td>
                    <td className="col-cost-kgt">
                      <FormInput
                        value={conn.delivery_cost_kgt}
                        onChange={(value) => { updateWarehouseConnection(conn.warehouseId, 'delivery_cost_kgt', value); clearConnectionError(conn.warehouseId, 'delivery_cost_kgt'); }}
                        placeholder="Стоимость, ₽"
                        disabled={!conn.enabled}
                        required={conn.enabled}
                        error={!!errors.connections?.[conn.warehouseId]?.delivery_cost_kgt}
                        errorText={errors.connections?.[conn.warehouseId]?.delivery_cost_kgt}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Кнопки действия */}
        <div className="form-actions">
          {isEditMode ? (
            <>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Отменить
              </button>
              <button type="submit" className="btn-primary">Сохранить изменения</button>
            </>
          ) : (
            <button type="submit" className="btn-primary">Добавить</button>
          )}
        </div>
      </form>
    </div>
  );
};

