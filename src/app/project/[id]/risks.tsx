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
  const [showResolved, setShowResolved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    probability: "medium" as RiskLevel,
    impact: "medium" as RiskLevel,
    mitigation: "",
  });
  const supabase = createClient();

  const { activeRisks, resolvedRisks } = useMemo(() => {
    const sorted = [...risks].sort(
      (a, b) => riskCriticality(b) - riskCriticality(a)
    );
    return {
      activeRisks: sorted.filter((r) => !r.resolved_at),
      resolvedRisks: sorted.filter((r) => r.resolved_at),
    };
  }, [risks]);

  const visibleActive = expanded ? activeRisks : activeRisks.slice(0, 3);

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

  async function updateRisk(id: string, patch: Partial<Risk>) {
    const previous = risks;
    onChange(previous.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const { error } = await supabase.from("risks").update(patch).eq("id", id);
    if (error) {
      onChange(previous);
      alert("Erreur : " + error.message);
    }
  }

  async function toggleResolved(risk: Risk) {
    await updateRisk(risk.id, {
      resolved_at: risk.resolved_at ? null : new Date().toISOString(),
    });
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
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
          ⚠️ Risques ({activeRisks.length})
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

      {activeRisks.length === 0 && resolvedRisks.length === 0 ? (
        <p className="text-xs text-muted text-center py-4">
          Aucun risque identifié. Pense à lister ce qui pourrait bloquer le projet.
        </p>
      ) : (
        <div className="space-y-2">
          {visibleActive.map((r) => (
            <RiskRow
              key={r.id}
              risk={r}
              editing={editingId === r.id}
              onEditToggle={() => setEditingId(editingId === r.id ? null : r.id)}
              onUpdate={(patch) => updateRisk(r.id, patch)}
              onResolve={() => toggleResolved(r)}
              onDelete={() => handleDelete(r.id)}
            />
          ))}
          {activeRisks.length > 3 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full text-[10px] text-muted hover:text-foreground py-1 transition-colors"
            >
              {expanded ? "▴ Réduire" : `▾ Voir ${activeRisks.length - 3} de plus`}
            </button>
          )}

          {resolvedRisks.length > 0 && (
            <>
              <button
                onClick={() => setShowResolved((v) => !v)}
                className="w-full text-[10px] text-muted hover:text-foreground py-1.5 mt-2 border-t border-border pt-2 transition-colors text-left"
              >
                {showResolved ? "▾" : "▸"} {resolvedRisks.length} résolu
                {resolvedRisks.length !== 1 ? "s" : ""}
              </button>
              {showResolved && (
                <div className="space-y-2 opacity-60">
                  {resolvedRisks.map((r) => (
                    <RiskRow
                      key={r.id}
                      risk={r}
                      editing={editingId === r.id}
                      onEditToggle={() => setEditingId(editingId === r.id ? null : r.id)}
                      onUpdate={(patch) => updateRisk(r.id, patch)}
                      onResolve={() => toggleResolved(r)}
                      onDelete={() => handleDelete(r.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function RiskRow({
  risk,
  editing,
  onEditToggle,
  onUpdate,
  onResolve,
  onDelete,
}: {
  risk: Risk;
  editing: boolean;
  onEditToggle: () => void;
  onUpdate: (patch: Partial<Risk>) => void;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const crit = riskCriticality(risk);
  const color = riskColor(crit);
  const isResolved = !!risk.resolved_at;

  return (
    <div className={`rounded-xl border ${color.bg} ${color.border}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={onEditToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEditToggle();
          }
        }}
        className="px-3 py-2 flex items-start gap-2 group cursor-pointer select-none hover:bg-black/5 dark:hover:bg-white/5 transition-colors rounded-xl"
        aria-expanded={editing}
      >
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${color.text} shrink-0 mt-0.5`}
          title={`Probabilité × Impact = ${crit}/9`}
        >
          {crit}
        </span>
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-medium break-words ${isResolved ? "line-through decoration-muted" : ""}`}
          >
            {risk.title}
          </div>
          {risk.mitigation && (
            <div
              className={`text-xs text-muted mt-0.5 break-words ${isResolved ? "line-through decoration-muted" : ""}`}
            >
              → {risk.mitigation}
            </div>
          )}
          {isResolved && risk.resolved_at && (
            <div className="text-[10px] text-green-600 dark:text-green-400 mt-1">
              ✅ Résolu le{" "}
              {new Date(risk.resolved_at).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
          )}
        </div>
        <span
          className="shrink-0 text-muted group-hover:text-foreground text-sm pt-0.5"
          aria-hidden="true"
        >
          {editing ? "▾" : "✎"}
        </span>
      </div>

      {editing && (
        <div className="px-3 pb-3 pt-1 border-t border-border/60 bg-background/30 space-y-2 rounded-b-xl">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
              Titre
            </label>
            <input
              value={risk.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
                Probabilité
              </label>
              <select
                value={risk.probability}
                onChange={(e) =>
                  onUpdate({ probability: e.target.value as RiskLevel })
                }
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
                value={risk.impact}
                onChange={(e) => onUpdate({ impact: e.target.value as RiskLevel })}
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
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-muted mb-1">
              Mitigation
            </label>
            <textarea
              value={risk.mitigation ?? ""}
              onChange={(e) => onUpdate({ mitigation: e.target.value || null })}
              rows={2}
              placeholder="Comment réduire ce risque ?"
              className="w-full px-3 py-2 bg-card border border-border rounded-lg text-xs outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-y"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onResolve}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isResolved
                  ? "bg-yellow-500/15 text-yellow-600 hover:bg-yellow-500/25"
                  : "bg-green-500/15 text-green-600 hover:bg-green-500/25"
              }`}
            >
              {isResolved ? "↩ Réactiver" : "✅ Marquer résolu"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-500 hover:bg-red-500/25 transition-colors"
            >
              🗑️ Supprimer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
