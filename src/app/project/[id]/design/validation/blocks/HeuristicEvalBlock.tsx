"use client";

import { useState } from "react";
import type {
  FindingSeverity,
  HeuristicEvalEntry,
  HeuristicId,
  ValidationState,
} from "../state";
import { FINDING_SEVERITY_META, HEURISTIC_META, makeId } from "../state";
import { HEURISTIC_EVAL_DEFAULTS } from "../validation-library";
import { validateHeuristic } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

type EvalSeverity = FindingSeverity | "none";

const SEVERITY_OPTIONS: Array<{ key: EvalSeverity; label: string; emoji: string }> = [
  { key: "none", label: "Non évalué", emoji: "◦" },
  { key: "minor", label: "Mineur", emoji: "🔵" },
  { key: "moderate", label: "Modéré", emoji: "🟡" },
  { key: "serious", label: "Sérieux", emoji: "🟠" },
  { key: "critical", label: "Critique", emoji: "🔴" },
];

export default function HeuristicEvalBlock({
  state,
  onChange,
}: {
  state: ValidationState;
  onChange: (patch: Partial<ValidationState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.heuristicEvals.length > 0);
  const issues = validateHeuristic(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const evaluated = state.heuristicEvals.filter((h) => h.severity !== "none").length;
  const resolved = state.heuristicEvals.filter((h) => h.resolved).length;
  const ok = evaluated >= 5 && !hasError;

  function loadAll() {
    onChange({
      heuristicEvals: HEURISTIC_EVAL_DEFAULTS.map((h) => ({
        ...h,
        id: makeId("heur"),
      })),
    });
  }

  function update(id: string, patch: Partial<HeuristicEvalEntry>) {
    onChange({
      heuristicEvals: state.heuristicEvals.map((h) =>
        h.id === id ? { ...h, ...patch } : h
      ),
    });
  }

  function remove(id: string) {
    onChange({
      heuristicEvals: state.heuristicEvals.filter((h) => h.id !== id),
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
          🔎 Heuristiques Nielsen
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({evaluated}/{state.heuristicEvals.length} évaluées · {resolved} résolues)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">NN/G (Nielsen, 1994, révisé 2020).</strong>{" "}
            Évaluation experte complémentaire aux tests users. Pour chaque heuristique : evidence
            (où c&apos;est cassé), severity, suggestion, resolved.
          </div>

          {state.heuristicEvals.length === 0 && (
            <button
              onClick={loadAll}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les 10 heuristiques
            </button>
          )}

          {state.heuristicEvals.length > 0 && (
            <div className="space-y-1.5">
              {state.heuristicEvals.map((h) => {
                const meta = HEURISTIC_META[h.heuristic];
                const smeta =
                  h.severity !== "none" ? FINDING_SEVERITY_META[h.severity] : null;
                const colorClass =
                  h.severity === "none"
                    ? "border-border bg-card"
                    : smeta?.color ?? "border-border bg-card";
                return (
                  <div
                    key={h.id}
                    className={`p-2.5 rounded-lg border ${colorClass} space-y-1.5 ${h.resolved ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={h.heuristic}
                        onChange={(e) =>
                          update(h.id, { heuristic: e.target.value as HeuristicId })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium flex-1 min-w-[200px]"
                      >
                        {(Object.keys(HEURISTIC_META) as HeuristicId[]).map((k) => (
                          <option key={k} value={k}>
                            {HEURISTIC_META[k].emoji} {HEURISTIC_META[k].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={h.severity}
                        onChange={(e) =>
                          update(h.id, { severity: e.target.value as EvalSeverity })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {SEVERITY_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.emoji} {opt.label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={h.resolved}
                          onChange={(e) => update(h.id, { resolved: e.target.checked })}
                          className="accent-accent"
                        />
                        Résolu
                      </label>
                      <button
                        onClick={() => remove(h.id)}
                        className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.hint}</div>
                    <textarea
                      value={h.evidence}
                      onChange={(e) => update(h.id, { evidence: e.target.value })}
                      placeholder="Evidence (où c'est cassé / où ça fonctionne)"
                      rows={2}
                      className="w-full px-2 py-1 text-[11px] rounded border border-border bg-card resize-y"
                    />
                    <textarea
                      value={h.suggestion}
                      onChange={(e) => update(h.id, { suggestion: e.target.value })}
                      placeholder="Suggestion d'amélioration"
                      rows={1}
                      className="w-full px-2 py-1 text-[11px] rounded border border-border bg-card resize-y"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}

