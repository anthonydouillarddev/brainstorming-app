"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PROJECT_TYPES, type ProjectType } from "@/lib/types";

export default function NewProject() {
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Donne un nom à ton projet");
      return;
    }
    if (!type) {
      setError("Choisis un type de projet");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert({ name: name.trim(), type, user_id: user.id })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (data) {
      router.push(`/project/${data.id}`);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 w-full">
      <div className="mb-8">
        <button
          onClick={() => router.push("/")}
          className="text-muted hover:text-foreground text-sm transition-colors mb-4"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-extrabold tracking-tight">🆕 Nouvelle idée</h1>
        <p className="text-muted text-sm mt-1">Choisis le type et donne-lui un nom</p>
      </div>

      <form onSubmit={handleCreate} className="space-y-6">
        {/* Type de projet */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-semibold mb-3">
            Type de projet <span className="text-red-500">*</span>
          </label>
          <div className="grid gap-2">
            {PROJECT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`text-left px-4 py-3 rounded-xl border transition-all ${
                  type === t.value
                    ? "bg-accent/15 border-accent/60 shadow-sm"
                    : "bg-background/60 border-border hover:border-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.emoji}</span>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${type === t.value ? "text-accent" : "text-foreground"}`}>
                      {t.label}
                    </div>
                    <div className="text-xs text-muted mt-0.5">{t.description}</div>
                  </div>
                  {type === t.value && <span className="text-accent text-lg">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nom */}
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
          <label htmlFor="name" className="block text-sm font-semibold mb-2">
            Nom du projet <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: SaaS Mail, Outil Proxy, ..."
            autoFocus
            className="w-full px-4 py-3 bg-background/60 border border-border rounded-xl text-foreground placeholder:text-muted/40 outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !name.trim() || !type}
            className="flex-1 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Création..." : "Créer le projet"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-5 py-3 text-muted hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
