"use client";

import { useState } from "react";
import { removeBottleAction } from "@/app/cantina/[id]/actions";

export default function RemoveBottleModal({
  bottle,
  wine,
  isOpen = false,
  onClose
}: {
  bottle: any;
  wine: any;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(1);

  if (bottle.quantity <= 0) return null;

  const handleClose = () => {
    setAmount(1);
    if (onClose) onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("bottleId", bottle.id.toString());
    formData.append("wineId", wine.id.toString());
    formData.append("amount", amount.toString());

    try {
      await removeBottleAction(formData);
      handleClose();
    } catch (err) {
      console.error(err);
      alert("Errore durante la rimozione.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink-700/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-sand-100">
        <h3 className="text-xl font-bold mb-2 text-ink-700 text-center">Rimuovi bottiglia</h3>
        <p className="text-sm text-ink-500 text-center mb-4">
          Per bottiglie rotte, regalate o inserite per errore — non verrà segnata come bevuta nel Diario.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {bottle.quantity > 1 && (
            <div>
              <label className="block text-xs font-bold text-ink-500 uppercase tracking-wider mb-2">
                Quante ne rimuovi? (disponibili: {bottle.quantity})
              </label>
              <input
                type="number"
                min="1"
                max={bottle.quantity}
                value={amount}
                onChange={(e) => setAmount(Math.min(bottle.quantity, Math.max(1, Number(e.target.value))))}
                className="border border-sand-200 rounded-xl p-3 w-full outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-sand-50"
              />
            </div>
          )}
          <div className="flex gap-3 justify-end mt-2 pt-4 border-t border-sand-100">
            <button type="button" onClick={handleClose} className="px-5 py-2.5 text-ink-500 font-bold hover:bg-sand-100 rounded-xl transition-colors">Annulla</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold disabled:opacity-50 transition-colors shadow-md">
              {loading ? "Rimuovo..." : "Conferma rimozione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
