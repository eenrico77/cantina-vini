"use client";

import { useEffect, useState } from "react";

type Props = {
  start: number;
  peak: number;
  end: number;
  current: number;
};

export default function MaturationCurve({ start, peak, end, current }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calcolo delle percentuali
  const totalDuration = Math.max(1, end - start);
  
  // Posizione dell'anno corrente
  const currentPercRaw = ((current - start) / totalDuration) * 100;
  const currentPerc = Math.min(100, Math.max(0, currentPercRaw));

  // Posizione dell'apice
  const peakPercRaw = ((peak - start) / totalDuration) * 100;
  const peakPerc = Math.min(100, Math.max(0, peakPercRaw));
  
  // Calcolo dinamico dello stop del gradiente (leggermente prima del picco inizia ad essere "quasi pronto")
  const almostPerc = Math.max(0, peakPerc - 15);

  return (
    <div className="bg-white rounded-2xl shadow-soft p-5 border border-sand-200 mt-4">
      <div className="flex justify-between items-end mb-8">
        <h3 className="text-sm font-semibold text-ink-700 uppercase tracking-wider">Curva di Maturazione</h3>
      </div>

      <div className="relative pt-6 pb-6">
        {/* Barra di sfondo (track) */}
        <div className="h-3 w-full bg-sand-200 rounded-full overflow-hidden relative">
          {/* Gradiente colorato animato */}
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: mounted ? '100%' : '0%',
              background: `linear-gradient(90deg, #7a8f99 0%, #c7773a ${almostPerc}%, #5f8a5a ${peakPerc}%, #a9463a 100%)`
            }}
          />
        </div>

        {/* Marker Inizio */}
        <div className="absolute top-0 left-0 -translate-x-1/2 flex flex-col items-center">
          <div className="text-[10px] uppercase font-bold text-status-young mb-1">Giovane</div>
          <div className="h-2 w-px bg-sand-200 mb-1"></div>
          <span className="text-[10px] font-medium text-ink-500">{start}</span>
        </div>

        {/* Marker Apice */}
        <div 
          className="absolute top-0 flex flex-col items-center"
          style={{ left: `${peakPerc}%`, transform: 'translateX(-50%)' }}
        >
          <div className="text-[10px] uppercase font-bold text-status-ready mb-1">Apice</div>
          <div className="h-2 w-px bg-status-ready mb-1"></div>
          <span className="text-[10px] font-medium text-ink-500">{peak}</span>
        </div>

        {/* Marker Fine */}
        <div className="absolute top-0 right-0 translate-x-1/2 flex flex-col items-center">
          <div className="text-[10px] uppercase font-bold text-status-decline mb-1">Declino</div>
          <div className="h-2 w-px bg-sand-200 mb-1"></div>
          <span className="text-[10px] font-medium text-ink-500">{end}</span>
        </div>

        {/* Marker "Oggi" animato */}
        <div 
          className="absolute top-[21px] flex flex-col items-center transition-all duration-1000 ease-out z-10"
          style={{ 
            left: mounted ? `${currentPerc}%` : '0%',
            transform: 'translateX(-50%)'
          }}
        >
          {/* Pallino indicatore */}
          <div className="w-5 h-5 bg-white border-[3px] border-ink-700 rounded-full shadow-md flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-ink-700 rounded-full"></div>
          </div>
          {/* Etichetta "Oggi" */}
          <div className="mt-1 bg-ink-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
            OGGI: {current}
          </div>
        </div>
      </div>
    </div>
  );
}