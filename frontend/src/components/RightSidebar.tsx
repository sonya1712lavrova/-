import React from 'react';
import type { Warehouse } from '../types';

interface RightSidebarProps {
  warehouse: Warehouse;
  showReturns?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ warehouse, showReturns = true }) => {
  return (
    <aside className="right-sidebar">
      {/* Block 1: О складе */}
      <div className="rs-card">
        <div className="rs-card__header">
          <h3 className="rs-card__title">О складе</h3>
          <button className="rs-card__editbtn" type="button" aria-label="Редактировать">
            <img src="/icons/i16_edit.svg" alt="" width={16} height={16} />
          </button>
        </div>
        <div className="rs-card__row">
          <div className="rs-field">
            <div className="rs-label">ID</div>
            <div className="rs-value">{warehouse.id}</div>
          </div>
          <div className="rs-field">
            <div className="rs-label">Адрес</div>
            <div className="rs-value">{warehouse.address}</div>
          </div>
          <div className="rs-field">
            <div className="rs-label">Телефон</div>
            <div className="rs-value">+7 (800) 555-0199</div>
          </div>
          <div className="rs-field">
            <div className="rs-label">График работы</div>
            <div className="rs-value">Пн–Пт · Не работает в праздники</div>
          </div>
        </div>
      </div>

      {/* Block 2: Возвраты */}
      {showReturns && (<div className="rs-card">
        <div className="rs-card__header">
          <h3 className="rs-card__title">Возвраты</h3>
          <button className="rs-card__editbtn" type="button" aria-label="Редактировать">
            <img src="/icons/i16_edit.svg" alt="" width={16} height={16} />
          </button>
        </div>
        <div className="rs-card__row">
          <div className="rs-field">
            <div className="rs-label">Контакты</div>
            <div className="rs-value">Яковлев Артём · +7 (800) 555-0199</div>
          </div>
          <div className="rs-field">
            <div className="rs-label">Основное место получения</div>
            <div className="rs-value">МКАД, д. 8А, Ташкент, 100058</div>
          </div>
          <div className="rs-field">
            <div className="rs-label">Дополнительный адрес</div>
            <div className="rs-value">Новинский бульвар, д. 8</div>
          </div>
        </div>
      </div>)}

      {/* Block 3: Button */}
      <button className="rs-button" type="button">
        <img src="/icons/i24_archive.svg" alt="" width={16} height={16} />
        Перенести в архив
      </button>
    </aside>
  );
};


