import React, { useState, useRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;        // small hint text above value (single-line)
  value?: string;        // explicit value text (overrides computed)
  placeholder?: string;  // shown when no value
  className?: string;
  disabled?: boolean;
  options?: SelectOption[];
  selectedValues?: string[]; // values from options
  defaultLabel?: string;     // label to show when selected all/none
}

// Presentational select field with proper visual states (default/hover/active)
export const Select: React.FC<SelectProps> = ({
  label,
  value,
  placeholder,
  className,
  disabled = false,
  options,
  selectedValues,
  defaultLabel,
}) => {
  const [active, setActive] = useState(false);
  const rootRef = useRef<HTMLButtonElement | null>(null);

  const computeDisplay = (): { text: string; isPlaceholder: boolean } => {
    if (value != null) return { text: value, isPlaceholder: false };
    const total = options?.length ?? 0;
    const selected = selectedValues ?? [];
    const count = selected.length;
    const allOrNone = total === 0 || count === 0 || count === total;
    if (allOrNone) {
      // "как будто не выбрано ничего" — показываем placeholder-строку
      return { text: placeholder ?? defaultLabel ?? '', isPlaceholder: true };
    }
    if (count === 1) {
      const found = options?.find(o => o.value === selected[0]);
      return { text: found?.label ?? defaultLabel ?? placeholder ?? '', isPlaceholder: false };
    }
    return { text: `Выбрано  •  ${count}`, isPlaceholder: false };
  };

  const { text: displayText, isPlaceholder } = computeDisplay();

  return (
    <button
      ref={rootRef}
      type="button"
      className={`ui-select ${active ? 'is-active' : ''} ${className ?? ''}`}
      onMouseDown={() => !disabled && setActive(true)}
      onBlur={() => setActive(false)}
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={active}
    >
      <div className="ui-select__texts">
        {label ? <div className="ui-select__hint">{label}</div> : null}
        <div className={`ui-select__value ${isPlaceholder ? 'is-placeholder' : ''}`}>{displayText}</div>
      </div>
      <svg className="ui-select__icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path className="ui-select__icon-path" fillRule="evenodd" clipRule="evenodd" d="M10.0001 11.5855L5.27294 6.86178L4.00061 8.13504L10.0001 14.1301L15.9995 8.13504L14.7272 6.86178L10.0001 11.5855Z" fill="currentColor"/>
      </svg>
    </button>
  );
};


