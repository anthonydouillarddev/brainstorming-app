"use client";

import { useState } from "react";
import type { LoadingKind, LoadingPatternEntry, StatesState } from "../state";
import { LOADING_KIND_META, makeId } from "../state";
import { LOADING_DURATION_GUIDE, LOADING_PRESETS } from "../states-library";
import { validateLoading } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function LoadingPatternsBlock({
  state,
  onChange,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.loadingPatterns.length > 0);
  const issues = validateLoading(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.loadingPatterns.length >= 2 && !hasError;

  function addPreset(preset: (typeof LOADING_PRESETS)[number]) {
    const next: LoadingPatternEntry = {
      id: makeId("loa"),
      kind: preset.kind,
      trigger: preset.trigger,
      minDurationMs: preset.minDurationMs,
      skeletonFields: preset.skeletonFields,
      notes: "",
    };
    onChange({ loadingPatterns: [...state.loadingPatterns, next] });
  }

  function addCustom() {
    const next: LoadingPatternEntry = {
      id: makeId("loa"),
      kind: "skeleton",
      trigger: "",
      minDurationMs: 400,
      skeletonFields: "",
      notes: "",
    };
    onChange({ loadingPatterns: [...state.loadingPatterns, next] });
  }

  function update(id: string, patch: Partial<LoadingPatternEntry>) {
    onChange({
      loadingPatterns: state.loadingPatterns.map((l) =>
        l.id === id ? { ...l, ...patch } : l
      ),
    });
  }

  function remove(id: string) {
    onChange({
      loadingPatterns: state.loadingPatterns.filter((l) => l.id !== id),
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
          ⏳ Loading patterns
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.loadingPatterns.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Doherty threshold (400ms).</strong> Au-delà, l&apos;user
            décroche. Skeleton &gt; spinner pour les listes. Optimistic UI pour les toggles.
          </div>

          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
            <div className="text-[11px] font-semibold text-foreground mb-2">
              📏 Guide durée → pattern
            </div>
            <div className="space-y-1 text-[11px] text-muted">
              {LOADING_DURATION_GUIDE.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span>{g.emoji}</span>
                  <span className="font-mono text-foreground">
                    &lt;{g.maxMs >= 999999 ? "∞" : `${g.maxMs}ms`}
                  </span>
                  <span>→</span>
                  <span>{g.recommend}</span>
                </div>
              ))}
            </div>
          </div>

          {state.loadingPatterns.length > 0 && (
            <div className="space-y-2">
              {state.loadingPatterns.map((l) => {
                const meta = LOADING_KIND_META[l.kind];
                return (
                  <div
                    key={l.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={l.kind}
                        onChange={(e) =>
                          update(l.id, { kind: e.target.value as LoadingKind })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(LOADING_KIND_META) as LoadingKind[]).map((k) => (
                          <option key={k} value={k}>
                            {LOADING_KIND_META[k].emoji} {LOADING_KIND_META[k].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={l.trigger}
                        onChange={(e) => update(l.id, { trigger: e.target.value })}
                        placeholder="Trigger (ex: Fetch liste projets)"
                        className="flex-1 h-8 px-2 text-sm rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(l.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <label className="text-muted">Min durée :</label>
                      <input
                        type="number"
                        value={l.minDurationMs}
                        onChange={(e) =>
                          update(l.id, { minDurationMs: Number(e.target.value) })
                        }
                        className="w-20 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                        min={0}
                        step={50}
                      />
                      <span className="text-muted">ms</span>
                      <span className="text-[10px] text-muted ml-auto italic">{meta.when}</span>
                    </div>
                    {l.kind === "skeleton" && (
                      <input
                        type="text"
                        value={l.skeletonFields ?? ""}
                        onChange={(e) => update(l.id, { skeletonFields: e.target.value })}
                        placeholder="Zones du skeleton (ex: titre + 3 lignes + badge)"
                        className="w-full h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                    )}
                    <input
                      type="text"
                      value={l.notes}
                      onChange={(e) => update(l.id, { notes: e.target.value })}
                      placeholder="Notes (optionnel)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Presets :</div>
            <div className="flex flex-wrap gap-1">
              {LOADING_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {LOADING_KIND_META[p.kind].emoji} {p.trigger.slice(0, 30)}
                  {p.trigger.length > 30 ? "…" : ""}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Pattern personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
