import React from 'react';
import { Loader2 } from 'lucide-react';

export function Button({
  children,
  variant = 'mustard',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseClass = {
    mustard: 'btn-mustard',
    secondary: 'btn-secondary',
    icon: 'btn-icon',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  }[variant] || 'btn-mustard';

  const sizeClass = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }[size] || 'btn-md';

  return (
    <button
      type={type}
      className={`${baseClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <Loader2 className="btn-spinner" size={16} />
      ) : (
        Icon && <Icon size={16} />
      )}
      {children}
    </button>
  );
}
