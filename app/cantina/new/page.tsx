"use client";

import { useState, useEffect } from "react";
import { createWine, analyzeLabelAction, generateCatalogImageAction } from "./actions";
import GlassIcon, { getGlassLabel } from "@/components/GlassIcon";
import EditableTextField from "@/components/EditableTextField";

const COLORS = ["Rosso", "Bianco", "Rosato", "Bollicine", "Dolce"];

export default function NewWinePage() {
  const [loadingAI, setLoadingAI] = useState(false);
  const [showYearPopup, setShowYearPopup] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);

  const [formData, setFormData] = useState({
    name: "", producer: "", color: "", region: "", country: "", year: "", quantity: "1",
    grapes: "", description: "", origin_notes: "", vintage_review: "",
    maturation_start: "", maturation_end: "", ideal_temp: "", decanting: "", glassware: "",
    organoleptic: "", taste_profile: "", purchase_price: "", storage_notes: "", format_ml: "750", tags: ""
  });
  const [wishlistId, setWishlistId] = useState("");
  const [realImage, setRealImage] = useState<string | null>(null);
  const [catalogImage, setCatalogImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<"real" | "catalog" | null>(null);
  const [generatingCatalog, setGeneratingCatalog] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 101}, (_, i) => currentYear - i);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const wId = params.get('wishlistId');
      if (wId) {
        setWishlistId(wId);
        setFormData(prev => ({
          ...prev,
          name: params.get('name') || prev.name,
          producer: params.get('producer') || prev.producer,
          region: params.get('region') || prev.region,
          country: params.get('country') || prev.country,
          color: params.get('color') || prev.color,
          year: params.get('year') || prev.year,
        }));
      }
    }
  }, []);

  const handleGenerateCatalog = async () => {
    if (!formData.name || !formData.producer || !formData.color) {
      alert("Compila almeno Nome, Produttore e Tipologia per generare l'immagine da catalogo.");
      return;
    }
    setGeneratingCatalog(true);
    try {
      const generated = await generateCatalogImageAction(formData.name, formData.producer, formData.color);
      if (generated) {
        setCatalogImage(generated);
        setSelectedImage("catalog");
      }
    } catch (e) {
      console.error(e);
      alert("Errore generazione immagine da catalogo");
    } finally {
      setGeneratingCatalog(false);
    }
  };

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
        if ((aiResult as any).originalImage) {
          setRealImage((aiResult as any).originalImage);
          setSelectedImage("real");
        }
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Errore durante l'analisi dell'etichetta.");
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    document.querySelectorAll("textarea").forEach(t => {
      const el = t as HTMLTextAreaElement;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    });
  }, [formData.decanting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    if (e.target.tagName.toLowerCase() === "textarea") {
      const el = e.target as HTMLTextAreaElement;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
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

  const removeImage = (type: "real" | "catalog") => {
    if (type === "real") {
      setRealImage(null);
      if (selectedImage === "real") setSelectedImage(catalogImage ? "catalog" : null);
    } else {
      setCatalogImage(null);
      if (selectedImage === "catalog") setSelectedImage(realImage ? "real" : null);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="font-serif text-3xl font-extrabold text-ink-700 tracking-tight inline-block border-b-2 border-brand-600 pb-1">Aggiungi Vino</h1>

      <div className="bg-sand-50 p-4 rounded-xl border border-dashed border-sand-200">
        <label className="block text-sm font-medium text-ink-500 mb-2">📸 Scatta una foto (mobile) o carica un'immagine dell'etichetta</label>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleImageUpload}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
        {loadingAI && (
          <div className="mt-3">
            <p className="text-sm text-brand-600 mb-2 font-medium">Analisi in corso, attendi qualche secondo...</p>
            <div className="w-full h-1.5 rounded-full bg-sand-200 overflow-hidden relative">
              <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-brand-500 rounded-full animate-progress"></div>
            </div>
          </div>
        )}
        
        {/* Scelta Immagine */}
        <div className="mt-4 pt-4 border-t border-sand-200">
          <p className="text-sm font-semibold text-ink-700 mb-3">Scegli l'immagine da salvare</p>
          <div className="flex flex-wrap gap-4 items-end">
            {realImage && (
              <div className="relative">
                <div 
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all w-32 h-40 ${selectedImage === "real" ? "border-brand-500 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                  onClick={() => setSelectedImage("real")}
                >
                  <img src={realImage} alt="Foto originale" className="w-full h-full object-cover" />
                  {selectedImage === "real" && <div className="absolute top-1 right-1 bg-brand-500 text-white rounded-full p-1 shadow"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] p-1 text-center font-medium">Foto Reale</div>
                </div>
                <button type="button" onClick={() => removeImage("real")} className="absolute -top-2 -left-2 bg-ink-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:opacity-80">×</button>
              </div>
            )}
            {catalogImage && (
              <div className="relative">
                <div 
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all w-32 h-40 ${selectedImage === "catalog" ? "border-brand-500 shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}
                  onClick={() => setSelectedImage("catalog")}
                >
                  <img src={catalogImage} alt="Foto da catalogo" className="w-full h-full object-cover" />
                  {selectedImage === "catalog" && <div className="absolute top-1 right-1 bg-brand-500 text-white rounded-full p-1 shadow"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>}
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] p-1 text-center font-medium">Catalogo</div>
                </div>
                <button type="button" onClick={() => removeImage("catalog")} className="absolute -top-2 -left-2 bg-ink-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:opacity-80">×</button>
              </div>
            )}
            {!catalogImage && (
              <div className="flex items-center h-full pb-2">
                <button 
                  type="button" 
                  disabled={true}
                  className="text-xs bg-white border border-brand-200 text-brand-600 font-bold px-3 py-2 rounded-lg transition-colors opacity-50 cursor-not-allowed flex items-center gap-2"
                >
                  ✨ Foto da catalogo (non disponibile)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <form action={createWine} onSubmit={handleSubmit} className="space-y-6">
        
        {/* Campi nascosti per i dati JSON e wishlist */}
        <input type="hidden" name="organoleptic" value={formData.organoleptic} />
        <input type="hidden" name="taste_profile" value={formData.taste_profile} />
        <input type="hidden" name="wishlistId" value={wishlistId} />
        <input type="hidden" name="final_image" value={selectedImage === "real" ? (realImage || "") : selectedImage === "catalog" ? (catalogImage || "") : ""} />
        
        {/* Campi nascosti AI readonly */}
        <input type="hidden" name="grapes" value={formData.grapes} />
        <input type="hidden" name="description" value={formData.description} />
        <input type="hidden" name="origin_notes" value={formData.origin_notes} />
        <input type="hidden" name="vintage_review" value={formData.vintage_review} />
        <input type="hidden" name="ideal_temp" value={formData.ideal_temp} />
        <input type="hidden" name="decanting" value={formData.decanting} />
        <input type="hidden" name="glassware" value={formData.glassware} />
        <input type="hidden" name="maturation_start" value={formData.maturation_start} />
        <input type="hidden" name="maturation_end" value={formData.maturation_end} />

        {/* Card: Il Vino */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-sand-200">
          <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4">Il vino</h2>
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
        </div>

        {/* Card: Dettagli */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-sand-200">
          <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4">Dettagli</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-ink-500 uppercase">Tipologia *</label>
              <select name="color" value={formData.color} onChange={handleChange} required className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option value="" disabled>Seleziona tipologia</option>
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-semibold text-ink-500 uppercase">Prezzo acquisto (€)</label>
              <input name="purchase_price" type="number" step="0.01" value={formData.purchase_price} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="es. 15.50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase">Annata *</label>
              <select name="year" value={formData.year} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option value="">Seleziona annata</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase">Quantità *</label>
              <input name="quantity" type="number" min={1} value={formData.quantity} onChange={handleChange} required className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-ink-500 uppercase">Formato</label>
              <select name="format_ml" value={formData.format_ml} onChange={handleChange} className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white">
                <option value="187">Piccola (18,7cl)</option>
                <option value="375">Mezza (37,5cl)</option>
                <option value="750">Standard (75cl)</option>
                <option value="1500">Magnum (1,5L)</option>
                <option value="3000">Doppio Magnum (3L)</option>
              </select>
            </div>
            <div className="col-span-2">
              <EditableTextField 
                label="Note personali" 
                name="storage_notes" 
                value={formData.storage_notes} 
                onChange={handleChange} 
                placeholder="Le tue note personali su questo vino..." 
              />
            </div>
          </div>
        </div>

        {/* Card: Provenienza */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-sand-200">
          <h2 className="text-sm font-bold text-brand-600 uppercase tracking-wider mb-4">Provenienza</h2>
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
        </div>

        {/* Card: Dettagli Extra (AI) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-sand-200">
          <details className="group">
            <summary className="cursor-pointer font-bold text-brand-600 uppercase tracking-wider list-none flex items-center justify-between text-sm">
              Mostra dettagli extra (AI)
              <span className="text-brand-600 transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-6 space-y-6">
              
              <div className="space-y-4">
                {formData.grapes && (
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Uvaggio</label>
                    <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{formData.grapes}</p>
                  </div>
                )}
                
                {formData.description && (
                  <div className="border-t border-sand-100 pt-4">
                    <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Descrizione AI</label>
                    <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{formData.description}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-sand-100 pt-4">
                {formData.ideal_temp && (
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Temp. Ideale</label>
                    <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{formData.ideal_temp}</p>
                  </div>
                )}
                {formData.glassware && (
                  <div>
                    <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-2">Bicchiere</label>
                    <div className="flex items-center gap-3">
                      <GlassIcon text={formData.glassware} className="w-8 h-8 text-brand-600" />
                      <span className="text-sm font-bold text-ink-700">{getGlassLabel(formData.glassware)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {formData.decanting && (
                <div className="border-t border-sand-100 pt-4">
                  <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Decantazione</label>
                  <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{formData.decanting}</p>
                </div>
              )}

              {(formData.maturation_start !== "" || formData.maturation_end !== "") && (
                <div className="border-t border-sand-100 pt-4">
                  <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Finestra di maturazione</label>
                  <p className="text-sm text-ink-700 leading-relaxed">
                    {formData.year ? `Pronto dal ${Number(formData.year) + Number(formData.maturation_start)} al ${Number(formData.year) + Number(formData.maturation_end)}` : `Pronto tra ${formData.maturation_start}-${formData.maturation_end} anni dalla vendemmia`}
                  </p>
                </div>
              )}

              {(formData.origin_notes || formData.vintage_review) && (
                <div className="border-t border-sand-100 pt-4 space-y-4">
                  {formData.origin_notes && (
                    <div>
                      <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Note Terroir</label>
                      <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{formData.origin_notes}</p>
                    </div>
                  )}
                  {formData.vintage_review && (
                    <div>
                      <label className="block text-[10px] font-bold text-ink-500 uppercase tracking-wider mb-1">Recensione Annata</label>
                      <p className="text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">{formData.vintage_review}</p>
                    </div>
                  )}
                </div>
              )}
              
            </div>
          </details>
        </div>

        <button type="submit" className="w-full bg-brand-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-600 transition-colors shadow-sm">
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
