import React from 'react';

interface SearchFieldProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  placeholder = 'Поиск',
  value,
  onChange,
}) => {
  return (
    <div className="nav-search">
      <input
        className="nav-search__input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Поиск"
      />
      <span className="nav-search__divider" />
      <button 
        className="nav-search__icon" 
        type="button"
        aria-label="Alice"
      >
        <img src="/icons/alice_icon.svg" alt="" width={24} height={24} />
      </button>
    </div>
  );
};


