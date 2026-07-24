import React from 'react';

export const DecantreLogo = ({
  className = 'h-16 w-16 text-slate-950',
  strokeWidth = 3.5,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      stroke="currentColor"
    >
      {/* Elegantly slanted outer oval */}
      <ellipse
        cx="100"
        cy="96"
        rx="72"
        ry="46"
        transform="rotate(-28 100 96)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* High-end calligraphic script 'D' monogram matching the luxury brand identity */}
      <path
        d="M 82,132 C 92,132 120,114 135,92 C 146,74 150,60 138,56 C 124,52 105,72 92,98 C 82,118 78,136 90,136 C 104,136 122,118 132,104 C 138,94 141,84 134,78 C 126,72 112,88 102,104 C 92,120 87,130 92,130 C 97,130 112,114 124,98"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
