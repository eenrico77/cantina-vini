"use client";

import { useState } from "react";
import { createWine, analyzeLabelAction } from "./actions";

const COLORS = ["Rosso", "Bianco", "Rosato", "Bollicine", "Dolce"];

export default function NewWinePage() {
  const [loadingAI, setLoadingAI] = useState(false);
  const [formData, setFormData] = useState({
    name: "", producer: "", color: "", region: "", country: "", year: "", quantity: "1",
    grapes: "", description: "", origin_notes: "", vintage_review: "",
    maturation_start: "", maturation_end: "", ideal_temp: "", decanting: "",
    organoleptic: "", taste_profile: ""
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

      <form action={createWine} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-sand-200">
        
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
              <input name="year" type="number" value={formData.year} onChange={handleChange} required className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase">Quantità *</label>
              <input name="quantity" type="number" min={1} value={formData.quantity} onChange={handleChange} required className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
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
    </div>
  );
}
