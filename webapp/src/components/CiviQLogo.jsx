import React from 'react';

export default function CiviQLogo({ size = 'md', className = '' }) {
  // Size variants
  const sizeClasses = {
    sm: { text: 'text-base', mark: 'w-7 h-7 text-xs', qSize: 'w-4 h-4' },
    md: { text: 'text-lg sm:text-xl', mark: 'w-9 h-9 sm:w-10 sm:h-10 text-sm', qSize: 'w-4 h-4 sm:w-5 sm:h-5' },
    lg: { text: 'text-2xl sm:text-3xl', mark: 'w-12 h-12 text-base', qSize: 'w-6 h-6' }
  }[size] || { text: 'text-lg', mark: 'w-9 h-9', qSize: 'w-4 h-4' };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Icon Badge */}
      <div className={`${sizeClasses.mark} rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          {/* Magnifying Glass Q Icon */}
          <circle cx="10.5" cy="10.5" r="7" stroke="currentColor" />
          <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="3" />
          {/* Subtle spark / civic eye */}
          <circle cx="10.5" cy="10.5" r="2.5" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Wordmark: Civi + Magnifying Glass Q */}
      <div className="flex items-baseline tracking-tight">
        <span className={`font-black text-slate-900 ${sizeClasses.text}`}>
          Civi
        </span>
        <span className="relative inline-flex items-center font-black text-rose-600">
          <span className={`${sizeClasses.text} font-black`}>Q</span>
          {/* Integrated magnifying handle badge to visually emphasize the magnifying glass Q */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="absolute -top-1 -right-2 text-rose-600 w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-90 animate-pulse"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M13.5 13.5L19 19" />
          </svg>
        </span>
      </div>
    </div>
  );
}
