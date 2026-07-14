"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);

  // Gestisce i link ricevuti via email (magic link, reset password) quando il
  // token torna nell'URL dopo il cancelletto (#access_token=...): il server non
  // lo vede mai, va letto e scambiato per una sessione qui, lato browser.
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const params = new URLSearchParams(hash.substring(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        supabase.auth
          .setSession({ access_token, refresh_token })
          .then(({ error }) => {
            if (!error) {
              router.push("/wines");
              router.refresh();
            } else {
              setCheckingLink(false);
            }
          });
        return;
      }
    }
    setCheckingLink(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/wines");
  };

  if (checkingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-ink-500 text-sm">Accesso in corso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-3xl font-bold text-center">
          Login Cantina 🍷
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded-xl px-4 py-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border rounded-xl px-4 py-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 rounded-xl"
        >
          {loading ? "Accesso..." : "Accedi"}
        </button>
      </form>
    </div>
  );
}