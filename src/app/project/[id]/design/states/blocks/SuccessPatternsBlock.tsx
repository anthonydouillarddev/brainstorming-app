"use client";

import { useState } from "react";
import type { StatesState, SuccessKind, SuccessPatternEntry } from "../state";
import { SUCCESS_KIND_META, makeId } from "../state";
import { SUCCESS_PRESETS } from "../states-library";
import { validateSuccess } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function SuccessPatternsBlock({
  state,
  onChange,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.successPatterns.length > 0);
  const issues = validateSuccess(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.successPatterns.length >= 2 && !hasError;

  function addPreset(preset: (typeof SUCCESS_PRESETS)[number]) {
    const next: SuccessPatternEntry = {
      id: makeId("suc"),
      ...preset,
      notes: "",
    };
    onChange({ successPatterns: [...state.successPatterns, next] });
  }

  function addCustom() {
    const next: SuccessPatternEntry = {
      id: makeId("suc"),
      kind: "toast",
      trigger: "",
      message: "",
      ctaNext: "",
      celebrate: false,
      durationMs: 4000,
      notes: "",
    };
    onChange({ successPatterns: [...state.successPatterns, next] });
  }

  function update(id: string, patch: Partial<SuccessPatternEntry>) {
    onChange({
      successPatterns: state.successPatterns.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    });
  }

  function remove(id: string) {
    onChange({
      successPatterns: state.successPatterns.filter((s) => s.id !== id),
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
          🎉 Success patterns
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.successPatterns.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Peak-end rule (Kahneman).</strong> L&apos;user se
            souvient du pic et de la fin. Un bon success state = le pic. Inline pour micro-actions,
            toast pour action passive, modal pour critique, page pour milestone.
          </div>

          {state.successPatterns.length > 0 && (
            <div className="space-y-2">
              {state.successPatterns.map((s) => {
                const meta = SUCCESS_KIND_META[s.kind];
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={s.kind}
                        onChange={(e) =>
                          update(s.id, { kind: e.target.value as SuccessKind })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(SUCCESS_KIND_META) as SuccessKind[]).map((k) => (
                          <option key={k} value={k}>
                            {SUCCESS_KIND_META[k].emoji} {SUCCESS_KIND_META[k].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={s.trigger}
                        onChange={(e) => update(s.id, { trigger: e.target.value })}
                        placeholder="Trigger (ex: Projet créé)"
                        className="flex-1 min-w-[180px] h-8 px-2 text-sm rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(s.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.when}</div>
                    <textarea
                      value={s.message}
                      onChange={(e) => update(s.id, { message: e.target.value })}
                      placeholder="Message (ex: Projet « {name} » créé)"
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card resize-y"
                    />
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                      <input
                        type="text"
                        value={s.ctaNext}
                        onChange={(e) => update(s.id, { ctaNext: e.target.value })}
                        placeholder="CTA suivant (ex: Ouvrir)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          value={s.durationMs}
                          onChange={(e) =>
                            update(s.id, { durationMs: Number(e.target.value) })
                          }
                          className="w-20 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0}
                          step={500}
                        />
                        <span className="text-muted">ms</span>
                      </div>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={s.celebrate}
                          onChange={(e) => update(s.id, { celebrate: e.target.checked })}
                          className="accent-accent"
                        />
                        🎊 Célébrer
                      </label>
                    </div>
                    {s.message && (
                      <div className="bg-green-500/5 border border-green-500/30 rounded-lg p-3 text-xs space-y-2">
                        <div className="flex items-center gap-2">
                          <span>{s.celebrate ? "🎉" : "✅"}</span>
                          <span className="font-medium text-green-700 dark:text-green-300">
                            {s.message}
                          </span>
                        </div>
                        {s.ctaNext && (
                          <button className="text-[11px] px-2 py-1 rounded bg-accent text-white">
                            {s.ctaNext}
                          </button>
                        )}
                      </div>
                    )}
                    <input
                      type="text"
                      value={s.notes}
                      onChange={(e) => update(s.id, { notes: e.target.value })}
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
              {SUCCESS_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {SUCCESS_KIND_META[p.kind].emoji} {p.trigger}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Success pattern personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
