"use client";

import { useState } from "react";
import type {
  CopyVariant,
  CopyVariantSet,
  MicrocopyState,
  PlacementKind,
} from "../state";
import { PLACEMENT_META, makeId } from "../state";
import { validateVariants } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function CopyVariantsBlock({
  state,
  onChange,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.variantSets.length > 0);
  const issues = validateVariants(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.variantSets.length >= 2 && !hasError;

  function addCustom() {
    const next: CopyVariantSet = {
      id: makeId("var"),
      placement: "cta-primary",
      context: "",
      baseline: "",
      variants: [{ text: "", rationale: "" }],
      hypothesis: "",
      notes: "",
    };
    onChange({ variantSets: [...state.variantSets, next] });
  }

  function update(id: string, patch: Partial<CopyVariantSet>) {
    onChange({
      variantSets: state.variantSets.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function remove(id: string) {
    onChange({ variantSets: state.variantSets.filter((s) => s.id !== id) });
  }

  function addVariant(setId: string) {
    const set = state.variantSets.find((s) => s.id === setId);
    if (!set) return;
    if (set.variants.length >= 3) return;
    update(setId, {
      variants: [...set.variants, { text: "", rationale: "" }],
    });
  }

  function updateVariant(setId: string, idx: number, patch: Partial<CopyVariant>) {
    const set = state.variantSets.find((s) => s.id === setId);
    if (!set) return;
    const next = set.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v));
    update(setId, { variants: next });
  }

  function removeVariant(setId: string, idx: number) {
    const set = state.variantSets.find((s) => s.id === setId);
    if (!set) return;
    update(setId, {
      variants: set.variants.filter((_, i) => i !== idx),
    });
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🔀 Copy variants (A/B)
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.variantSets.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">A/B testing ready.</strong> Pour chaque CTA /
            message clé, définis la baseline (version canonique) + 1 à 3 variantes avec
            rationale. Utile pour Optimizely, GrowthBook, ou juste trancher en équipe.
          </div>

          {state.variantSets.length > 0 && (
            <div className="space-y-3">
              {state.variantSets.map((s) => {
                const pmeta = PLACEMENT_META[s.placement];
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={s.placement}
                        onChange={(e) =>
                          update(s.id, { placement: e.target.value as PlacementKind })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(PLACEMENT_META) as PlacementKind[]).map((p) => (
                          <option key={p} value={p}>
                            {PLACEMENT_META[p].emoji} {PLACEMENT_META[p].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={s.context}
                        onChange={(e) => update(s.id, { context: e.target.value })}
                        placeholder="Contexte (ex: CTA submit login)"
                        className="flex-1 min-w-[160px] h-8 px-2 text-sm rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(s.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">
                      Max {pmeta.defaultMax} caractères recommandés
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-accent">
                        Baseline (canonique)
                      </label>
                      <input
                        type="text"
                        value={s.baseline}
                        onChange={(e) => update(s.id, { baseline: e.target.value })}
                        placeholder="Version canonique utilisée par défaut"
                        className="w-full h-8 px-2 text-sm rounded border border-accent/40 bg-accent/5 font-medium"
                      />
                      <div className="text-[10px] text-muted font-mono">
                        {s.baseline.length} car.
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-semibold">
                          Variantes ({s.variants.length}/3)
                        </label>
                        {s.variants.length < 3 && (
                          <button
                            onClick={() => addVariant(s.id)}
                            className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-accent/10"
                          >
                            + Ajouter
                          </button>
                        )}
                      </div>
                      {s.variants.map((v, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-muted w-5">
                              {String.fromCharCode(66 + idx)}
                            </span>
                            <input
                              type="text"
                              value={v.text}
                              onChange={(e) =>
                                updateVariant(s.id, idx, { text: e.target.value })
                              }
                              placeholder="Variante"
                              className="flex-1 h-7 px-2 text-xs rounded border border-border bg-card"
                            />
                            <span className="text-[10px] text-muted font-mono w-14 text-right">
                              {v.text.length} car.
                            </span>
                            <button
                              onClick={() => removeVariant(s.id, idx)}
                              className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                              aria-label="Supprimer variante"
                            >
                              ×
                            </button>
                          </div>
                          <input
                            type="text"
                            value={v.rationale}
                            onChange={(e) =>
                              updateVariant(s.id, idx, { rationale: e.target.value })
                            }
                            placeholder="Rationale (ex: plus direct, plus amical)"
                            className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted ml-6"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={s.hypothesis}
                      onChange={(e) => update(s.id, { hypothesis: e.target.value })}
                      placeholder="Hypothèse (ex: Variante B améliore le CTR)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card"
                    />
                    <input
                      type="text"
                      value={s.notes}
                      onChange={(e) => update(s.id, { notes: e.target.value })}
                      placeholder="Notes (optionnel)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Nouveau set de variantes
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
