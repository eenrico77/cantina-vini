import Link from "next/link";

export default function NotAuthenticated() {
  return (
    <div className="p-8 text-center mt-20">
      <div className="text-4xl mb-4">🍷</div>
      <h2 className="text-2xl font-black text-ink-700 mb-2">Accesso Richiesto</h2>
      <p className="text-sm text-ink-500 mb-8">Devi accedere per visualizzare questa pagina.</p>
      <Link href="/login" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-6 rounded-xl transition-colors inline-block">
        Vai al Login
      </Link>
    </div>
  );
}
