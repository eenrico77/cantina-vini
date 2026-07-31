// Genera una foto professionale per ciascuna categoria di cibo usata in /abbinamento
// e la salva in public/Foods/<id>.jpg. Da eseguire una tantum (o quando si aggiungono
// nuove categorie): node scripts/generate-food-images.mjs
import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    const value = rawValue.replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

const CATEGORIES = [
  { id: "carne-rossa", prompt: "a perfectly grilled thick red meat steak, sliced, resting on a dark wooden board" },
  { id: "pollame", prompt: "roasted golden-brown chicken thighs with crispy skin on a rustic plate" },
  { id: "pesce", prompt: "a whole grilled sea bass fish with lemon and herbs on a white plate" },
  { id: "pasta-risotti", prompt: "a creamy risotto with mushrooms in a shallow bowl, steam rising" },
  { id: "pizza", prompt: "a Neapolitan margherita pizza with fresh basil, straight out of the oven" },
  { id: "formaggi-salumi", prompt: "an elegant wooden board with assorted cheeses, cured meats and grapes" },
  { id: "verdure", prompt: "a colorful plate of grilled and roasted seasonal vegetables" },
  { id: "dolci", prompt: "a slice of rich chocolate layer cake with a dusting of cocoa powder" },
];

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY mancante in .env.local");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const outDir = path.join(process.cwd(), "public", "Foods");
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

for (const { id, prompt } of CATEGORIES) {
  const fullPrompt = `A single, appetizing, professional food-photography style photo of ${prompt}. Natural light, shallow depth of field, neutral warm background, no people, no hands, no text, no logos, high-end editorial food photography.`;
  console.log(`Generando: ${id}...`);
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: { parts: [{ text: fullPrompt }] },
    config: { imageConfig: { aspectRatio: "4:3" } },
  });
  const parts = response.candidates?.[0]?.content?.parts;
  const imagePart = parts?.find((p) => p.inlineData);
  if (!imagePart?.inlineData?.data) {
    console.error(`  Nessuna immagine restituita per ${id}, salto.`);
    continue;
  }
  const buffer = Buffer.from(imagePart.inlineData.data, "base64");
  const outPath = path.join(outDir, `${id}.jpg`);
  writeFileSync(outPath, buffer);
  console.log(`  Salvata in public/Foods/${id}.jpg`);
}

console.log("Fatto.");
