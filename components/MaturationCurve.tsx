"use client";

import { useEffect, useState } from "react";

type Props = {
  start: number;
  peak?: number; // mantenuto per retrocompatibilità ma ignorato
  end: number;
  current: number;
};

export default function MaturationCurve({ start, end, current }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const padding = Math.max(2, Math.floor((end - start) * 0.5));
  const minYear = start - padding;
  const maxYear = end + padding;
  const totalYears = Math.max(1, maxYear - minYear);

  const currentPercRaw = ((current - minYear) / totalYears) * 100;
  const currentPerc = Math.min(100, Math.max(0, currentPercRaw));

  const startPerc = ((start - minYear) / totalYears) * 100;
  const endPerc = ((end - minYear) / totalYears) * 100;

  // Calcola Y(t) sulla curva Bezier (x(t) è lineare a t con questi control points)
  const getCurveY = (xPerc: number) => {
    if (xPerc <= 50) {
      const t = xPerc / 50;
      return Math.pow(1 - t, 3) * 90 + 3 * Math.pow(1 - t, 2) * t * 90 + 3 * (1 - t) * Math.pow(t, 2) * 10 + Math.pow(t, 3) * 10;
    } else {
      const t = (xPerc - 50) / 50;
      return Math.pow(1 - t, 3) * 10 + 3 * Math.pow(1 - t, 2) * t * 10 + 3 * (1 - t) * Math.pow(t, 2) * 90 + Math.pow(t, 3) * 90;
    }
  };

  const currentY = getCurveY(currentPerc);

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 border border-sand-200 mt-4">
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-sm font-semibold text-ink-700 uppercase tracking-wider">Curva di Maturazione</h3>
      </div>

      <div className="relative w-full h-32 pt-2">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="curveGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset={`${startPerc}%`} stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset={`${endPerc}%`} stopColor="#ef4444" />
            </linearGradient>
            
            <linearGradient id="fillGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset={`${startPerc}%`} stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.4" />
              <stop offset={`${endPerc}%`} stopColor="#ef4444" stopOpacity="0.4" />
            </linearGradient>

            <clipPath id="idealWindow">
              <rect x={startPerc} y="0" width={endPerc - startPerc} height="100" />
            </clipPath>
          </defs>

          {/* Sfondo curva intera leggera */}
          <path 
            d="M 0 90 C 16.6 90, 33.3 10, 50 10 C 66.6 10, 83.3 90, 100 90 L 100 100 L 0 100 Z" 
            fill="url(#fillGrad)" 
            opacity="0.15"
          />

          {/* Finestra ideale ombreggiata */}
          <path 
            d="M 0 90 C 16.6 90, 33.3 10, 50 10 C 66.6 10, 83.3 90, 100 90 L 100 100 L 0 100 Z" 
            fill="url(#fillGrad)" 
            clipPath="url(#idealWindow)"
          />

          {/* Linea principale della curva */}
          <path 
            d="M 0 90 C 16.6 90, 33.3 10, 50 10 C 66.6 10, 83.3 90, 100 90" 
            fill="none" 
            stroke="url(#curveGrad)" 
            strokeWidth="3" 
            strokeLinecap="round"
          />
        </svg>

        {/* Etichette Finestra Ideale */}
        <div 
          className="absolute top-0 flex flex-col items-center h-full"
          style={{ left: `${startPerc}%`, transform: 'translateX(-50%)' }}
        >
          <span className="text-[10px] font-bold text-ink-500 mb-1">{start}</span>
          <div className="flex-1 w-px border-l border-dashed border-sand-300"></div>
        </div>

        <div 
          className="absolute top-0 flex flex-col items-center h-full"
          style={{ left: `${endPerc}%`, transform: 'translateX(-50%)' }}
        >
          <span className="text-[10px] font-bold text-ink-500 mb-1">{end}</span>
          <div className="flex-1 w-px border-l border-dashed border-sand-300"></div>
        </div>

        {/* Marker Oggi animato */}
        <div 
          className="absolute flex flex-col items-center transition-all duration-1000 ease-out z-10"
          style={{ 
            left: mounted ? `${currentPerc}%` : '0%',
            top: mounted ? `${currentY}%` : '90%',
            transform: 'translate(-50%, calc(-100% + 8px))'
          }}
        >
          <div className="bg-ink-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap mb-1">
            OGGI: {current}
          </div>
          <div className="w-4 h-4 bg-white border-[3px] border-ink-700 rounded-full shadow-md"></div>
        </div>
      </div>
    </div>
  );
}