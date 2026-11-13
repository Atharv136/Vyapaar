import React from 'react';

export const SparkleDoodle: React.FC<{ className?: string }> = ({ className = "w-4 h-4 text-amber-DEFAULT" }) => (
  <svg viewBox="0 0 36 36" className={className} fill="none" stroke="currentColor">
    <path d="M18 3C18 12 24 18 33 18C24 18 18 24 18 33C18 24 12 18 3 18C12 18 18 12 18 3Z" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

export const SquiggleUnderline: React.FC<{ className?: string }> = ({ className = "w-full h-3 text-amber-DEFAULT" }) => (
  <svg viewBox="0 0 220 18" className={className} fill="none" stroke="currentColor">
    <path d="M3 12C55 4 145 3 217 11" strokeWidth="4" strokeLinecap="round" />
    <path d="M24 16C85 11 155 11 198 15" strokeWidth="2.2" strokeLinecap="round" opacity="0.65" />
  </svg>
);

export const CurvedArrowDoodle: React.FC<{ className?: string; flip?: boolean }> = ({ className = "w-12 h-8 text-forest", flip = false }) => (
  <svg viewBox="0 0 80 50" className={`${className} ${flip ? '-scale-x-100' : ''}`} fill="none" stroke="currentColor">
    <path d="M6 38C25 14 52 12 70 24" strokeWidth="2.8" strokeLinecap="round" strokeDasharray="4 4" />
    <path d="M61 15L72 25L58 29" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const VoiceWaveDoodle: React.FC<{ className?: string }> = ({ className = "w-24 h-6 text-forest" }) => (
  <svg viewBox="0 0 120 32" className={className} stroke="currentColor">
    <line x1="6" y1="12" x2="6" y2="20" strokeWidth="3" strokeLinecap="round" />
    <line x1="16" y1="7" x2="16" y2="25" strokeWidth="3" strokeLinecap="round" />
    <line x1="26" y1="3" x2="26" y2="29" strokeWidth="3" strokeLinecap="round" />
    <line x1="36" y1="9" x2="36" y2="23" strokeWidth="3" strokeLinecap="round" />
    <line x1="46" y1="5" x2="46" y2="27" strokeWidth="3" strokeLinecap="round" />
    <line x1="56" y1="11" x2="56" y2="21" strokeWidth="3" strokeLinecap="round" />
    <line x1="66" y1="4" x2="66" y2="28" strokeWidth="3" strokeLinecap="round" />
    <line x1="76" y1="8" x2="76" y2="24" strokeWidth="3" strokeLinecap="round" />
    <line x1="86" y1="13" x2="86" y2="19" strokeWidth="3" strokeLinecap="round" />
    <line x1="96" y1="6" x2="96" y2="26" strokeWidth="3" strokeLinecap="round" />
    <line x1="106" y1="10" x2="106" y2="22" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

