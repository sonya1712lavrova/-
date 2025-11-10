import React, { useEffect, useRef, useState } from 'react';

interface FormInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string | number;
  className?: string;
  error?: boolean;
  errorText?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Optional placeholder shown only when the field is focused (e.g., phone mask) */
  focusPlaceholder?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  min,
  className,
  error = false,
  errorText,
  onFocus,
  onBlur,
  focusPlaceholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const active = isFocused;
  const filled = value.length > 0;

  useEffect(() => {
    if (active && inputRef.current) {
      // Avoid scroll jumps on mobile when focusing programmatically
      try {
        // @ts-expect-error preventScroll is widely supported in modern browsers
        inputRef.current.focus({ preventScroll: true });
      } catch {
        inputRef.current.focus();
      }
      try {
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      } catch {}
    }
  }, [active]);

  return (
    <div className={`form-input-root ${className || ''}`}>
      <div
        className={`form-input-container ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''} ${error ? 'error' : ''} ${className || ''}`}
        onClick={() => {
          if (disabled) return;
          if (!isFocused) {
            setIsFocused(true);
          }
        }}
        onFocusCapture={() => {
          if (disabled) return;
          setIsFocused(true);
        if (onFocus) onFocus();
        }}
        onBlurCapture={(e) => {
          const next = e.relatedTarget as Node | null;
          if (!next || !(e.currentTarget as unknown as Node).contains(next)) {
            setIsFocused(false);
          if (onBlur) onBlur();
          }
        }}
      >
        {active ? (
          <div className="form-input-content-wrapper">
            <label className="form-input-label">
              {placeholder}
              {required && ' *'}
            </label>
            <input
              ref={inputRef}
              type={type}
              className="form-input-field"
            placeholder={focusPlaceholder ?? ""}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              required={required}
              min={min}
              aria-invalid={error ? 'true' : undefined}
            />
            {disabled && (
              <span className="form-input-trailing-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9.99902 1.66797C12.3001 1.66797 14.1658 3.53295 14.166 5.83398V8.33398H14.999C15.9195 8.33398 16.666 9.0805 16.666 10.001V15.001C16.666 16.8419 15.173 18.334 13.332 18.334H6.66602C4.82507 18.334 3.33203 16.8419 3.33203 15.001V10.001C3.33203 9.0805 4.07855 8.33398 4.99902 8.33398H5.83203V5.83398C5.83221 3.53295 7.69795 1.66797 9.99902 1.66797ZM4.99902 15.001C4.99902 15.9215 5.74554 16.668 6.66602 16.668H13.332C14.2525 16.668 14.999 15.9215 14.999 15.001V10.001H4.99902V15.001ZM9.99902 3.33398C8.61842 3.33398 7.4992 4.45342 7.49902 5.83398V8.33398H12.499V5.83398C12.4988 4.45342 11.3796 3.33398 9.99902 3.33398Z" fill="#221B11" fill-opacity="0.21"/>
                </svg>
              </span>
            )}
          </div>
        ) : filled ? (
          <div className="form-input-content-wrapper">
            <label className="form-input-label">
              {placeholder}
              {required && ' *'}
            </label>
            <div className="form-input-field form-input-field--static">{value}</div>
            {disabled && (
              <span className="form-input-trailing-icon" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9.99902 1.66797C12.3001 1.66797 14.1658 3.53295 14.166 5.83398V8.33398H14.999C15.9195 8.33398 16.666 9.0805 16.666 10.001V15.001C16.666 16.8419 15.173 18.334 13.332 18.334H6.66602C4.82507 18.334 3.33203 16.8419 3.33203 15.001V10.001C3.33203 9.0805 4.07855 8.33398 4.99902 8.33398H5.83203V5.83398C5.83221 3.53295 7.69795 1.66797 9.99902 1.66797ZM4.99902 15.001C4.99902 15.9215 5.74554 16.668 6.66602 16.668H13.332C14.2525 16.668 14.999 15.9215 14.999 15.001V10.001H4.99902V15.001ZM9.99902 3.33398C8.61842 3.33398 7.4992 4.45342 7.49902 5.83398V8.33398H12.499V5.83398C12.4988 4.45342 11.3796 3.33398 9.99902 3.33398Z" fill="#221B11" fill-opacity="0.21"/>
                </svg>
              </span>
            )}
          </div>
        ) : (
          <input
            ref={inputRef}
            type={type}
            className="form-input-field"
            placeholder={`${placeholder}${required ? ' *' : ''}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            required={required}
            min={min}
            aria-invalid={error ? 'true' : undefined}
          />
        )}
        {!active && !filled && disabled && (
          <span className="form-input-trailing-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9.99902 1.66797C12.3001 1.66797 14.1658 3.53295 14.166 5.83398V8.33398H14.999C15.9195 8.33398 16.666 9.0805 16.666 10.001V15.001C16.666 16.8419 15.173 18.334 13.332 18.334H6.66602C4.82507 18.334 3.33203 16.8419 3.33203 15.001V10.001C3.33203 9.0805 4.07855 8.33398 4.99902 8.33398H5.83203V5.83398C5.83221 3.53295 7.69795 1.66797 9.99902 1.66797ZM4.99902 15.001C4.99902 15.9215 5.74554 16.668 6.66602 16.668H13.332C14.2525 16.668 14.999 15.9215 14.999 15.001V10.001H4.99902V15.001ZM9.99902 3.33398C8.61842 3.33398 7.4992 4.45342 7.49902 5.83398V8.33398H12.499V5.83398C12.4988 4.45342 11.3796 3.33398 9.99902 3.33398Z" fill="#221B11" fill-opacity="0.21"/>
            </svg>
          </span>
        )}
      </div>
      {errorText ? <div className="form-input-caption">{errorText}</div> : null}
    </div>
  );
};

