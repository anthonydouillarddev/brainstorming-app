"use client";

import { useState } from "react";
import type { FlowsState } from "../state";
import { computeFrictionScore } from "../state";
import { validateFriction } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function FrictionCounterBlock({ state }: { state: FlowsState }) {
  const [expanded, setExpanded] = useState(false);
  const score = computeFrictionScore(state);
  const issues = validateFriction(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = score.level === "low" && !hasError;

  const levelColor =
    score.level === "low"
      ? "text-green-600"
      : score.level === "medium"
      ? "text-amber-500"
      : "text-red-500";
  const levelBg =
    score.level === "low"
      ? "bg-green-500/10 border-green-500/30"
      : score.level === "medium"
      ? "bg-amber-500/10 border-amber-500/30"
      : "bg-red-500/10 border-red-500/30";
  const levelLabel =
    score.level === "low" ? "Low" : score.level === "medium" ? "Medium" : "High";

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          📊 Friction counter
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className={`text-sm font-normal ${levelColor}`}>
            {score.total} ({levelLabel})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Calculé automatiquement</strong> depuis les
            étapes : <code>total = steps + fields + decisions×2 + modals×2</code>. Seuils : low
            &lt; 6, medium &lt; 10, high ≥ 10 (Baymard).
          </div>

          <div className={`border rounded-xl p-4 ${levelBg}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                  Friction score
                </div>
                <div className={`text-3xl font-bold ${levelColor}`}>{score.total}</div>
              </div>
              <div className={`text-sm font-semibold ${levelColor}`}>{levelLabel}</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <FrictionCell label="Étapes" value={score.breakdown.steps} weight="×1" />
              <FrictionCell label="Champs" value={score.breakdown.fields} weight="×1" />
              <FrictionCell label="Décisions" value={score.breakdown.decisions} weight="×2" />
              <FrictionCell label="Modals" value={score.breakdown.modals} weight="×2" />
            </div>
          </div>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}

function FrictionCell({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: string;
}) {
  return (
    <div className="bg-card/60 border border-border rounded-lg p-2 text-center">
      <div className="text-[10px] text-muted">{label}</div>
      <div className="text-lg font-bold font-mono">{value}</div>
      <div className="text-[9px] text-muted/70">{weight}</div>
    </div>
  );
}
