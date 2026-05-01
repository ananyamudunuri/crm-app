/**
 * Reusable Button Component
 * Supports multiple variants, sizes, and loading states
 */

import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary', // primary, secondary, danger, success
  size = 'md', // sm, md, lg
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  icon,
  fullWidth = false,
  className = '',
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const widthClass = fullWidth ? 'btn-full-width' : '';
  
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="btn-spinner"></span>}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;