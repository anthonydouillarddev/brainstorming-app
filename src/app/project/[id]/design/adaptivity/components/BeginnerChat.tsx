"use client";

import { useState } from "react";
import type { AdaptivityState } from "../state";
import { makeId } from "../state";
import {
  BREAKPOINTS_TAILWIND,
  COLOR_SCHEME_PRESETS,
  CONTAINER_QUERY_PRESETS,
  DENSITY_PRESETS,
  INPUT_MODALITY_PRESETS,
  LOCALE_PRESETS,
  VIEWPORT_PRESETS,
} from "../adaptivity-library";

type Step =
  | "breakpoints"
  | "color"
  | "density"
  | "input"
  | "container"
  | "locale"
  | "viewport"
  | "done";

const STEPS: Step[] = [
  "breakpoints",
  "color",
  "density",
  "input",
  "container",
  "locale",
  "viewport",
  "done",
];

export default function BeginnerChat({
  state,
  onChange,
  onSwitchMode,
}: {
  state: AdaptivityState;
  onChange: (patch: Partial<AdaptivityState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (state.breakpoints.length === 0) return 0;
    if (state.colorSchemes.length === 0) return 1;
    if (state.densities.length === 0) return 2;
    if (state.inputModalities.length === 0) return 3;
    if (state.containerQueries.length === 0) return 4;
    if (state.localizations.length === 0) return 5;
    if (state.viewportRules.length === 0) return 6;
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

  function seedBreakpoints() {
    onChange({
      breakpoints: BREAKPOINTS_TAILWIND.map((b) => ({ ...b, id: makeId("bp"), notes: "" })),
    });
  }

  function seedColor() {
    onChange({
      colorSchemes: COLOR_SCHEME_PRESETS.slice(0, 3).map((c) => ({ ...c, id: makeId("cs") })),
    });
  }

  function seedDensity() {
    onChange({
      densities: DENSITY_PRESETS.map((d) => ({ ...d, id: makeId("den") })),
    });
  }

  function seedInput() {
    onChange({
      inputModalities: INPUT_MODALITY_PRESETS.slice(0, 3).map((m) => ({
        ...m,
        id: makeId("im"),
      })),
    });
  }

  function seedContainer() {
    onChange({
      containerQueries: CONTAINER_QUERY_PRESETS.slice(0, 2).map((c) => ({
        ...c,
        id: makeId("cq"),
      })),
    });
  }

  function seedLocale() {
    onChange({
      localizations: LOCALE_PRESETS.slice(0, 2).map((l) => ({
        ...l,
        id: makeId("loc"),
      })),
    });
  }

  function seedViewport() {
    onChange({
      viewportRules: VIEWPORT_PRESETS.slice(0, 4).map((v) => ({
        ...v,
        id: makeId("vp"),
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

      {step === "breakpoints" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📐 Étape 1 — Breakpoints</h2>
          <p className="text-sm text-muted leading-relaxed">
            Mobile First (Luke Wroblewski) : on part du petit écran et on élargit. Breakpoints
            standards : <strong>sm/md/lg/xl/2xl</strong> (Tailwind) ou{" "}
            <strong>compact/medium/expanded</strong> (Material 3). Tu pourras ajuster ensuite.
          </p>
          <button
            onClick={seedBreakpoints}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger les 5 breakpoints Tailwind
          </button>
          {state.breakpoints.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.breakpoints.length} breakpoint(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "color" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🌓 Étape 2 — Dark mode</h2>
          <p className="text-sm text-muted leading-relaxed">
            <strong>Light + Dark + System</strong> = combo recommandé. System suit l&apos;OS par
            défaut, mais l&apos;user peut forcer depuis les settings. Chaque couleur doit avoir sa
            variante.
          </p>
          <button
            onClick={seedColor}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger Light + Dark + System
          </button>
          {state.colorSchemes.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.colorSchemes.length} scheme(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "density" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📄 Étape 3 — Densité</h2>
          <p className="text-sm text-muted leading-relaxed">
            <strong>Compact</strong> (power users, dashboards), <strong>Normal</strong> (défaut),{" "}
            <strong>Confortable</strong> (seniors, accessibilité). Mindeck stocke déjà ce choix
            dans <code>user_preferences</code>.
          </p>
          <button
            onClick={seedDensity}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger les 3 densités
          </button>
          {state.densities.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.densities.length} densité(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "input" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">👆 Étape 4 — Input modality</h2>
          <p className="text-sm text-muted leading-relaxed">
            Supporter <strong>souris + touch + clavier</strong>. Détection via{" "}
            <code>@media (hover)</code> et <code>(pointer)</code>. Target minimum 24×24 px (WCAG
            2.5.8) ou 44×44 px (Apple HIG) sur touch.
          </p>
          <button
            onClick={seedInput}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 3 modalités (souris + touch + clavier)
          </button>
          {state.inputModalities.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.inputModalities.length} modalité(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "container" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📦 Étape 5 — Container queries</h2>
          <p className="text-sm text-muted leading-relaxed">
            Breakpoints <em>par composant</em> (baseline 2023). Une card s&apos;adapte à son
            parent, indépendamment du viewport. Utile pour sidebars, grids flexibles.
          </p>
          <button
            onClick={seedContainer}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 2 CQ (Card projet + Dashboard panel)
          </button>
          {state.containerQueries.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.containerQueries.length} CQ ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "locale" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🌍 Étape 6 — Localisations</h2>
          <p className="text-sm text-muted leading-relaxed">
            i18n + RTL. BCP 47 · Unicode CLDR. Pense <strong>maintenant</strong> aux formats
            date/number/currency et à la direction RTL (ar, he) — 30% plus facile qu&apos;en
            retrofit.
          </p>
          <button
            onClick={seedLocale}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger fr-FR + en-US
          </button>
          {state.localizations.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.localizations.length} locale(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "viewport" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📐 Étape 7 — Viewport &amp; safe-areas</h2>
          <p className="text-sm text-muted leading-relaxed">
            Zoom 200% (WCAG 1.4.4), reflow 400% (WCAG 1.4.10), orientation, safe-areas iOS/Android
            (env(safe-area-inset-*)), print. Les oublis classiques.
          </p>
          <button
            onClick={seedViewport}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 4 règles (zoom, reflow, orientation, safe-area iOS)
          </button>
          {state.viewportRules.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.viewportRules.length} règle(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4 text-center py-4">
          <div className="text-5xl">📐</div>
          <h2 className="text-xl font-bold">C&apos;est bouclé !</h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Tu as les 7 piliers d&apos;adaptativité (MUST + SHOULD). Passe en mode Formulaire
            pour ajuster breakpoints, mapper tes tokens dark mode, affiner container queries,
            activer tes locales et cocher les viewport rules respectés.
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
