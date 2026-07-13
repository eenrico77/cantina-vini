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
        className="mt-3 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-red-200"
      >
        🍷 Segna come bevuta
      </button>

      {open && (
        <div className="fixed inset-0 bg-brand-500/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Com'era {wine.name}?</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Voto (1-5)</label>
                <input type="number" name="rating" min="1" max="5" className="border rounded-lg p-2 w-full outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (opzionali)</label>
                <textarea name="notes" className="border rounded-lg p-2 w-full outline-none focus:ring-2 focus:ring-red-500 h-24" placeholder="Profumi, con chi l'hai bevuto..." />
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 text-ink-500 font-medium">Annulla</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium disabled:opacity-50">
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
