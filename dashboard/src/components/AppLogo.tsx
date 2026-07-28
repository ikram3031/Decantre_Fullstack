import React from 'react';

interface AppLogoProps {
  className?: string;
  strokeWidth?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = 'h-16 w-16 text-slate-950',
}) => {
  return (
    <img src="/src/assets/images/logo.webp" alt="Decantre Logo" className={className} />
  );
};
