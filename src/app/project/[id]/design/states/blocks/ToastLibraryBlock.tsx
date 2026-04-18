"use client";

import { useState } from "react";
import type { StatesState, ToastEntry, ToastKind, ToastPlacement } from "../state";
import { TOAST_KIND_META, TOAST_PLACEMENT_META, makeId } from "../state";
import { TOAST_PRESETS } from "../states-library";
import { validateToasts } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function ToastLibraryBlock({
  state,
  onChange,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.toasts.length > 0);
  const issues = validateToasts(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.toasts.length >= 2 && !hasError;

  function addPreset(preset: (typeof TOAST_PRESETS)[number]) {
    const next: ToastEntry = {
      id: makeId("toa"),
      ...preset,
      notes: "",
    };
    onChange({ toasts: [...state.toasts, next] });
  }

  function addCustom() {
    const next: ToastEntry = {
      id: makeId("toa"),
      kind: "info",
      label: "",
      placement: "bottom-right",
      durationMs: 4000,
      action: "",
      dismissible: true,
      notes: "",
    };
    onChange({ toasts: [...state.toasts, next] });
  }

  function update(id: string, patch: Partial<ToastEntry>) {
    onChange({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }

  function remove(id: string) {
    onChange({ toasts: state.toasts.filter((t) => t.id !== id) });
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
          🍞 Toast library
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.toasts.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Durées recommandées :</strong> info/success{" "}
            <code>3-5s</code>, warn/error <code>5-8s</code>, action critique <code>sticky (0)</code>
            {" "}avec bouton dismiss. Jamais de message technique.
          </div>

          {state.toasts.length > 0 && (
            <div className="space-y-2">
              {state.toasts.map((t) => {
                const meta = TOAST_KIND_META[t.kind];
                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={t.kind}
                        onChange={(e) => update(t.id, { kind: e.target.value as ToastKind })}
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(TOAST_KIND_META) as ToastKind[]).map((k) => (
                          <option key={k} value={k}>
                            {TOAST_KIND_META[k].emoji} {TOAST_KIND_META[k].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={t.label}
                        onChange={(e) => update(t.id, { label: e.target.value })}
                        placeholder="Label (ex: Projet sauvé)"
                        className="flex-1 min-w-[180px] h-8 px-2 text-sm rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(t.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.use}</div>
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                      <select
                        value={t.placement}
                        onChange={(e) =>
                          update(t.id, { placement: e.target.value as ToastPlacement })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(TOAST_PLACEMENT_META) as ToastPlacement[]).map((p) => (
                          <option key={p} value={p}>
                            {TOAST_PLACEMENT_META[p]}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          value={t.durationMs}
                          onChange={(e) =>
                            update(t.id, { durationMs: Number(e.target.value) })
                          }
                          className="w-20 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                          step={500}
                        />
                        <span className="text-muted">ms</span>
                        {t.durationMs === 0 && (
                          <span className="text-[10px] text-amber-600 font-mono">sticky</span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={t.action}
                        onChange={(e) => update(t.id, { action: e.target.value })}
                        placeholder="Action"
                        className="w-24 h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={t.dismissible}
                          onChange={(e) => update(t.id, { dismissible: e.target.checked })}
                          className="accent-accent"
                        />
                        ×
                      </label>
                    </div>
                    {t.label && (
                      <div className={`rounded-lg p-2.5 text-xs border ${meta.color}`}>
                        <div className="flex items-center gap-2">
                          <span>{meta.emoji}</span>
                          <span className="flex-1 font-medium">{t.label}</span>
                          {t.action && (
                            <button className="text-[11px] px-2 py-0.5 rounded bg-card border border-border">
                              {t.action}
                            </button>
                          )}
                          {t.dismissible && <span className="text-muted">×</span>}
                        </div>
                      </div>
                    )}
                    <input
                      type="text"
                      value={t.notes}
                      onChange={(e) => update(t.id, { notes: e.target.value })}
                      placeholder="Notes (optionnel)"
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
              {TOAST_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {TOAST_KIND_META[p.kind].emoji} {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Toast personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
