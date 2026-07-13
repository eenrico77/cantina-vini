"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addWishlistItem(formData: FormData) {
  const name = formData.get("name") as string;
  const producer = formData.get("producer") as string;
  if (!name || !producer) throw new Error("Nome e produttore richiesti");

  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Non autenticato");

  await supabase.from("wishlist_items").insert({
    user_id: auth.user.id,
    name,
    producer,
    region: formData.get("region") || null,
    country: formData.get("country") || null,
    color: formData.get("color") || null,
    year: formData.get("year") ? Number(formData.get("year")) : null,
    notes: formData.get("notes") || null
  });

  revalidatePath('/wishlist');
}

export async function deleteWishlistItem(id: string) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) throw new Error("Non autenticato");

  await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.user.id);
  revalidatePath('/wishlist');
}
