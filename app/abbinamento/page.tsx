"use client";

import { useState } from "react";
import Link from "next/link";
import { Beef, Drumstick, Fish, Soup, Pizza, Sandwich, Salad, Cake } from "lucide-react";
import { getFoodPairingFullAction } from "@/app/actions";

const FOOD_OPTIONS = [
  { id: "carne_rossa", label: "Carne rossa", icon: Beef },
  { id: "pollame", label: "Pollame", icon: Drumstick },
  { id: "pesce", label: "Pesce", icon: Fish },
  { id: "pasta_risotti", label: "Pasta e risotti", icon: Soup },
  { id: "pizza", label: "Pizza", icon: Pizza },
  { id: "formaggi_salumi", label: "Formaggi e salumi", icon: Sandwich },
  { id: "verdure", label: "Verdure", icon: Salad },
  { id: "dolci", label: "Dolci", icon: Cake },
];

export default function AbbinamentoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedFood, setSelectedFood] = useState("");

  const handleSelectFood = async (label: string) => {
    setSelectedFood(label);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await getFoodPairingFullAction(label);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Errore imprevisto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      {!result && !loading && (
        <>
          <h1 className="font-serif text-3xl font-extrabold text-ink-700 tracking-tight inline-block border-b-2 border-brand-600 pb-1">
            Cosa mangi oggi?
          </h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {FOOD_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelectFood(opt.label)}
                className="bg-sand-100 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-sand-200 hover:border-brand-300 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  <opt.icon className="w-7 h-7 text-brand-600" strokeWidth={1.5} />
                </div>
                <span className="font-semibold text-ink-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-ink-500 font-medium">Cerco l'abbinamento perfetto per: {selectedFood}...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
          <p>{error}</p>
          <button onClick={() => setError("")} className="mt-3 text-sm font-bold underline">Riprova</button>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-8">
          <h1 className="font-serif text-2xl font-bold text-ink-700">
            Abbinamenti per: {selectedFood}
          </h1>

          <section>
            <h2 className="text-lg font-bold mb-4">Dalla tua cantina</h2>
            <div className="space-y-4">
              <div className="p-4 bg-sand-50 border border-sand-200 rounded-xl">
                <div className="text-xs font-bold text-ink-500 uppercase mb-2">Abbinamento Classico</div>
                {result.classic?.wineId ? (
                  <>
                    <Link href={`/cantina/${result.classic.wineId}`} className="font-semibold text-blue-600 hover:underline block text-lg">
                      {result.classic.wineName} ({result.classic.year})
                    </Link>
                    <p className="text-sm text-ink-500 mb-2">{result.classic.producer}</p>
                    <p className="text-base italic text-ink-700">{result.classic.explanation}</p>
                  </>
                ) : (
                  <p className="text-sm text-ink-500">Nessun abbinamento classico trovato.</p>
                )}
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="text-xs font-bold text-amber-700 uppercase mb-2">Abbinamento Audace</div>
                {result.daring?.wineId ? (
                  <>
                    <Link href={`/cantina/${result.daring.wineId}`} className="font-semibold text-amber-800 hover:underline block text-lg">
                      {result.daring.wineName} ({result.daring.year})
                    </Link>
                    <p className="text-sm text-amber-700/80 mb-2">{result.daring.producer}</p>
                    <p className="text-base italic text-amber-900">{result.daring.explanation}</p>
                  </>
                ) : (
                  <p className="text-sm text-ink-500">Nessun abbinamento audace trovato.</p>
                )}
              </div>
            </div>
          </section>

          {result.toDiscover && result.toDiscover.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4">Da scoprire (in enoteca)</h2>
              <div className="space-y-4">
                {result.toDiscover.map((disc: any, i: number) => (
                  <div key={i} className="p-4 bg-sand-100 border border-sand-200 rounded-xl shadow-sm">
                    <div className="font-bold text-ink-700 mb-1">{disc.style}</div>
                    <p className="text-sm text-ink-600">{disc.explanation}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={() => setResult(null)}
              className="w-full bg-brand-100 text-brand-700 py-3 rounded-xl font-bold transition-colors hover:bg-brand-200"
            >
              Scegli un altro piatto
            </button>
            <Link 
              href="/"
              className="w-full text-center py-3 text-ink-500 font-medium hover:text-ink-700 transition-colors"
            >
              Torna alla Home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
