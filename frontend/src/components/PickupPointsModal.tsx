import React, { useState } from 'react';
import type { PickupPoint } from '../types';

interface PickupPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickupPoints: PickupPoint[];
}

export const PickupPointsModal: React.FC<PickupPointsModalProps> = ({
  isOpen,
  onClose,
  pickupPoints
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPoints, setSelectedPoints] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const filteredPoints = pickupPoints.filter(point => {
    const searchLower = searchQuery.toLowerCase();
    return (
      point.name.toLowerCase().includes(searchLower) ||
      point.address.toLowerCase().includes(searchLower)
    );
  });

  const togglePoint = (id: string) => {
    const newSelected = new Set(selectedPoints);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedPoints(newSelected);
  };

  const toggleAll = () => {
    if (selectedPoints.size === filteredPoints.length) {
      setSelectedPoints(new Set());
    } else {
      setSelectedPoints(new Set(filteredPoints.map(p => p.id)));
    }
  };

  const getPointType = (point: PickupPoint): string => {
    if (point.name.includes('Новинский') || point.id === 'pvz-1') {
      return 'Click and Collect';
    }
    if (point.name.includes('Невский')) {
      return 'Склад';
    }
    return 'Платная';
  };

  const getWorkingHours = (point: PickupPoint): string => {
    return point.workingHours || 'Ежедневно, 10:00–23:00';
  };

  const getDeliveryTime = (index: number): string => {
    const times = ['4', '2 дня', '5 дней', '1 день', '4 дня', '2 дня', '3 дня', '4 дня', '1 день', '1 день'];
    return times[index] || '2-3 дня';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Способ доставки «Самовывоз»</h2>
            <p className="modal-subtitle">
              Список всех точек самовывоза вашего бизнеса можно посмотреть{' '}
              <a href="#" className="link">тут</a>
            </p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-actions">
          <button className="btn-primary">Подключить точки</button>
          <div className="modal-tabs">
            <button
              className={`modal-tab ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              Список
            </button>
            <button
              className={`modal-tab ${activeTab === 'map' ? 'active' : ''}`}
              onClick={() => setActiveTab('map')}
            >
              Карта
            </button>
          </div>
        </div>

        <div className="modal-filters">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск по названию или адресу"
              className="search-input-modal"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select className="filter-select">
            <option>Тип</option>
            <option>Click and Collect</option>
            <option>Склад</option>
            <option>Платная</option>
            <option>Бесплатная</option>
          </select>
        </div>

        {activeTab === 'list' ? (
          <div className="modal-table-container">
            <table className="modal-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedPoints.size === filteredPoints.length && filteredPoints.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>Название и адрес</th>
                  <th>Тип</th>
                  <th>График работы</th>
                  <th>Срок доставки</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredPoints.map((point, index) => (
                  <tr key={point.id} className="modal-table-row">
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedPoints.has(point.id)}
                        onChange={() => togglePoint(point.id)}
                      />
                    </td>
                    <td>
                      <div className="point-info">
                        <div className="point-name">{point.name}</div>
                        <div className="point-address">{point.address}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${getPointType(point).toLowerCase().replace(/\s/g, '-')}`}>
                        {getPointType(point)}
                      </span>
                    </td>
                    <td className="working-hours">
                      {getWorkingHours(point)}
                    </td>
                    <td>{getDeliveryTime(index)}</td>
                    <td>
                      <button className="icon-btn">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="map-placeholder">
            <div style={{ padding: 48, textAlign: 'center', color: '#6e6e73' }}>
              🗺️ Карта в разработке
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

