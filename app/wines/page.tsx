import { createClient } from "@/lib/supabase/server";
import { mapBottleFromDB } from "@/lib/adapters/bottleAdapter";
import WineCard from "@/components/Winecard";
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
    <div style={{ padding: 24, maxWidth: 600 }} className="mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">La tua cantina</h1>
          <p className="text-sm text-gray-500">
            {bottles.length} {bottles.length === 1 ? "bottiglia" : "bottiglie"}
          </p>
        </div>
        <Link
          href="/cantina/new"
          className="bg-black text-white text-sm px-4 py-2 rounded-full"
        >
          + Aggiungi
        </Link>
      </div>

      {bottles.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Cantina vuota 🍷</p>
      ) : (
        <div className="space-y-3">
          {bottles.map((bottle) => (
            <WineCard key={bottle.id} bottle={bottle} />
          ))}
        </div>
      )}
    </div>
  );
}
