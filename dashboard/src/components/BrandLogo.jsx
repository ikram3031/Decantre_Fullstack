import React, { useState, useEffect } from 'react';
import { clientConfig } from '@/clientConfig';
import { apiClient } from '@/lib/api-client';
import engulficFallbackLogo from '@/assets/logo_engulfic.png';
import decantreFallbackLogo from '@/assets/decantre_logo.png';
import plexiviaFallbackLogo from '@/assets/plexivia.png';

const fallbackAssets = {
  engulfic: engulficFallbackLogo,
  decantre: decantreFallbackLogo,
  plexivia: plexiviaFallbackLogo,
};

// Renders the tenant branding logo with fixed proportional width and dynamic height
export const BrandLogo = ({
  src,
  className = 'w-[115px] h-auto',
  alt = 'Brand logo',
  iconOnly = false,
}) => {
  const { clientKey = 'decantre', brandName = 'Decantre', logoUrl } = clientConfig || {};
  const fallbackAsset = fallbackAssets[clientKey] || null;

  const defaultLogo = clientKey === 'engulfic'
    ? 'https://server.engulfic.com/uploads/assets/engulfic_logo.webp'
    : '/src/uploads/assets/logo.webp';

  const rawUrl = src || logoUrl || import.meta.env?.VITE_LOGO_URL || defaultLogo;

  const resolveLogoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const base = apiClient?.defaults?.baseURL || '';
    if (url.startsWith('/') && base.endsWith('/')) {
      return `${base.slice(0, -1)}${url}`;
    }
    if (!url.startsWith('/') && !base.endsWith('/')) {
      return `${base}/${url}`;
    }
    return `${base}${url}`;
  };

  const primaryUrl = resolveLogoUrl(rawUrl);
  const [currentSrc, setCurrentSrc] = useState(primaryUrl || fallbackAsset);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrentSrc(primaryUrl || fallbackAsset);
    setImageError(false);
  }, [primaryUrl, fallbackAsset]);

  const handleImageError = () => {
    if (currentSrc !== fallbackAsset && fallbackAsset) {
      setCurrentSrc(fallbackAsset);
    } else {
      setImageError(true);
    }
  };

  if (currentSrc && !imageError) {
    return (
      <div className={`relative overflow-hidden flex items-center justify-start shrink-0 ${className}`}>
        <img
          src={currentSrc}
          alt={alt || brandName}
          className="w-full h-auto max-h-12 object-contain object-left"
          onError={handleImageError}
        />
      </div>
    );
  }

  if (iconOnly) {
    return (
      <div className={`flex items-center justify-center font-bold text-primary shrink-0 ${className}`}>
        <span className="bg-primary/20 px-2 py-0.5 rounded border border-primary/30 uppercase text-xs font-black">
          {clientKey ? clientKey.slice(0, 2) : 'WL'}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 font-bold tracking-wider text-xl text-primary shrink-0 ${className}`}>
      <span className="bg-primary/20 px-2 py-0.5 rounded border border-primary/30 uppercase text-xs font-black">
        {clientKey ? clientKey.slice(0, 2) : 'WL'}
      </span>
      <span className="truncate">{brandName}</span>
    </div>
  );
};

export default BrandLogo;
