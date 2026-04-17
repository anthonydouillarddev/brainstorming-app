"use client";

import { useState } from "react";
import type { FlowsState } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function CriticalPathBlock({
  state,
  onChange,
}: {
  state: FlowsState;
  onChange: (patch: Partial<FlowsState>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const criticalSteps = state.steps.filter((s) => s.isCritical);
  const ahaIndex = state.steps.findIndex((s) => s.isAhaMoment);
  const pathLength = criticalSteps.length;
  const ahaPosition = ahaIndex >= 0 ? ahaIndex + 1 : null;

  const ok = pathLength > 0 && pathLength <= 5 && ahaPosition !== null;
  const hasWarn = pathLength > 5;

  function toggleCritical(stepId: string) {
    onChange({
      steps: state.steps.map((s) =>
        s.id === stepId ? { ...s, isCritical: !s.isCritical } : s
      ),
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
          🎯 Critical path
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">
            ({pathLength} étape{pathLength > 1 ? "s" : ""}
            {ahaPosition ? ` · aha step ${ahaPosition}` : ""})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Critical path</strong> = le chemin minimum
            obligatoire (landing → signup → first value). Bascule les étapes entre critique ou
            optionnelle. Objectif : ≤ 5 étapes critiques avant l&apos;aha moment.
          </div>

          {state.steps.length === 0 ? (
            <div className="text-xs text-muted italic text-center py-4">
              Ajoute des étapes dans le bloc FlowSteps pour voir le critical path.
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {state.steps.map((s, i) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2 p-2 rounded border transition ${
                      s.isCritical
                        ? "border-accent/50 bg-accent/5"
                        : "border-border bg-card/40 opacity-60"
                    }`}
                  >
                    <span className="font-mono text-xs text-muted w-6">#{i + 1}</span>
                    <span className="text-lg">{s.isAhaMoment ? "⭐" : "📄"}</span>
                    <span className="flex-1 text-sm font-medium">
                      {s.label || "(sans nom)"}
                    </span>
                    <button
                      onClick={() => toggleCritical(s.id)}
                      className={`text-[10px] px-2 py-1 rounded transition ${
                        s.isCritical
                          ? "bg-accent text-white"
                          : "border border-border text-muted hover:bg-accent/10"
                      }`}
                    >
                      {s.isCritical ? "CRITIQUE" : "optionnel"}
                    </button>
                  </div>
                ))}
              </div>

              <div
                className={`border rounded-xl p-4 ${
                  pathLength <= 5
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                      Chemin critique
                    </div>
                    <div className="text-lg font-bold">
                      {pathLength} étape{pathLength > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-xs text-muted">
                    {pathLength <= 5 ? (
                      <span className="text-green-600">✓ Dans la cible (≤ 5)</span>
                    ) : (
                      <span className="text-amber-500">
                        ⚠ Au-delà de 5 — 10-20% drop-off par étape (Baymard)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
