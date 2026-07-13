import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_CELLAR_NAME = "Cantina predefinita";

/**
 * bottles.cellar_id è NOT NULL con FK verso cellars(id).
 * Finché non esiste una UI per gestire più cantine/celle, garantiamo che
 * ogni utente abbia sempre almeno una cellar valida da usare come default.
 */
export async function getOrCreateDefaultCellar(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data: existing, error: findError } = await supabase
    .from("cellars")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (findError) {
    throw new Error(`Impossibile leggere le cellar: ${findError.message}`);
  }

  if (existing?.id) {
    return existing.id as string;
  }

  const { data: created, error: createError } = await supabase
    .from("cellars")
    .insert({ user_id: userId, name: DEFAULT_CELLAR_NAME })
    .select("id")
    .single();

  if (createError || !created) {
    throw new Error(
      `Impossibile creare la cellar predefinita: ${createError?.message ?? "errore sconosciuto"}`
    );
  }

  return created.id as string;
}
