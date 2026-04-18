"use client";

import { useState } from "react";
import type {
  ErrorCategory,
  ErrorPatternEntry,
  ErrorTone,
  StatesState,
} from "../state";
import { ERROR_CATEGORY_META, TONE_META, makeId } from "../state";
import { ERROR_PRESETS } from "../states-library";
import { validateError } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function ErrorPatternsBlock({
  state,
  onChange,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.errorPatterns.length > 0);
  const issues = validateError(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.errorPatterns.length >= 2 && !hasError;

  function addPreset(preset: (typeof ERROR_PRESETS)[number]) {
    const next: ErrorPatternEntry = {
      id: makeId("err"),
      ...preset,
      notes: "",
    };
    onChange({ errorPatterns: [...state.errorPatterns, next] });
  }

  function addCustom() {
    const next: ErrorPatternEntry = {
      id: makeId("err"),
      category: "validation",
      trigger: "",
      tone: "calm",
      message: "",
      action: "",
      technicalFallback: "",
      notes: "",
    };
    onChange({ errorPatterns: [...state.errorPatterns, next] });
  }

  function update(id: string, patch: Partial<ErrorPatternEntry>) {
    onChange({
      errorPatterns: state.errorPatterns.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    });
  }

  function remove(id: string) {
    onChange({
      errorPatterns: state.errorPatterns.filter((e) => e.id !== id),
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
          ⚠️ Error patterns
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.errorPatterns.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">NN/G &amp; Apple HIG.</strong> 3 règles : lisible
            (pas de code), explicatif (pourquoi), actionnable (bouton recovery). Pas d&apos;erreur
            sans message humain.
          </div>

          {state.errorPatterns.length > 0 && (
            <div className="space-y-2">
              {state.errorPatterns.map((err) => {
                const meta = ERROR_CATEGORY_META[err.category];
                const tone = TONE_META[err.tone];
                return (
                  <div
                    key={err.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={err.category}
                        onChange={(e) =>
                          update(err.id, { category: e.target.value as ErrorCategory })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(ERROR_CATEGORY_META) as ErrorCategory[]).map((c) => (
                          <option key={c} value={c}>
                            {ERROR_CATEGORY_META[c].emoji} {ERROR_CATEGORY_META[c].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={err.tone}
                        onChange={(e) => update(err.id, { tone: e.target.value as ErrorTone })}
                        className="h-8 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(TONE_META) as ErrorTone[]).map((t) => (
                          <option key={t} value={t}>
                            {TONE_META[t].emoji} {TONE_META[t].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={err.trigger}
                        onChange={(e) => update(err.id, { trigger: e.target.value })}
                        placeholder="Trigger (ex: POST /login échoue)"
                        className="flex-1 min-w-[180px] h-8 px-2 text-sm rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(err.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.tip}</div>
                    <textarea
                      value={err.message}
                      onChange={(e) => update(err.id, { message: e.target.value })}
                      placeholder={`Message user (ton ${tone.label.toLowerCase()}, ex: "${tone.example}")`}
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card resize-y"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={err.action}
                        onChange={(e) => update(err.id, { action: e.target.value })}
                        placeholder="Action recovery (ex: Réessayer)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                      <input
                        type="text"
                        value={err.technicalFallback}
                        onChange={(e) => update(err.id, { technicalFallback: e.target.value })}
                        placeholder="Fallback technique (Sentry, logs…)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                      />
                    </div>
                    {err.message && (
                      <div
                        className={`rounded-lg p-3 text-xs border ${
                          err.tone === "urgent"
                            ? "bg-red-500/5 border-red-500/30 text-red-700 dark:text-red-300"
                            : err.tone === "playful"
                              ? "bg-amber-500/5 border-amber-500/30"
                              : "bg-card border-border"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span>{meta.emoji}</span>
                          <div className="flex-1">
                            <div>{err.message}</div>
                            {err.action && (
                              <button className="mt-2 text-[11px] px-2 py-1 rounded bg-accent text-white">
                                {err.action}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Presets :</div>
            <div className="flex flex-wrap gap-1">
              {ERROR_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {ERROR_CATEGORY_META[p.category].emoji} {p.trigger}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Pattern erreur personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
