import React, { useState, useRef } from 'react';

interface BuiSearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const BuiSearchField: React.FC<BuiSearchFieldProps> = ({
  value,
  onChange,
  placeholder = 'Поиск по названию или адресу',
  className,
}) => {
  const [active, setActive] = useState(false);
  const hasValue = value.trim().length > 0;
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div
      className={[
        'bui-search',
        active ? 'is-active' : '',
        hasValue ? 'is-filled' : '',
        className ?? '',
      ].join(' ').trim()}
      onMouseDown={() => {
        // ensure we keep active style while clicking inside
        setActive(true);
      }}
      onMouseUp={() => {
        inputRef.current?.focus();
      }}
    >
      <div className="bui-search__field">
        <div className="bui-search__icon-search" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8.75 1.66797C12.662 1.66797 15.833 4.83896 15.833 8.75098C15.833 10.4067 15.2653 11.9297 14.3135 13.1357L18.3359 17.1582L17.1572 18.3369L13.1348 14.3145C11.9287 15.2663 10.4057 15.834 8.75 15.834C4.83798 15.834 1.66699 12.663 1.66699 8.75098C1.66699 4.83896 4.83798 1.66797 8.75 1.66797ZM8.75 3.33398C5.75846 3.33398 3.33301 5.75943 3.33301 8.75098C3.33301 11.7425 5.75846 14.168 8.75 14.168C11.7415 14.168 14.167 11.7425 14.167 8.75098C14.167 5.75943 11.7415 3.33398 8.75 3.33398Z" fill="currentColor"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          className="bui-search__input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setActive(true)}
          onBlur={() => setActive(false)}
          placeholder={placeholder}
          aria-label="Поиск"
        />
        {hasValue && (
          <button
            type="button"
            className="bui-search__clear"
            aria-label="Очистить"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M9.06067 8.00002L14.0006 3.06011L12.9399 1.99945L8.00001 6.93936L3.06011 1.99946L1.99945 3.06012L6.93935 8.00002L1.99945 12.9399L3.06011 14.0006L8.00001 9.06068L12.9399 14.0006L14.0006 12.9399L9.06067 8.00002Z" fill="currentColor"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};


