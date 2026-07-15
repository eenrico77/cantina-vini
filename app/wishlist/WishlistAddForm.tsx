"use client";

import { useState } from "react";
import { addWishlistItem } from "./actions";
import { analyzeLabelAction } from "@/app/cantina/new/actions";

export default function WishlistAddForm() {
  const [loadingAI, setLoadingAI] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    producer: "",
    color: "",
    year: "",
    region: "",
    notes: ""
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
          year: aiResult.year?.toString() || prev.year,
          region: [aiResult.region, aiResult.country].filter(Boolean).join(", ") || prev.region,
        }));
      }
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Errore durante l'analisi dell'etichetta.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await addWishlistItem(fd);
      setFormData({
        name: "",
        producer: "",
        color: "",
        year: "",
        region: "",
        notes: ""
      });
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      alert("Errore durante il salvataggio: " + err.message);
    }
  };

  return (
    <div className="bg-sand-100 p-5 rounded-xl shadow-sm border border-sand-200">
      <h2 className="font-bold mb-4">Aggiungi vino desiderato</h2>
      
      <div className="bg-sand-50 p-4 rounded-xl border border-dashed border-sand-200 mb-4">
        <label className="block text-sm font-medium text-ink-500 mb-2">📸 Hai visto un vino interessante? Fotografa l'etichetta per precompilare i campi</label>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleImageUpload}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {loadingAI && <p className="text-sm text-blue-600 mt-2">Analisi in corso, attendi qualche secondo...</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input name="name" value={formData.name} onChange={handleChange} placeholder="Nome vino *" required className="border p-2 rounded-lg text-sm outline-none focus:border-brand-500" />
          <input name="producer" value={formData.producer} onChange={handleChange} placeholder="Produttore *" required className="border p-2 rounded-lg text-sm outline-none focus:border-brand-500" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <input name="color" value={formData.color} onChange={handleChange} placeholder="Tipologia" className="border p-2 rounded-lg text-sm outline-none focus:border-brand-500" />
          <input name="year" type="number" value={formData.year} onChange={handleChange} placeholder="Annata" className="border p-2 rounded-lg text-sm outline-none focus:border-brand-500" />
          <input name="region" value={formData.region} onChange={handleChange} placeholder="Regione/Paese" className="border p-2 rounded-lg text-sm outline-none focus:border-brand-500" />
        </div>
        <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Note (chi me l'ha consigliato, prezzo indicativo...)" className="border p-2 rounded-lg text-sm outline-none focus:border-brand-500 w-full" />
        <button type="submit" disabled={loadingAI} className="w-full bg-ink-700 text-white font-medium py-2 rounded-lg text-sm hover:bg-ink-500 transition-colors disabled:opacity-50">
          Aggiungi alla lista
        </button>
      </form>
    </div>
  );
}
