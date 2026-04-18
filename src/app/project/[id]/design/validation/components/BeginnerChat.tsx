"use client";

import { useState } from "react";
import type { ValidationState } from "../state";
import { makeId } from "../state";
import { HEURISTIC_EVAL_DEFAULTS } from "../validation-library";

type Step = "tests" | "sus" | "heuristic" | "pmf" | "done";

const STEPS: Step[] = ["tests", "sus", "heuristic", "pmf", "done"];

export default function BeginnerChat({
  state,
  onChange,
  onSwitchMode,
}: {
  state: ValidationState;
  onChange: (patch: Partial<ValidationState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (state.userTests.length === 0) return 0;
    if (state.susResponses.length === 0) return 1;
    if (state.heuristicEvals.length === 0) return 2;
    if (state.pmfMetrics.length === 0) return 3;
    return 4;
  });

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }
  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function seedFirstTest() {
    onChange({
      userTests: [
        {
          id: makeId("test"),
          title: "Test usability — onboarding v1",
          method: "moderated",
          goal: "Valider la création du premier projet en < 3 min",
          participantCount: 5,
          completionRate: 0,
          timeOnTaskSec: 0,
          status: "planned",
          startedAt: new Date().toISOString().slice(0, 10),
          findings: [],
          notes: "Protocol : think-aloud · 45min par session",
        },
      ],
    });
  }

  function seedFirstSus() {
    onChange({
      susResponses: [
        {
          id: makeId("sus"),
          participantLabel: "P1",
          answers: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
          notes: "Réponse initiale · à remplir après test",
        },
      ],
    });
  }

  function seedHeuristics() {
    onChange({
      heuristicEvals: HEURISTIC_EVAL_DEFAULTS.map((h) => ({
        ...h,
        id: makeId("heur"),
      })),
    });
  }

  function seedPmf() {
    onChange({
      pmfMetrics: [
        {
          id: makeId("pmf"),
          kind: "sean-ellis",
          value: 0,
          target: 40,
          measuredAt: new Date().toISOString().slice(0, 10),
          sampleSize: 0,
          notes: "À mesurer via Typeform ou in-app survey",
        },
        {
          id: makeId("pmf"),
          kind: "activation-rate",
          value: 0,
          target: 40,
          measuredAt: new Date().toISOString().slice(0, 10),
          sampleSize: 0,
          notes: "% users atteignant l'aha moment",
        },
      ],
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

      {step === "tests" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🧑‍🔬 Étape 1 — Tests utilisateurs</h2>
          <p className="text-sm text-muted leading-relaxed">
            NN/G : <strong>5 users = 85% des problèmes</strong> détectés. Sessions
            moderated (think-aloud), unmoderated (Maze/Useberry), ou guerilla (5 min au café).
            Chaque finding = severity + fix.
          </p>
          <button
            onClick={seedFirstTest}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Créer le premier test planifié
          </button>
          {state.userTests.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.userTests.length} test(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "sus" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📊 Étape 2 — SUS (System Usability Scale)</h2>
          <p className="text-sm text-muted leading-relaxed">
            10 questions · score /100 · <strong>bench moyen = 68</strong>, good = 72.6,
            excellent = 80.3+ (Sauro 2011). Standard de l&apos;industrie depuis 1986 (John
            Brooke).
          </p>
          <button
            onClick={seedFirstSus}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Ajouter le premier participant SUS
          </button>
          {state.susResponses.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.susResponses.length} réponse(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "heuristic" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🔎 Étape 3 — Heuristiques Nielsen</h2>
          <p className="text-sm text-muted leading-relaxed">
            Évaluation experte : 10 heuristiques NN/G appliquées à ton produit. Pour chaque :
            evidence + severity (critical/serious/moderate/minor) + suggestion.
          </p>
          <button
            onClick={seedHeuristics}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger les 10 heuristiques Nielsen
          </button>
          {state.heuristicEvals.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.heuristicEvals.length} heuristique(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "pmf" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🎯 Étape 4 — PMF metrics</h2>
          <p className="text-sm text-muted leading-relaxed">
            <strong>Sean Ellis 40% rule</strong> : si ≥ 40% des users sont « très déçus » de
            perdre le produit → PMF. Complété par NPS (≥ 30), activation rate, rétention J30 et
            wow moment time.
          </p>
          <button
            onClick={seedPmf}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Ajouter Sean Ellis + Activation rate
          </button>
          {state.pmfMetrics.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.pmfMetrics.length} métrique(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4 text-center py-4">
          <div className="text-5xl">🎓</div>
          <h2 className="text-xl font-bold">C&apos;est bouclé !</h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Tu as les 4 méthodes de validation (qualitative + quantitative). Passe en mode
            Formulaire pour renseigner les réponses SUS, noter les heuristiques et mesurer
            Sean Ellis.
          </p>
          <button
            onClick={onSwitchMode}
            className="text-sm px-5 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition"
          >
            Passer en mode Formulaire
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>
        <button
          onClick={next}
          disabled={stepIndex === STEPS.length - 1}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
