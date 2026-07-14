import { createClient } from "@/lib/supabase/server";
import NotAuthenticated from "@/components/NotAuthenticated";
import WishlistClientList from "@/components/WishlistClientList";
import WishlistAddForm from "./WishlistAddForm";

export default async function WishlistPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <NotAuthenticated />;

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8 mb-20">
      <h1 className="text-3xl font-extrabold text-ink-700">Wishlist</h1>

      <WishlistAddForm />

      <div>
        <h2 className="font-bold mb-4 text-lg">La tua lista</h2>
        <WishlistClientList items={items || []} />
      </div>
    </div>
  );
}
