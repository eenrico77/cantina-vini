import { createClient } from "@/lib/supabase/server";
import WineDetailClient from "@/components/WineDetailClient";

export default async function WineDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6">Non autenticato</div>;
  }

  // Vino
  const { data: wine, error: wineError } = await supabase
    .from("wines")
    .select("*")
    .eq("user_id", user.id)
    .eq("id", params.id)
    .maybeSingle();

  if (wineError || !wine) {
    return <div className="p-6 text-center text-ink-500 mt-10">Vino non trovato</div>;
  }

  // Bottiglie (Annate)
  const { data: bottles, error: bottlesError } = await supabase
    .from("bottles")
    .select("*")
    .eq("user_id", user.id)
    .eq("wine_id", params.id)
    .order("year", { ascending: false });

  // Storico Bevute (Diary)
  const { data: diaryEntries } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("wine_id", params.id)
    .order("drunk_at", { ascending: false });

  if (bottlesError) {
    return <div className="p-6 text-center text-status-decline mt-10">Errore caricamento annate</div>;
  }

  return (
    <WineDetailClient 
      wine={wine} 
      bottles={bottles} 
      diaryEntries={diaryEntries} 
    />
  );
}
