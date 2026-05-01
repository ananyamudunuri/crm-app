/**
 * Reusable Input Component with Validation
 */

import React, { useState } from 'react';

const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  required = false,
  placeholder = '',
  error = '',
  disabled = false,
  className = '',
}) => {
  const [touched, setTouched] = useState(false);
  
  const showError = touched && error;
  
  const handleBlur = (e) => {
    setTouched(true);
    if (onBlur) onBlur(e);
  };
  
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`form-input ${showError ? 'error' : ''} ${className}`}
      />
      {showError && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Input;