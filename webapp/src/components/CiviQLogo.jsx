import React from 'react';

export default function CiviQLogo({ size = 'md', className = '' }) {
  // Dimension definitions
  const dimensions = {
    sm: { height: 28, text: 'text-lg', lens: 22 },
    md: { height: 36, text: 'text-2xl', lens: 28 },
    lg: { height: 48, text: 'text-3xl sm:text-4xl', lens: 38 }
  }[size] || { height: 36, text: 'text-2xl', lens: 28 };

  return (
    <div className={`inline-flex items-center gap-1 select-none font-sans ${className}`}>
      {/* Brand Name "Civi" */}
      <span className={`font-black tracking-tight text-slate-900 ${dimensions.text}`}>
        Civi
      </span>

      {/* Bespoke Vector "Q" rendered as an illuminated magnifying glass */}
      <div className="relative inline-flex items-center justify-center -ml-0.5">
        <svg
          width={dimensions.lens * 1.25}
          height={dimensions.lens * 1.25}
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Vibrant Civic Gradient */}
            <linearGradient id="qRimGradient" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Lens Glass Reflective Gradient */}
            <radialGradient id="qLensGlow" cx="18" cy="18" r="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#fecdd3" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#e11d48" stopOpacity="0.1" />
            </radialGradient>

            {/* Subtle Drop Shadow */}
            <filter id="qShadow" x="-4" y="-2" width="52" height="52" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Group with filter */}
          <g filter="url(#qShadow)">
            {/* Inner Lens Glass filling */}
            <circle cx="18" cy="18" r="12" fill="url(#qLensGlow)" />

            {/* Primary Magnifying Glass Circular Rim (Letter Q Body) */}
            <circle
              cx="18"
              cy="18"
              r="12.5"
              stroke="url(#qRimGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Optical Glass Highlight Arch */}
            <path
              d="M10 13 A 10 10 0 0 1 20 8"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Magnifying Glass Center Focus Crosshairs */}
            <circle cx="18" cy="18" r="2.5" fill="#ef4444" />
            <line x1="18" y1="11" x2="18" y2="13.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="18" y1="22.5" x2="18" y2="25" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="11" y1="18" x2="13.5" y2="18" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="22.5" y1="18" x2="25" y2="18" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

            {/* Heavy-Duty Ergonomic Magnifier Handle (The Q Leg) */}
            {/* Metallic handle collar */}
            <line
              x1="27"
              y1="27"
              x2="31"
              y2="31"
              stroke="#94a3b8"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Main colored handle shaft extending down-right */}
            <line
              x1="29.5"
              y1="29.5"
              x2="38.5"
              y2="38.5"
              stroke="url(#qRimGradient)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Handle Grip Highlight */}
            <line
              x1="31"
              y1="31"
              x2="36.5"
              y2="36.5"
              stroke="#ffffff"
              strokeWidth="1.8"
              strokeLinecap="round"
              opacity="0.75"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
