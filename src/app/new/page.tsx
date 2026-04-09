"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProject() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("projects")
      .insert({ name: name.trim(), user_id: user.id })
      .select()
      .single();

    if (!error && data) {
      router.push(`/project/${data.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 w-full">
      <h1 className="text-2xl font-bold mb-6">🆕 Nouvelle idée</h1>
      <form onSubmit={handleCreate} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            Nom du projet
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: SaaS Mail, Proxy Tool, ..."
            required
            autoFocus
            className="w-full px-3 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Création..." : "Créer le projet"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-4 py-2.5 text-muted hover:text-foreground transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
