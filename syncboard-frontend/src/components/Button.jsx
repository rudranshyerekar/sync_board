import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-4 py-2 rounded-md font-semibold text-sm transition-colors duration-fast shadow-sm';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-transparent text-primary border border-primary hover:bg-primary-light',
    ghost: 'bg-transparent text-text-secondary hover:bg-bg-tertiary shadow-none',
    danger: 'bg-danger text-white hover:bg-red-600',
  };

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`;

  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
};
