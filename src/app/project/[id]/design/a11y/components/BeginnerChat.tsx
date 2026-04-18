"use client";

import { useState } from "react";
import type { A11yState } from "../state";
import { makeId } from "../state";
import {
  ARIA_PATTERN_PRESETS,
  AT_COMBOS,
  COGNITIVE_PRESETS,
  LANDMARK_DEFAULTS,
  LIVE_REGION_PRESETS,
  MOTION_PRESETS,
  WCAG_CRITERIA,
  wcagPresetsToEntries,
} from "../a11y-library";

type Step =
  | "wcag"
  | "keyboard"
  | "landmarks"
  | "aria"
  | "at"
  | "cognitive"
  | "motion"
  | "done";

const STEPS: Step[] = [
  "wcag",
  "keyboard",
  "landmarks",
  "aria",
  "at",
  "cognitive",
  "motion",
  "done",
];

export default function BeginnerChat({
  state,
  onChange,
  onSwitchMode,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (state.wcagChecks.length === 0) return 0;
    if (state.keyboardFlows.length === 0) return 1;
    if (state.landmarks.length === 0) return 2;
    if (state.ariaPatterns.length === 0) return 3;
    if (state.assistiveTech.length === 0) return 4;
    if (state.cognitiveChecks.length === 0) return 5;
    if (state.motionPreferences.length === 0) return 6;
    return 7;
  });

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }
  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function seedWcag() {
    const entries = wcagPresetsToEntries(WCAG_CRITERIA).map((e) => ({
      ...e,
      id: makeId("wcag"),
    }));
    onChange({ wcagChecks: entries });
  }

  function seedKeyboard() {
    onChange({
      keyboardFlows: [
        {
          id: makeId("kb"),
          flowName: "Login",
          tabOrder: [
            { index: 1, target: "Skip link", expectedFocus: true, notes: "" },
            { index: 2, target: "Input email", expectedFocus: true, notes: "" },
            { index: 3, target: "Input password", expectedFocus: true, notes: "" },
            { index: 4, target: "Button submit", expectedFocus: true, notes: "" },
          ],
          trapFocus: false,
          escapeHandler: "",
          skipLinks: "Aller au contenu (cible <main>)",
          notes: "",
        },
        {
          id: makeId("kb"),
          flowName: "Modal confirmation suppression",
          tabOrder: [
            { index: 1, target: "Button Annuler (focus initial)", expectedFocus: true, notes: "" },
            { index: 2, target: "Button Supprimer définitivement", expectedFocus: true, notes: "" },
          ],
          trapFocus: true,
          escapeHandler: "Close modal",
          skipLinks: "",
          notes: "Focus retourne au trigger à la fermeture",
        },
      ],
    });
  }

  function seedLandmarks() {
    onChange({
      landmarks: LANDMARK_DEFAULTS.map((l) => ({
        ...l,
        id: makeId("lm"),
        present: true,
      })),
      liveRegions: LIVE_REGION_PRESETS.slice(0, 2).map((r) => ({
        ...r,
        id: makeId("lr"),
      })),
    });
  }

  function seedAria() {
    onChange({
      ariaPatterns: ARIA_PATTERN_PRESETS.slice(0, 3).map((p) => ({
        ...p,
        id: makeId("aria"),
      })),
    });
  }

  function seedAT() {
    onChange({
      assistiveTech: AT_COMBOS.filter((c) => c.priority === "required").map((c) => ({
        id: makeId("at"),
        at: c.at,
        browser: c.browser,
        version: "",
        status: "unknown" as const,
        tested: false,
        notes: c.reason,
      })),
    });
  }

  function seedCognitive() {
    onChange({
      cognitiveChecks: COGNITIVE_PRESETS.slice(0, 6).map((p) => ({
        id: makeId("cog"),
        axis: p.axis,
        rule: p.rule,
        status: "unknown" as const,
        note: "",
      })),
    });
  }

  function seedMotion() {
    onChange({
      motionPreferences: MOTION_PRESETS.map((p) => ({
        id: makeId("mot"),
        axis: p.axis,
        respected: false,
        implementation: p.implementation,
        notes: p.notes,
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

      {step === "wcag" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">♿ Étape 1 — WCAG 2.2 AA</h2>
          <p className="text-sm text-muted leading-relaxed">
            WCAG = standard mondial, repris par RGAA (France) et EAA (Europe). On charge les{" "}
            <strong>{WCAG_CRITERIA.length} critères</strong> AA prioritaires, à toi de cocher
            pass/fail/partial sur ton produit.
          </p>
          <button
            onClick={seedWcag}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger les {WCAG_CRITERIA.length} critères WCAG 2.2 AA
          </button>
          {state.wcagChecks.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.wcagChecks.length} critère(s) chargé(s).
            </div>
          )}
        </div>
      )}

      {step === "keyboard" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">⌨️ Étape 2 — Navigation clavier</h2>
          <p className="text-sm text-muted leading-relaxed">
            <strong>Règle 1</strong> : tout ce qui se fait à la souris doit se faire au clavier.
            Tab order logique, focus visible partout, Esc pour fermer les modals, pas de piège
            clavier.
          </p>
          <button
            onClick={seedKeyboard}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 2 flows types (Login + Modal suppression)
          </button>
          {state.keyboardFlows.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.keyboardFlows.length} flow(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "landmarks" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🧭 Étape 3 — Landmarks + Live regions</h2>
          <p className="text-sm text-muted leading-relaxed">
            Les landmarks ARIA (<code>banner</code>, <code>nav</code>, <code>main</code>,{" "}
            <code>contentinfo</code>) permettent aux screen readers de naviguer rapidement. Les
            live regions annoncent les changements dynamiques (toasts, erreurs).
          </p>
          <button
            onClick={seedLandmarks}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 4 landmarks + 2 live regions
          </button>
          {state.landmarks.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.landmarks.length} landmark(s) · {state.liveRegions.length} live region(s).
            </div>
          )}
        </div>
      )}

      {step === "aria" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🔧 Étape 4 — Patterns ARIA</h2>
          <p className="text-sm text-muted leading-relaxed">
            Pour chaque composant custom (dialog, combobox, tabs), l&apos;ARIA Authoring Practices
            Guide (APG) définit les interactions clavier attendues. Implémenter ces patterns =
            l&apos;app marche avec NVDA/JAWS/VoiceOver.
          </p>
          <button
            onClick={seedAria}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 3 patterns (dialog + combobox + tabs)
          </button>
          {state.ariaPatterns.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.ariaPatterns.length} pattern(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "at" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🔊 Étape 5 — Assistive Tech Matrix</h2>
          <p className="text-sm text-muted leading-relaxed">
            Tester ton app avec les combos AT × navigateur les plus utilisés (WebAIM 2024) :
            <strong> NVDA+Chrome</strong> (36%), <strong>JAWS+Chrome</strong> (25%),{" "}
            <strong>VoiceOver+Safari</strong> (10%).
          </p>
          <button
            onClick={seedAT}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger les combos required
          </button>
          {state.assistiveTech.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.assistiveTech.length} combo(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "cognitive" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🧠 Étape 6 — Cognitive a11y</h2>
          <p className="text-sm text-muted leading-relaxed">
            Troubles cognitifs, TDAH, dyslexie, anxiété : charge mémoire faible, langage simple,
            pas de time limits agressifs, aide à l&apos;erreur, focus unique.
          </p>
          <button
            onClick={seedCognitive}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 6 règles cognitives
          </button>
          {state.cognitiveChecks.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.cognitiveChecks.length} règle(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "motion" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🎬 Étape 7 — Motion &amp; Sensory</h2>
          <p className="text-sm text-muted leading-relaxed">
            Respecter <code>prefers-reduced-motion</code> (troubles vestibulaires),{" "}
            <code>prefers-contrast</code>, flash-safety (WCAG 2.3.1, épilepsie), pas d&apos;autoplay
            audio.
          </p>
          <button
            onClick={seedMotion}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 6 préférences media query
          </button>
          {state.motionPreferences.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.motionPreferences.length} préférence(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4 text-center py-4">
          <div className="text-5xl">♿</div>
          <h2 className="text-xl font-bold">C&apos;est bouclé !</h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Tu as les 7 familles (MUST + SHOULD). Passe en mode Formulaire pour marquer chaque
            critère comme pass/fail, générer la roadmap de remediation, et traquer les issues
            résolues.
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
