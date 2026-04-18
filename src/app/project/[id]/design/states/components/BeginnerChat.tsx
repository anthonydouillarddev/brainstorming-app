"use client";

import { useState } from "react";
import type { StatesState } from "../state";
import { makeId } from "../state";
import {
  EMPTY_PRESETS,
  ERROR_PRESETS,
  LOADING_PRESETS,
  MACHINE_TEMPLATES,
  MICRO_PRESETS,
  SUCCESS_PRESETS,
  TOAST_PRESETS,
} from "../states-library";

type Step =
  | "screens"
  | "loading"
  | "empty"
  | "error"
  | "micro"
  | "success"
  | "toasts"
  | "machines"
  | "done";

const STEPS: Step[] = [
  "screens",
  "loading",
  "empty",
  "error",
  "micro",
  "success",
  "toasts",
  "machines",
  "done",
];

export default function BeginnerChat({
  state,
  onChange,
  onSwitchMode,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (state.screens.length === 0) return 0;
    if (state.loadingPatterns.length === 0) return 1;
    if (state.emptyStates.length === 0) return 2;
    if (state.errorPatterns.length === 0) return 3;
    if (state.microInteractions.length === 0) return 4;
    if (state.successPatterns.length === 0) return 5;
    if (state.toasts.length === 0) return 6;
    if (state.stateMachines.length === 0) return 7;
    return 8;
  });

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }
  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function seedScreens() {
    onChange({
      screens: [
        {
          id: makeId("scr"),
          title: "Liste principale",
          needsLoading: true,
          needsEmpty: true,
          needsError: true,
          needsSuccess: false,
          priority: "must",
          notes: "",
        },
        {
          id: makeId("scr"),
          title: "Détail item",
          needsLoading: true,
          needsEmpty: false,
          needsError: true,
          needsSuccess: true,
          priority: "must",
          notes: "",
        },
        {
          id: makeId("scr"),
          title: "Formulaire création",
          needsLoading: false,
          needsEmpty: false,
          needsError: true,
          needsSuccess: true,
          priority: "must",
          notes: "",
        },
      ],
    });
  }

  function seedLoading() {
    onChange({
      loadingPatterns: LOADING_PRESETS.slice(0, 3).map((p) => ({
        ...p,
        id: makeId("loa"),
        skeletonFields: p.skeletonFields,
        notes: "",
      })),
    });
  }

  function seedEmpty() {
    onChange({
      emptyStates: EMPTY_PRESETS.slice(0, 3).map((p) => ({
        ...p,
        id: makeId("emp"),
        notes: "",
      })),
    });
  }

  function seedError() {
    onChange({
      errorPatterns: ERROR_PRESETS.slice(0, 4).map((p) => ({
        ...p,
        id: makeId("err"),
        notes: "",
      })),
    });
  }

  function seedMicro() {
    onChange({
      microInteractions: MICRO_PRESETS.slice(0, 3).map((p) => ({
        ...p,
        id: makeId("mic"),
      })),
    });
  }

  function seedSuccess() {
    onChange({
      successPatterns: SUCCESS_PRESETS.slice(0, 3).map((p) => ({
        ...p,
        id: makeId("suc"),
        notes: "",
      })),
    });
  }

  function seedToasts() {
    onChange({
      toasts: TOAST_PRESETS.slice(0, 3).map((p) => ({
        ...p,
        id: makeId("toa"),
        notes: "",
      })),
    });
  }

  function seedMachine() {
    const tpl = MACHINE_TEMPLATES[0];
    onChange({
      stateMachines: [
        {
          id: makeId("mch"),
          screenTitle: tpl.label,
          states: [...tpl.states],
          initial: tpl.initial,
          transitions: tpl.transitions.map((t) => ({ ...t })),
          notes: "",
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

      {step === "screens" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🖥️ Étape 1 — Écrans critiques</h2>
          <p className="text-sm text-muted leading-relaxed">
            Avant de designer des états, on liste les écrans qui en ont besoin. Un écran de liste a
            besoin de <strong>loading + empty + error</strong> ; un formulaire plutôt de{" "}
            <strong>error + success</strong>.
          </p>
          <button
            onClick={seedScreens}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            🌱 Générer 3 écrans types (Liste, Détail, Formulaire)
          </button>
          {state.screens.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.screens.length} écran(s) ajouté(s). Bascule en mode Formulaire pour éditer les
              détails.
            </div>
          )}
        </div>
      )}

      {step === "loading" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">⏳ Étape 2 — Loading patterns</h2>
          <p className="text-sm text-muted leading-relaxed">
            Règle d&apos;or : <strong>&lt; 400ms</strong>, rien n&apos;est nécessaire. Entre 400ms et
            2s, préfère un <strong>skeleton</strong> (-30% de perception du délai). Au-delà de 2s,
            progress bar obligatoire.
          </p>
          <button
            onClick={seedLoading}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 3 patterns loading (skeleton + spinner + inline)
          </button>
          {state.loadingPatterns.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.loadingPatterns.length} pattern(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "empty" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🌱 Étape 3 — Empty states</h2>
          <p className="text-sm text-muted leading-relaxed">
            Un écran vide sans message = mauvaise première impression. Chaque empty state a un{" "}
            <strong>titre + corps + CTA</strong>. Le <em>first-use</em> éduque, le <em>no-results</em>{" "}
            aide à rebondir.
          </p>
          <button
            onClick={seedEmpty}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 3 empty states (first-use + no-results + filtered)
          </button>
          {state.emptyStates.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.emptyStates.length} empty state(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "error" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">⚠️ Étape 4 — Error patterns</h2>
          <p className="text-sm text-muted leading-relaxed">
            Une erreur doit être <strong>lisible par un humain</strong>, <strong>indiquer le
            problème</strong>, et <strong>proposer une action</strong>. Pas de «&nbsp;Error 500&nbsp;» brut. Ton
            calme pour la validation, assumé pour le serveur.
          </p>
          <button
            onClick={seedError}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 4 patterns erreur (validation + network + server + 404)
          </button>
          {state.errorPatterns.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.errorPatterns.length} pattern(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "micro" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">✨ Étape 5 — Micro-interactions</h2>
          <p className="text-sm text-muted leading-relaxed">
            Les petits détails font la différence entre une app figée et une app vivante. Durées
            recommandées : <strong>80–400ms</strong>, avec un focus visible sur tous les éléments
            interactifs (WCAG 2.4.7).
          </p>
          <button
            onClick={seedMicro}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 3 micro-interactions (button + input + card)
          </button>
          {state.microInteractions.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.microInteractions.length} micro-interaction(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "success" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🎉 Étape 6 — Success patterns</h2>
          <p className="text-sm text-muted leading-relaxed">
            Peak-end rule (Kahneman) : l&apos;user se souvient des pics. Un bon success state =
            le pic. <strong>Inline</strong> pour les micro-actions, <strong>toast</strong> pour
            l&apos;action passive, <strong>modal/page</strong> pour les milestones.
          </p>
          <button
            onClick={seedSuccess}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 3 success patterns (inline + toast + modal)
          </button>
          {state.successPatterns.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.successPatterns.length} pattern(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "toasts" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🍞 Étape 7 — Toast library</h2>
          <p className="text-sm text-muted leading-relaxed">
            Une lib de toasts cohérente : 4 types (info / success / warn / error), 6 placements,
            durée selon criticité. Ne mets jamais un toast error à 2s : l&apos;user n&apos;a pas le
            temps de lire.
          </p>
          <button
            onClick={seedToasts}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 3 toasts (success + info + warn)
          </button>
          {state.toasts.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.toasts.length} toast(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "machines" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🔀 Étape 8 — State machines</h2>
          <p className="text-sm text-muted leading-relaxed">
            Une state machine rend explicites les transitions entre états. Évite les bugs du
            genre <em>loader qui reste affiché après une erreur</em>. Implémentable via XState ou
            un simple reducer.
          </p>
          <button
            onClick={seedMachine}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 1 machine (Liste fetch API)
          </button>
          {state.stateMachines.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.stateMachines.length} machine(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4 text-center py-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold">C&apos;est bouclé !</h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Tu as couvert les 8 familles d&apos;états (MUST + SHOULD). Passe en mode Formulaire
            pour affiner chaque pattern, ajouter les mesures de latence (NICE) et utiliser les
            exports.
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
