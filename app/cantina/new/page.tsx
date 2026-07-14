"use client";

import { useState } from "react";
import { createWine, analyzeLabelAction } from "./actions";

const COLORS = ["Rosso", "Bianco", "Rosato", "Bollicine", "Dolce"];

export default function NewWinePage() {
  const [loadingAI, setLoadingAI] = useState(false);
  const [showYearPopup, setShowYearPopup] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);

  const [formData, setFormData] = useState({
    name: "", producer: "", color: "", region: "", country: "", year: "", quantity: "1",
    grapes: "", description: "", origin_notes: "", vintage_review: "",
    maturation_start: "", maturation_end: "", ideal_temp: "", decanting: "", glassware: "",
    organoleptic: "", taste_profile: "", purchase_price: ""
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingAI(true);
    try {
      const data = new FormData();
      data.append("image", file);
      const aiResult = await analyzeLabelAction(data);
      if (aiResult) {
        setFormData(prev => ({
          ...prev,
          name: aiResult.name || prev.name,
          producer: aiResult.producer || prev.producer,
          color: aiResult.color || prev.color,
          region: aiResult.region || prev.region,
          country: aiResult.country || prev.country,
          grapes: aiResult.grapes || prev.grapes,
          description: aiResult.description || prev.description,
          origin_notes: aiResult.origin_notes || prev.origin_notes,
          vintage_review: aiResult.vintage_review || prev.vintage_review,
          maturation_start: aiResult.maturation_start?.toString() || prev.maturation_start,
          maturation_end: aiResult.maturation_end?.toString() || prev.maturation_end,
          ideal_temp: aiResult.ideal_temp || prev.ideal_temp,
          decanting: aiResult.decanting || prev.decanting,
          glassware: aiResult.glassware || prev.glassware,
          organoleptic: aiResult.organoleptic ? JSON.stringify(aiResult.organoleptic) : prev.organoleptic,
          taste_profile: aiResult.taste_profile ? JSON.stringify(aiResult.taste_profile) : prev.taste_profile,
        }));
      }
    } catch (e) {
      console.error(e);
      alert("Errore durante l'analisi dell'etichetta.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    if (!fd.get("year")) {
      e.preventDefault();
      setFormDataToSubmit(fd);
      setShowYearPopup(true);
    }
  };

  const submitWithoutYear = () => {
    if (formDataToSubmit) {
      createWine(formDataToSubmit);
    }
    setShowYearPopup(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-extrabold text-ink-700 tracking-tight">Aggiungi Vino</h1>

      <div className="bg-sand-50 p-4 rounded-xl border border-dashed border-sand-200">
        <label className="block text-sm font-medium text-ink-500 mb-2">📸 Scansiona etichetta con AI</label>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleImageUpload}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {loadingAI && <p className="text-sm text-blue-600 mt-2">Analisi in corso, attendi qualche secondo...</p>}
      </div>

      <form action={createWine} onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-sand-200">
        
        {/* Campi nascosti per i dati JSON */}
        <input type="hidden" name="organoleptic" value={formData.organoleptic} />
        <input type="hidden" name="taste_profile" value={formData.taste_profile} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 uppercase">Nome Vino *</label>
            <input name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 uppercase">Produttore *</label>
            <input name="producer" value={formData.producer} onChange={handleChange} required className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 uppercase">Tipologia *</label>
            <select name="color" value={formData.color} onChange={handleChange} required className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none">
              <option value="" disabled>Seleziona tipologia</option>
              {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase">Annata *</label>
              <input name="year" type="number" value={formData.year} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase">Quantità *</label>
              <input name="quantity" type="number" min={1} value={formData.quantity} onChange={handleChange} required className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase">Prezzo di acquisto (€)</label>
              <input name="purchase_price" type="number" step="0.01" value={formData.purchase_price} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="es. 15.50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 uppercase">Regione</label>
            <input name="region" value={formData.region} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 uppercase">Paese</label>
            <input name="country" value={formData.country} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-500 uppercase">Uvaggio</label>
            <input name="grapes" value={formData.grapes} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-500 uppercase">Descrizione AI</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-20" />
          </div>
        </div>

        <details className="text-sm">
          <summary className="cursor-pointer font-medium text-blue-600">Mostra dettagli extra (AI)</summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase">Note Terroir</label>
              <textarea name="origin_notes" value={formData.origin_notes} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase">Recensione Annata</label>
              <textarea name="vintage_review" value={formData.vintage_review} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase">Temp. Ideale</label>
                <input name="ideal_temp" value={formData.ideal_temp} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase">Bicchiere Consigliato</label>
                <input name="glassware" value={formData.glassware} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase">Decantazione</label>
                <input name="decanting" value={formData.decanting} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase">Inizio Maturazione (anni dalla vendemmia)</label>
                <input name="maturation_start" type="number" value={formData.maturation_start} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase">Fine Maturazione (anni dalla vendemmia)</label>
                <input name="maturation_end" type="number" value={formData.maturation_end} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg outline-none" />
              </div>
            </div>
          </div>
        </details>

        <button type="submit" className="w-full bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors">
          Conferma e Salva Vino
        </button>
      </form>

      {showYearPopup && (
        <div className="fixed inset-0 bg-ink-700/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-sand-100">
            <h3 className="text-xl font-bold mb-4 text-ink-700 text-center">Annata mancante</h3>
            <p className="text-sm text-ink-500 mb-6 text-center">
              Senza l'annata non possiamo calcolare la finestra di maturazione e capire quando aprire la bottiglia.
            </p>
            <div className="flex flex-col gap-3">
              <button type="button" onClick={() => setShowYearPopup(false)} className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors shadow-md">
                Torna indietro e compila
              </button>
              <button type="button" onClick={submitWithoutYear} className="px-5 py-2.5 text-ink-500 font-bold hover:bg-sand-100 rounded-xl transition-colors">
                Salva comunque senza annata
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
