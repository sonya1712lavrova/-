import React, { useState } from 'react';
import type { PickupPoint } from '../types';
import { Checkbox } from './Checkbox';
import { BuiSearchField } from './BuiSearchField';

interface PvzPageProps {
  pickupPoints: PickupPoint[];
  onBack: () => void;
}

export const PvzPage: React.FC<PvzPageProps> = ({ pickupPoints, onBack }) => {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allSelected = selectedIds.size > 0 && selectedIds.size === pickupPoints.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < pickupPoints.length;

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(pickupPoints.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };
  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <div className="pvz-page">
      {/* Breadcrumb */}
      <div className="pvz-breadcrumb">
        <button onClick={onBack} className="breadcrumb-link">
          К складу
        </button>
      </div>

      {/* Page Header */}
      <div className="pvz-page-header">
        <div className="pvz-page-header-left">
          <h1 className="pvz-page-title">Способ доставки «Самовывоз»</h1>
          <p className="pvz-page-subtitle">
            Список всех точек самовывоза вашего бизнеса можно посмотреть{' '}
            <a href="#" className="pvz-subtitle-link">тут</a>
          </p>
        </div>
        <div className="pvz-page-header-right">
          <button className="icon-button" aria-label="Скачать">
            <img src="/icons/i24_download.svg" alt="" width={24} height={24} />
          </button>
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
          <button className="btn-primary">Подключить точки</button>
        </div>
      </div>

      {/* Filters and Table Container */}
      <div className="pvz-content-wrapper">
        {/* Filters (show only when 10+ rows) */}
        {pickupPoints.length >= 10 && (
          <div className="pvz-filters">
            <BuiSearchField value={searchQuery} onChange={setSearchQuery} />
          </div>
        )}

        {/* Table */}
        <div className="pvz-table-wrapper">
          <table className="pvz-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              </th>
              <th className="col-name-address">Название и адрес</th>
              <th className="col-schedule">График работы</th>
              <th className="col-delivery-term">Срок доставки</th>
              <th className="col-storage-term">Срок хранения</th>
              <th className="col-cost-mgt">Стоимость доставки для МГТ</th>
              <th className="col-cost-kgt">Стоимость доставки для КГТ</th>
              <th className="col-menu"></th>
            </tr>
          </thead>
          <tbody>
            {pickupPoints
              .filter((p) => {
                const q = searchQuery.trim().toLowerCase();
                if (!q) return true;
                return (
                  p.name.toLowerCase().includes(q) ||
                  p.address.toLowerCase().includes(q)
                );
              })
              .map((p, idx) => (
              <tr key={p.id}>
                <td className="col-checkbox">
                  <Checkbox
                    checked={selectedIds.has(p.id)}
                    onChange={(checked) => toggleOne(p.id, checked)}
                  />
                </td>
                <td className="col-name-address">
                  <div className="pvz-name">{p.name}</div>
                  <div className="pvz-address">{p.address}</div>
                  {idx === 0 && <span className="badge-click-collect">Click and Collect</span>}
                </td>
                <td className="col-schedule">
                  {idx === 0 ? (
                    <>
                      <div>Пн–Пт, 10:00–23:00</div>
                      <div>Сб–Вс, 09:00–18:00</div>
                    </>
                  ) : (
                    <div>Ежедневно, 10:00–23:00</div>
                  )}
                </td>
                <td className="col-delivery-term">
                  {idx === 0 ? '0 дней' : `${idx + 3} дн${idx + 3 === 4 ? 'я' : 'ей'}`}
                </td>
                <td className="col-storage-term">14 дней</td>
                <td className="col-cost-mgt">
                  {idx === 0 ? 'Бесплатно' : `${(idx + 1) * 100} ₽`}
                </td>
                <td className="col-cost-kgt">
                  {idx === 0 ? 'Бесплатно' : `${(idx + 1) * 200} ₽`}
                </td>
                <td className="col-menu">
                  <button className="icon-button-small" aria-label="Действие">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M4.37511 3.5V2.625C4.37511 1.6585 5.15861 0.875 6.12511 0.875H7.87511C8.84161 0.875 9.62511 1.6585 9.62511 2.625V3.5H11.5151L12.25 3.50085V4.81335H11.3766L10.7479 10.7753C10.607 12.1111 9.4805 13.125 8.13733 13.125H5.8628C4.51962 13.125 3.39314 12.1111 3.25228 10.7753L2.62357 4.81335H1.75V3.50085L4.37511 3.5ZM6.12511 2.1875H7.87511C8.11673 2.1875 8.31261 2.38338 8.31261 2.625V3.5H5.68761V2.625C5.68761 2.38338 5.88348 2.1875 6.12511 2.1875ZM4.55754 10.6376L3.94335 4.81335H10.0568L9.4426 10.6377C9.37216 11.3055 8.80892 11.8125 8.13733 11.8125H5.8628C5.19121 11.8125 4.62797 11.3055 4.55754 10.6376Z" fill="#191817"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};


