"use client";

import { useState } from "react";
import DrinkBottleModal from "./DrinkBottleModal";

export default function BottleActionsSheet({ 
  bottle, 
  wine, 
  onEditValue 
}: { 
  bottle: any; 
  wine: any; 
  onEditValue: () => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drinkModalOpen, setDrinkModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setSheetOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-sand-50 text-ink-600 border border-sand-200 hover:bg-sand-100 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
      >
        ••• Azioni
      </button>

      {/* Bottom Sheet Overlay */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-ink-700/40" onClick={() => setSheetOpen(false)}></div>
          <div className="bg-white w-full rounded-t-3xl p-4 pb-6 relative z-10 shadow-2xl">
            <div className="w-12 h-1.5 bg-sand-200 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-ink-700 mb-3 px-1">Azioni Annata {bottle.year}</h3>
            
            <div className="flex flex-col">
              <button 
                onClick={() => { setSheetOpen(false); onEditValue(); }}
                className="flex items-center justify-between py-3 border-b border-sand-100 hover:bg-sand-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 font-medium text-ink-700 text-sm">
                  <span className="text-base">✏️</span> Modifica valore attuale
                </div>
                <span className="text-ink-300">❯</span>
              </button>

              <button 
                onClick={() => { setSheetOpen(false); setDrinkModalOpen(true); }}
                className="flex items-center justify-between py-3 border-b border-sand-100 hover:bg-sand-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3 font-medium text-brand-600 text-sm">
                  <span className="text-base">🍷</span> Segna come bevuta
                </div>
                <span className="text-ink-300">❯</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Segna Bevuta */}
      {drinkModalOpen && (
        <DrinkBottleModal 
          bottle={bottle} 
          wine={wine} 
          isOpen={drinkModalOpen} 
          onClose={() => setDrinkModalOpen(false)} 
        />
      )}
    </>
  );
}
