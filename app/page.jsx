import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import NotAuthenticated from "@/components/NotAuthenticated";
import { mapBottleFromDB } from "@/lib/adapters/bottleAdapter";
import { getAgingStatus } from "@/lib/domain/maturation";


export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <NotAuthenticated />;
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

  const { data: allBottlesData } = await supabase
    .from("bottles")
    .select(`id, year, quantity, peak_start, peak_end, wines ( id, name, producer, color )`)
    .eq("user_id", user.id)
    .gt("quantity", 0);

  const currentYear = new Date().getFullYear();
  const readyBottles = (allBottlesData ?? [])
    .filter(b => b.peak_start && b.peak_end && getAgingStatus(currentYear, b.peak_start, b.peak_end) === "ready")
    .slice(0, 3);

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="font-serif text-2xl font-bold inline-block border-b-2 border-brand-600 pb-1">🍷 La tua cantina</h1>
        <p className="text-sm text-ink-500">Stato attuale della tua cantina</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        <div className="bg-sand-100 rounded-2xl shadow-md px-4 py-5">
          <p className="text-xs text-slate-500 mb-1">Numero di bottiglie</p>
          <p className="text-3xl font-semibold">{totalBottles ?? 0}</p>
        </div>
        <div className="bg-sand-100 rounded-2xl shadow-md px-4 py-5">
          <p className="text-xs text-slate-500 mb-1">Valore (ultime 5)</p>
          <p className="text-3xl font-semibold">{totalValue.toFixed(0)}€</p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Azioni rapide</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/cantina/new" className="bg-sand-100 rounded-2xl shadow-md px-3 py-4 text-xs text-center block">
            <span className="block text-amber-700 font-semibold mb-1">＋</span>
            <span className="text-slate-700">Aggiungi bottiglia</span>
          </Link>
          <Link href="/wines" className="bg-sand-100 rounded-2xl shadow-md px-3 py-4 text-xs text-center block">
            <span className="block text-amber-700 font-semibold mb-1">🍷</span>
            <span className="text-slate-700">Vedi tutta la cantina</span>
          </Link>
        </div>
      </section>

      {readyBottles.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">🍷 Pronti da bere ora</h2>
          <div className="grid grid-cols-1 gap-3">
            {readyBottles.map((b) => (
              <Link key={b.id} href={`/cantina/${b.wines?.id}`} className="block bg-sand-100 rounded-2xl shadow-sm p-3 flex items-center justify-between hover:border-brand-300 border border-transparent transition-colors">
                <div>
                  <p className="font-semibold text-ink-700 text-sm">{b.wines?.name}</p>
                  <p className="text-ink-500 text-xs">{b.wines?.producer} — {b.year}</p>
                </div>
                <span className="text-[10px] font-bold bg-status-ready/10 text-status-ready px-2 py-1 rounded-full uppercase tracking-wide">Pronto ora</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link href="/abbinamento" className="block bg-ink-700 hover:bg-ink-500 text-white rounded-2xl shadow-md px-5 py-4 text-center font-bold transition-colors">
        🍽️ Abbina il tuo vino al cibo
      </Link>

      <section>
        <h2 className="text-base font-semibold mb-3">Aggiunte recenti</h2>

        <div className="grid grid-cols-1 gap-4">
          {bottles.slice(0, 3).map((b) => (
            <Link key={b.id} href={`/cantina/${b.wine?.id}`} className="block bg-sand-100 rounded-2xl shadow-md p-4 hover:border-brand-300 border border-transparent transition-colors">
              <h3 className="text-lg font-semibold">{b.wine?.name}</h3>
              <p className="text-ink-500 text-sm">{b.wine?.producer} — {b.year}</p>
              <div className="flex justify-between mt-3 text-ink-500 text-sm">
                <span>{b.wine?.region}</span>
                <span className="capitalize">{b.wine?.color}</span>
              </div>
            </Link>
          ))}
        </div>

        {bottles.length === 0 && (
          <p className="text-ink-500 text-center mt-10">Nessun vino trovato 🍇</p>
        )}
      </section>
    </div>
  );
}
