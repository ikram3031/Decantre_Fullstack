import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseStyle = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider';
  
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-slate-700 text-white font-bold shadow-xs',
    success: 'bg-emerald-600 text-white font-bold shadow-xs',
    warning: 'bg-amber-500 text-white font-bold shadow-xs',
    danger: 'bg-rose-600 text-white font-bold shadow-xs',
    info: 'bg-blue-600 text-white font-bold shadow-xs',
    neutral: 'bg-slate-600 text-white font-bold shadow-xs'
  };

  const titleText = typeof children === 'string' ? children : undefined;

  return (
    <span className={`flex items-center justify-center ${baseStyle} ${variants[variant]} ${className} w-25 max-w-25 truncate text-center`} title={titleText}>
      {children}
    </span>
  );
};
