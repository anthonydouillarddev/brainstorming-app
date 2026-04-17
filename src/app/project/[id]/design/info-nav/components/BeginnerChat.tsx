"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { InfoNavState, NavPattern, SitemapScreen } from "../state";
import { makeScreenId, toSlug } from "../state";
import { NAV_PATTERN_DEFAULT, SCREEN_TEMPLATES } from "../templates";

type Step = "screens" | "primary-action" | "nav-pattern" | "done";

const STEPS: Step[] = ["screens", "primary-action", "nav-pattern", "done"];

export default function BeginnerChat({
  state,
  projectType,
  onChange,
  onSwitchMode,
}: {
  state: InfoNavState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<InfoNavState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (state.screens.length === 0) return 0;
    if (!state.navPattern) return 2;
    return 3;
  });

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);
  const templates = projectType ? SCREEN_TEMPLATES[projectType] : [];
  const existingTitles = new Set(state.screens.map((s) => s.title.toLowerCase().trim()));
  const availableTemplates = templates.filter(
    (t) => !existingTitles.has(t.title.toLowerCase().trim())
  );

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }
  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function toggleScreen(template: (typeof templates)[number]) {
    const existing = state.screens.find(
      (s) => s.title.toLowerCase().trim() === template.title.toLowerCase().trim()
    );
    if (existing) {
      const toRemove = existing.id;
      onChange({
        screens: state.screens.filter((s) => s.id !== toRemove),
        navItems: state.navItems.filter((id) => id !== toRemove),
      });
    } else {
      const rootChildren = state.screens.filter((s) => s.parentId === null);
      const screen: SitemapScreen = {
        id: makeScreenId(),
        title: template.title,
        slug: toSlug(template.title),
        emoji: template.emoji,
        parentId: null,
        position: rootChildren.length,
        isPrimaryNav: template.isPrimaryNav,
        description: template.description,
      };
      onChange({
        screens: [...state.screens, screen],
        navItems: template.isPrimaryNav
          ? [...state.navItems, screen.id]
          : state.navItems,
      });
    }
  }

  function pickNavPattern(pattern: NavPattern) {
    onChange({ navPattern: pattern });
    next();
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
          <h2 className="text-lg md:text-xl font-bold">
            Quelles sont les 5 pièces de ton app ?
          </h2>
          <p className="text-sm text-muted">
            Coche les écrans principaux que tu veux avoir. Tu pourras en ajouter d&apos;autres
            plus tard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((tpl) => {
              const isPicked = existingTitles.has(tpl.title.toLowerCase().trim());
              return (
                <button
                  key={tpl.title}
                  onClick={() => toggleScreen(tpl)}
                  className={`text-left p-3 rounded-xl border-2 transition ${
                    isPicked
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tpl.emoji}</span>
                    <span className="font-semibold text-sm flex-1">{tpl.title}</span>
                    <span
                      className={`text-xs ${isPicked ? "text-accent" : "text-muted/40"}`}
                    >
                      {isPicked ? "✓" : "○"}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">{tpl.description}</div>
                </button>
              );
            })}
            {availableTemplates.length === 0 && state.screens.length > 0 && (
              <div className="text-xs text-muted italic col-span-full p-3">
                Tu as déjà ajouté toutes les pièces suggérées. Pour en créer des persos, utilise
                le mode Formulaire.
              </div>
            )}
          </div>

          <Nav onPrev={prev} onNext={next} canNext={state.screens.length > 0} />
        </div>
      )}

      {step === "primary-action" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            L&apos;action la plus importante de ton app, c&apos;est laquelle ?
          </h2>
          <p className="text-sm text-muted">
            Celle que tes users feront 10 fois par jour. Elle doit être accessible en ≤ 1 clic
            depuis l&apos;accueil.
          </p>
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-xs text-muted">
            <strong className="text-foreground">On ne change rien pour l&apos;instant</strong> —
            c&apos;est juste pour que tu te souviennes de ce focus quand tu construiras la page
            d&apos;accueil. Le « bouton principal » doit rester ≤ 1 clic partout.
          </div>
          <Nav onPrev={prev} onNext={next} canNext={true} />
        </div>
      )}

      {step === "nav-pattern" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            Où mettre la barre de navigation ?
          </h2>
          <p className="text-sm text-muted">
            Choisis le pattern qui correspond à ton app. Tu pourras le changer dans le mode
            Formulaire.
          </p>
          {projectType && (
            <div className="bg-accent/5 border border-accent/30 rounded-lg p-3 text-xs">
              <strong className="text-accent">Reco pour un projet {projectType}</strong> :{" "}
              {NAV_PATTERN_DEFAULT[projectType]}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => pickNavPattern("sidebar")}
              className="text-left p-3 rounded-xl border-2 border-border bg-card hover:border-accent transition"
            >
              <div className="text-xl">📑</div>
              <div className="font-semibold text-sm mt-1">À gauche (Sidebar)</div>
              <div className="text-[11px] text-muted">Classique desktop, 4-8 items</div>
            </button>
            <button
              onClick={() => pickNavPattern("top-tabs")}
              className="text-left p-3 rounded-xl border-2 border-border bg-card hover:border-accent transition"
            >
              <div className="text-xl">📂</div>
              <div className="font-semibold text-sm mt-1">En haut (Tabs)</div>
              <div className="text-[11px] text-muted">Simple, &lt; 6 sections</div>
            </button>
            <button
              onClick={() => pickNavPattern("bottom-nav")}
              className="text-left p-3 rounded-xl border-2 border-border bg-card hover:border-accent transition"
            >
              <div className="text-xl">📱</div>
              <div className="font-semibold text-sm mt-1">En bas (Mobile)</div>
              <div className="text-[11px] text-muted">Appli mobile, ≤ 5 items</div>
            </button>
          </div>
          <Nav onPrev={prev} onNext={next} canNext={!!state.navPattern} />
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-lg md:text-xl font-bold">Ton architecture de base est posée !</h2>
            <p className="text-sm text-muted">
              Tu as défini {state.screens.length} écran{state.screens.length > 1 ? "s" : ""}, un
              pattern de navigation. Passe en mode Formulaire pour affiner le sitemap (hiérarchie,
              sous-pages), ajouter les entités métier, le dictionnaire de labels et générer les
              exports.
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

function Nav({
  onPrev,
  onNext,
  canNext,
}: {
  onPrev: () => void;
  onNext: () => void;
  canNext: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <button
        onClick={onPrev}
        className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition"
      >
        ← Retour
      </button>
      <button
        onClick={onNext}
        disabled={!canNext}
        className="text-sm px-5 py-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Suivant →
      </button>
    </div>
  );
}
