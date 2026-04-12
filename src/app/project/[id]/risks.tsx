"use client";

import { createClient } from "@/lib/supabase/client";
import { useMemo, useState } from "react";
import type { Risk, RiskLevel } from "@/lib/types";
import { RISK_LEVELS, riskCriticality, riskColor } from "@/lib/types";

export default function RisksPanel({
  projectId,
  risks,
  onChange,
}: {
  projectId: string;
  risks: Risk[];
  onChange: (risks: Risk[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({
    title: "",
    probability: "medium" as RiskLevel,
    impact: "medium" as RiskLevel,
    mitigation: "",
  });
  const supabase = createClient();

  const sortedRisks = useMemo(
    () =>
      [...risks].sort((a, b) => riskCriticality(b) - riskCriticality(a)),
    [risks]
  );

  const visibleRisks = expanded ? sortedRisks : sortedRisks.slice(0, 3);

  function resetForm() {
    setForm({ title: "", probability: "medium", impact: "medium", mitigation: "" });
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const { data, error } = await supabase
      .from("risks")
      .insert({
        project_id: projectId,
        title: form.title.trim(),
        probability: form.probability,
        impact: form.impact,
        mitigation: form.mitigation.trim() || null,
      })
      .select()
      .single();

    if (error) {
      alert("Erreur : " + error.message);
      return;
    }
    if (data) {
      onChange([data as Risk, ...risks]);
      resetForm();
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    const previous = risks;
    onChange(previous.filter((r) => r.id !== id));
    const { error } = await supabase.from("risks").delete().eq("id", id);
    if (error) {
      onChange(previous);
      alert("Erreur : " + error.message);
    }
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          ⚠️ Risques ({risks.length})
        </h3>
        <button
          onClick={() => setAdding((v) => !v)}
          className="text-[10px] px-2 py-1 rounded-lg bg-accent/15 text-accent font-semibold hover:bg-accent/25 transition-colors"
        >
          {adding ? "✕" : "+ Ajouter"}
        </button>
      </div>

      {adding && (
        <form
          onSubmit={handleAdd}
          className="mb-3 p-3 bg-background/60 border border-border rounded-xl space-y-2"
        >
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Titre du risque..."
            required
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                Probabilité
              </label>
              <select
                value={form.probability}
                onChange={(e) => setForm({ ...form, probability: e.target.value as RiskLevel })}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none"
              >
                {RISK_LEVELS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                Impact
              </label>
              <select
                value={form.impact}
                onChange={(e) => setForm({ ...form, impact: e.target.value as RiskLevel })}
                className="w-full px-2 py-1.5 bg-card border border-border rounded-lg text-xs outline-none"
              >
                {RISK_LEVELS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <input
            value={form.mitigation}
            onChange={(e) => setForm({ ...form, mitigation: e.target.value })}
            placeholder="Mitigation (optionnel)"
            className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
          />
          <button
            type="submit"
            className="w-full py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors"
          >
            Enregistrer
          </button>
        </form>
      )}

      {sortedRisks.length === 0 ? (
        <p className="text-xs text-muted text-center py-4">
          Aucun risque identifié. Pense à lister ce qui pourrait bloquer le projet.
        </p>
      ) : (
        <div className="space-y-2">
          {visibleRisks.map((r) => {
            const crit = riskCriticality(r);
            const color = riskColor(crit);
            return (
              <div
                key={r.id}
                className={`px-3 py-2 rounded-xl border ${color.bg} ${color.border} flex items-start gap-2 group`}
              >
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color.text} shrink-0 mt-0.5`}
                  title={`Probabilité × Impact = ${crit}/9`}
                >
                  {crit}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.title}</div>
                  {r.mitigation && (
                    <div className="text-xs text-muted mt-0.5 line-clamp-1">
                      → {r.mitigation}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-muted hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            );
          })}
          {sortedRisks.length > 3 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full text-[10px] text-muted hover:text-foreground py-1 transition-colors"
            >
              {expanded ? "▴ Réduire" : `▾ Voir ${sortedRisks.length - 3} de plus`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
