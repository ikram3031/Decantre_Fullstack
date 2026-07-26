import React from 'react';

export const DecantreLogo = ({
  className = 'h-16 w-16 text-slate-950',
  strokeWidth = 3.5,
}) => {
  return (
    <img src="/src/assets/images/logo.webp" alt="Decantre Logo" className={className} />
  );
};
