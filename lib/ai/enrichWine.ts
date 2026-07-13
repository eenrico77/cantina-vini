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
      body: { type: Type.INTEGER }, intensity: { type: Type.INTEGER }, tannins: { type: Type.INTEGER },
      acidity: { type: Type.INTEGER }, persistence: { type: Type.INTEGER }, alcohol: { type: Type.NUMBER }
    },
    required: ["body", "intensity", "tannins", "acidity", "persistence", "alcohol"]
  }
};

export async function analyzeWineLabel(base64Image: string) {
  if (!process.env.GEMINI_API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [
      { inlineData: { mimeType: "image/jpeg", data: base64Image.split(",")[1] } },
      { text: "Identifica questo vino dall'etichetta. Estrai i dati per creare una scheda tecnica professionale completa, includendo recensione dell'annata e dettagli sul terroir. Ignora l'annata specifica della foto se non è chiara, concentrati sul vino." }
    ]},
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: WINE_SCHEMA_PROPERTIES, required: ["name", "producer", "color"] } }
  });
  return response.text ? JSON.parse(response.text) : null;
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

export async function getFoodPairingRecommendation(food: string, inventory: any[]) {
  if (!process.env.GEMINI_API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const wineList = inventory.map(b => ({ id: b.id, wineName: b.wine?.name, producer: b.wine?.producer, year: b.year, color: b.wine?.color }));
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Agisci come un sommelier personale. L'utente vuole mangiare: "${food}".
    In cantina ha SOLO questi vini: ${JSON.stringify(wineList)}.
    Scegli le 2 migliori opzioni dalla lista fornita (non suggerire vini esterni). Spiega perché.`,
    config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: {
      classic: { type: Type.OBJECT, properties: { bottleId: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["bottleId", "explanation"] },
      daring: { type: Type.OBJECT, properties: { bottleId: { type: Type.STRING }, explanation: { type: Type.STRING } }, required: ["bottleId", "explanation"] }
    }, required: ["classic", "daring"] } }
  });
  return response.text ? JSON.parse(response.text) : null;
}
