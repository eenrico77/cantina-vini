"use client";

import { useState } from "react";
import { getPairingAction } from "@/app/actions";
import Link from "next/link";

export default function FoodPairingForm() {
  const [food, setFood] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await getPairingAction(food);
      if (res.empty) {
        setError("Nessuna bottiglia disponibile in cantina per fare l'abbinamento!");
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setError(err.message || "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">Cosa mangi stasera? 🍽️</h2>
      <div className="bg-sand-100 rounded-2xl shadow-md p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            placeholder="es. Risotto ai funghi, Sushi..." 
            value={food} 
            onChange={(e) => setFood(e.target.value)}
            className="border border-sand-200 rounded-lg px-3 py-2 flex-1 text-sm outline-none focus:border-black"
            required
          />
          <button type="submit" disabled={loading} className="bg-ink-700 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
            {loading ? "Cerco..." : "Abbina"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

        {result && (
          <div className="mt-4 space-y-4">
            <div className="p-3 bg-sand-50 border border-sand-200 rounded-xl">
              <div className="text-xs font-bold text-ink-500 uppercase mb-1">Abbinamento Classico</div>
              {result.classic?.wineId ? (
                <>
                  <Link href={`/cantina/${result.classic.wineId}`} className="font-semibold text-blue-600 hover:underline block">
                    {result.classic.wineName} ({result.classic.year})
                  </Link>
                  <p className="text-xs text-ink-500 mb-2">{result.classic.producer}</p>
                  <p className="text-sm italic text-ink-500">{result.classic.explanation}</p>
                </>
              ) : (
                <p className="text-sm text-ink-500">Nessun abbinamento classico trovato.</p>
              )}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="text-xs font-bold text-amber-700 uppercase mb-1">Abbinamento Audace</div>
              {result.daring?.wineId ? (
                <>
                  <Link href={`/cantina/${result.daring.wineId}`} className="font-semibold text-amber-800 hover:underline block">
                    {result.daring.wineName} ({result.daring.year})
                  </Link>
                  <p className="text-xs text-amber-600/70 mb-2">{result.daring.producer}</p>
                  <p className="text-sm italic text-amber-900">{result.daring.explanation}</p>
                </>
              ) : (
                <p className="text-sm text-ink-500">Nessun abbinamento audace trovato.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
