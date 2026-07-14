import { createClient } from "@/lib/supabase/server";
import NotAuthenticated from "@/components/NotAuthenticated";

const AGING_LABELS: Record<string, string> = {
  too_young: "Giovane",
  almost_ready: "Quasi pronto",
  ready: "Pronto ora",
  past_peak: "In declino",
  Sconosciuto: "Sconosciuto",
};

export default async function StatsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <NotAuthenticated />;

  // Fetch bottles
  const { data: bottles } = await supabase
    .from("bottles")
    .select(`
      quantity, current_value, purchase_price, aging_status,
      wine:wines(color)
    `)
    .eq("user_id", user.id);

  // Fetch diary count
  const { count: drunkCount } = await supabase
    .from("diary_entries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const inventory = (bottles || []).filter(b => b.quantity > 0);
  
  const totalBottles = inventory.reduce((acc, b) => acc + b.quantity, 0);
  const totalValue = inventory.reduce((acc, b) => acc + ((b.current_value || b.purchase_price || 0) * b.quantity), 0);
  
  const byColor = inventory.reduce((acc, b) => {
    // @ts-ignore
    const c = b.wine?.color || "Sconosciuto";
    acc[c] = (acc[c] || 0) + b.quantity;
    return acc;
  }, {} as Record<string, number>);

  const byAging = inventory.reduce((acc, b) => {
    const status = b.aging_status || "Sconosciuto";
    acc[status] = (acc[status] || 0) + b.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 mb-20">
      <h1 className="text-3xl font-extrabold text-ink-700">Statistiche</h1>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-sand-200">
          <p className="text-xs text-ink-500 font-semibold mb-1 uppercase tracking-wider">In Cantina</p>
          <p className="text-3xl font-black">{totalBottles}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-sand-200">
          <p className="text-xs text-ink-500 font-semibold mb-1 uppercase tracking-wider">Valore Stimato</p>
          <p className="text-3xl font-black">{totalValue.toFixed(0)}€</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-sand-200 col-span-2">
          <p className="text-xs text-ink-500 font-semibold mb-1 uppercase tracking-wider text-center">Bottiglie Bevute</p>
          <p className="text-3xl font-black text-center">{drunkCount || 0}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Per Tipologia</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-sand-200 space-y-2">
          {Object.entries(byColor).map(([color, qty]) => (
            <div key={color} className="flex justify-between items-center">
              <span className="text-sm font-medium">{color}</span>
              <span className="text-sm font-bold bg-sand-100 px-2 py-0.5 rounded-full">{qty}</span>
            </div>
          ))}
          {Object.keys(byColor).length === 0 && <p className="text-sm text-ink-500">Nessun dato</p>}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Per Maturazione</h2>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-sand-200 space-y-2">
          {Object.entries(byAging).map(([status, qty]) => (
            <div key={status} className="flex justify-between items-center">
              <span className="text-sm font-medium">{AGING_LABELS[status] || status}</span>
              <span className="text-sm font-bold bg-sand-100 px-2 py-0.5 rounded-full">{qty}</span>
            </div>
          ))}
          {Object.keys(byAging).length === 0 && <p className="text-sm text-ink-500">Nessun dato</p>}
        </div>
      </div>
    </div>
  );
}
