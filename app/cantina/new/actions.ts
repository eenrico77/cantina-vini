"use server";

import { analyzeWineLabel, generateProfessionalWineImage } from "@/lib/ai/enrichWine";
import { waitUntil } from "@vercel/functions";
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
  return { ...result, originalImage: dataUri };
}

export async function generateCatalogImageAction(name: string, producer: string, color: string) {
  if (!name || !producer || !color) throw new Error("Dati mancanti per generare l'immagine da catalogo");
  const result = await generateProfessionalWineImage(name, producer, color);
  return result; // base64 data URI
}

export async function createWine(formData: FormData): Promise<void> {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const producer = formData.get("producer") as string;
  const color = formData.get("color") as string;
  const region = (formData.get("region") as string) || null;
  const country = (formData.get("country") as string) || null;
  const yearRaw = formData.get("year") as string;
  const year: number | null = yearRaw ? Number(yearRaw) : null;
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
  const glassware = (formData.get("glassware") as string) || null;
  
  const purchasePriceRaw = formData.get("purchase_price") as string;
  const purchase_price = purchasePriceRaw ? Number(purchasePriceRaw) : null;
  
  const organolepticRaw = formData.get("organoleptic") as string;
  const tasteProfileRaw = formData.get("taste_profile") as string;
  const organoleptic = organolepticRaw ? JSON.parse(organolepticRaw) : null;
  const taste_profile = tasteProfileRaw ? JSON.parse(tasteProfileRaw) : null;
  const wishlistId = formData.get("wishlistId") as string;
  const finalImageBase64 = formData.get("final_image") as string;

  if (!name || !producer || !color) {
    throw new Error("Dati mancanti: Nome, Produttore e Tipologia sono obbligatori.");
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
        decanting_needed: Boolean(decanting && decanting.trim().length > 0),
        glassware,
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

  if (year && Number.isFinite(maturation_start) && Number.isFinite(maturation_end)) {
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
      purchase_price,
      peak_start: peakStart,
      peak_end: peakEnd,
      aging_status: agingStatus
    })
    .select("id")
    .single();

  if (insertBottleError || !bottle) {
    throw new Error(insertBottleError?.message ?? "Creazione bottiglia fallita");
  }

  if (finalImageBase64 && finalImageBase64.startsWith("data:image/")) {
    const matches = finalImageBase64.match(/^data:(image\/[A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, "base64");
      
      const ext = mimeType.split("/")[1] || "png";
      const fileName = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("wine-images")
        .upload(fileName, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("wine-images")
          .getPublicUrl(fileName);
        
        if (publicUrlData?.publicUrl) {
          await supabase.from("wines").update({ image_url: publicUrlData.publicUrl }).eq("id", wineId);
        }
      } else {
        console.error("Errore upload immagine:", uploadError);
      }
    }
  }

  if (wishlistId) {
    const { error: delErr } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", wishlistId)
      .eq("user_id", userId);
    if (delErr) console.error("Errore cancellazione wishlist:", delErr);
  }

  redirect(`/cantina/${wineId}`);
}
