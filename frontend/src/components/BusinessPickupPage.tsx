import React, { useEffect, useState } from 'react';
import { getBusinessPickupPoints, createBusinessPickupPoint, updateBusinessPickupPoint, getWarehouseBusinessLinks, deleteBusinessPickupPoint } from '../api';
import { AddPickupPointForm } from './AddPickupPointForm';
import { BuiSearchField } from './BuiSearchField';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './DropdownMenu';
import { Checkbox } from './Checkbox';
import { BusinessPickupMap } from './BusinessPickupMap';
import { Modal } from './Modal';
import { ActionBar } from './ActionBar';
import { geocodeAddress, primeGeocodes } from '../utils/geocode';

interface BusinessPickupPageProps {
  onBack: () => void;
  warehouses: Array<{ id: string; name: string; address: string }>;
}


interface BusinessPickupPoint {
  id: string;
  name: string;
  address: string;
  schedule: Array<{
    selected_days: string[];
    work_from: string;
    work_to: string;
  }>;
  storage_period?: number;
}

interface WarehouseBusinessLink {
  warehouseId: string;
  businessPickupPointId: string;
  enabled: boolean;
}

const DAYS_MAP: Record<string, string> = {
  mon: 'Пн',
  tue: 'Вт',
  wed: 'Ср',
  thu: 'Чт',
  fri: 'Пт',
  sat: 'Сб',
  sun: 'Вс',
};

function formatSchedule(schedule: BusinessPickupPoint['schedule']): string {
  if (!schedule || schedule.length === 0) return '';
  
  // Collect all unique days
  const allDays = new Set<string>();
  schedule.forEach((interval) => {
    interval.selected_days.forEach((d) => allDays.add(d));
  });

  // Check if all days are present
  const allWeekDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const hasAllDays = allWeekDays.every((d) => allDays.has(d));

  // Group by time range
  const timeGroups = new Map<string, string[]>();
  schedule.forEach((interval) => {
    const timeKey = `${interval.work_from}–${interval.work_to}`;
    const days = interval.selected_days.map((d) => DAYS_MAP[d] || d);
    if (!timeGroups.has(timeKey)) {
      timeGroups.set(timeKey, []);
    }
    timeGroups.get(timeKey)!.push(...days);
  });

  // Format output
  const parts: string[] = [];
  timeGroups.forEach((days, time) => {
    const daysPart = hasAllDays && days.length === 7 ? 'Ежедневно' : days.join(', ');
    parts.push(`${daysPart}, ${time}`);
  });

  return parts.join('\n');
}

export const BusinessPickupPage: React.FC<BusinessPickupPageProps> = ({ onBack, warehouses }) => {
  const [points, setPoints] = useState<BusinessPickupPoint[]>([]);
  const [links, setLinks] = useState<WarehouseBusinessLink[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>(() => {
    const saved = sessionStorage.getItem('bpp_view_mode');
    return (saved === 'map' ? 'map' : 'list');
  });
  const [editingPoint, setEditingPoint] = useState<BusinessPickupPoint | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletePoint, setDeletePoint] = useState<BusinessPickupPoint | null>(null);
  const [deleteMany, setDeleteMany] = useState<boolean>(false);
  const [pendingUpdate, setPendingUpdate] = useState<any | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);
  const [editingLinks, setEditingLinks] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const pointsList = await getBusinessPickupPoints();
      setPoints(Array.isArray(pointsList) ? pointsList : []);
      
      // Try to load links, but don't fail if it errors
      try {
        const linksList = await getWarehouseBusinessLinks();
        setLinks(Array.isArray(linksList) ? linksList : []);
      } catch (err) {
        console.warn('Failed to load warehouse links:', err);
        setLinks([]);
      }
    } catch (err) {
      console.error('Failed to load points:', err);
      setPoints([]);
      setLinks([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Prime geocodes for loaded points
  useEffect(() => {
    if (points.length > 0) {
      primeGeocodes(points.map(p => p.address)).catch(() => {});
    }
  }, [points]);

  useEffect(() => {
    sessionStorage.setItem('bpp_view_mode', viewMode);
  }, [viewMode]);

  const handleSave = async (data: any) => {
    try {
      if (editingPoint) {
        // Update existing point
        await updateBusinessPickupPoint(editingPoint.id, data);
      } else {
        // Create new point
        const res = await createBusinessPickupPoint(data);
        // Geocode immediately to ensure instant appearance on the map
        if (data?.address) {
          await geocodeAddress(data.address);
        }
        if (res && res.id) {
          setHighlightedIds([res.id]);
          setViewMode('map');
        }
      }
      setShowForm(false);
      setEditingPoint(null);
      loadData();
    } catch (error) {
      console.error('Failed to save pickup point:', error);
      alert(editingPoint ? 'Ошибка при сохранении изменений' : 'Ошибка при создании точки самовывоза');
    }
  };

  const handleRowClick = (point: BusinessPickupPoint) => {
    setEditingPoint(point);
    // Prefer fresh links from backend to гарантированно отрисовать подключения
    getWarehouseBusinessLinks()
      .then((all) => {
        const filtered = Array.isArray(all)
          ? all.filter((l: any) => l.businessPickupPointId === point.id)
          : [];
        setEditingLinks(filtered);
        setShowForm(true);
      })
      .catch(() => {
        // fallback to already загруженные links из страницы
        const filtered = links.filter((l) => l.businessPickupPointId === point.id);
        setEditingLinks(filtered as any);
        setShowForm(true);
      });
  };

  const handleDelete = async (point: BusinessPickupPoint) => {
    // Open confirm modal
    setDeletePoint(point);
  };

  // Get connected warehouses count for each point
  const getConnectedCount = (pointId: string): number => {
    const connectedLinks = links.filter(
      (link) => link.businessPickupPointId === pointId && link.enabled
    );
    console.log(`Point ${pointId} connected to:`, connectedLinks);
    return connectedLinks.length;
  };

  const filteredPoints = points.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allVisibleIds = filteredPoints.map((p) => p.id);
  const allChecked = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedIds.has(id));
  const someChecked = selectedIds.size > 0 && !allChecked;

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set<string>(prev);
      if (checked) {
        allVisibleIds.forEach((id) => next.add(id));
      } else {
        allVisibleIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  };

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set<string>(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  };

  console.log('BusinessPickupPage state:', { 
    pointsCount: points.length, 
    linksCount: links.length, 
    filteredCount: filteredPoints.length,
    showForm,
    allLinks: links,
    allPoints: points
  });

  if (showForm) {
    return (
      <>
        <AddPickupPointForm
          warehouses={warehouses}
          editingPoint={editingPoint}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          onConfirmSave={(data) => setPendingUpdate(data)}
          initialLinks={editingLinks}
        />
        <Modal
          open={!!pendingUpdate}
          title="Изменить настройки точки самовывоза?"
          onClose={() => setPendingUpdate(null)}
          footer={(
            <>
              <button className="btn-secondary" onClick={() => setPendingUpdate(null)}>Назад</button>
              <button
                className="btn-primary"
                onClick={async () => {
                  if (!pendingUpdate) return;
                  await handleSave(pendingUpdate);
                  setPendingUpdate(null);
                }}
              >
                Да, изменить
              </button>
            </>
          )}
        >
          Новые настройки точки самовывоза применятся ко всем складам, к которым подключена
        </Modal>
      </>
    );
  }

  return (
    <div className="business-page">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-end' }}>
        <div className="page-header-left" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="breadcrumb-link" onClick={onBack}>Назад</button>
          <h1 className="page-title">Точки самовывоза</h1>
        </div>
        {points.length > 0 && (
          <div className="page-header-actions" style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <button
              className="btn-secondary btn-secondary--md"
              onClick={() => {/* TODO: Download handler */}}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M7.99992 11.0006L11.8636 7.13694L10.8029 6.07628L8.74992 8.12928L8.74992 2H7.24992L7.24992 8.12928L5.19691 6.07628L4.13625 7.13694L7.99992 11.0006Z"
                  fill="#191817"
                />
                <path
                  d="M1.85992 12.0199L1.27075 9.99994H2.83325L3.29992 11.5999C3.45547 12.1333 3.94436 12.4999 4.49992 12.4999H11.4999C12.0555 12.4999 12.5444 12.1333 12.6999 11.5999L13.1666 9.99994H14.7291L14.1399 12.0199C13.7977 13.1933 12.7221 13.9999 11.4999 13.9999H4.49992C3.2777 13.9999 2.20214 13.1933 1.85992 12.0199Z"
                  fill="#191817"
                />
              </svg>
            </button>
            {/* View toggle moved near Download button */}
            <div className="pvz-tabs">
              <button
                className={`pvz-tab ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                Список
              </button>
              <button
                className={`pvz-tab ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                Карта
              </button>
            </div>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Добавить точку
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="all-warehouses-content-wrapper">
        {points.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration" aria-hidden="true" />
            <div className="empty-texts">
              <div className="empty-title">Добавьте первую точку самовывоза</div>
              <div className="empty-subtitle">
                Создайте точку самовывоза, чтобы подключить её к вашим складам
              </div>
            </div>
            <div className="empty-actions">
              <button className="btn-primary btn-primary--sm" onClick={() => setShowForm(true)}>
                Добавить вручную
              </button>
              <button className="compare-button">Загрузить через Excel</button>
            </div>
          </div>
        ) : viewMode === 'map' ? (
          <BusinessPickupMap
            points={filteredPoints}
            getConnectedCount={getConnectedCount}
            highlightedIds={highlightedIds}
          />
        ) : (
          <>
            {/* Search & Filter */}
            {points.length >= 10 && (
              <div style={{ marginBottom: '24px' }}>
                <BuiSearchField
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Поиск по названию или адресу"
                />
              </div>
            )}

            {/* Table */}
            <div className="pvz-table-wrapper">
              <table className="pvz-table">
                <thead>
                  <tr>
                    {filteredPoints.length > 1 && (
                      <th className="col-checkbox" style={{ verticalAlign: 'middle' }}>
                        <Checkbox checked={allChecked} indeterminate={someChecked} onChange={handleToggleAll} />
                      </th>
                    )}
                    <th className="col-name-address">Название и адрес</th>
                    <th style={{ width: '280px' }}>График работы</th>
                    <th style={{ width: '240px', textAlign: 'right' }}>Подключена к складам</th>
                    <th className="col-menu"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPoints.map((point) => {
                    const connectedCount = getConnectedCount(point.id);
                    const connectedText = (warehouses && warehouses.length > 0 && connectedCount >= warehouses.length)
                      ? 'Все склады'
                      : String(connectedCount);
                    const scheduleText = formatSchedule(point.schedule);

                    return (
                      <tr 
                        key={point.id}
                        onClick={(e) => {
                          // Don't trigger row click if clicking on checkbox or delete button
                          const target = e.target as HTMLElement;
                          if (
                            target.closest('.ui-checkbox') || 
                            target.closest('.icon-button-small')
                          ) {
                            return;
                          }
                          handleRowClick(point);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {filteredPoints.length > 1 && (
                          <td className="col-checkbox" style={{ verticalAlign: 'middle' }}>
                            <Checkbox checked={selectedIds.has(point.id)} onChange={(v) => handleToggleRow(point.id, v)} />
                          </td>
                        )}
                        <td className="col-name-address">
                          <div className="pvz-name">{point.name}</div>
                          <div className="pvz-address">{point.address}</div>
                        </td>
                        <td style={{ whiteSpace: 'pre-line', verticalAlign: 'middle' }}>{scheduleText}</td>
                        <td style={{ verticalAlign: 'middle', textAlign: 'right' }}>{connectedText}</td>
                        <td className="col-menu" style={{ verticalAlign: 'middle' }}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="icon-button-small"
                                onClick={(e) => e.stopPropagation()}
                                aria-label="More"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                                  <path d="M3.5 7.06445C3.5 7.78933 2.91237 8.37695 2.1875 8.37695C1.46263 8.37695 0.875 7.78933 0.875 7.06445C0.875 6.33958 1.46263 5.75195 2.1875 5.75195C2.91237 5.75195 3.5 6.33958 3.5 7.06445Z" fill="#191817"/>
                                  <path d="M8.3125 7.06445C8.3125 7.78933 7.72487 8.37695 7 8.37695C6.27513 8.37695 5.6875 7.78933 5.6875 7.06445C5.6875 6.33958 6.27513 5.75195 7 5.75195C7.72487 5.75195 8.3125 6.33958 8.3125 7.06445Z" fill="#191817"/>
                                  <path d="M11.8125 8.37695C12.5374 8.37695 13.125 7.78933 13.125 7.06445C13.125 6.33958 12.5374 5.75195 11.8125 5.75195C11.0876 5.75195 10.5 6.33958 10.5 7.06445C10.5 7.78933 11.0876 8.37695 11.8125 8.37695Z" fill="#191817"/>
                                </svg>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(point);
                                }}
                              >
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(point);
                                }}
                              >
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {selectedIds.size > 0 && (
        <ActionBar
          count={selectedIds.size}
          onDelete={() => setDeleteMany(true)}
          onClose={() => setSelectedIds(new Set())}
        />
      )}
      <Modal
        open={!!deletePoint || deleteMany}
        title={deleteMany ? 'Удалить точки самовывоза?' : 'Удалить точку самовывоза?'}
        onClose={() => { setDeletePoint(null); setDeleteMany(false); }}
        footer={(
          <>
            <button className="btn-secondary" onClick={() => { setDeletePoint(null); setDeleteMany(false); }}>Назад</button>
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  if (deleteMany) {
                    const ids = Array.from(selectedIds);
                    for (const id of ids) {
                      await deleteBusinessPickupPoint(id);
                    }
                    setSelectedIds(new Set());
                    setDeleteMany(false);
                  } else if (deletePoint) {
                    await deleteBusinessPickupPoint(deletePoint.id);
                    setDeletePoint(null);
                  }
                  loadData();
                } catch (e) {
                  console.error('Failed to delete pickup point:', e);
                  setDeletePoint(null);
                  setDeleteMany(false);
                  alert('Не удалось удалить точку');
                }
              }}
            >
              Да, удалить
            </button>
          </>
        )}
      >
        {deleteMany
          ? 'Они будут удалены со всех складов, к которым подключены'
          : 'Она будет удалена со всех складов, к которым подключена'}
      </Modal>
    </div>
  );
};


