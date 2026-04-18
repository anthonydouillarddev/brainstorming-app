"use client";

import { useState } from "react";
import type { AdaptivityState, BreakpointEntry } from "../state";
import { BREAKPOINT_KIND_META, makeId } from "../state";
import { BREAKPOINTS_MATERIAL, BREAKPOINTS_TAILWIND } from "../adaptivity-library";
import { validateBreakpoints } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function BreakpointsBlock({
  state,
  onChange,
}: {
  state: AdaptivityState;
  onChange: (patch: Partial<AdaptivityState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.breakpoints.length > 0);
  const issues = validateBreakpoints(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.breakpoints.length >= 3 && !hasError;

  function loadPreset(preset: typeof BREAKPOINTS_TAILWIND) {
    onChange({
      breakpoints: preset.map((b) => ({ ...b, id: makeId("bp"), notes: "" })),
    });
  }

  function addCustom() {
    const next: BreakpointEntry = {
      id: makeId("bp"),
      name: "",
      kind: "mobile",
      minPx: 0,
      maxPx: 0,
      containerMaxPx: 100,
      gridCols: 4,
      gutterPx: 16,
      marginPx: 16,
      notes: "",
    };
    onChange({ breakpoints: [...state.breakpoints, next] });
  }

  function update(id: string, patch: Partial<BreakpointEntry>) {
    onChange({
      breakpoints: state.breakpoints.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  }

  function remove(id: string) {
    onChange({ breakpoints: state.breakpoints.filter((b) => b.id !== id) });
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
          📐 Breakpoints
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.breakpoints.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Mobile First (Luke Wroblewski).</strong> Partir du
            petit écran et élargir. Breakpoints standards : Tailwind (sm/md/lg/xl/2xl) ou Material
            3 (compact/medium/expanded/large/xlarge).
          </div>

          {state.breakpoints.length === 0 && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => loadPreset(BREAKPOINTS_TAILWIND)}
                className="text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
              >
                📦 Tailwind v4 (5 bp)
              </button>
              <button
                onClick={() => loadPreset(BREAKPOINTS_MATERIAL)}
                className="text-sm font-medium px-4 py-3 rounded-lg bg-card border border-border hover:bg-accent/5 transition"
              >
                📦 Material 3 (5 bp)
              </button>
            </div>
          )}

          {state.breakpoints.length > 0 && (
            <div className="space-y-2">
              {state.breakpoints.map((b) => {
                const kmeta = BREAKPOINT_KIND_META[b.kind];
                return (
                  <div
                    key={b.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={b.name}
                        onChange={(e) => update(b.id, { name: e.target.value })}
                        placeholder="Nom (sm, md, lg)"
                        className="w-20 h-8 px-2 text-sm rounded border border-border bg-card font-mono font-semibold"
                      />
                      <select
                        value={b.kind}
                        onChange={(e) =>
                          update(b.id, {
                            kind: e.target.value as BreakpointEntry["kind"],
                          })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(
                          Object.keys(BREAKPOINT_KIND_META) as Array<keyof typeof BREAKPOINT_KIND_META>
                        ).map((k) => (
                          <option key={k} value={k}>
                            {BREAKPOINT_KIND_META[k].emoji} {BREAKPOINT_KIND_META[k].label}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          value={b.minPx}
                          onChange={(e) =>
                            update(b.id, { minPx: Number(e.target.value) })
                          }
                          className="w-20 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                        />
                        <span className="text-muted">→</span>
                        <input
                          type="number"
                          value={b.maxPx}
                          onChange={(e) =>
                            update(b.id, { maxPx: Number(e.target.value) })
                          }
                          placeholder="∞"
                          className="w-20 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                        />
                        <span className="text-muted">px</span>
                      </div>
                      <button
                        onClick={() => remove(b.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {kmeta.hint}</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">Container max</span>
                        <input
                          type="number"
                          value={b.containerMaxPx}
                          onChange={(e) =>
                            update(b.id, { containerMaxPx: Number(e.target.value) })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">Grid cols</span>
                        <input
                          type="number"
                          value={b.gridCols}
                          onChange={(e) =>
                            update(b.id, { gridCols: Number(e.target.value) })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={1}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">Gutter / margin</span>
                        <div className="flex gap-1">
                          <input
                            type="number"
                            value={b.gutterPx}
                            onChange={(e) =>
                              update(b.id, { gutterPx: Number(e.target.value) })
                            }
                            className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                            min={0}
                          />
                          <input
                            type="number"
                            value={b.marginPx}
                            onChange={(e) =>
                              update(b.id, { marginPx: Number(e.target.value) })
                            }
                            className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                            min={0}
                          />
                        </div>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={b.notes}
                      onChange={(e) => update(b.id, { notes: e.target.value })}
                      placeholder="Notes"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {state.breakpoints.length > 0 && (
            <button
              onClick={addCustom}
              className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
            >
              + Breakpoint personnalisé
            </button>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
