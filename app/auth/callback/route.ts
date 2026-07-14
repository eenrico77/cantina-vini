import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Gestisce il ritorno dai link inviati via email da Supabase (magic link,
// reset password, conferma email): scambia il "code" nell'URL per una sessione
// valida (cookie), poi rimanda l'utente dentro l'app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/wines";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
