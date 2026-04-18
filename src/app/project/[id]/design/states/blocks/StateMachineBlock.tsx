"use client";

import { useState } from "react";
import type {
  MachineStateKind,
  MachineTransition,
  StateMachineEntry,
  StatesState,
} from "../state";
import { MACHINE_STATE_META, makeId } from "../state";
import { MACHINE_TEMPLATES } from "../states-library";
import { validateMachines } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const ALL_MACHINE_STATES: MachineStateKind[] = [
  "idle",
  "loading",
  "success",
  "error",
  "empty",
  "partial",
  "offline",
];

export default function StateMachineBlock({
  state,
  onChange,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.stateMachines.length > 0);
  const issues = validateMachines(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.stateMachines.length >= 1 && !hasError;

  function addFromTemplate(tpl: (typeof MACHINE_TEMPLATES)[number]) {
    const next: StateMachineEntry = {
      id: makeId("mch"),
      screenTitle: tpl.label,
      states: [...tpl.states],
      initial: tpl.initial,
      transitions: tpl.transitions.map((t) => ({ ...t })),
      notes: "",
    };
    onChange({ stateMachines: [...state.stateMachines, next] });
  }

  function addCustom() {
    const next: StateMachineEntry = {
      id: makeId("mch"),
      screenTitle: "",
      states: ["idle", "loading", "success", "error"],
      initial: "idle",
      transitions: [],
      notes: "",
    };
    onChange({ stateMachines: [...state.stateMachines, next] });
  }

  function update(id: string, patch: Partial<StateMachineEntry>) {
    onChange({
      stateMachines: state.stateMachines.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    });
  }

  function remove(id: string) {
    onChange({
      stateMachines: state.stateMachines.filter((m) => m.id !== id),
    });
  }

  function toggleMachineState(mId: string, st: MachineStateKind) {
    const m = state.stateMachines.find((x) => x.id === mId);
    if (!m) return;
    const nextStates = m.states.includes(st)
      ? m.states.filter((s) => s !== st)
      : [...m.states, st];
    const nextInitial = nextStates.includes(m.initial) ? m.initial : nextStates[0];
    update(mId, { states: nextStates, initial: nextInitial });
  }

  function addTransition(mId: string) {
    const m = state.stateMachines.find((x) => x.id === mId);
    if (!m) return;
    const from = m.states[0] ?? "idle";
    const to = m.states[1] ?? m.states[0] ?? "loading";
    update(mId, {
      transitions: [...m.transitions, { from, to, event: "" }],
    });
  }

  function updateTransition(mId: string, index: number, patch: Partial<MachineTransition>) {
    const m = state.stateMachines.find((x) => x.id === mId);
    if (!m) return;
    const next = m.transitions.map((t, i) => (i === index ? { ...t, ...patch } : t));
    update(mId, { transitions: next });
  }

  function removeTransition(mId: string, index: number) {
    const m = state.stateMachines.find((x) => x.id === mId);
    if (!m) return;
    update(mId, { transitions: m.transitions.filter((_, i) => i !== index) });
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
          🔀 State machines
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.stateMachines.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">David Harel / XState.</strong> Une state machine
            rend explicites les transitions. Utile pour éviter les bugs du genre{" "}
            <em>loader qui reste affiché après une erreur</em>. Chaque écran = 1 machine.
          </div>

          {state.stateMachines.length > 0 && (
            <div className="space-y-3">
              {state.stateMachines.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border border-border bg-card space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={m.screenTitle}
                      onChange={(e) => update(m.id, { screenTitle: e.target.value })}
                      placeholder="Nom de la machine (ex: Liste projets)"
                      className="flex-1 h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                    />
                    <button
                      onClick={() => remove(m.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[11px] text-muted font-medium">États actifs :</div>
                    <div className="flex flex-wrap gap-1">
                      {ALL_MACHINE_STATES.map((st) => {
                        const meta = MACHINE_STATE_META[st];
                        const active = m.states.includes(st);
                        return (
                          <button
                            key={st}
                            onClick={() => toggleMachineState(m.id, st)}
                            className={`text-[11px] px-2 py-1 rounded border transition flex items-center gap-1 ${
                              active
                                ? "bg-accent text-white border-accent"
                                : "border-border hover:bg-accent/10"
                            }`}
                          >
                            <span>{meta.emoji}</span>
                            {meta.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <label className="text-muted">État initial :</label>
                    <select
                      value={m.initial}
                      onChange={(e) =>
                        update(m.id, { initial: e.target.value as MachineStateKind })
                      }
                      className="h-7 px-2 text-xs rounded border border-border bg-card"
                    >
                      {m.states.map((st) => (
                        <option key={st} value={st}>
                          {MACHINE_STATE_META[st].emoji} {MACHINE_STATE_META[st].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-muted font-medium">Transitions :</div>
                      <button
                        onClick={() => addTransition(m.id)}
                        className="text-[10px] px-2 py-0.5 rounded border border-border hover:bg-accent/10 transition"
                      >
                        + Transition
                      </button>
                    </div>
                    {m.transitions.length === 0 && (
                      <div className="text-[11px] text-muted italic px-2">
                        Aucune transition. Ajoutes-en pour définir le comportement.
                      </div>
                    )}
                    <div className="space-y-1">
                      {m.transitions.map((tr, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-[auto_auto_auto_1fr_auto] gap-1.5 items-center text-xs"
                        >
                          <select
                            value={tr.from}
                            onChange={(e) =>
                              updateTransition(m.id, idx, {
                                from: e.target.value as MachineStateKind,
                              })
                            }
                            className="h-7 px-1.5 text-xs rounded border border-border bg-card"
                          >
                            {m.states.map((st) => (
                              <option key={st} value={st}>
                                {MACHINE_STATE_META[st].emoji} {st}
                              </option>
                            ))}
                          </select>
                          <span className="text-muted">→</span>
                          <select
                            value={tr.to}
                            onChange={(e) =>
                              updateTransition(m.id, idx, {
                                to: e.target.value as MachineStateKind,
                              })
                            }
                            className="h-7 px-1.5 text-xs rounded border border-border bg-card"
                          >
                            {m.states.map((st) => (
                              <option key={st} value={st}>
                                {MACHINE_STATE_META[st].emoji} {st}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={tr.event}
                            onChange={(e) =>
                              updateTransition(m.id, idx, { event: e.target.value })
                            }
                            placeholder="Event (ex: fetch success)"
                            className="h-7 px-2 text-xs rounded border border-border bg-card"
                          />
                          <button
                            onClick={() => removeTransition(m.id, idx)}
                            className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                            aria-label="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={m.notes}
                    onChange={(e) => update(m.id, { notes: e.target.value })}
                    placeholder="Notes (optionnel)"
                    className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Templates :</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {MACHINE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => addFromTemplate(tpl)}
                  className="text-left p-2 rounded border border-border hover:bg-accent/5 transition"
                >
                  <div className="text-xs font-semibold">🔀 {tpl.label}</div>
                  <div className="text-[10px] text-muted mt-0.5">{tpl.description}</div>
                  <div className="flex flex-wrap gap-0.5 mt-1">
                    {tpl.states.map((st) => (
                      <span
                        key={st}
                        className="text-[9px] px-1 py-0.5 rounded bg-card border border-border font-mono"
                      >
                        {MACHINE_STATE_META[st].emoji} {st}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Machine personnalisée
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
