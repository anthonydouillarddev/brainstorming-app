"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { FlowsState } from "../state";
import { PATTERNS, PATTERN_DEFAULT } from "../templates";
import BlockStatus from "../components/BlockStatus";

export default function OnboardingPatternBlock({
  state,
  projectType,
  onChange,
}: {
  state: FlowsState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<FlowsState>) => void;
}) {
  const [expanded, setExpanded] = useState(!state.onboardingPattern);
  const ok = !!state.onboardingPattern;
  const recommended = projectType ? PATTERN_DEFAULT[projectType] : null;
  const selected = state.onboardingPattern
    ? PATTERNS.find((p) => p.key === state.onboardingPattern)
    : null;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎯 Pattern d&apos;onboarding
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {!expanded && selected && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {selected.emoji} {selected.label}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Anti-patterns</strong> : tutoriel slide de 10
            écrans (tout le monde skip), permissions avant value, signup avec 8 champs.{" "}
            <strong className="text-foreground">Pattern préféré 2024+</strong> : empty-state
            teaching (Linear, Superhuman) — la page vide enseigne par elle-même.
            {recommended && !state.onboardingPattern && (
              <>
                <br />
                <strong className="text-foreground">Reco {projectType}</strong> :{" "}
                {PATTERNS.find((p) => p.key === recommended)?.label}.
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {PATTERNS.map((p) => {
              const isSelected = state.onboardingPattern === p.key;
              const isRecommended = p.key === recommended;
              return (
                <button
                  key={p.key}
                  onClick={() => onChange({ onboardingPattern: p.key })}
                  className={`text-left p-3 rounded-lg border-2 transition ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="font-semibold text-sm">{p.label}</span>
                    {isRecommended && !isSelected && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-accent/20 text-accent">
                        RECO
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted mb-1">{p.description}</div>
                  <div className="text-[10px] text-muted/70">
                    <span className="font-semibold">Best for :</span> {p.bestFor}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.examples.map((ex) => (
                      <span
                        key={ex}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-muted/20 text-muted"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
