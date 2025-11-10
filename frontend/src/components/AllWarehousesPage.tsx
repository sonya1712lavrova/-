import React, { useEffect, useState } from 'react';
import { Chip } from './Chip';
import { BuiSearchField } from './BuiSearchField';
import { getBusinessPickupPoints } from '../api';

interface Warehouse {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'pending' | 'archived';
  statusText: string;
  organization: string;
}

interface AllWarehousesPageProps {
  warehouses: Warehouse[];
  onWarehouseClick: (warehouseId: string) => void;
  // Chips
  chips: { id: string; name: string }[];
  selectedChipId: string; // 'all' | warehouseId
  onSelectAll: () => void;
  onSelectWarehouse: (id: string) => void;
  onOpenBusiness?: () => void;
}

export const AllWarehousesPage: React.FC<AllWarehousesPageProps> = ({ 
  warehouses, 
  onWarehouseClick,
  chips,
  selectedChipId,
  onSelectAll,
  onSelectWarehouse,
  onOpenBusiness,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [businessCount, setBusinessCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const list = await getBusinessPickupPoints();
        setBusinessCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setBusinessCount(0);
      }
    })();
  }, []);

  const filteredWarehouses = warehouses.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="all-warehouses-page">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Склады</h1>
        <div className="page-header-actions" style={{ marginLeft: 'auto' }}>
          <button className="btn-primary">Добавить</button>
        </div>
      </div>

      {/* Chips (same as on warehouse page) */}
      <div className="tabs">
        <Chip
          label="Все склады"
          desc={chips.length.toString()}
          selected={selectedChipId === 'all'}
          onClick={onSelectAll}
        />
        {chips.map((chip) => (
          <Chip
            key={chip.id}
            label={chip.name}
            selected={selectedChipId === chip.id}
            icon={
              chip.id === 'wh-2' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.28593 3.28593C4.53618 2.03569 6.23187 1.33331 7.99998 1.33331C9.76809 1.33331 11.4638 2.03569 12.714 3.28593C13.9643 4.53618 14.6666 6.23187 14.6666 7.99998C14.6666 9.76809 13.9643 11.4638 12.714 12.714C11.4638 13.9643 9.76809 14.6666 7.99998 14.6666C6.23187 14.6666 4.53618 13.9643 3.28593 12.714C2.03569 11.4638 1.33331 9.76809 1.33331 7.99998C1.33331 6.23187 2.03569 4.53618 3.28593 3.28593ZM8.66665 4.00503L8.83331 7.6548L10.4193 9.59096L9.54425 10.466L7.16665 8.34516L7.33331 3.99998L8.66665 4.00503Z" fill="currentColor"/>
                </svg>
              ) : undefined
            }
            onClick={() => onSelectWarehouse(chip.id)}
          />
        ))}
      </div>

      {/* Content Wrapper */}
      <div className="all-warehouses-content-wrapper">
        {/* Business PVZ widget (entry) */}
        <button
          type="button"
          className="bpp-widget"
          onClick={onOpenBusiness}
          aria-label="Точки самовывоза бизнес"
        >
          <div className="bpp-slot">
            <span className="bpp-widget__icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M18.9981 9.99818C18.9981 12.6782 17.2182 15.4407 15.0457 17.7385C13.9303 18.9182 12.805 19.8766 11.9999 20.511C11.1948 19.8766 10.0695 18.9182 8.95409 17.7385C6.7816 15.4407 5.00171 12.6782 5.00171 9.99818C5.00171 6.13319 8.1349 3 11.9999 3C15.8649 3 18.9981 6.13319 18.9981 9.99818ZM20.9981 9.99818C20.9981 16.9673 11.9999 23 11.9999 23C11.9999 23 3.00171 16.9673 3.00171 9.99818C3.00171 5.02862 7.03033 1 11.9999 1C16.9694 1 20.9981 5.02862 20.9981 9.99818ZM9.99933 9.99768C9.99933 8.89275 10.8951 7.99703 12 7.99703C13.1049 7.99703 14.0006 8.89275 14.0006 9.99768C14.0006 11.1026 13.1049 11.9983 12 11.9983C10.8951 11.9983 9.99933 11.1026 9.99933 9.99768ZM12 5.99837C9.79122 5.99837 8.00067 7.78892 8.00067 9.99768C8.00067 12.2064 9.79122 13.997 12 13.997C14.2087 13.997 15.9993 12.2064 15.9993 9.99768C15.9993 7.78892 14.2087 5.99837 12 5.99837Z" fill="currentColor"/>
              </svg>
            </span>
            <div className="bpp-widget__content">
              <div className="bpp-widget__title">Ваши пункты выдачи</div>
              <div className="bpp-widget__subtitle">Для способа DBS · Самовывоз</div>
            </div>
            <span className="bpp-widget__badge">{businessCount > 0 ? `${businessCount} шт` : 'Нет созданных'}</span>
          </div>
        </button>

        {/* Search */}
        {warehouses.length >= 10 && (
          <div className="all-warehouses-search">
            <BuiSearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск по названию или адресу"
            />
          </div>
        )}

        {/* Table */}
        <div className="all-warehouses-table-wrapper">
          <table className="all-warehouses-table">
            <thead>
              <tr>
                <th className="col-name">Название</th>
                <th className="col-id">ID</th>
                <th className="col-address">Адрес</th>
                <th className="col-status">Статус</th>
                <th className="col-organization">Организация</th>
                <th className="col-menu"></th>
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.map((warehouse) => (
                <tr 
                  key={warehouse.id} 
                  onClick={() => onWarehouseClick(warehouse.id)}
                  className="clickable-row"
                >
                  <td className="col-name">
                    <div className="warehouse-name">{warehouse.name}</div>
                  </td>
                  <td className="col-id">{warehouse.id}</td>
                  <td className="col-address">{warehouse.address}</td>
                  <td className="col-status">
                    {warehouse.status === 'pending' ? (
                      <div className="status-cell">
                        <span className="status-icon" aria-hidden="true">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3.286 3.28563C4.53624 2.03539 6.23193 1.33301 8.00004 1.33301C9.76815 1.33301 11.4638 2.03539 12.7141 3.28563C13.9643 4.53587 14.6667 6.23156 14.6667 7.99967C14.6667 9.76779 13.9643 11.4635 12.7141 12.7137C11.4638 13.964 9.76815 14.6663 8.00004 14.6663C6.23193 14.6663 4.53624 13.964 3.286 12.7137C2.03575 11.4635 1.33337 9.76778 1.33337 7.99967C1.33337 6.23156 2.03575 4.53587 3.286 3.28563ZM8.66671 4.00472L8.83337 7.6545L10.4193 9.59066L9.54431 10.4657L7.16671 8.34485L7.33337 3.99967L8.66671 4.00472Z" fill="currentColor"/>
                          </svg>
                        </span>
                        <span>Ожидает подключения</span>
                      </div>
                    ) : (
                      <span className={`status-badge status-${warehouse.status}`}>{warehouse.statusText}</span>
                    )}
                  </td>
                  <td className="col-organization">{warehouse.organization}</td>
                  <td className="col-menu">
                    <button 
                      className="icon-button-small" 
                      aria-label="Меню"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M3.5 7.06445C3.5 7.78933 2.91237 8.37695 2.1875 8.37695C1.46263 8.37695 0.875 7.78933 0.875 7.06445C0.875 6.33958 1.46263 5.75195 2.1875 5.75195C2.91237 5.75195 3.5 6.33958 3.5 7.06445Z" fill="#191817"/>
                        <path d="M8.3125 7.06445C8.3125 7.78933 7.72487 8.37695 7 8.37695C6.27513 8.37695 5.6875 7.78933 5.6875 7.06445C5.6875 6.33958 6.27513 5.75195 7 5.75195C7.72487 5.75195 8.3125 6.33958 8.3125 7.06445Z" fill="#191817"/>
                        <path d="M11.8125 8.37695C12.5374 8.37695 13.125 7.78933 13.125 7.06445C13.125 6.33958 12.5374 5.75195 11.8125 5.75195C11.0876 5.75195 10.5 6.33958 10.5 7.06445C10.5 7.78933 11.0876 8.37695 11.8125 8.37695Z" fill="#191817"/>
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

