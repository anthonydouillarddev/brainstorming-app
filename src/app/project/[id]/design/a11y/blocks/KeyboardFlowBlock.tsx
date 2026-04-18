"use client";

import { useState } from "react";
import type { A11yState, KeyboardFlowEntry, KeyboardFlowStep } from "../state";
import { makeId } from "../state";
import { validateKeyboard } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function KeyboardFlowBlock({
  state,
  onChange,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.keyboardFlows.length > 0);
  const issues = validateKeyboard(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.keyboardFlows.length >= 2 && !hasError;

  function addFlow() {
    const next: KeyboardFlowEntry = {
      id: makeId("kb"),
      flowName: "",
      tabOrder: [],
      trapFocus: false,
      escapeHandler: "",
      skipLinks: "",
      notes: "",
    };
    onChange({ keyboardFlows: [...state.keyboardFlows, next] });
  }

  function update(id: string, patch: Partial<KeyboardFlowEntry>) {
    onChange({
      keyboardFlows: state.keyboardFlows.map((f) => (f.id === id ? { ...f, ...patch } : f)),
    });
  }

  function remove(id: string) {
    onChange({
      keyboardFlows: state.keyboardFlows.filter((f) => f.id !== id),
    });
  }

  function addStep(flowId: string) {
    const flow = state.keyboardFlows.find((f) => f.id === flowId);
    if (!flow) return;
    const nextStep: KeyboardFlowStep = {
      index: flow.tabOrder.length + 1,
      target: "",
      expectedFocus: true,
      notes: "",
    };
    update(flowId, { tabOrder: [...flow.tabOrder, nextStep] });
  }

  function updateStep(flowId: string, stepIdx: number, patch: Partial<KeyboardFlowStep>) {
    const flow = state.keyboardFlows.find((f) => f.id === flowId);
    if (!flow) return;
    update(flowId, {
      tabOrder: flow.tabOrder.map((s, i) => (i === stepIdx ? { ...s, ...patch } : s)),
    });
  }

  function removeStep(flowId: string, stepIdx: number) {
    const flow = state.keyboardFlows.find((f) => f.id === flowId);
    if (!flow) return;
    const next = flow.tabOrder
      .filter((_, i) => i !== stepIdx)
      .map((s, i) => ({ ...s, index: i + 1 }));
    update(flowId, { tabOrder: next });
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
          ⌨️ Navigation clavier
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.keyboardFlows.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">WCAG 2.1.1 + 2.4.3 + 2.4.7.</strong> Pour chaque
            flow : tab order explicite, focus visible, trap focus dans les modals, Esc pour
            échapper, skip link sur les pages publiques.
          </div>

          {state.keyboardFlows.length > 0 && (
            <div className="space-y-3">
              {state.keyboardFlows.map((flow) => (
                <div
                  key={flow.id}
                  className="p-3 rounded-lg border border-border bg-card space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={flow.flowName}
                      onChange={(e) => update(flow.id, { flowName: e.target.value })}
                      placeholder="Nom du flow (ex: Login, Modal suppression)"
                      className="flex-1 h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                    />
                    <button
                      onClick={() => remove(flow.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flow.trapFocus}
                        onChange={(e) => update(flow.id, { trapFocus: e.target.checked })}
                        className="accent-accent"
                      />
                      🔒 Trap focus (modal)
                    </label>
                    <input
                      type="text"
                      value={flow.escapeHandler}
                      onChange={(e) => update(flow.id, { escapeHandler: e.target.value })}
                      placeholder="Handler Esc (ex: close modal)"
                      className="flex-1 min-w-[160px] h-7 px-2 text-xs rounded border border-border bg-card"
                    />
                  </div>

                  <input
                    type="text"
                    value={flow.skipLinks}
                    onChange={(e) => update(flow.id, { skipLinks: e.target.value })}
                    placeholder="Skip links (ex: Aller au contenu → <main>)"
                    className="w-full h-7 px-2 text-xs rounded border border-border bg-card"
                  />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-medium text-muted">
                        Tab order ({flow.tabOrder.length})
                      </div>
                      <button
                        onClick={() => addStep(flow.id)}
                        className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-accent/10"
                      >
                        + Étape
                      </button>
                    </div>
                    {flow.tabOrder.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs">
                        <span className="font-mono text-[10px] text-muted w-5 text-right">
                          {step.index}.
                        </span>
                        <input
                          type="text"
                          value={step.target}
                          onChange={(e) =>
                            updateStep(flow.id, idx, { target: e.target.value })
                          }
                          placeholder="Élément cible (ex: Input email)"
                          className="flex-1 h-7 px-2 text-xs rounded border border-border bg-card"
                        />
                        <label
                          className="flex items-center gap-1 cursor-pointer text-[10px]"
                          title="Focus visible ?"
                        >
                          <input
                            type="checkbox"
                            checked={step.expectedFocus}
                            onChange={(e) =>
                              updateStep(flow.id, idx, { expectedFocus: e.target.checked })
                            }
                            className="accent-accent"
                          />
                          👁️
                        </label>
                        <button
                          onClick={() => removeStep(flow.id, idx)}
                          className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                          aria-label="Supprimer étape"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={flow.notes}
                    onChange={(e) => update(flow.id, { notes: e.target.value })}
                    placeholder="Notes (optionnel)"
                    className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addFlow}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Nouveau flow clavier
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
