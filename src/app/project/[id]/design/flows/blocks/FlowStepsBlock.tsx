"use client";

import { useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { EmotionLevel, FlowStep, FlowsState } from "../state";
import { makeStepId } from "../state";
import { FLOW_TEMPLATES, stepFromTemplate } from "../templates";
import { validateSteps } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const EMOTIONS: { level: EmotionLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: "😡", label: "Furieux" },
  { level: 2, emoji: "😕", label: "Confus" },
  { level: 3, emoji: "😐", label: "Neutre" },
  { level: 4, emoji: "🙂", label: "Content" },
  { level: 5, emoji: "🤩", label: "Ravi" },
];

export default function FlowStepsBlock({
  state,
  projectType,
  onChange,
}: {
  state: FlowsState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<FlowsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.steps.length > 0);
  const issues = validateSteps(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.steps.length >= 3 && !!state.ahaMomentStepId && !hasError;

  function addStep() {
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

  function addFromTemplate() {
    if (!projectType) return;
    const template = FLOW_TEMPLATES[projectType];
    if (!template) return;
    const steps = template.map((t) => stepFromTemplate(t));
    const ahaStep = steps.find((s) => s.isAhaMoment);
    onChange({
      steps,
      ahaMomentStepId: ahaStep?.id ?? null,
    });
  }

  function updateStep(id: string, patch: Partial<FlowStep>) {
    onChange({ steps: state.steps.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  }

  function removeStep(id: string) {
    onChange({
      steps: state.steps.filter((s) => s.id !== id),
      ahaMomentStepId: state.ahaMomentStepId === id ? null : state.ahaMomentStepId,
    });
  }

  function moveStep(id: string, dir: -1 | 1) {
    const index = state.steps.findIndex((s) => s.id === id);
    if (index === -1) return;
    const target = index + dir;
    if (target < 0 || target >= state.steps.length) return;
    const copy = [...state.steps];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange({ steps: copy });
  }

  function markAha(id: string) {
    onChange({
      ahaMomentStepId: state.ahaMomentStepId === id ? null : id,
      steps: state.steps.map((s) => ({ ...s, isAhaMoment: s.id === id })),
    });
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
          🛣️ Chemin utilisateur
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.steps.length}/5)</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && state.steps.length > 0 && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {state.steps
            .slice(0, 4)
            .map((s, i) => `${i + 1}. ${s.label || "(sans nom)"}${s.isAhaMoment ? " ⭐" : ""}`)
            .join(" · ")}
          {state.steps.length > 4 && "…"}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Raconte-moi en 5 étapes max</strong> ce que fait
            ton user la première fois. Marque l&apos;étape où il dit &laquo; ouah &raquo; en{" "}
            <strong className="text-accent">⭐ aha moment</strong>. Baymard : au-delà de 5
            étapes, 10-20% de drop-off par étape.
          </div>

          {state.steps.length === 0 && projectType && (
            <button
              onClick={addFromTemplate}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger le template {projectType} (5 étapes pré-remplies)
            </button>
          )}

          <div className="space-y-2">
            {state.steps.map((step, i) => (
              <div
                key={step.id}
                className={`border rounded-xl p-3 space-y-2 ${
                  step.isAhaMoment
                    ? "border-amber-500/50 bg-amber-500/5"
                    : "border-border bg-card/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted w-6">#{i + 1}</span>
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveStep(step.id, -1)}
                      disabled={i === 0}
                      className="w-4 h-4 rounded text-[10px] text-muted hover:bg-accent/10 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveStep(step.id, 1)}
                      disabled={i === state.steps.length - 1}
                      className="w-4 h-4 rounded text-[10px] text-muted hover:bg-accent/10 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <input
                    type="text"
                    value={step.label}
                    onChange={(e) => updateStep(step.id, { label: e.target.value })}
                    placeholder="Nom de l'étape"
                    className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-medium"
                  />
                  <button
                    onClick={() => markAha(step.id)}
                    className={`text-xs px-2 py-1 rounded transition ${
                      step.isAhaMoment
                        ? "bg-amber-500 text-white"
                        : "text-muted hover:bg-accent/10"
                    }`}
                    title="Marquer comme aha moment"
                  >
                    ⭐ {step.isAhaMoment ? "Aha" : "marquer"}
                  </button>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  value={step.action}
                  onChange={(e) => updateStep(step.id, { action: e.target.value })}
                  placeholder="Action de l'user à cette étape"
                  className="w-full h-8 px-2 text-xs rounded border border-border bg-card text-muted"
                />
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted">Émotion :</span>
                    {EMOTIONS.map((e) => (
                      <button
                        key={e.level}
                        onClick={() => updateStep(step.id, { emotion: e.level })}
                        className={`text-base p-0.5 rounded hover:bg-accent/10 transition ${
                          step.emotion === e.level ? "bg-accent/20" : "opacity-60"
                        }`}
                        title={e.label}
                      >
                        {e.emoji}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <label>champs</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={step.fields ?? 0}
                      onChange={(e) =>
                        updateStep(step.id, { fields: Number(e.target.value) })
                      }
                      className="w-12 h-6 px-1 rounded border border-border bg-card text-center"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <label>décisions</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={step.decisions ?? 0}
                      onChange={(e) =>
                        updateStep(step.id, { decisions: Number(e.target.value) })
                      }
                      className="w-12 h-6 px-1 rounded border border-border bg-card text-center"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted">
                    <label>modals</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={step.modals ?? 0}
                      onChange={(e) =>
                        updateStep(step.id, { modals: Number(e.target.value) })
                      }
                      className="w-12 h-6 px-1 rounded border border-border bg-card text-center"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {state.steps.length < 8 && (
            <button
              onClick={addStep}
              className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
            >
              + Ajouter une étape
            </button>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
