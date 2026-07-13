"use server";

import { enrichWineWithAI } from "@/lib/ai/enrichWine";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultCellar } from "@/lib/supabase/getOrCreateDefaultCellar";
import { redirect } from "next/navigation";

export async function createWine(formData: FormData): Promise<void> {
  const supabase = createClient();

  // 1. LEGGIAMO I DATI DAL FORM
  const name = formData.get("name") as string;
  const producer = formData.get("producer") as string;
  const color = formData.get("color") as string;
  const region = (formData.get("region") as string) || null;
  const country = (formData.get("country") as string) || null;
  const year = Number(formData.get("year"));
  const quantity = Number(formData.get("quantity") || 1);

  if (!name || !producer || !color || !Number.isFinite(year)) {
    throw new Error("Dati mancanti: assicurati che Nome, Produttore, Tipologia e Anno siano inseriti.");
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Not authenticated");
  const userId = auth.user.id;

  // 2. TROVA (O CREA) IL VINO CONCETTUALE
  //    Un vino può avere più annate/bottiglie: se esiste già per questo utente
  //    (stesso nome+produttore), riusiamo quello invece di duplicarlo.
  const { data: existingWine, error: findWineError } = await supabase
    .from("wines")
    .select("id")
    .eq("user_id", userId)
    .eq("name", name)
    .eq("producer", producer)
    .maybeSingle();

  if (findWineError) {
    console.error("SUPABASE FIND WINE ERROR:", findWineError);
    throw new Error(findWineError.message);
  }

  let wineId: number = existingWine?.id;

  if (!wineId) {
    const { data: wine, error: insertWineError } = await supabase
      .from("wines")
      .insert({
        user_id: userId,
        name,
        producer,
        color,
        region,
        country,
        ai_generated: false,
      })
      .select("id")
      .single();

    if (insertWineError || !wine) {
      console.error("SUPABASE INSERT WINE ERROR:", insertWineError);
      throw new Error(insertWineError?.message ?? "Creazione vino fallita");
    }

    wineId = wine.id;
  }

  // 3. LA BOTTIGLIA POSSEDUTA VA SEMPRE IN "bottles", MAI SOLO SU "wines"
  const cellarId = await getOrCreateDefaultCellar(supabase, userId);

  const { data: bottle, error: insertBottleError } = await supabase
    .from("bottles")
    .insert({
      wine_id: wineId,
      user_id: userId,
      cellar_id: cellarId,
      year,
      quantity,
    })
    .select("id")
    .single();

  if (insertBottleError || !bottle) {
    console.error("SUPABASE INSERT BOTTLE ERROR:", insertBottleError);
    throw new Error(insertBottleError?.message ?? "Creazione bottiglia fallita");
  }

  // 4. ARRICCHIMENTO AI (ASYNC) — la maturazione è per annata, va sulla bottiglia;
  //    le info di servizio/conservazione valgono per il vino in generale.
  try {
    const enriched = await enrichWineWithAI(name, producer, year);

    if (enriched) {
      await supabase
        .from("bottles")
        .update({
          peak_start: enriched.aging.peak_start,
          peak_end: enriched.aging.peak_end,
          aging_status: enriched.aging.status,
        })
        .eq("id", bottle.id);

      await supabase
        .from("wines")
        .update({
          ideal_temp: enriched.wine.ideal_temp,
          decanting_needed: enriched.wine.decanting_needed,
          storage_position: enriched.wine.storage_position,
          storage_temperature: enriched.wine.storage_temperature,
          storage_humidity: enriched.wine.storage_humidity,
          storage_notes: enriched.wine.storage_notes,
          maturation_confidence: enriched.aging.confidence,
          ai_generated: true,
        })
        .eq("id", wineId);
    }
  } catch (aiError) {
    console.warn("AI Enrichment failed, but wine/bottle were saved:", aiError);
  }

  // 5. REDIRECT ALLA SCHEDA DEL VINO APPENA CREATO/AGGIORNATO
  redirect(`/cantina/${wineId}`);
}
