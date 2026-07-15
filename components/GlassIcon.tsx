import React from 'react';

export function getGlassLabel(text: string): string {
  const t = (text || "").toLowerCase();
  if (t.includes('tulip')) return "Tulipano";
  if (t.includes('flute') || t.includes('flûte')) return "Flûte";
  if (t.includes('bordolese') || t.includes('bordeaux')) return "Bordolese";
  if (t.includes('borgognone') || t.includes('burgundy')) return "Borgognone";
  return "Calice standard";
}

export default function GlassIcon({ text, className = "w-5 h-5" }: { text: string; className?: string }) {
  const t = (text || "").toLowerCase();
  
  if (t.includes('tulip')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M7 5C7 5 6 11 8 13C10 15 12 15 12 15C12 15 14 15 16 13C18 11 17 5 17 5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15V21" strokeLinecap="round"/>
        <path d="M9 21H15" strokeLinecap="round"/>
      </svg>
    );
  }
  
  if (t.includes('flute') || t.includes('flûte')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M9 3V11C9 13 12 14 12 14C12 14 15 13 15 11V3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14V21" strokeLinecap="round"/>
        <path d="M9 21H15" strokeLinecap="round"/>
      </svg>
    );
  }
  
  if (t.includes('bordolese') || t.includes('bordeaux')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M8 4V9C8 12 12 14 12 14C12 14 16 12 16 9V4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14V21" strokeLinecap="round"/>
        <path d="M9 21H15" strokeLinecap="round"/>
      </svg>
    );
  }
  
  if (t.includes('borgognone') || t.includes('burgundy')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M7 5C7 5 4 10 9 13.5C11 15 12 15 12 15C12 15 13 15 15 13.5C20 10 17 5 17 5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 15V21" strokeLinecap="round"/>
        <path d="M9 21H15" strokeLinecap="round"/>
      </svg>
    );
  }

  // Default: Calice standard
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <path d="M8 4C8 4 7 10 9 12.5C10.5 14.5 12 15 12 15C12 15 13.5 14.5 15 12.5C17 10 16 4 16 4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 15V21" strokeLinecap="round"/>
      <path d="M9 21H15" strokeLinecap="round"/>
    </svg>
  );
}
