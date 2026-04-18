"use client";

import { useMemo, useState } from "react";
import type {
  PrinciplesState,
  ProjectRuleCategory,
  ProjectRuleEntry,
} from "../state";
import {
  PROJECT_RULES_PRESETS,
  PROJECT_RULE_CATEGORY_META,
  makeId,
} from "../state";
import BlockStatus from "../components/BlockStatus";

type CategoryFilter = ProjectRuleCategory | "all";

export default function ProjectRulesBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.projectRules.length > 0);
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const enabledCount = useMemo(
    () => state.projectRules.filter((r) => r.enabled).length,
    [state.projectRules]
  );
  const ok = enabledCount >= 6;

  function loadAllPresets() {
    const next: ProjectRuleEntry[] = PROJECT_RULES_PRESETS.map((p) => ({
      ...p,
      id: makeId("rule"),
    }));
    onChange({ projectRules: next });
  }

  function addPreset(preset: (typeof PROJECT_RULES_PRESETS)[number]) {
    const next: ProjectRuleEntry = { id: makeId("rule"), ...preset };
    onChange({ projectRules: [...state.projectRules, next] });
  }

  function addCustom() {
    const next: ProjectRuleEntry = {
      id: makeId("rule"),
      category: "forms",
      doRule: "",
      dontRule: "",
      why: "",
      source: "",
      enabled: true,
    };
    onChange({ projectRules: [...state.projectRules, next] });
  }

  function update(id: string, patch: Partial<ProjectRuleEntry>) {
    onChange({
      projectRules: state.projectRules.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    });
  }

  function remove(id: string) {
    onChange({
      projectRules: state.projectRules.filter((r) => r.id !== id),
    });
  }

  const filtered =
    filter === "all"
      ? state.projectRules
      : state.projectRules.filter((r) => r.category === filter);

  const categoryCounts = useMemo(() => {
    const out = {} as Record<ProjectRuleCategory, number>;
    for (const cat of Object.keys(PROJECT_RULE_CATEGORY_META) as ProjectRuleCategory[]) {
      out[cat] = state.projectRules.filter((r) => r.category === cat).length;
    }
    return out;
  }, [state.projectRules]);

  const availablePresets = useMemo(() => {
    const existingDos = new Set(
      state.projectRules.map((r) => r.doRule.trim().toLowerCase())
    );
    return PROJECT_RULES_PRESETS.filter(
      (p) => !existingDos.has(p.doRule.trim().toLowerCase())
    );
  }, [state.projectRules]);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          📋 Règles UI/UX projet
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            V4
          </span>
          <span className="text-muted text-sm font-normal">
            ({enabledCount}/{state.projectRules.length} actives)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Règles DO/DON&apos;T projet-specific.</strong>{" "}
            Complément des 10 heuristiques Nielsen (générales) et des 18 Laws (théoriques). Ici
            des règles <em>concrètes</em> à respecter dans TON projet : formulaires, boutons,
            navigation, feedback, densité, a11y.
          </div>

          {state.projectRules.length === 0 && (
            <button
              onClick={loadAllPresets}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {PROJECT_RULES_PRESETS.length} règles par défaut (Baymard, NN/G, WCAG, Refactoring UI)
            </button>
          )}

          {state.projectRules.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted">Filtre :</span>
              <button
                type="button"
                onClick={() => setFilter("all")}
                aria-pressed={filter === "all"}
                className={`text-[11px] px-3 py-1.5 rounded border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                  filter === "all"
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-accent/10"
                }`}
              >
                Tout ({state.projectRules.length})
              </button>
              {(
                Object.keys(PROJECT_RULE_CATEGORY_META) as ProjectRuleCategory[]
              ).map((cat) => {
                const meta = PROJECT_RULE_CATEGORY_META[cat];
                const count = categoryCounts[cat];
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilter(cat)}
                    aria-pressed={filter === cat}
                    className={`text-[11px] px-3 py-1.5 rounded border transition flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
                      filter === cat
                        ? "bg-accent text-white border-accent"
                        : "border-border hover:bg-accent/10"
                    }`}
                  >
                    {meta.emoji} {meta.label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((r) => {
                const meta = PROJECT_RULE_CATEGORY_META[r.category];
                return (
                  <div
                    key={r.id}
                    className={`p-3 rounded-lg border space-y-2 ${
                      r.enabled
                        ? "border-accent/30 bg-accent/5"
                        : "border-border bg-card opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={r.category}
                        onChange={(e) =>
                          update(r.id, {
                            category: e.target.value as ProjectRuleCategory,
                          })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(PROJECT_RULE_CATEGORY_META) as ProjectRuleCategory[]).map(
                          (c) => (
                            <option key={c} value={c}>
                              {PROJECT_RULE_CATEGORY_META[c].emoji}{" "}
                              {PROJECT_RULE_CATEGORY_META[c].label}
                            </option>
                          )
                        )}
                      </select>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={r.enabled}
                          onChange={(e) => update(r.id, { enabled: e.target.checked })}
                          className="accent-accent"
                        />
                        Active
                      </label>
                      <span className="text-[10px] text-muted italic flex-1">
                        {meta.hint}
                      </span>
                      <button
                        onClick={() => remove(r.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-green-600 font-semibold">
                        ✅ À faire
                      </label>
                      <textarea
                        value={r.doRule}
                        onChange={(e) => update(r.id, { doRule: e.target.value })}
                        placeholder="Label toujours visible au-dessus du champ..."
                        rows={2}
                        className="w-full px-2 py-1.5 text-xs rounded border border-green-500/30 bg-green-500/5 resize-y"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-red-600 font-semibold">
                        🚫 À éviter
                      </label>
                      <textarea
                        value={r.dontRule}
                        onChange={(e) => update(r.id, { dontRule: e.target.value })}
                        placeholder="Label en placeholder qui disparaît à la frappe..."
                        rows={2}
                        className="w-full px-2 py-1.5 text-xs rounded border border-red-500/30 bg-red-500/5 resize-y"
                      />
                    </div>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <input
                        type="text"
                        value={r.why}
                        onChange={(e) => update(r.id, { why: e.target.value })}
                        placeholder="Pourquoi (impact, chiffre, référence)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                      />
                      <input
                        type="text"
                        value={r.source}
                        onChange={(e) => update(r.id, { source: e.target.value })}
                        placeholder="Source"
                        className="w-32 h-7 px-2 text-[11px] font-mono rounded border border-border bg-card text-muted"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {availablePresets.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Presets à ajouter :</div>
              <div className="flex flex-wrap gap-1">
                {availablePresets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addPreset(p)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition text-left max-w-full truncate"
                    title={p.doRule}
                  >
                    + {PROJECT_RULE_CATEGORY_META[p.category].emoji}{" "}
                    {p.doRule.slice(0, 40)}
                    {p.doRule.length > 40 ? "…" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Règle personnalisée
          </button>
        </>
      )}
    </div>
  );
}
