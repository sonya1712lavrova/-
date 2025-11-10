import React from 'react';
import type { Warehouse } from '../types';

interface WarehouseInfoProps {
  warehouse: Warehouse;
}

export const WarehouseInfo: React.FC<WarehouseInfoProps> = ({ warehouse }) => {
  return (
    <div className="info-panel">
      <div className="info-panel-header">
        <h3 className="info-panel-title">О складе</h3>
        <button className="edit-button" aria-label="Редактировать сведения о складе">
          <img src="/icons/i16_edit.svg" alt="" width={16} height={16} />
        </button>
      </div>

      <div className="info-group">
        <div className="info-label">Договор</div>
        <div className="info-value">3778673/22 от 18.05.2022</div>
      </div>

      <div className="info-group">
        <div className="info-label">ID</div>
        <div className="info-value">{warehouse.id}</div>
      </div>

      <div className="info-group">
        <div className="info-label">Адрес</div>
        <div className="info-value">{warehouse.address}</div>
      </div>

      <div className="info-group">
        <div className="info-label">Телефон</div>
        <div className="info-value">+7 (800) 555-0199</div>
      </div>

      <div className="info-group">
        <div className="info-label">График работы</div>
        <div className="info-value">Пн, Вт, Ср, Чт, Пт · Не работает в праздники</div>
      </div>

      <div className="info-group">
        <div className="info-label">Выходные дни графика</div>
        <div className="info-value">8 января — 9 января 2025</div>
      </div>

      <div className="info-group">
        <div className="info-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Возвраты</span>
          <button className="edit-button" aria-label="Редактировать параметры возвратов">
            <img src="/icons/i16_edit.svg" alt="" width={16} height={16} />
          </button>
        </div>
        <div className="info-value" style={{ marginBottom: 8 }}>
          <strong>Контакты</strong>
          <div>Яковлев Артём · +7 (800) 555-0199</div>
        </div>
        <div className="info-value" style={{ marginBottom: 8 }}>
          <strong>Основное место получения</strong>
          <div>Магазин кольцевая дорога, 8А, Ташкент, 100058</div>
        </div>
        <div className="info-value">
          <strong>Дополнительный адрес для возвратов</strong>
          <div>Новинский бульвар, д. 8</div>
        </div>
      </div>

      <button className="btn-archive">
        <img src="/icons/i24_archive.svg" alt="archive" width={20} height={20} style={{ marginRight: 8 }} />
        Перенести в архив
      </button>
    </div>
  );
};

