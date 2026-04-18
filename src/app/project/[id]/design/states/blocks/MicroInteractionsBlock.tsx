"use client";

import { useState } from "react";
import type {
  EasingKind,
  MicroInteractionEntry,
  MicroTarget,
  StatesState,
} from "../state";
import { EASING_META, makeId } from "../state";
import { MICRO_PRESETS } from "../states-library";
import { validateMicro } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const ALL_STATES = [
  "hover",
  "focus",
  "active",
  "disabled",
  "enter",
  "exit",
  "on",
  "off",
  "invalid",
  "auto-dismiss",
  "swipe-dismiss",
];

const TARGET_META: Record<MicroTarget, { emoji: string; label: string }> = {
  button: { emoji: "🔘", label: "Button" },
  input: { emoji: "📝", label: "Input" },
  card: { emoji: "🪪", label: "Card" },
  row: { emoji: "📋", label: "Row" },
  link: { emoji: "🔗", label: "Link" },
  modal: { emoji: "🪟", label: "Modal" },
  toast: { emoji: "🍞", label: "Toast" },
  tab: { emoji: "📑", label: "Tab" },
  toggle: { emoji: "🔀", label: "Toggle" },
  custom: { emoji: "✨", label: "Custom" },
};

export default function MicroInteractionsBlock({
  state,
  onChange,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.microInteractions.length > 0);
  const issues = validateMicro(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.microInteractions.length >= 2 && !hasError;

  function addPreset(preset: (typeof MICRO_PRESETS)[number]) {
    const next: MicroInteractionEntry = {
      id: makeId("mic"),
      ...preset,
    };
    onChange({ microInteractions: [...state.microInteractions, next] });
  }

  function addCustom() {
    const next: MicroInteractionEntry = {
      id: makeId("mic"),
      target: "button",
      customTarget: "",
      states: ["hover", "focus"],
      durationMs: 150,
      easing: "ease-out",
      notes: "",
    };
    onChange({ microInteractions: [...state.microInteractions, next] });
  }

  function update(id: string, patch: Partial<MicroInteractionEntry>) {
    onChange({
      microInteractions: state.microInteractions.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    });
  }

  function remove(id: string) {
    onChange({
      microInteractions: state.microInteractions.filter((m) => m.id !== id),
    });
  }

  function toggleStateFlag(id: string, flag: string) {
    const m = state.microInteractions.find((x) => x.id === id);
    if (!m) return;
    const next = m.states.includes(flag)
      ? m.states.filter((s) => s !== flag)
      : [...m.states, flag];
    update(id, { states: next });
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
          ✨ Micro-interactions
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.microInteractions.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Dan Saffer.</strong> Les micro-interactions rendent
            l&apos;app vivante. Durée idéale <strong>80–400ms</strong>. Focus visible obligatoire
            sur tout élément interactif (WCAG 2.4.7).
          </div>

          {state.microInteractions.length > 0 && (
            <div className="space-y-2">
              {state.microInteractions.map((m) => {
                const meta = TARGET_META[m.target];
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={m.target}
                        onChange={(e) =>
                          update(m.id, { target: e.target.value as MicroTarget })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(TARGET_META) as MicroTarget[]).map((t) => (
                          <option key={t} value={t}>
                            {TARGET_META[t].emoji} {TARGET_META[t].label}
                          </option>
                        ))}
                      </select>
                      {m.target === "custom" && (
                        <input
                          type="text"
                          value={m.customTarget}
                          onChange={(e) => update(m.id, { customTarget: e.target.value })}
                          placeholder="Nom de la cible"
                          className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 min-w-[120px]"
                        />
                      )}
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          value={m.durationMs}
                          onChange={(e) =>
                            update(m.id, { durationMs: Number(e.target.value) })
                          }
                          className="w-20 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                          step={10}
                        />
                        <span className="text-muted">ms</span>
                      </div>
                      <select
                        value={m.easing}
                        onChange={(e) => update(m.id, { easing: e.target.value as EasingKind })}
                        className="h-8 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(EASING_META) as EasingKind[]).map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => remove(m.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">
                      {meta.label} · {EASING_META[m.easing]}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {ALL_STATES.map((s) => {
                        const active = m.states.includes(s);
                        return (
                          <button
                            key={s}
                            onClick={() => toggleStateFlag(m.id, s)}
                            className={`text-[11px] px-2 py-0.5 rounded border transition ${
                              active
                                ? "bg-accent text-white border-accent"
                                : "border-border hover:bg-accent/10"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      value={m.notes}
                      onChange={(e) => update(m.id, { notes: e.target.value })}
                      placeholder="Notes (ex: scale 0.98 au active, focus ring visible)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Presets :</div>
            <div className="flex flex-wrap gap-1">
              {MICRO_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {TARGET_META[p.target].emoji} {TARGET_META[p.target].label} ({p.durationMs}ms)
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Micro-interaction personnalisée
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
