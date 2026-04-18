"use client";

import { useState } from "react";
import type {
  AdaptivityState,
  ContainerQueryEntry,
  ContainerSize,
} from "../state";
import { CONTAINER_SIZE_META, makeId } from "../state";
import { CONTAINER_QUERY_PRESETS } from "../adaptivity-library";
import { validateContainerQueries } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function ContainerQueriesBlock({
  state,
  onChange,
}: {
  state: AdaptivityState;
  onChange: (patch: Partial<AdaptivityState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.containerQueries.length > 0);
  const issues = validateContainerQueries(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.containerQueries.length >= 2 && !hasError;

  function addPreset(preset: (typeof CONTAINER_QUERY_PRESETS)[number]) {
    onChange({
      containerQueries: [
        ...state.containerQueries,
        { ...preset, id: makeId("cq") },
      ],
    });
  }

  function addCustom() {
    const next: ContainerQueryEntry = {
      id: makeId("cq"),
      component: "",
      containerName: "",
      threshold: "sm",
      thresholdPx: CONTAINER_SIZE_META.sm.defaultPx,
      layoutChange: "",
      notes: "",
    };
    onChange({ containerQueries: [...state.containerQueries, next] });
  }

  function update(id: string, patch: Partial<ContainerQueryEntry>) {
    const partial = { ...patch };
    if (patch.threshold && !patch.thresholdPx) {
      partial.thresholdPx = CONTAINER_SIZE_META[patch.threshold].defaultPx;
    }
    onChange({
      containerQueries: state.containerQueries.map((c) =>
        c.id === id ? { ...c, ...partial } : c
      ),
    });
  }

  function remove(id: string) {
    onChange({
      containerQueries: state.containerQueries.filter((c) => c.id !== id),
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
          📦 Container queries
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.containerQueries.length})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">CSS @container (baseline 2023).</strong>{" "}
            Breakpoints <em>par composant</em>, indépendants du viewport. Une card s&apos;adapte à
            son parent — utile pour sidebars, grids flexibles, composants réutilisés.
          </div>

          {state.containerQueries.length > 0 && (
            <div className="space-y-2">
              {state.containerQueries.map((cq) => {
                const meta = CONTAINER_SIZE_META[cq.threshold];
                return (
                  <div
                    key={cq.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={cq.component}
                        onChange={(e) =>
                          update(cq.id, { component: e.target.value })
                        }
                        placeholder="Composant (ex: Card projet)"
                        className="flex-1 min-w-[160px] h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                      />
                      <input
                        type="text"
                        value={cq.containerName}
                        onChange={(e) =>
                          update(cq.id, { containerName: e.target.value })
                        }
                        placeholder="container-name"
                        className="w-32 h-7 px-2 text-xs font-mono rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(cq.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <select
                        value={cq.threshold}
                        onChange={(e) =>
                          update(cq.id, {
                            threshold: e.target.value as ContainerSize,
                          })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(CONTAINER_SIZE_META) as ContainerSize[]).map((s) => (
                          <option key={s} value={s}>
                            {s} ({CONTAINER_SIZE_META[s].defaultPx}px)
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <span className="text-muted">@</span>
                        <input
                          type="number"
                          value={cq.thresholdPx}
                          onChange={(e) =>
                            update(cq.id, { thresholdPx: Number(e.target.value) })
                          }
                          className="w-20 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                        />
                        <span className="text-muted">px</span>
                      </div>
                      <span className="text-[10px] text-muted italic flex-1">
                        💡 {meta.hint}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={cq.layoutChange}
                      onChange={(e) => update(cq.id, { layoutChange: e.target.value })}
                      placeholder="Changement de layout (ex: stack → row, avatar visible)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card"
                    />
                    <code className="block text-[10px] font-mono text-muted bg-card/40 border border-border rounded px-2 py-1">
                      @container {cq.containerName || "name"} (min-width: {cq.thresholdPx}px){" "}
                      {"{ ... }"}
                    </code>
                    <input
                      type="text"
                      value={cq.notes}
                      onChange={(e) => update(cq.id, { notes: e.target.value })}
                      placeholder="Notes"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Presets :</div>
            <div className="flex flex-wrap gap-1">
              {CONTAINER_QUERY_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {p.component} ({p.thresholdPx}px)
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Container query personnalisée
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
