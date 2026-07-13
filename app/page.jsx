import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { mapBottleFromDB } from "@/lib/adapters/bottleAdapter";
import FoodPairingForm from "@/components/FoodPairingForm";

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="p-6">Non autenticato</div>;
  }

  const { data, error } = await supabase
    .from("bottles")
    .select(
      `
      id, wine_id, user_id, cellar_id, year, quantity, format_ml,
      purchase_price, current_value, peak_start, peak_end, aging_status, notes, rating,
      wines ( id, name, producer, color, region, country, image_url )
    `
    )
    .eq("user_id", user.id)
    .order("id", { ascending: false })
    .limit(5);

  const bottles = error ? [] : (data ?? []).map(mapBottleFromDB);

  const { count: totalBottles } = await supabase
    .from("bottles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalValue = (data ?? []).reduce(
    (sum, b) => sum + (b.current_value ?? b.purchase_price ?? 0),
    0
  );

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">🍷 La tua cantina</h1>
        <p className="text-sm text-gray-500">Stato attuale della tua cantina</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-md px-4 py-5">
          <p className="text-xs text-slate-500 mb-1">Numero di bottiglie</p>
          <p className="text-3xl font-semibold">{totalBottles ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md px-4 py-5">
          <p className="text-xs text-slate-500 mb-1">Valore (ultime 5)</p>
          <p className="text-3xl font-semibold">{totalValue.toFixed(0)}€</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Azioni rapide</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/cantina/new" className="bg-white rounded-2xl shadow-md px-3 py-4 text-xs text-center block">
            <span className="block text-amber-700 font-semibold mb-1">＋</span>
            <span className="text-slate-700">Aggiungi bottiglia</span>
          </Link>
          <Link href="/wines" className="bg-white rounded-2xl shadow-md px-3 py-4 text-xs text-center block">
            <span className="block text-amber-700 font-semibold mb-1">🍷</span>
            <span className="text-slate-700">Vedi tutta la cantina</span>
          </Link>
        </div>
      </section>

      <FoodPairingForm />

      <section>
        <h2 className="text-base font-semibold mb-3">Aggiunte recenti</h2>

        <div className="grid grid-cols-1 gap-4">
          {bottles.map((b) => (
            <article key={b.id} className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="text-lg font-semibold">{b.wine?.name}</h3>
              <p className="text-gray-500 text-sm">{b.wine?.producer} — {b.year}</p>
              <div className="flex justify-between mt-3 text-gray-500 text-sm">
                <span>{b.wine?.region}</span>
                <span className="capitalize">{b.wine?.color}</span>
              </div>
            </article>
          ))}
        </div>

        {bottles.length === 0 && (
          <p className="text-gray-500 text-center mt-10">Nessun vino trovato 🍇</p>
        )}
      </section>
    </div>
  );
}
