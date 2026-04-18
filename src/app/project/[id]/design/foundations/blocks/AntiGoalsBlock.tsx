"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import { validateAntiGoals } from "../validators";
import type { FoundationsState } from "../state";
import { ANTI_GOALS_TEMPLATES } from "../templates";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function AntiGoalsBlock({
  state,
  projectType,
  onChange,
}: {
  state: FoundationsState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.antiGoals.length > 0);
  const issues = validateAntiGoals(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.antiGoals.length >= 1 && !hasError;

  const templates = projectType ? ANTI_GOALS_TEMPLATES[projectType] : [];
  const availableTemplates = templates.filter((t) => !state.antiGoals.includes(t));

  function addGoal(text: string) {
    const trimmed = text.trim();
    if (!trimmed || state.antiGoals.includes(trimmed)) return;
    onChange({ antiGoals: [...state.antiGoals, trimmed] });
  }

  function removeGoal(i: number) {
    onChange({ antiGoals: state.antiGoals.filter((_, idx) => idx !== i) });
  }

  function updateGoal(i: number, value: string) {
    onChange({
      antiGoals: state.antiGoals.map((g, idx) => (idx === i ? value : g)),
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
          🚫 Anti-goals
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.antiGoals.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Un produit qui veut servir tout le monde ne
            sert personne.</strong> Liste explicitement ce que ton produit ne fera{" "}
            <em>jamais</em> — ça te protège du scope creep et ça clarifie ton positionnement.
          </div>

          <div className="space-y-1">
            {state.antiGoals.map((goal, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="text-red-500 shrink-0">✗</span>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => updateGoal(i, e.target.value)}
                  className="h-9 px-3 text-sm rounded border border-border bg-card flex-1"
                />
                <button
                  onClick={() => removeGoal(i)}
                  className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                  aria-label="Retirer"
                >
                  ×
                </button>
              </div>
            ))}
            <input
              type="text"
              placeholder="Ajouter un anti-goal (Enter pour valider)"
              className="h-9 px-3 text-sm rounded border border-dashed border-border bg-card w-full"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const input = e.target as HTMLInputElement;
                  addGoal(input.value);
                  input.value = "";
                }
              }}
            />
          </div>

          {availableTemplates.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">
                Templates pour type <strong>{projectType}</strong> — clic pour ajouter :
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableTemplates.map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => addGoal(tpl)}
                    className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition text-left"
                  >
                    + {tpl}
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
