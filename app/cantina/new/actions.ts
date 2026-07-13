"use server";

import { analyzeWineLabel, generateProfessionalWineImage } from "@/lib/ai/enrichWine";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateDefaultCellar } from "@/lib/supabase/getOrCreateDefaultCellar";
import { redirect } from "next/navigation";
import { getAgingStatus } from "@/lib/domain/maturation";

export async function analyzeLabelAction(formData: FormData) {
  const file = formData.get("image") as File;
  if (!file) throw new Error("Nessuna immagine fornita");
  
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;
  
  const result = await analyzeWineLabel(dataUri);
  return result;
}

export async function createWine(formData: FormData): Promise<void> {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const producer = formData.get("producer") as string;
  const color = formData.get("color") as string;
  const region = (formData.get("region") as string) || null;
  const country = (formData.get("country") as string) || null;
  const year = Number(formData.get("year"));
  const quantity = Number(formData.get("quantity") || 1);
  
  // AI fields
  const grapes = (formData.get("grapes") as string) || null;
  const description = (formData.get("description") as string) || null;
  const origin_notes = (formData.get("origin_notes") as string) || null;
  const vintage_review = (formData.get("vintage_review") as string) || null;
  const ideal_temp = (formData.get("ideal_temp") as string) || null;
  const decanting = (formData.get("decanting") as string) || null;
  const maturation_start = Number(formData.get("maturation_start"));
  const maturation_end = Number(formData.get("maturation_end"));
  
  const organolepticRaw = formData.get("organoleptic") as string;
  const tasteProfileRaw = formData.get("taste_profile") as string;
  const organoleptic = organolepticRaw ? JSON.parse(organolepticRaw) : null;
  const taste_profile = tasteProfileRaw ? JSON.parse(tasteProfileRaw) : null;

  if (!name || !producer || !color || !Number.isFinite(year)) {
    throw new Error("Dati mancanti: Nome, Produttore, Tipologia e Anno sono obbligatori.");
  }

  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Not authenticated");
  const userId = auth.user.id;

  const { data: existingWine } = await supabase
    .from("wines")
    .select("id, image_url")
    .eq("user_id", userId)
    .eq("name", name)
    .eq("producer", producer)
    .maybeSingle();

  let wineId: number;
  let imageUrl: string | null = existingWine?.image_url || null;

  if (existingWine?.id) {
    wineId = existingWine.id;
  } else {
    const { data: wine, error: insertWineError } = await supabase
      .from("wines")
      .insert({
        user_id: userId,
        name,
        producer,
        color,
        region,
        country,
        grapes,
        description,
        origin_notes,
        vintage_review,
        ideal_temp,
        decanting_needed: decanting === "Sì" || decanting === "true" || decanting === "Yes",
        organoleptic,
        taste_profile,
        ai_generated: true,
      })
      .select("id, image_url")
      .single();

    if (insertWineError || !wine) {
      throw new Error(insertWineError?.message ?? "Creazione vino fallita");
    }

    wineId = wine.id;
    imageUrl = wine.image_url;
  }

  const cellarId = await getOrCreateDefaultCellar(supabase, userId);

  let peakStart = null;
  let peakEnd = null;
  let agingStatus = null;

  if (Number.isFinite(maturation_start) && Number.isFinite(maturation_end)) {
    peakStart = year + maturation_start;
    peakEnd = year + maturation_end;
    agingStatus = getAgingStatus(new Date().getFullYear(), peakStart, peakEnd);
  }

  const { data: bottle, error: insertBottleError } = await supabase
    .from("bottles")
    .insert({
      wine_id: wineId,
      user_id: userId,
      cellar_id: cellarId,
      year,
      quantity,
      peak_start: peakStart,
      peak_end: peakEnd,
      aging_status: agingStatus
    })
    .select("id")
    .single();

  if (insertBottleError || !bottle) {
    throw new Error(insertBottleError?.message ?? "Creazione bottiglia fallita");
  }

  if (!imageUrl) {
    try {
      const newImage = await generateProfessionalWineImage(name, producer, color);
      if (newImage) {
        await supabase.from("wines").update({ image_url: newImage }).eq("id", wineId);
      }
    } catch (e) {
      console.warn("Immagine non generata", e);
    }
  }

  redirect(`/cantina/${wineId}`);
}
