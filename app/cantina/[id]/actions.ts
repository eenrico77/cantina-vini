"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function drinkBottleAction(formData: FormData) {
  const bottleId = formData.get("bottleId") as string;
  const wineId = formData.get("wineId") as string;
  const wineName = formData.get("wineName") as string;
  const producer = formData.get("producer") as string;
  const year = Number(formData.get("year"));
  const rating = formData.get("rating") ? Number(formData.get("rating")) : null;
  const notes = (formData.get("notes") as string) || null;

  if (!bottleId || !wineId) throw new Error("Mancano dati della bottiglia");

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Non autenticato");

  // Decrement quantity (sempre filtrato per user_id: bottles non ha RLS)
  const { data: currentBottle, error: fetchErr } = await supabase
    .from("bottles")
    .select("quantity")
    .eq("id", bottleId)
    .eq("user_id", auth.user.id)
    .single();

  if (fetchErr || !currentBottle) throw new Error("Bottiglia non trovata");

  const newQuantity = Math.max(0, currentBottle.quantity - 1);

  await supabase
    .from("bottles")
    .update({ quantity: newQuantity })
    .eq("id", bottleId)
    .eq("user_id", auth.user.id);

  // Insert into diary
  await supabase
    .from("diary_entries")
    .insert({
      user_id: auth.user.id,
      wine_id: parseInt(wineId, 10),
      bottle_id: parseInt(bottleId, 10),
      wine_name: wineName,
      producer,
      year,
      drunk_at: new Date().toISOString().split("T")[0],
      rating,
      notes
    });

  revalidatePath(`/cantina/${wineId}`);
  revalidatePath('/diary');
  revalidatePath('/stats');
}

export async function updateBottleValueAction(formData: FormData) {
  const bottleId = formData.get("bottleId") as string;
  const wineId = formData.get("wineId") as string;
  const currentValueRaw = formData.get("currentValue") as string;
  const currentValue = currentValueRaw ? Number(currentValueRaw) : null;

  if (!bottleId || !wineId) throw new Error("Mancano dati della bottiglia");

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Non autenticato");

  await supabase
    .from("bottles")
    .update({ current_value: currentValue })
    .eq("id", bottleId)
    .eq("user_id", auth.user.id);

  revalidatePath(`/cantina/${wineId}`);
  revalidatePath('/stats');
}
