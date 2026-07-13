import { createClient } from "@/lib/supabase/server";
import { mapBottleFromDB } from "@/lib/adapters/bottleAdapter";
import WineCard from "@/components/Winecard";
import WineListClient from "@/components/WineListClient";
import Link from "next/link";

export default async function WinesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div style={{ padding: 24 }}>Non autenticato</div>;
  }

  const { data, error } = await supabase
    .from("bottles")
    .select(
      `
      id,
      wine_id,
      user_id,
      cellar_id,
      year,
      quantity,
      format_ml,
      purchase_price,
      current_value,
      peak_start,
      peak_end,
      aging_status,
      notes,
      rating,
      wines (
        id,
        name,
        producer,
        color,
        region,
        country,
        image_url,
        ideal_temp,
        decanting_needed,
        storage_position,
        storage_temperature,
        storage_humidity,
        storage_notes,
        maturation_confidence,
        ai_generated
      )
    `
    )
    .eq("user_id", user.id)
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return <div style={{ padding: 24 }}>Errore caricamento cantina</div>;
  }

  const bottles = (data ?? []).map(mapBottleFromDB);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">La tua cantina</h1>
          <p className="text-sm text-gray-500 mt-1">
            {bottles.length} {bottles.length === 1 ? "bottiglia" : "bottiglie"} totali
          </p>
        </div>
        <Link
          href="/cantina/new"
          className="bg-black text-white text-sm px-5 py-2.5 rounded-full font-medium shadow-md hover:bg-gray-800 transition-colors"
        >
          + Aggiungi Vino
        </Link>
      </div>

      <WineListClient bottles={bottles} />
    </div>
  );
}
