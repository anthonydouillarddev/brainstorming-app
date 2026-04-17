"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { DesignSystemState, SemanticToken } from "../state";
import { SEMANTIC_PRESETS, makeId } from "../state";
import { MVP_BY_TYPE } from "../components-catalog";
import { PATTERN_TEMPLATES } from "../patterns-library";

type Step = "tokens" | "components" | "patterns" | "done";

const STEPS: Step[] = ["tokens", "components", "patterns", "done"];

export default function BeginnerChat({
  state,
  projectType,
  onChange,
  onSwitchMode,
}: {
  state: DesignSystemState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<DesignSystemState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (state.semanticTokens.length === 0) return 0;
    if (state.components.length === 0) return 1;
    if (state.patterns.length === 0) return 2;
    return 3;
  });

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }
  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function loadSemanticPresets() {
    const next: SemanticToken[] = SEMANTIC_PRESETS.map((p) => ({ ...p, id: makeId("tok") }));
    onChange({ semanticTokens: next });
  }

  function loadTypeRecommendations() {
    if (!projectType) return;
    const reco = MVP_BY_TYPE[projectType];
    const next = [
      ...reco.must.map((s) => ({ slug: s, priority: "must" as const, notes: "" })),
      ...reco.should.map((s) => ({ slug: s, priority: "should" as const, notes: "" })),
    ];
    onChange({ components: next });
  }

  function enableAllPatterns() {
    onChange({
      patterns: PATTERN_TEMPLATES.map((t) => ({
        patternId: t.id,
        type: t.type,
        customMarkdown: "",
      })),
    });
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 md:p-8 space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">
            Étape {stepIndex + 1} / {STEPS.length}
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

      {step === "tokens" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            Charge tes semantic tokens de base
          </h2>
          <p className="text-sm text-muted">
            10 tokens pré-remplis (bg.primary, text.default, border.default, feedback.danger…)
            prêts à l&apos;emploi. Tu ajustes les couleurs après.
          </p>
          <button
            onClick={() => {
              loadSemanticPresets();
              next();
            }}
            disabled={state.semanticTokens.length > 0}
            className="w-full text-sm font-medium px-4 py-4 rounded-xl bg-accent/10 border-2 border-accent/30 text-accent hover:bg-accent/20 disabled:opacity-50 transition"
          >
            {state.semanticTokens.length > 0
              ? `✓ ${state.semanticTokens.length} tokens chargés`
              : `📦 Charger les 10 tokens par défaut`}
          </button>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={prev}
              disabled
              className="text-sm px-4 py-2 rounded border border-border opacity-30"
            >
              ← Retour
            </button>
            <button
              onClick={next}
              disabled={state.semanticTokens.length === 0}
              className="text-sm px-5 py-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {step === "components" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            Quels composants te faut-il pour {projectType ? `ton ${projectType}` : "ton projet"} ?
          </h2>
          <p className="text-sm text-muted">
            Charge la sélection recommandée (MUST + SHOULD) pour démarrer vite. Tu pourras
            ajouter/retirer après.
          </p>
          {projectType && (
            <button
              onClick={() => {
                loadTypeRecommendations();
                next();
              }}
              disabled={state.components.length > 0}
              className="w-full text-sm font-medium px-4 py-4 rounded-xl bg-accent/10 border-2 border-accent/30 text-accent hover:bg-accent/20 disabled:opacity-50 transition"
            >
              {state.components.length > 0
                ? `✓ ${state.components.length} composants sélectionnés`
                : `📦 Charger la reco ${projectType} (${
                    MVP_BY_TYPE[projectType].must.length +
                    MVP_BY_TYPE[projectType].should.length
                  } composants)`}
            </button>
          )}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={prev}
              className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition"
            >
              ← Retour
            </button>
            <button
              onClick={next}
              disabled={state.components.length === 0}
              className="text-sm px-5 py-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {step === "patterns" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">Active les patterns d&apos;état</h2>
          <p className="text-sm text-muted">
            Empty / Loading / Error / Success. Les 4 états à ne jamais oublier.
          </p>
          <button
            onClick={() => {
              enableAllPatterns();
              next();
            }}
            disabled={state.patterns.length > 0}
            className="w-full text-sm font-medium px-4 py-4 rounded-xl bg-accent/10 border-2 border-accent/30 text-accent hover:bg-accent/20 disabled:opacity-50 transition"
          >
            {state.patterns.length > 0
              ? `✓ ${state.patterns.length} patterns activés`
              : `📦 Activer les ${PATTERN_TEMPLATES.length} patterns par défaut`}
          </button>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={prev}
              className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition"
            >
              ← Retour
            </button>
            <button
              onClick={next}
              disabled={state.patterns.length === 0}
              className="text-sm px-5 py-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-lg md:text-xl font-bold">Design System initialisé !</h2>
            <p className="text-sm text-muted">
              {state.semanticTokens.length} tokens · {state.components.length} composants ·{" "}
              {state.patterns.length} patterns. Passe au mode Formulaire pour ajuster les
              couleurs, les variants et l&apos;a11y.
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
              onClick={prev}
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
