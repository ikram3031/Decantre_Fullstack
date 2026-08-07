import React from 'react';

export const Logo = ({ className = 'w-12 h-12', showText = true, color = 'gold' }) => {
  // We define a unique ID prefix to prevent gradient collisions when multiple logos are rendered.
  const gradientId = "luxury-gold-gradient";
  const glowId = "gold-glow-filter";

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_2px_10px_rgba(212,175,55,0.15)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Elite Metallic Gold Gradient */}
          <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B38728" />
            <stop offset="25%" stopColor="#FBF5B7" />
            <stop offset="50%" stopColor="#DAA520" />
            <stop offset="75%" stopColor="#FBF5B7" />
            <stop offset="100%" stopColor="#AA771C" />
          </linearGradient>

          {/* Golden Ambient Glow */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Asymmetrical Stepped Pedestal Silhouette from the original logo */}
        {/* Deep luxury-dark background backing */}
        <path
          d="M 10,80 L 90,80 L 90,60 L 70,60 L 70,22 L 50,22 L 50,38 L 30,38 L 30,60 L 10,60 Z"
          fill="#121212"
          fillOpacity="0.95"
        />

        {/* Outer Gold Frame */}
        <path
          d="M 10,80 L 90,80 L 90,60 L 70,60 L 70,22 L 50,22 L 50,38 L 30,38 L 30,60 L 10,60 Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.25"
          strokeLinejoin="miter"
          strokeLinecap="square"
        />

        {/* Inner Fine Border Accent (Inset by 3px) */}
        <path
          d="M 13,77 L 87,77 L 87,63 L 73,63 L 73,25 L 53,25 L 53,41 L 33,41 L 33,63 L 13,63 Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="0.5"
          strokeOpacity="0.45"
          strokeLinejoin="miter"
          strokeLinecap="square"
        />

        {/* 2. Cursive Signature Script (Calligraphic Monogram inside the steps) */}
        <g filter={`url(#${glowId})`}>
          {/* Main calligraphic loop representing the elegant cursive logo emblem */}
          <path
            d="M 46,28 C 46,28 44,56 44,59 C 44,62 48,62 52,58 C 58,52 64,42 64,34 C 64,26 56,22 48,22 C 40,22 36,32 36,44 C 36,54 44,60 52,58"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
            style={{ animationDuration: '3.5s' }}
          />
          {/* Decorative flourish across the top of the cursive letter */}
          <path
            d="M 38,26 C 42,26 48,24 54,23"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Floating Crown / Dot Accent */}
          <circle
            cx="50"
            cy="18"
            r="1.2"
            fill={`url(#${gradientId})`}
          />
        </g>

        {/* 3. "DECANTRE" Classic Serif Typography housed in the bottom pedestal bar */}
        <text
          x="50"
          y="71"
          textAnchor="middle"
          fill={`url(#${gradientId})`}
          fontFamily="Marcellus, serif"
          fontSize="6"
          letterSpacing="0.25em"
          fontWeight="400"
        >
          DECANTRE
        </text>
      </svg>

      {/* Brand text displayed alongside the logo */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className="text-base sm:text-xl font-serif tracking-[0.25em] text-gold font-light leading-none">
            DECANTRE
          </span>
          <span className="hidden sm:inline-block text-[8px] uppercase tracking-[0.42em] text-gold/70 font-light font-sans mt-1">
            PARFUMERIE ELITE
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
