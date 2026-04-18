"use client";

import { useState } from "react";
import type { LatencyLogEntry, StatesState } from "../state";
import { SLO_STATUS_META, computeSloStatus, makeId } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function LatencySloBlock({
  state,
  onChange,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.latencyLogs.length > 0);
  const statuses = state.latencyLogs.map((l) => computeSloStatus(l));
  const failCount = statuses.filter((s) => s === "fail").length;
  const warnCount = statuses.filter((s) => s === "warn").length;
  const ok = state.latencyLogs.length >= 2 && failCount === 0;

  function addEntry() {
    const triggerExample = state.loadingPatterns[0]?.trigger ?? "";
    const next: LatencyLogEntry = {
      id: makeId("lat"),
      trigger: triggerExample,
      p50Ms: 180,
      p95Ms: 450,
      sloTargetMs: 400,
      sampleSize: 100,
      sampledAt: new Date().toISOString().slice(0, 10),
      notes: "",
    };
    onChange({ latencyLogs: [...state.latencyLogs, next] });
  }

  function update(id: string, patch: Partial<LatencyLogEntry>) {
    onChange({
      latencyLogs: state.latencyLogs.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  }

  function remove(id: string) {
    onChange({ latencyLogs: state.latencyLogs.filter((l) => l.id !== id) });
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
          📏 Latency SLO log
          <span className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-600 rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">({state.latencyLogs.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={failCount > 0} hasWarn={warnCount > 0} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Doherty threshold (400ms).</strong> Mesure les
            latences réelles de tes patterns loading. Compare p95 au SLO cible. Au-delà de 1.5× la
            cible = hors SLO. Source : DevTools, Sentry, RUM, logs.
          </div>

          {state.latencyLogs.length > 0 && (
            <div className="space-y-2">
              {state.latencyLogs.map((l) => {
                const status = computeSloStatus(l);
                const meta = SLO_STATUS_META[status];
                const ratio = l.sloTargetMs === 0 ? 0 : l.p95Ms / l.sloTargetMs;
                const barColor =
                  status === "ok"
                    ? "bg-green-500"
                    : status === "warn"
                      ? "bg-amber-500"
                      : "bg-red-500";
                return (
                  <div
                    key={l.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={l.trigger}
                        onChange={(e) => update(l.id, { trigger: e.target.value })}
                        placeholder="Trigger (ex: Fetch liste projets)"
                        className="flex-1 h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                      />
                      <span className={`text-xs font-mono ${meta.color}`}>
                        {meta.emoji} {meta.label}
                      </span>
                      <button
                        onClick={() => remove(l.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">p50 (ms)</span>
                        <input
                          type="number"
                          value={l.p50Ms}
                          onChange={(e) => update(l.id, { p50Ms: Number(e.target.value) })}
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                          step={10}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">p95 (ms)</span>
                        <input
                          type="number"
                          value={l.p95Ms}
                          onChange={(e) => update(l.id, { p95Ms: Number(e.target.value) })}
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                          step={10}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">SLO cible (ms)</span>
                        <input
                          type="number"
                          value={l.sloTargetMs}
                          onChange={(e) =>
                            update(l.id, { sloTargetMs: Number(e.target.value) })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                          step={50}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">Échantillon</span>
                        <input
                          type="number"
                          value={l.sampleSize}
                          onChange={(e) =>
                            update(l.id, { sampleSize: Number(e.target.value) })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                          step={10}
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                        <span>0ms</span>
                        <span>SLO {l.sloTargetMs}ms</span>
                        <span>{(l.sloTargetMs * 2).toFixed(0)}ms</span>
                      </div>
                      <div className="relative h-2 bg-card border border-border rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full w-[50%] border-r border-dashed border-green-500/50"
                          title="SLO"
                        />
                        <div
                          className={`h-full ${barColor} transition-all`}
                          style={{
                            width: `${Math.min(100, (ratio / 2) * 100)}%`,
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted font-mono">
                        <span>p95 : {l.p95Ms}ms</span>
                        <span>·</span>
                        <span>
                          ratio p95/SLO :{" "}
                          <span className={meta.color}>
                            {(ratio * 100).toFixed(0)}%
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-muted">Mesuré le :</label>
                      <input
                        type="date"
                        value={l.sampledAt}
                        onChange={(e) => update(l.id, { sampledAt: e.target.value })}
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                      />
                      <input
                        type="text"
                        value={l.notes}
                        onChange={(e) => update(l.id, { notes: e.target.value })}
                        placeholder="Notes (source: Sentry, RUM…)"
                        className="flex-1 h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                      />
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
            + Nouvelle mesure
          </button>
        </>
      )}
    </div>
  );
}
