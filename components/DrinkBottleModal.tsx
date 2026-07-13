"use client";

import { useState } from "react";
import { drinkBottleAction } from "@/app/cantina/[id]/actions";

export default function DrinkBottleModal({ bottle, wine }: { bottle: any, wine: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (bottle.quantity <= 0) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append("bottleId", bottle.id.toString());
    formData.append("wineId", wine.id.toString());
    formData.append("wineName", wine.name);
    formData.append("producer", wine.producer);
    formData.append("year", bottle.year.toString());

    try {
      await drinkBottleAction(formData);
      setOpen(false);
    } catch (err) {
      console.error(err);
      alert("Errore durante il salvataggio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 bg-white text-brand-600 border-2 border-brand-200 hover:bg-brand-50 hover:border-brand-300 px-4 py-3 rounded-xl text-sm font-bold transition-all shadow-sm"
      >
        <span>🍷</span> Segna come bevuta
      </button>

      {open && (
        <div className="fixed inset-0 bg-ink-700/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-sand-100">
            <h3 className="text-xl font-bold mb-4 text-ink-700 text-center">Com'era questo vino?</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Voto (1-5)</label>
                <input type="number" name="rating" min="1" max="5" className="border border-sand-200 rounded-xl p-3 w-full outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-sand-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">Note (opzionali)</label>
                <textarea name="notes" className="border border-sand-200 rounded-xl p-3 w-full outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 h-24 bg-sand-50 resize-none" placeholder="Profumi, con chi l'hai bevuto..." />
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-sand-100">
                <button type="button" onClick={() => setOpen(false)} className="px-5 py-2.5 text-ink-500 font-bold hover:bg-sand-100 rounded-xl transition-colors">Annulla</button>
                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold disabled:opacity-50 transition-colors shadow-md">
                  {loading ? "Salvo..." : "Conferma"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
