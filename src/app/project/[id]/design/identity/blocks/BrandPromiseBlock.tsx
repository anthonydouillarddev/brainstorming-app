"use client";

import { useState } from "react";
import type { IdentityState } from "../state";
import { validatePromise } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const EXAMPLES = [
  "Pour les freelances, une facturation qui prévient avant les relances.",
  "Pour les équipes qui lisent beaucoup, un éditeur sans distraction.",
  "Pour les dev solo, un design system en 30 minutes.",
];

export default function BrandPromiseBlock({
  state,
  onChange,
}: {
  state: IdentityState;
  onChange: (patch: Partial<IdentityState>) => void;
}) {
  const [expanded, setExpanded] = useState(!!state.brandPromise.trim());
  const issues = validatePromise(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const wordCount = state.brandPromise.trim().split(/\s+/).filter(Boolean).length;
  const ok = wordCount >= 4 && wordCount <= 15 && !hasError && !hasWarn;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎁 Brand promise
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && state.brandPromise.trim() && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          « {state.brandPromise.trim()} »
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Neumeier</strong> : une marque, c&apos;est un{" "}
            <em>gut feeling</em>. La promise est la phrase qui déclenche ce feeling.
            <strong className="text-foreground"> Objectif : ≤ 15 mots.</strong> Évite{" "}
            <em>leader, innovant, révolutionnaire, solution</em> — ça ne dit rien.
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium flex items-center justify-between">
              <span>Ta brand promise</span>
              <span
                className={`font-mono text-[10px] ${
                  wordCount > 15 ? "text-amber-500" : "text-muted"
                }`}
              >
                {wordCount} mot{wordCount > 1 ? "s" : ""}
              </span>
            </label>
            <textarea
              value={state.brandPromise}
              onChange={(e) => onChange({ brandPromise: e.target.value })}
              rows={2}
              placeholder="Pour [cible], [ton produit] est [catégorie] qui [bénéfice unique]."
              className="w-full px-3 py-2 text-sm rounded border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted">Exemples cliquables :</div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => onChange({ brandPromise: ex })}
                  className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition text-left max-w-md"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
