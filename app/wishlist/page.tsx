import { createClient } from "@/lib/supabase/server";
import { addWishlistItem } from "./actions";
import WishlistClientList from "@/components/WishlistClientList";

export default async function WishlistPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="p-6">Non autenticato</div>;

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 mb-20">
      <h1 className="text-3xl font-extrabold text-gray-900">Wishlist</h1>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h2 className="font-bold mb-4">Aggiungi vino desiderato</h2>
        <form action={addWishlistItem} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="name" placeholder="Nome vino *" required className="border p-2 rounded-lg text-sm outline-none focus:border-black" />
            <input name="producer" placeholder="Produttore *" required className="border p-2 rounded-lg text-sm outline-none focus:border-black" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input name="color" placeholder="Tipologia" className="border p-2 rounded-lg text-sm outline-none focus:border-black" />
            <input name="year" type="number" placeholder="Annata" className="border p-2 rounded-lg text-sm outline-none focus:border-black" />
            <input name="region" placeholder="Regione/Paese" className="border p-2 rounded-lg text-sm outline-none focus:border-black" />
          </div>
          <textarea name="notes" placeholder="Note (chi me l'ha consigliato, prezzo indicativo...)" className="border p-2 rounded-lg text-sm outline-none focus:border-black w-full" />
          <button type="submit" className="w-full bg-black text-white font-medium py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
            Aggiungi alla lista
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-bold mb-4 text-lg">La tua lista</h2>
        <WishlistClientList items={items || []} />
      </div>
    </div>
  );
}
