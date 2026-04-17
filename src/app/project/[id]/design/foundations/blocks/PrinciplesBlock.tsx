"use client";

import { useState } from "react";
import { validatePrinciples } from "../validators";
import {
  makePrincipleId,
  type FoundationsPrinciple,
  type FoundationsState,
} from "../state";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const EXAMPLES = [
  { principle: "Vitesse > Personnalisation", rationale: "Linear, Superhuman" },
  { principle: "Clarté > Richesse", rationale: "Stripe, Apple" },
  { principle: "Focus > Options", rationale: "Notion, Basecamp" },
  { principle: "Simplicité > Complétude", rationale: "37signals" },
  { principle: "Silence > Notifications", rationale: "Productivity apps" },
  { principle: "Action > Configuration", rationale: "Zero-config setup" },
];

export default function PrinciplesBlock({
  state,
  onChange,
}: {
  state: FoundationsState;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.designPrinciples.length > 0);
  const issues = validatePrinciples(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const opposableCount = state.designPrinciples.filter((p) => p.principle.includes(">")).length;
  const ok = opposableCount >= 3 && !hasError;

  const summary =
    state.designPrinciples.length > 0
      ? state.designPrinciples
          .filter((p) => p.principle.trim())
          .map((p) => p.principle.trim())
          .join(" · ")
      : null;

  function addPrinciple(seed?: Partial<FoundationsPrinciple>) {
    if (state.designPrinciples.length >= 5) return;
    const next: FoundationsPrinciple = {
      id: makePrincipleId(),
      principle: seed?.principle ?? "",
      rationale: seed?.rationale ?? "",
    };
    onChange({ designPrinciples: [...state.designPrinciples, next] });
  }

  function updatePrinciple(id: string, patch: Partial<FoundationsPrinciple>) {
    onChange({
      designPrinciples: state.designPrinciples.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    });
  }

  function removePrinciple(id: string) {
    onChange({ designPrinciples: state.designPrinciples.filter((p) => p.id !== id) });
  }

  function movePrinciple(id: string, dir: -1 | 1) {
    const index = state.designPrinciples.findIndex((p) => p.id === id);
    if (index === -1) return;
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= state.designPrinciples.length) return;
    const copy = [...state.designPrinciples];
    [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
    onChange({ designPrinciples: copy });
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
          🧭 Principes design
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.designPrinciples.length}/5)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && summary && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {summary}
        </div>
      )}

      {expanded && (
      <>
      <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">Un bon principe tranche un dilemme.</strong>{" "}
        <em>&laquo; Clarté &gt; Richesse &raquo;</em> force un choix. <em>&laquo; Simple et
        efficace &raquo;</em> ne tranche rien. Objectif : 3-5 principes opposables (format A &gt; B).
      </div>

      <div className="space-y-2">
        {state.designPrinciples.map((principle, index) => (
          <div key={principle.id} className="flex items-start gap-2">
            <div className="flex flex-col">
              <button
                onClick={() => movePrinciple(principle.id, -1)}
                disabled={index === 0}
                className="w-6 h-5 rounded text-xs text-muted hover:text-foreground hover:bg-accent/10 disabled:opacity-30"
                aria-label="Monter"
              >
                ▲
              </button>
              <button
                onClick={() => movePrinciple(principle.id, 1)}
                disabled={index === state.designPrinciples.length - 1}
                className="w-6 h-5 rounded text-xs text-muted hover:text-foreground hover:bg-accent/10 disabled:opacity-30"
                aria-label="Descendre"
              >
                ▼
              </button>
            </div>
            <div className="flex-1 space-y-1 bg-card/60 border border-border rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted">#{index + 1}</span>
                <input
                  type="text"
                  value={principle.principle}
                  onChange={(e) =>
                    updatePrinciple(principle.id, { principle: e.target.value })
                  }
                  placeholder="Ex : Clarté > Richesse"
                  className="flex-1 h-9 px-3 text-sm rounded border border-border bg-card font-medium"
                />
                <button
                  onClick={() => removePrinciple(principle.id)}
                  className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </div>
              <input
                type="text"
                value={principle.rationale}
                onChange={(e) => updatePrinciple(principle.id, { rationale: e.target.value })}
                placeholder="Pourquoi ce trade-off ? (optionnel mais recommandé)"
                className="w-full h-8 px-3 text-xs rounded border border-border bg-card text-muted"
              />
            </div>
          </div>
        ))}

        {state.designPrinciples.length < 5 && (
          <button
            onClick={() => addPrinciple()}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Ajouter un principe
          </button>
        )}
      </div>

      {state.designPrinciples.length < 3 && (
        <div className="space-y-2">
          <div className="text-xs text-muted">Exemples cliquables :</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.slice(0, 5 - state.designPrinciples.length).map((ex, i) => (
              <button
                key={i}
                onClick={() => addPrinciple(ex)}
                className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
                disabled={state.designPrinciples.length >= 5}
              >
                {ex.principle}{" "}
                <span className="text-muted">— {ex.rationale}</span>
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
