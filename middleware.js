import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Link ricevuti via email (magic link, reset password, conferma) tornano con
  // un "code" nell'URL: va scambiato per una sessione vera PRIMA di decidere se
  // rimandare al login, altrimenti il redirect qui sotto scatterebbe sempre.
  const code = req.nextUrl.searchParams.get("code");
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
    const redirectUrl = new URL(req.nextUrl.pathname, req.url);
    return NextResponse.redirect(redirectUrl, { headers: res.headers });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteggiamo tutto tranne login
  if (!user && !req.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};