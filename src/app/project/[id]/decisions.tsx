"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import type { Decision } from "@/lib/types";

export default function DecisionsPanel({
  projectId,
  initialDecisions,
  onChange,
}: {
  projectId: string;
  initialDecisions: Decision[];
  onChange: (decisions: Decision[]) => void;
}) {
  const [decisions, setDecisions] = useState<Decision[]>(initialDecisions);
  const [adding, setAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    decision: "",
    options: "",
    context: "",
    rationale: "",
    decided_at: new Date().toISOString().slice(0, 10),
  });

  function commit(next: Decision[]) {
    setDecisions(next);
    onChange(next);
  }

  function resetForm() {
    setForm({
      title: "",
      decision: "",
      options: "",
      context: "",
      rationale: "",
      decided_at: new Date().toISOString().slice(0, 10),
    });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.decision.trim()) return;

    const { data, error } = await supabase
      .from("decisions")
      .insert({
        project_id: projectId,
        title: form.title.trim(),
        decision: form.decision.trim(),
        options: form.options.trim() || null,
        context: form.context.trim() || null,
        rationale: form.rationale.trim() || null,
        decided_at: form.decided_at,
      })
      .select()
      .single();

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }

    if (data) {
      commit([data as Decision, ...decisions]);
      resetForm();
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette décision ?")) return;
    const previous = decisions;
    commit(previous.filter((d) => d.id !== id));
    const { error } = await supabase.from("decisions").delete().eq("id", id);
    if (error) {
      commit(previous);
      alert("Erreur de suppression : " + error.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold tracking-tight">🧭 Décisions</h2>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-xs px-3 py-1.5 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors shadow-sm"
        >
          {adding ? "✕ Annuler" : "+ Ajouter une décision"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm mb-5 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Utiliser Supabase plutôt que Firebase"
              required
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Décision <span className="text-red-500">*</span>
            </label>
            <input
              value={form.decision}
              onChange={(e) => setForm({ ...form, decision: e.target.value })}
              placeholder="Ex: On part sur Supabase"
              required
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Options considérées
            </label>
            <textarea
              value={form.options}
              onChange={(e) => setForm({ ...form, options: e.target.value })}
              rows={2}
              placeholder="Firebase, Supabase, Neon, PlanetScale..."
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Contexte
            </label>
            <textarea
              value={form.context}
              onChange={(e) => setForm({ ...form, context: e.target.value })}
              rows={2}
              placeholder="Pourquoi cette décision se pose maintenant ?"
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Raison du choix
            </label>
            <textarea
              value={form.rationale}
              onChange={(e) => setForm({ ...form, rationale: e.target.value })}
              rows={2}
              placeholder="Pourquoi cette option plutôt qu'une autre ?"
              className="w-full px-4 py-2.5 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Date de la décision
            </label>
            <input
              type="date"
              value={form.decided_at}
              onChange={(e) => setForm({ ...form, decided_at: e.target.value })}
              className="px-3 py-2 bg-background/60 border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-accent text-white text-sm font-semibold rounded-xl hover:bg-accent-hover transition-colors shadow-sm"
          >
            Enregistrer
          </button>
        </form>
      )}

      {decisions.length === 0 ? (
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-10 text-center shadow-sm">
          <p className="text-4xl mb-3">🧭</p>
          <p className="text-sm text-muted">
            Garde une trace des décisions structurantes — techniques, produit, business.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {decisions.map((d) => {
            const isOpen = expandedId === d.id;
            return (
              <div
                key={d.id}
                className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setExpandedId(isOpen ? null : d.id)}
                  className="w-full px-5 py-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm">{d.title}</h3>
                      <p className="text-xs text-muted mt-1 line-clamp-1">→ {d.decision}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-muted">
                        {new Date(d.decided_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-muted text-sm">{isOpen ? "▾" : "▸"}</span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-border space-y-3 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
                        Décision
                      </div>
                      <div className="font-medium">{d.decision}</div>
                    </div>
                    {d.options && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
                          Options considérées
                        </div>
                        <div className="whitespace-pre-wrap">{d.options}</div>
                      </div>
                    )}
                    {d.context && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
                          Contexte
                        </div>
                        <div className="whitespace-pre-wrap">{d.context}</div>
                      </div>
                    )}
                    {d.rationale && (
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-muted mb-1">
                          Raison
                        </div>
                        <div className="whitespace-pre-wrap">{d.rationale}</div>
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="text-xs text-red-500 hover:text-red-400 transition-colors"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
