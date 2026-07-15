import { createClient } from "@/lib/supabase/server";
import NotAuthenticated from "@/components/NotAuthenticated";
import EmptyState from "@/components/EmptyState";

export default async function DiaryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <NotAuthenticated />;

  const { data: entries, error } = await supabase
    .from("diary_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("drunk_at", { ascending: false });

  if (error) return <div className="p-6 text-red-500">Errore: {error.message}</div>;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 mb-20">
      <h1 className="text-3xl font-extrabold text-ink-700">Diario Bevute</h1>
      
      {!entries || entries.length === 0 ? (
        <EmptyState
          emoji="📖"
          title="Il tuo diario è ancora vuoto"
          subtitle="Ogni volta che segni una bottiglia come bevuta dalla scheda del vino, la trovi qui con voto e note."
          ctaLabel="Vai alla tua cantina"
          ctaHref="/wines"
        />
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-sand-200">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-lg">{entry.wine_name}</h3>
                  <p className="text-sm text-ink-500">{entry.producer} — {entry.year}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-sand-100 px-2 py-1 rounded text-ink-500">{new Date(entry.drunk_at).toLocaleDateString()}</span>
                  {entry.rating ? <div className="mt-1 font-medium text-amber-500">{"★".repeat(entry.rating)}</div> : null}
                </div>
              </div>
              {entry.notes && <p className="text-sm text-ink-500 bg-sand-50 p-3 rounded-lg italic mt-2">"{entry.notes}"</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
