"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getFoodPairingFullAction } from "@/app/actions";

const FOOD_OPTIONS = [
  { id: "carne_rossa", label: "Carne rossa", img: "/foods/carne-rossa.jpg" },
  { id: "pollame", label: "Pollame", img: "/foods/pollame.jpg" },
  { id: "pesce", label: "Pesce", img: "/foods/pesce.jpg" },
  { id: "pasta_risotti", label: "Pasta e risotti", img: "/foods/pasta-risotti.jpg" },
  { id: "pizza", label: "Pizza", img: "/foods/pizza.jpg" },
  { id: "formaggi_salumi", label: "Formaggi e salumi", img: "/foods/formaggi-salumi.jpg" },
  { id: "verdure", label: "Verdure", img: "/foods/verdure.jpg" },
  { id: "dolci", label: "Dolci", img: "/foods/dolci.jpg" },
];

export default function AbbinamentoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [selectedFood, setSelectedFood] = useState("");
  const [customFood, setCustomFood] = useState("");

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

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFood.trim()) return;
    handleSelectFood(customFood.trim());
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
                className="rounded-2xl overflow-hidden shadow-sm border border-sand-200 hover:border-brand-300 transition-colors text-left"
              >
                <div className="relative w-full h-28">
                  <Image src={opt.img} alt={opt.label} fill className="object-cover" sizes="(max-width: 768px) 50vw, 300px" />
                </div>
                <div className="bg-sand-50 px-3 py-2.5">
                  <span className="font-semibold text-ink-700 text-sm">{opt.label}</span>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomSubmit} className="mt-6 bg-sand-100 rounded-2xl p-4 shadow-sm border border-sand-200">
            <label className="block text-sm font-semibold text-ink-700 mb-2">...oppure descrivi il tuo piatto</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customFood}
                onChange={(e) => setCustomFood(e.target.value)}
                placeholder="es. Risotto ai funghi, Sushi..."
                className="border border-sand-200 rounded-lg px-3 py-2 flex-1 text-sm outline-none focus:border-brand-500 bg-white"
              />
              <button type="submit" className="bg-ink-700 hover:bg-ink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                Abbina
              </button>
            </div>
          </form>
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
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-ink-500 uppercase">Abbinamento Classico</div>
                  {typeof result.classic?.matchScore === "number" && (
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-100 rounded-full px-2 py-0.5">{result.classic.matchScore}% affinità</span>
                  )}
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-amber-700 uppercase">Abbinamento Audace</div>
                  {typeof result.daring?.matchScore === "number" && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 rounded-full px-2 py-0.5">{result.daring.matchScore}% affinità</span>
                  )}
                </div>
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
