"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import type { HeuristicAnswer, NielsenEntry, PrinciplesState } from "../state";
import { NIELSEN_HEURISTICS } from "../nielsen";
import { computeNielsenScore } from "../state";

export default function BeginnerChat({
  state,
  project,
  onChange,
  onSwitchMode,
}: {
  state: PrinciplesState;
  project: Project;
  onChange: (patch: Partial<PrinciplesState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    const firstUnanswered = NIELSEN_HEURISTICS.findIndex(
      (h) => !state.nielsenAnswers.find((a) => a.heuristicSlug === h.slug)
    );
    return firstUnanswered >= 0 ? firstUnanswered : NIELSEN_HEURISTICS.length;
  });

  const isDone = stepIndex >= NIELSEN_HEURISTICS.length;
  const step = isDone ? null : NIELSEN_HEURISTICS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / (NIELSEN_HEURISTICS.length + 1)) * 100);
  const score = computeNielsenScore(state);

  function answer(a: HeuristicAnswer) {
    if (!step) return;
    const existing = state.nielsenAnswers.find((e) => e.heuristicSlug === step.slug);
    const entry: NielsenEntry = existing
      ? { ...existing, answer: a }
      : { heuristicSlug: step.slug, answer: a, note: "" };
    const next = existing
      ? state.nielsenAnswers.map((e) => (e.heuristicSlug === step.slug ? entry : e))
      : [...state.nielsenAnswers, entry];
    onChange({ nielsenAnswers: next });
    setStepIndex(stepIndex + 1);
  }

  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 md:p-8 space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">
            Heuristique {Math.min(stepIndex + 1, NIELSEN_HEURISTICS.length)} /{" "}
            {NIELSEN_HEURISTICS.length}
          </span>
          <span className="font-mono text-muted">{progress}%</span>
        </div>
        <div className="h-2 bg-card border border-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step ? (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-accent font-semibold">
              Nielsen #{step.num}
            </div>
            <h2
              className="text-lg md:text-xl font-bold mt-1"
              dangerouslySetInnerHTML={{ __html: step.title }}
            />
          </div>
          <p
            className="text-sm text-muted"
            dangerouslySetInnerHTML={{ __html: step.question }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-xs">
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                ✓ Exemple
              </div>
              <div className="text-muted">{step.exampleGood}</div>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-xs">
              <div className="font-semibold text-red-500 mb-1">✗ Anti-exemple</div>
              <div className="text-muted">{step.exampleBad}</div>
            </div>
          </div>

          <p className="text-xs text-muted italic">{step.summary}</p>

          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              onClick={prev}
              disabled={stepIndex === 0}
              className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 disabled:opacity-30 transition"
            >
              ← Retour
            </button>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button
                onClick={() => answer("yes")}
                className="text-sm px-4 py-2 rounded bg-green-500/20 border border-green-500 text-green-600 hover:bg-green-500/30 transition"
              >
                ✓ Oui
              </button>
              <button
                onClick={() => answer("no")}
                className="text-sm px-4 py-2 rounded bg-red-500/20 border border-red-500 text-red-500 hover:bg-red-500/30 transition"
              >
                ✗ Non
              </button>
              <button
                onClick={() => answer("unknown")}
                className="text-sm px-4 py-2 rounded border border-border text-muted hover:bg-accent/10 transition"
              >
                ? Je sais pas
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-lg md:text-xl font-bold">
              Audit terminé — score {score.passed}/{score.total}
            </h2>
            <p className="text-sm text-muted">
              Tu as répondu aux 10 heuristiques de Nielsen pour{" "}
              <strong>{project.official_name || project.name}</strong>. Passe au mode Formulaire
              pour épingler les lois UX, faire l&apos;audit d&apos;affordances/feedback et
              générer ta Design Principles Card.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={onSwitchMode}
              className="text-sm px-5 py-2 rounded bg-accent text-white hover:bg-accent-hover transition"
            >
              Passer au mode Formulaire →
            </button>
            <button
              onClick={() => setStepIndex(0)}
              className="text-sm px-5 py-2 rounded border border-border hover:bg-accent/10 transition"
            >
              ← Revoir mes réponses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
