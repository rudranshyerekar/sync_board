import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  // Matches priority styles from Design.md
  const variants = {
    default: 'bg-bg-tertiary text-text-secondary',
    'Urgent': 'bg-red-50 text-danger border border-red-200',
    'High': 'bg-orange-50 text-warning border border-orange-200',
    'Medium': 'bg-yellow-50 text-yellow-600 border border-yellow-200',
    'Low': 'bg-green-50 text-success border border-green-200',
  };

  const style = variants[variant] || variants.default;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium ${style} ${className}`}>
      {children}
    </span>
  );
};
