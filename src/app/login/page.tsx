"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2">🧠 Brainstorming</h1>
        <p className="text-muted text-center mb-8 text-sm">
          Tes idées SaaS, accessibles partout
        </p>

        {sent ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-lg mb-2">📧 Email envoyé !</p>
            <p className="text-muted text-sm">
              Clique sur le lien dans l&apos;email envoyé à <strong className="text-foreground">{email}</strong> pour te connecter.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Se connecter avec un magic link"}
            </button>
            <p className="text-muted text-xs text-center">
              Pas besoin de mot de passe — un lien de connexion sera envoyé par email.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
