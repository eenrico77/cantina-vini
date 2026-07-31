import { GoogleGenAI, Type, Schema } from "@google/genai";

const WINE_SCHEMA_PROPERTIES: Record<string, Schema> = {
  name: { type: Type.STRING },
  producer: { type: Type.STRING },
  color: { type: Type.STRING, description: "Uno tra: Rosso, Bianco, Bollicine, Rosato, Dolce" },
  region: { type: Type.STRING },
  country: { type: Type.STRING },
  grapes: { type: Type.STRING },
  maturation_start: { type: Type.INTEGER, description: "Quanti anni dopo la vendemmia inizia la beva ideale" },
  maturation_peak: { type: Type.INTEGER, description: "Quanti anni dopo la vendemmia è il picco" },
  maturation_end: { type: Type.INTEGER, description: "Quanti anni dopo la vendemmia inizia il declino" },
  ideal_temp: { type: Type.STRING },
  decanting: { type: Type.STRING },
  glassware: { type: Type.STRING },
  description: { type: Type.STRING },
  origin_notes: { type: Type.STRING, description: "Informazioni approfondite sul terroir, la zona di produzione e la storia del vigneto." },
  vintage_review: { type: Type.STRING, description: "Un breve riassunto critico sulla qualità dell'annata in generale per questo vino." },
  organoleptic: {
    type: Type.OBJECT,
    properties: { visual: { type: Type.STRING }, olfactory: { type: Type.STRING }, gustatory: { type: Type.STRING } },
    required: ["visual", "olfactory", "gustatory"]
  },
  taste_profile: {
    type: Type.OBJECT,
    properties: {
      body: { type: Type.INTEGER, description: "Corpo del vino, intero da 1 (leggero) a 10 (corposo)" },
      intensity: { type: Type.INTEGER, description: "Intensità aromatica, intero da 1 (delicato) a 10 (intenso)" },
      tannins: { type: Type.INTEGER, description: "Tannicità, intero da 1 (morbido) a 10 (deciso)" },
      acidity: { type: Type.INTEGER, description: "Acidità, intero da 1 (rotondo) a 10 (fresco)" },
      persistence: { type: Type.INTEGER, description: "Persistenza gustativa, intero da 1 (breve) a 10 (lunga)" },
      alcohol: { type: Type.NUMBER }
    },
    required: ["body", "intensity", "tannins", "acidity", "persistence", "alcohol"]
  },
  flavor_notes: {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "Scegli 2 o 3 categorie di sapore SOLO da questa lista chiusa (scrivi esattamente la chiave, senza inventarne altre): mela-pera, agrumi, frutta-rossa, frutta-tropicale, fiori, spezie-legno, miele-frutta-secca, minerale-lievito"
  },
  food_pairings: {
    type: Type.ARRAY,
    items: { type: Type.STRING },
    description: "3-5 abbinamenti gastronomici specifici e realistici per QUESTO vino, basati sul suo reale profilo gustativo (corpo, tannini, acidità, aromi) e non genericamente sul solo colore. Es. 'Tagliata di manzo al rosmarino', non solo 'Carne rossa'."
  },
  recognized: { type: Type.BOOLEAN, description: "true solo se l'immagine mostra chiaramente e per intero un'etichetta di vino leggibile, false altrimenti" }
};

export async function analyzeWineLabel(base64Image: string) {
  if (!process.env.GEMINI_API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [
      { inlineData: { mimeType: "image/jpeg", data: base64Image.split(",")[1] } },
      { text: "Identifica questo vino dall'etichetta. Estrai i dati per creare una scheda tecnica professionale completa, includendo recensione dell'annata e dettagli sul terroir. Ignora l'annata specifica della foto se non è chiara, concentrati sul vino. Se l'immagine non mostra chiaramente un'etichetta di vino reale e leggibile (es. persone, animali, oggetti non pertinenti, o testo illeggibile per sfocatura/angolazione), imposta recognized a false e lascia vuoti tutti gli altri campi. Non inventare dati se non sei sicuro di poterli leggere realmente." }
    ]},
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: WINE_SCHEMA_PROPERTIES, required: ["recognized"] } }
  });
  const parsed = response.text ? JSON.parse(response.text) : null;
  if (parsed && parsed.recognized === false) {
    throw new Error("Non riesco a riconoscere un'etichetta di vino in questa foto. Riprova con un'inquadratura frontale, ben illuminata e a fuoco.");
  }
  return parsed;
}

export async function generateProfessionalWineImage(name: string, producer: string, color: string) {
  if (!process.env.GEMINI_API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `A single, clean, professional catalog-style studio photograph of a bottle of ${color} wine. The bottle is "${name}" by "${producer}". Centered, neutral soft gray background, elegant lighting, no people, no hands, high-end product photography.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "3:4" } }
  });
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) for (const part of parts) if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  return null;
}

export async function getFoodPairingFull(food: string, inventory: any[]) {
  if (!process.env.GEMINI_API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const wineList = inventory.map(b => ({
    id: b.id,
    wineName: b.wine?.name,
    producer: b.wine?.producer,
    year: b.year,
    color: b.wine?.color,
    tasteProfile: b.wine?.taste_profile,
    flavorNotes: b.wine?.flavor_notes,
  }));
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agisci come un sommelier personale. L'utente vuole mangiare: "${food}".
    In cantina ha questi vini: ${JSON.stringify(wineList)}. Ogni vino include, quando disponibile, tasteProfile (corpo, intensità, tannini, acidità, persistenza, alcol da 1 a 10) e flavorNotes: usa questi dati reali per un abbinamento preciso, non basarti solo su nome/colore.
    Fai due cose:
    1. Se c'è un abbinamento sensato, scegli le 2 migliori opzioni SOLO dalla lista fornita (non inventare vini che non sono in lista). Per ciascuna stima anche un matchScore da 0 a 100 basato sull'aderenza reale del profilo gustativo al piatto. Se non c'è nulla di adatto in cantina, lascia bottleId vuoto.
    2. Suggerisci anche 2 tipologie di vino generiche (non legate alla cantina) che si abbinerebbero bene: descrivi lo stile/vitigno/regione indicativa da cercare in enoteca, NON un prodotto specifico da comprare online.`,
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: {
      classic: { type: Type.OBJECT, properties: { bottleId: { type: Type.STRING }, explanation: { type: Type.STRING }, matchScore: { type: Type.INTEGER } } },
      daring: { type: Type.OBJECT, properties: { bottleId: { type: Type.STRING }, explanation: { type: Type.STRING }, matchScore: { type: Type.INTEGER } } },
      toDiscover: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: {
        style: { type: Type.STRING, description: "es. 'Sauvignon Blanc della Nuova Zelanda'" },
        explanation: { type: Type.STRING }
      }, required: ["style", "explanation"] } }
    }, required: ["toDiscover"] } }
  });
  return response.text ? JSON.parse(response.text) : null;
}

export async function generateWineFoodPairings(wine: { name: string; color: string; taste_profile?: any; flavor_notes?: string[]; organoleptic?: any }) {
  if (!process.env.GEMINI_API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agisci come un sommelier personale. Questo è il vino: ${JSON.stringify(wine)}.
    Suggerisci 3-5 abbinamenti gastronomici specifici e realistici basati sul suo reale profilo gustativo (corpo, tannini, acidità, aromi), non genericamente sul solo colore. Es. "Tagliata di manzo al rosmarino", non solo "Carne rossa".`,
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: {
      food_pairings: { type: Type.ARRAY, items: { type: Type.STRING } }
    }, required: ["food_pairings"] } }
  });
  const parsed = response.text ? JSON.parse(response.text) : null;
  return parsed?.food_pairings ?? null;
}
