import React, { useMemo, useState } from 'react';
import styles from './TextArea.module.css';

export interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  error?: boolean;
  errorText?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = '',
  required = false,
  error = false,
  errorText,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const filled = useMemo(() => value.trim().length > 0, [value]);

  const containerClass = [
    styles.container,
    isFocused ? styles.active : '',
    filled ? styles.filled : '',
    error ? styles.error : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const placeholderClass = [
    styles.placeholder,
    (isFocused || filled) ? styles.placeholderSmall : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.root}>
      <div
        className={containerClass}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <div className={styles.content}>
          <div className={placeholderClass}>
            {placeholder}
            {required && ' *'}
          </div>
          <textarea
            className={styles.area}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            rows={4}
          />
        </div>
      </div>
      {errorText ? <div className={styles.caption}>{errorText}</div> : null}
    </div>
  );
};


