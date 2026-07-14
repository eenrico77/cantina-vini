import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions";
import Link from "next/link";

export default async function Header() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="flex justify-end p-4 gap-2">
      <Link 
        href="/account"
        className="text-xs font-bold text-ink-500 hover:text-brand-600 transition-colors bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-sand-200 shadow-sm"
      >
        Account
      </Link>
      <form action={signOutAction}>
        <button 
          className="text-xs font-bold text-ink-500 hover:text-brand-600 transition-colors bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-sand-200 shadow-sm"
          type="submit"
        >
          Esci
        </button>
      </form>
    </header>
  );
}
