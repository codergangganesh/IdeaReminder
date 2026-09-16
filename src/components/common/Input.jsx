import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-field-group ${className}`}>
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <div className="form-input-wrap">
        {Icon && <Icon className="form-input-icon" size={18} />}
        <input
          id={inputId}
          className={`form-input-control ${Icon ? 'has-icon' : ''} ${error ? 'has-error' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="form-error-msg">{error}</span>}
      {helperText && !error && <span className="form-helper-msg">{helperText}</span>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  rows = 4,
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-field-group ${className}`}>
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <textarea
        id={inputId}
        rows={rows}
        className={`form-textarea-control ${error ? 'has-error' : ''}`}
        {...props}
      />
      {error && <span className="form-error-msg">{error}</span>}
      {helperText && !error && <span className="form-helper-msg">{helperText}</span>}
    </div>
  );
}

export function Select({
  label,
  error,
  options = [],
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`form-field-group ${className}`}>
      {label && <label htmlFor={inputId} className="form-label">{label}</label>}
      <select id={inputId} className={`form-select-control ${error ? 'has-error' : ''}`} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error-msg">{error}</span>}
    </div>
  );
}
