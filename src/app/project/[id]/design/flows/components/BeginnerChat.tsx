"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { FlowStep, FlowsState } from "../state";
import { computeActivationMetric, makeStepId } from "../state";
import { FLOW_TEMPLATES, stepFromTemplate } from "../templates";

type Step = "intro" | "steps" | "aha" | "nsa" | "done";

const STEPS: Step[] = ["intro", "steps", "aha", "nsa", "done"];

export default function BeginnerChat({
  state,
  projectType,
  onChange,
  onSwitchMode,
}: {
  state: FlowsState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<FlowsState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (state.steps.length === 0) return 0;
    if (!state.ahaMomentStepId) return 2;
    if (!computeActivationMetric(state.northStarAction)) return 3;
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

  function loadTemplate() {
    if (!projectType) return;
    const template = FLOW_TEMPLATES[projectType];
    if (!template) return;
    const steps = template.map((t) => stepFromTemplate(t));
    const ahaStep = steps.find((s) => s.isAhaMoment);
    onChange({
      steps,
      ahaMomentStepId: ahaStep?.id ?? null,
    });
    next();
  }

  function addBlankStep() {
    const step: FlowStep = {
      id: makeStepId(),
      label: "",
      screen: "",
      action: "",
      isAhaMoment: false,
      isCritical: true,
      emotion: 3,
    };
    onChange({ steps: [...state.steps, step] });
  }

  function updateStepLabel(id: string, label: string) {
    onChange({ steps: state.steps.map((s) => (s.id === id ? { ...s, label } : s)) });
  }

  function markAha(id: string) {
    onChange({
      ahaMomentStepId: id,
      steps: state.steps.map((s) => ({ ...s, isAhaMoment: s.id === id })),
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

      {step === "intro" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            Raconte-moi le parcours de ton user type
          </h2>
          <p className="text-sm text-muted">
            5 étapes max de la première fois qu&apos;il découvre ton app jusqu&apos;à ce
            qu&apos;il en soit accro. On va démarrer d&apos;un template pré-rempli pour ton type
            de projet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              onClick={loadTemplate}
              disabled={!projectType}
              className="text-left p-4 rounded-xl border-2 border-accent bg-accent/10 hover:bg-accent/20 transition"
            >
              <div className="text-xl mb-1">📦</div>
              <div className="font-semibold text-sm">Charger le template</div>
              <div className="text-[11px] text-muted mt-1">
                Parcours type {projectType} en 5 étapes (éditable après)
              </div>
            </button>
            <button
              onClick={() => {
                addBlankStep();
                next();
              }}
              className="text-left p-4 rounded-xl border-2 border-border bg-card hover:border-accent transition"
            >
              <div className="text-xl mb-1">📝</div>
              <div className="font-semibold text-sm">Écrire de zéro</div>
              <div className="text-[11px] text-muted mt-1">
                1 étape vide que tu remplis toi-même
              </div>
            </button>
          </div>
          <Nav onPrev={prev} onNext={next} canNext={state.steps.length > 0} />
        </div>
      )}

      {step === "steps" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            Relis les {state.steps.length} étapes et ajuste les titres
          </h2>
          <p className="text-sm text-muted">
            Chaque étape = une action clé du user. Tu peux réécrire les labels.
          </p>
          <div className="space-y-2">
            {state.steps.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-2 p-2 rounded border border-border bg-card"
              >
                <span className="font-mono text-xs text-muted w-6">#{i + 1}</span>
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => updateStepLabel(s.id, e.target.value)}
                  placeholder="Titre de l'étape"
                  className="h-8 px-2 text-sm rounded border border-border bg-card flex-1"
                />
              </div>
            ))}
          </div>
          <Nav onPrev={prev} onNext={next} canNext={state.steps.length > 0} />
        </div>
      )}

      {step === "aha" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            Dans laquelle de ces étapes ton user dit « ouah, ça vaut le coup » ?
          </h2>
          <p className="text-sm text-muted">
            C&apos;est l&apos;aha moment : le moment exact où il perçoit la valeur. Clique dessus.
          </p>
          <div className="space-y-2">
            {state.steps.map((s, i) => (
              <button
                key={s.id}
                onClick={() => markAha(s.id)}
                className={`w-full flex items-center gap-2 p-3 rounded-xl border-2 transition text-left ${
                  state.ahaMomentStepId === s.id
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-border bg-card hover:border-accent/50"
                }`}
              >
                <span className="font-mono text-xs text-muted w-6">#{i + 1}</span>
                <span className="flex-1 text-sm font-medium">{s.label || "(sans nom)"}</span>
                {state.ahaMomentStepId === s.id && <span className="text-xl">⭐</span>}
              </button>
            ))}
          </div>
          <Nav onPrev={prev} onNext={next} canNext={!!state.ahaMomentStepId} />
        </div>
      )}

      {step === "nsa" && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-bold">
            L&apos;action qui prouve que ton user est accro ?
          </h2>
          <p className="text-sm text-muted">
            Formule : <em>[verbe] par [qui] en [combien de temps]</em>. Exemple Facebook : « 7 amis
            ajoutés en 10 jours ». Slack : « 2000 messages envoyés par l&apos;équipe ».
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              value={state.northStarAction.verb}
              onChange={(e) =>
                onChange({
                  northStarAction: { ...state.northStarAction, verb: e.target.value },
                })
              }
              placeholder="Verbe + quantité"
              className="h-10 px-3 text-sm rounded border border-border bg-card"
            />
            <input
              type="text"
              value={state.northStarAction.segment}
              onChange={(e) =>
                onChange({
                  northStarAction: { ...state.northStarAction, segment: e.target.value },
                })
              }
              placeholder="Segment"
              className="h-10 px-3 text-sm rounded border border-border bg-card"
            />
            <input
              type="text"
              value={state.northStarAction.timeframe}
              onChange={(e) =>
                onChange({
                  northStarAction: { ...state.northStarAction, timeframe: e.target.value },
                })
              }
              placeholder="Timeframe"
              className="h-10 px-3 text-sm rounded border border-border bg-card"
            />
            <input
              type="text"
              value={state.northStarAction.value}
              onChange={(e) =>
                onChange({
                  northStarAction: { ...state.northStarAction, value: e.target.value },
                })
              }
              placeholder="Valeur prouvée"
              className="h-10 px-3 text-sm rounded border border-border bg-card"
            />
          </div>
          <Nav
            onPrev={prev}
            onNext={next}
            canNext={!!computeActivationMetric(state.northStarAction)}
          />
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center space-y-2">
            <div className="text-4xl">🎉</div>
            <h2 className="text-lg md:text-xl font-bold">Ton parcours est dessiné !</h2>
            <p className="text-sm text-muted">
              {state.steps.length} étape{state.steps.length > 1 ? "s" : ""} · aha moment étape{" "}
              {state.steps.findIndex((s) => s.isAhaMoment) + 1} ·{" "}
              {computeActivationMetric(state.northStarAction) || "NSA à affiner"}
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
