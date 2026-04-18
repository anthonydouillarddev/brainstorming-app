"use client";

import { useState } from "react";
import type { PmfMetricEntry, PmfMetricKind, ValidationState } from "../state";
import { PMF_METRIC_META, makeId } from "../state";
import { validatePmf } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function PmfMetricsBlock({
  state,
  onChange,
}: {
  state: ValidationState;
  onChange: (patch: Partial<ValidationState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.pmfMetrics.length > 0);
  const issues = validatePmf(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.pmfMetrics.length >= 2 && !hasError;

  function addMetric(kind: PmfMetricKind) {
    const meta = PMF_METRIC_META[kind];
    const next: PmfMetricEntry = {
      id: makeId("pmf"),
      kind,
      value: 0,
      target: meta.target,
      measuredAt: new Date().toISOString().slice(0, 10),
      sampleSize: 0,
      notes: "",
    };
    onChange({ pmfMetrics: [...state.pmfMetrics, next] });
  }

  function update(id: string, patch: Partial<PmfMetricEntry>) {
    onChange({
      pmfMetrics: state.pmfMetrics.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  }

  function remove(id: string) {
    onChange({ pmfMetrics: state.pmfMetrics.filter((m) => m.id !== id) });
  }

  const usedKinds = new Set(state.pmfMetrics.map((m) => m.kind));
  const availableKinds = (Object.keys(PMF_METRIC_META) as PmfMetricKind[]).filter(
    (k) => !usedKinds.has(k)
  );

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎯 PMF metrics
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.pmfMetrics.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Sean Ellis + Reichheld.</strong> Sean Ellis 40%
            rule : ≥ 40% users « very disappointed » si produit disparu = PMF. Complété par NPS
            (≥ 30), activation, rétention, wow moment time.
          </div>

          {state.pmfMetrics.length > 0 && (
            <div className="space-y-2">
              {state.pmfMetrics.map((m) => {
                const meta = PMF_METRIC_META[m.kind];
                const ratio = meta.target === 0 ? 0 : m.value / meta.target;
                const hit = m.sampleSize >= 30 && m.value >= meta.target;
                const miss = m.sampleSize >= 30 && m.value < meta.target * 0.5;
                const color = hit
                  ? "border-green-500/30 bg-green-500/5"
                  : miss
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-amber-500/30 bg-amber-500/5";
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg border ${color} space-y-2`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={m.kind}
                        onChange={(e) =>
                          update(m.id, { kind: e.target.value as PmfMetricKind })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(PMF_METRIC_META) as PmfMetricKind[]).map((k) => (
                          <option key={k} value={k}>
                            {PMF_METRIC_META[k].emoji} {PMF_METRIC_META[k].label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => remove(m.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.hint}</div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Valeur</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={m.value}
                            onChange={(e) =>
                              update(m.id, { value: Number(e.target.value) })
                            }
                            className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                            step={m.kind === "nps" ? 1 : 0.1}
                          />
                          <span className="text-muted text-[10px]">{meta.unit}</span>
                        </div>
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Target</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={m.target}
                            onChange={(e) =>
                              update(m.id, { target: Number(e.target.value) })
                            }
                            className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                            step={m.kind === "nps" ? 1 : 0.1}
                          />
                          <span className="text-muted text-[10px]">{meta.unit}</span>
                        </div>
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Échantillon</span>
                        <input
                          type="number"
                          value={m.sampleSize}
                          onChange={(e) =>
                            update(m.id, { sampleSize: Number(e.target.value) })
                          }
                          className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted">Mesuré le</span>
                        <input
                          type="date"
                          value={m.measuredAt}
                          onChange={(e) =>
                            update(m.id, { measuredAt: e.target.value })
                          }
                          className="h-7 px-2 text-[11px] rounded border border-border bg-card font-mono"
                        />
                      </label>
                    </div>

                    <div className="space-y-1">
                      <div className="h-2 bg-card border border-border rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            hit
                              ? "bg-green-500"
                              : miss
                                ? "bg-red-500"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, ratio * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted font-mono">
                        <span>
                          {m.value}
                          {meta.unit}
                        </span>
                        <span>
                          Target : {m.target}
                          {meta.unit}
                        </span>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={m.notes}
                      onChange={(e) => update(m.id, { notes: e.target.value })}
                      placeholder="Notes / source"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {availableKinds.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Ajouter :</div>
              <div className="flex flex-wrap gap-1">
                {availableKinds.map((k) => (
                  <button
                    key={k}
                    onClick={() => addMetric(k)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {PMF_METRIC_META[k].emoji} {PMF_METRIC_META[k].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
