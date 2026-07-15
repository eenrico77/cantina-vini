import { createClient } from "@/lib/supabase/server";
import NotAuthenticated from "@/components/NotAuthenticated";
import AccountForm from "./AccountForm";

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <NotAuthenticated />;
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="font-serif text-3xl font-extrabold text-ink-700 tracking-tight">Il tuo Account</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-sand-200 space-y-4">
        <h2 className="text-xl font-bold text-ink-700">Cambia Password</h2>
        <p className="text-sm text-ink-500">Imposta o cambia la password per accedere al tuo account senza usare il magic link.</p>
        
        <AccountForm />
      </div>
    </div>
  );
}
