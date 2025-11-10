import React from 'react';

interface ActionBarProps {
  count: number;
  onDelete: () => void;
  onClose: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({ count, onDelete, onClose }) => {
  return (
    <div className="action-bar" role="region" aria-label="Массовые действия">
      <div className="action-bar__text">
        Выбрано {count} {count === 1 ? 'точка самовывоза' : 'точки самовывоза'}
      </div>
      <div className="action-bar__actions">
        <button className="btn-white" onClick={onDelete}>Удалить</button>
      </div>
      <button className="action-bar__close" aria-label="Сбросить выбор" onClick={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M9.06067 8.00057L14.0006 3.06066L12.9399 2L8.00001 6.93991L3.06011 2.00001L1.99945 3.06067L6.93935 8.00057L1.99945 12.9405L3.06011 14.0011L8.00001 9.06123L12.9399 14.0011L14.0006 12.9405L9.06067 8.00057Z" fill="#F5F5F5"/>
        </svg>
      </button>
    </div>
  );
};



