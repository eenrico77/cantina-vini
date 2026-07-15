"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import MaturationCurve from "@/components/MaturationCurve";
import { getAgingLabel } from "@/lib/domain/maturation";
import type { AgingStatus } from "@/types";
import BottleActionsSheet from "@/components/BottleActionsSheet";
import { updateBottleValueAction } from "@/app/cantina/[id]/actions";

const getStaticPairings = (color: string) => {
  switch (color) {
    case "Rosso": return ["Arrosti", "Brasati", "Selvaggina", "Formaggi stagionati", "Grigliate rosse"];
    case "Bianco": return ["Pesce", "Crostacei", "Risotti", "Formaggi freschi", "Antipasti di mare"];
    case "Bollicine": return ["Aperitivo", "Crudo di mare", "Fritti", "Sushi", "Antipasti leggeri"];
    case "Rosato": return ["Salumi", "Pesce grigliato", "Cucina estiva", "Insalate", "Pizza"];
    case "Dolce": return ["Dessert", "Formaggi erborinati", "Frutta secca", "Crostate", "Cioccolato"];
    default: return [];
  }
};

function EditableValue({ bottle, wineId, isEditing, setIsEditing }: { bottle: any; wineId: string; isEditing: boolean; setIsEditing: (v: boolean) => void }) {
  const [val, setVal] = useState(bottle.current_value || bottle.purchase_price || "");
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("bottleId", bottle.id);
      fd.append("wineId", wineId);
      if (val !== "") fd.append("currentValue", val.toString());
      await updateBottleValueAction(fd);
      setIsEditing(false);
    });
  };

  const displayVal = bottle.current_value;
  const purchase = bottle.purchase_price;

  if (isEditing) {
    return (
      <div className="bg-sand-50 rounded-2xl p-3 border border-brand-200 mb-4 flex items-center gap-2">
        <span className="text-[10px] font-bold text-ink-500 uppercase">Valore (€)</span>
        <input 
          type="number" 
          step="0.01"
          value={val}
          onChange={e => setVal(e.target.value)}
          className="border border-sand-200 rounded p-1 w-20 text-sm focus:ring-brand-500 outline-none"
        />
        <button onClick={handleSave} disabled={isPending} className="bg-brand-500 text-white px-3 py-1 rounded font-bold text-xs">
          {isPending ? "..." : "Salva"}
        </button>
        <button onClick={() => setIsEditing(false)} className="text-ink-400 font-bold text-xs px-2">
          Annulla
        </button>
      </div>
    );
  }

  return (
    <div className="bg-sand-50 rounded-2xl p-3 border border-sand-100 mb-4 flex justify-between items-center">
      <div>
        <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-0.5">Valore Attuale</div>
        <div className="text-sm font-medium text-ink-700">
          {displayVal ? (
            <span>{displayVal}€</span>
          ) : purchase ? (
            <span className="text-ink-400">{purchase}€ <span className="text-[10px]">(prezzo acquisto)</span></span>
          ) : (
            <span className="text-ink-400 text-xs italic">—</span>
          )}
        </div>
      </div>
    </div>
  );
}

function getFormatLabel(ml: number) {
  switch (ml) {
    case 187: return "Piccola (18,7cl)";
    case 375: return "Mezza (37,5cl)";
    case 750: return "Standard (75cl)";
    case 1500: return "Magnum (1,5L)";
    case 3000: return "Doppio Magnum (3L)";
    default: return `${ml / 1000}L`;
  }
}

function BottleCard({ bottle, wine, currentYear }: { bottle: any; wine: any; currentYear: number }) {
  const [isEditingValue, setIsEditingValue] = useState(false);
  const hasCurve = typeof bottle.peak_start === "number" && typeof bottle.peak_end === "number";
  const peak = hasCurve ? Math.floor((bottle.peak_start + bottle.peak_end) / 2) : null;

  return (
    <div className="bg-white border border-sand-200 rounded-3xl p-5 shadow-soft relative overflow-hidden">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-sand-50 rounded-2xl p-3 text-center border border-sand-100">
          <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Annata</div>
          <div className="text-2xl font-black text-ink-700">{bottle.year}</div>
        </div>
        <div className="bg-sand-50 rounded-2xl p-3 text-center border border-sand-100">
          <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Bottiglie</div>
          <div className="text-2xl font-black text-ink-700">{bottle.quantity}</div>
        </div>
      </div>

      {bottle.format_ml && (
        <div className="flex justify-center mb-4">
          <span className="bg-brand-50 text-brand-600 font-bold text-xs px-3 py-1 rounded-full">
            {getFormatLabel(bottle.format_ml)}
          </span>
        </div>
      )}

      {bottle.tags && bottle.tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-4 mt-2">
          {bottle.tags.map((t: string) => (
            <span key={t} className="bg-sand-100 text-ink-600 font-medium text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md">
              {t}
            </span>
          ))}
        </div>
      )}

      {hasCurve ? (
        <div className="mb-4">
          <MaturationCurve
            start={bottle.peak_start}
            peak={peak as number}
            end={bottle.peak_end}
            current={currentYear}
          />
          {bottle.aging_status && (
            <div className="mt-4 text-center text-xs font-semibold text-ink-500 uppercase tracking-wider">
              Stato: {getAgingLabel(bottle.aging_status, bottle.peak_start, bottle.peak_end)}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-sand-50 border border-sand-100 rounded-2xl p-4 text-center text-sm text-ink-500 mb-4">
          Dati di maturazione non disponibili
        </div>
      )}

      {/* Info Rapide: Temp, Bicchiere, Abbinamenti */}
      <div className="bg-sand-50 rounded-2xl p-4 mb-4 border border-sand-100 space-y-3">
        <div className="flex gap-2">
          {wine.ideal_temp && (
            <div className="flex-1 bg-white border border-sand-100 text-ink-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
              <span className="text-xs opacity-70">🌡️</span> {wine.ideal_temp}
            </div>
          )}
          {wine.glassware && (
            <div className="flex-1 bg-white border border-sand-100 text-ink-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm">
              <span className="text-xs opacity-70">🍷</span> {wine.glassware}
            </div>
          )}
        </div>
        {wine.color && (
          <div>
            <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1.5 px-1">Abbinamenti</div>
            <div className="flex flex-wrap gap-1">
              {getStaticPairings(wine.color).map((p: string) => (
                <span key={p} className="bg-white border border-sand-200 text-ink-600 text-[10px] font-semibold px-2 py-1.5 rounded-lg shadow-sm">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditableValue bottle={bottle} wineId={wine.id} isEditing={isEditingValue} setIsEditing={setIsEditingValue} />

      {bottle.notes && (
        <div className="bg-sand-50 rounded-2xl p-4 mb-4 text-sm text-ink-700 italic border border-sand-100">
          "{bottle.notes}"
        </div>
      )}

      {typeof bottle.rating === "number" && (
        <div className="text-sm font-bold text-brand-500 mb-4 flex justify-center text-lg">
          {"★".repeat(bottle.rating)}
        </div>
      )}

      {/* Azioni Consolidate */}
      <div className="mt-4">
        <BottleActionsSheet bottle={bottle} wine={wine} onEditValue={() => setIsEditingValue(true)} />
      </div>
    </div>
  );
}

export default function WineDetailClient({ wine, bottles, diaryEntries }: any) {
  const [activeTab, setActiveTab] = useState("annate");
  const currentYear = new Date().getFullYear();
  
  const TASTE_LABELS: Record<string, string> = {
    body: "Corpo",
    intensity: "Intensità",
    tannins: "Tannini",
    acidity: "Acidità",
    persistence: "Persistenza",
    alcohol: "Alcol",
  };
  const tasteProfile = wine.taste_profile as Record<string, number> | null;
  const organoleptic = wine.organoleptic as any | null;

  return (
    <div className="pb-24 -mt-6"> {/* -mt-6 to offset standard layout padding for full bleed hero */}
      {/* Hero Section */}
      <div 
        className="relative px-6 py-10 flex flex-col items-center text-center shadow-sm overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2000&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/75"></div>
        
        <div className="relative z-10 flex flex-col items-center w-full">
          {wine.image_url ? (
            <div className="relative mb-6 flex flex-col items-center">
              <div className="relative w-32 h-48 bg-sand-50/95 rounded-2xl shadow-xl border border-white/40 p-3">
                <div className="relative w-full h-full">
                  <Image 
                    src={wine.image_url} 
                    alt={wine.name} 
                    fill 
                    className="object-contain"
                  />
                </div>
              </div>
              {/* Floor shadow */}
              <div className="absolute -bottom-1 w-24 h-2 bg-black/40 blur-md rounded-[100%] pointer-events-none"></div>
            </div>
          ) : (
            <div className="w-32 h-48 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 flex items-center justify-center text-5xl shadow-sm border border-white/20">
              🍷
            </div>
          )}
          <p className="text-xs font-bold text-brand-200 uppercase tracking-widest mb-2">{wine.producer}</p>
          <h1 className="text-3xl font-black text-white leading-tight mb-3">{wine.name}</h1>
          <p className="text-sm font-medium text-white/80">
            {[wine.region, wine.country, wine.color].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-2xl mx-auto mt-8 space-y-6">
        
        {/* TABS */}
        <div>
          <div className="flex border-b border-sand-200 mb-6">
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "annate" ? "border-brand-500 text-brand-600" : "border-transparent text-ink-500 hover:text-ink-700"}`}
              onClick={() => setActiveTab("annate")}
            >
              Le tue Annate
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "storico" ? "border-brand-500 text-brand-600" : "border-transparent text-ink-500 hover:text-ink-700"}`}
              onClick={() => setActiveTab("storico")}
            >
              Storico Bevute
            </button>
            <button 
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === "info" ? "border-brand-500 text-brand-600" : "border-transparent text-ink-500 hover:text-ink-700"}`}
              onClick={() => setActiveTab("info")}
            >
              Info Vino
            </button>
          </div>

          {activeTab === "annate" && (
            <div className="space-y-6">
              {!bottles || bottles.length === 0 ? (
                <div className="bg-sand-50 border border-sand-200 rounded-2xl p-6 text-center text-ink-500 text-sm">
                  Nessuna bottiglia di questo vino in cantina.
                </div>
              ) : (
                bottles.map((bottle: any) => (
                  <BottleCard key={bottle.id} bottle={bottle} wine={wine} currentYear={currentYear} />
                ))
              )}
            </div>
          )}

          {activeTab === "storico" && (
            <div className="space-y-4">
              {!diaryEntries || diaryEntries.length === 0 ? (
                <div className="bg-sand-50 border border-sand-200 rounded-2xl p-6 text-center text-ink-500 text-sm">
                  Non hai ancora bevuto nessuna bottiglia di questo vino.
                </div>
              ) : (
                diaryEntries.map((entry: any) => (
                  <div key={entry.id} className="bg-white border border-sand-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-ink-700 text-lg">Annata {entry.year}</div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold bg-sand-100 text-ink-500 px-2 py-1 rounded-md uppercase tracking-wider">
                          {new Date(entry.drunk_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {entry.rating && (
                      <div className="text-brand-500 text-lg mb-2">{"★".repeat(entry.rating)}</div>
                    )}
                    {entry.notes && (
                      <p className="text-sm text-ink-700 bg-sand-50 p-3 rounded-xl italic border border-sand-100">
                        "{entry.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "info" && (
            <div className="space-y-6">
              {/* Dati Info Base */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white border border-sand-200 rounded-2xl p-4 shadow-sm text-center">
                  <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Temperatura</div>
                  <div className="text-lg font-bold text-ink-700">{wine.ideal_temp || "—"}</div>
                </div>
                <div className="bg-white border border-sand-200 rounded-2xl p-4 shadow-sm text-center">
                  <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Decantazione</div>
                  <div className="text-lg font-bold text-ink-700">{wine.decanting_needed ? "Sì" : "No"}</div>
                  {wine.decanting_notes && <div className="text-xs text-ink-500 mt-1">{wine.decanting_notes}</div>}
                </div>
              </div>

              {wine.storage_notes && (
                <div className="bg-sand-50 border border-sand-200 rounded-2xl p-5 shadow-sm">
                  <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Note di conservazione</div>
                  <p className="text-sm text-ink-700">{wine.storage_notes}</p>
                </div>
              )}

              {/* Dati AI */}
              {(wine.grapes || wine.description || wine.origin_notes || wine.vintage_review || organoleptic || tasteProfile) && (
                <div className="bg-white border border-sand-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-ink-700 mb-4 border-b border-sand-100 pb-2">Note del sommelier (AI)</h3>
                  <div className="space-y-4 text-sm text-ink-700">
                    {wine.grapes && <div><span className="font-semibold text-ink-500 mr-2 uppercase text-[10px] tracking-wider">Uvaggio</span><br/>{wine.grapes}</div>}
                    {wine.description && <div><span className="font-semibold text-ink-500 mr-2 uppercase text-[10px] tracking-wider">Descrizione</span><br/>{wine.description}</div>}
                    {wine.origin_notes && <div><span className="font-semibold text-ink-500 mr-2 uppercase text-[10px] tracking-wider">Terroir</span><br/>{wine.origin_notes}</div>}
                    {wine.vintage_review && <div><span className="font-semibold text-ink-500 mr-2 uppercase text-[10px] tracking-wider">Annata</span><br/>{wine.vintage_review}</div>}
                    
                    {organoleptic && (
                      <div>
                        <span className="font-semibold text-ink-500 block mb-1 uppercase text-[10px] tracking-wider">Analisi organolettica</span>
                        <ul className="list-disc pl-5 space-y-1 text-ink-700/90">
                          {organoleptic.visual && <li>Vista: {organoleptic.visual}</li>}
                          {organoleptic.olfactory && <li>Naso: {organoleptic.olfactory}</li>}
                          {organoleptic.gustatory && <li>Gusto: {organoleptic.gustatory}</li>}
                        </ul>
                      </div>
                    )}

                    {tasteProfile && (
                      <div className="mt-6">
                        <span className="font-semibold text-ink-500 block mb-4 uppercase text-[10px] tracking-wider">Profilo gustativo</span>
                        
                        {tasteProfile.alcohol && (
                          <div className="text-sm font-bold text-ink-700 mb-4 bg-sand-50 py-2 px-3 rounded-lg border border-sand-100 inline-block">
                            Alcol: {tasteProfile.alcohol}%
                          </div>
                        )}

                        <div className="space-y-5">
                          {[
                            { key: 'body', left: 'Leggero', right: 'Corposo' },
                            { key: 'intensity', left: 'Delicato', right: 'Intenso' },
                            { key: 'tannins', left: 'Morbido', right: 'Deciso' },
                            { key: 'acidity', left: 'Rotondo', right: 'Fresco' },
                            { key: 'persistence', left: 'Breve', right: 'Lunga' }
                          ].map(slider => {
                            const val = tasteProfile[slider.key];
                            if (val == null) return null;
                            const perc = (Number(val) / 5) * 100;
                            return (
                              <div key={slider.key}>
                                <div className="flex justify-between text-xs font-semibold text-ink-600 mb-1.5">
                                  <span>{slider.left}</span>
                                  <span>{slider.right}</span>
                                </div>
                                <div className="h-2.5 w-full bg-sand-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${perc}%` }}></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Abbinamenti Statici */}
              {wine.color && (
                <div className="bg-sand-50 border border-sand-200 rounded-2xl p-5 shadow-sm text-center">
                  <div className="text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Abbinamenti Consigliati</div>
                  <p className="text-sm font-medium text-ink-700">
                    {wine.color === "Rosso" && "Carni rosse, brasati, formaggi stagionati"}
                    {wine.color === "Bianco" && "Pesce, crostacei, formaggi freschi"}
                    {wine.color === "Bollicine" && "Aperitivo, fritti, sushi"}
                    {wine.color === "Rosato" && "Salumi, cucina estiva, pesce grigliato"}
                    {wine.color === "Dolce" && "Dessert, formaggi erborinati"}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
