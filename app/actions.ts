"use server";

import { createClient } from "@/lib/supabase/server";
import { getFoodPairingRecommendation } from "@/lib/ai/enrichWine";
import { redirect } from "next/navigation";

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function getPairingAction(food: string) {
  if (!food) throw new Error("Inserisci il cibo");

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Non autenticato");

  // Fetch all bottles in stock for the user
  const { data: bottles, error } = await supabase
    .from("bottles")
    .select(`
      id, year, quantity,
      wine:wines ( id, name, producer, color )
    `)
    .eq("user_id", auth.user.id)
    .gt("quantity", 0);

  if (error) throw new Error("Errore nel recupero della cantina");

  if (!bottles || bottles.length === 0) {
    return { empty: true };
  }

  // The AI needs an inventory list (id is bottle.id)
  const recommendation = await getFoodPairingRecommendation(food, bottles);
  
  if (!recommendation) {
    throw new Error("Errore durante la generazione dell'abbinamento (AI non ha risposto)");
  }

  const getWine = (w: any) => Array.isArray(w) ? w[0] : w;
  const enrichOption = (opt: any) => {
    const bottle = bottles.find(b => b.id.toString() === opt.bottleId?.toString());
    const w = getWine(bottle?.wine);
    return {
      bottleId: opt.bottleId,
      explanation: opt.explanation,
      wineName: w?.name,
      producer: w?.producer,
      year: bottle?.year,
      wineId: w?.id
    };
  };

  return {
    classic: enrichOption(recommendation.classic),
    daring: enrichOption(recommendation.daring)
  };
}

export async function changePasswordAction(formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || password.length < 6) {
    return { error: "La password deve essere di almeno 6 caratteri." };
  }
  if (password !== confirmPassword) {
    return { error: "Le password non coincidono." };
  }

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) return { error: "Non autenticato" };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
