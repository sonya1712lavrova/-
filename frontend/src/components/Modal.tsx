import React, { useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({ open, title, children, footer, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
        role="document"
      >
        <button className="modal__close" aria-label="Закрыть" onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M9.06067 8.00057L14.0006 3.06066L12.9399 2L8.00001 6.93991L3.06011 2.00001L1.99945 3.06067L6.93935 8.00057L1.99945 12.9405L3.06011 14.0011L8.00001 9.06123L12.9399 14.0011L14.0006 12.9405L9.06067 8.00057Z" fill="#191817"/>
          </svg>
        </button>
        <div className="modal__header">
          {typeof title === 'string' ? <h2 className="modal__title">{title}</h2> : title}
        </div>
        <div className="modal__content">
          {children}
        </div>
        <div className="modal__footer">
          {footer}
        </div>
      </div>
    </div>
  );
};


