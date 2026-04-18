"use client";

import { useState } from "react";
import type { LatencyEntry, PrinciplesState } from "../state";
import { makeId } from "../state";
import { validateLatency } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function LatencyLogBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.latencyLog.length > 0);
  const issues = validateLatency(state);
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.latencyLog.length > 0 && !hasWarn;

  function addEntry() {
    const next: LatencyEntry = {
      id: makeId("lat"),
      action: "",
      latencyMs: 300,
      hasSkeleton: false,
    };
    onChange({ latencyLog: [...state.latencyLog, next] });
  }

  function update(id: string, patch: Partial<LatencyEntry>) {
    onChange({
      latencyLog: state.latencyLog.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  }

  function remove(id: string) {
    onChange({ latencyLog: state.latencyLog.filter((l) => l.id !== id) });
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
          ⏱️ Doherty latency log
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">({state.latencyLog.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Doherty Threshold 400ms.</strong> Au-delà,
            l&apos;user décroche. Mesure avec Lighthouse ou intuition, coche « skeleton » si tu
            en affiches un pour cacher la latence.
          </div>

          {state.latencyLog.length > 0 && (
            <div className="space-y-2">
              {state.latencyLog.map((l) => {
                const overThreshold = l.latencyMs > 400;
                const isOk = !overThreshold || l.hasSkeleton;
                return (
                  <div
                    key={l.id}
                    className={`border rounded-xl p-3 space-y-2 transition ${
                      isOk
                        ? "border-border bg-card/60"
                        : "border-amber-500/50 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={l.action}
                        onChange={(e) => update(l.id, { action: e.target.value })}
                        placeholder="Action (ex: Charger liste projets)"
                        className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-medium"
                      />
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={30000}
                          value={l.latencyMs}
                          onChange={(e) =>
                            update(l.id, { latencyMs: Number(e.target.value) })
                          }
                          className={`w-20 h-7 px-1 rounded border border-border bg-card text-xs text-center font-mono ${
                            overThreshold ? "text-amber-600 font-bold" : ""
                          }`}
                        />
                        <span className="text-[10px] text-muted">ms</span>
                      </div>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={l.hasSkeleton}
                          onChange={(e) => update(l.id, { hasSkeleton: e.target.checked })}
                        />
                        <span className={l.hasSkeleton ? "text-green-600" : "text-muted"}>
                          skeleton
                        </span>
                      </label>
                      <button
                        onClick={() => remove(l.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={addEntry}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Logger une latence
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
