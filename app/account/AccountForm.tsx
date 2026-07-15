"use client";

import { useState } from "react";
import { changePasswordAction } from "@/app/actions";

export default function AccountForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const pwd = formData.get("password") as string;
    const confirmPwd = formData.get("confirmPassword") as string;

    if (pwd !== confirmPwd) {
      setError("Le password non coincidono.");
      setLoading(false);
      return;
    }

    try {
      const res = await changePasswordAction(formData);
      if (res?.error) {
        setError(res.error);
      } else if (res?.success) {
        setSuccess("Password aggiornata con successo!");
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      setError(err.message || "Errore sconosciuto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{error}</div>}
      {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">{success}</div>}
      
      <div>
        <label className="block text-xs font-semibold text-ink-500 uppercase">Nuova Password</label>
        <input 
          name="password" 
          type="password" 
          required 
          minLength={6}
          className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-sand-50" 
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-ink-500 uppercase">Conferma Password</label>
        <input 
          name="confirmPassword" 
          type="password" 
          required 
          minLength={6}
          className="mt-1 w-full border border-sand-200 p-2.5 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-sand-50" 
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        className="px-5 py-2.5 bg-ink-700 hover:bg-ink-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
      >
        {loading ? "Salvataggio..." : "Salva Password"}
      </button>
    </form>
  );
}
