"use client";

import { useState } from "react";
import type { PrinciplesState } from "../state";
import { UX_LAWS } from "../laws-library";
import { validatePrinciplesCount } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function DesignPrinciplesBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.designPrinciples.length > 0);
  const filled = state.designPrinciples.filter((p) => p.trim()).length;
  const issues = validatePrinciplesCount(state);
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = filled >= 3 && filled <= 5;

  function updatePrinciple(index: number, value: string) {
    const next = [...state.designPrinciples];
    next[index] = value;
    onChange({ designPrinciples: next });
  }

  function addPrinciple(seed?: string) {
    if (state.designPrinciples.length >= 7) return;
    onChange({ designPrinciples: [...state.designPrinciples, seed ?? ""] });
  }

  function removePrinciple(index: number) {
    onChange({
      designPrinciples: state.designPrinciples.filter((_, i) => i !== index),
    });
  }

  // Générer des suggestions depuis les lois pinned
  function generateFromPinned() {
    if (state.pinnedLaws.length === 0) return;
    const suggestions: string[] = [];
    for (const pin of state.pinnedLaws.slice(0, 5)) {
      const law = UX_LAWS.find((l) => l.slug === pin.lawSlug);
      if (!law) continue;
      suggestions.push(`${law.name.replace(/<[^>]+>/g, "")} appliquée : ${law.summary}`);
    }
    onChange({ designPrinciples: [...state.designPrinciples, ...suggestions] });
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
          📜 Design Principles Card
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({filled}/5)</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">3-5 principes non négociables</strong> qui
            guident chaque décision UI/UX. Format actionnable (ex : « Chaque action destructive a
            un undo de 5s »). Trop de principes (&gt;5) = personne ne les retient.
          </div>

          {state.pinnedLaws.length > 0 && state.designPrinciples.length === 0 && (
            <button
              onClick={generateFromPinned}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              ✨ Générer depuis les {state.pinnedLaws.length} lois épinglées
            </button>
          )}

          <div className="space-y-2">
            {state.designPrinciples.map((p, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-mono text-xs text-muted mt-2 w-6">#{i + 1}</span>
                <textarea
                  value={p}
                  onChange={(e) => updatePrinciple(i, e.target.value)}
                  placeholder="Ex : Chaque action destructive a un undo de 5s"
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm rounded border border-border bg-card resize-none"
                />
                <button
                  onClick={() => removePrinciple(i)}
                  className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs mt-1"
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </div>
            ))}

            {state.designPrinciples.length < 7 && (
              <button
                onClick={() => addPrinciple()}
                className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
              >
                + Ajouter un principe
              </button>
            )}
          </div>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
