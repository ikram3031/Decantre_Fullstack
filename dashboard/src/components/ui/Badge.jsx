import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider';
  
  const variants = {
    default: 'bg-slate-700 text-white font-bold shadow-xs',
    success: 'bg-emerald-600 text-white font-bold shadow-xs',
    warning: 'bg-amber-500 text-white font-bold shadow-xs',
    danger: 'bg-rose-600 text-white font-bold shadow-xs',
    info: 'bg-blue-600 text-white font-bold shadow-xs',
    neutral: 'bg-slate-600 text-white font-bold shadow-xs'
  };

  return (
    <span className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
