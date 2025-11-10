import React, { useEffect, useRef } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  className,
  indeterminate = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate && !checked;
    }
  }, [indeterminate, checked]);

  return (
    <label className={`ui-checkbox ${indeterminate ? 'is-indeterminate' : ''} ${className ?? ''}`}>
      <input
        id={id}
        type="checkbox"
        className="ui-checkbox__input"
        ref={inputRef}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="ui-checkbox__box" aria-hidden="true">
        {/* Check icon (no bg) */}
        <svg className="ui-checkbox__icon ui-checkbox__icon--check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15.089 5.91083C15.5921 6.41391 15.5921 7.22957 15.0891 7.7327L9.08971 13.7331C8.58652 14.2363 7.77061 14.2364 7.26739 13.7331L4.91089 11.3766C4.40777 10.8735 4.40777 10.0578 4.91089 9.55468C5.41402 9.05156 6.22974 9.05156 6.73286 9.55468L8.17858 11.0004L13.267 5.91092C13.7701 5.40772 14.5859 5.40767 15.089 5.91083Z" fill="currentColor"/>
        </svg>
        {/* Indeterminate icon (minus) */}
        <svg className="ui-checkbox__icon ui-checkbox__icon--minus" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="5" y="8.65019" width="10" height="2.5" rx="1.25" fill="currentColor"/>
        </svg>
      </span>
      {label != null && <span className="ui-checkbox__label">{label}</span>}
    </label>
  );
};


