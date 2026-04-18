"use client";

import { useState } from "react";
import type {
  AdaptivityState,
  HoverSupport,
  InputKind,
  InputModalityEntry,
  PointerPrecision,
} from "../state";
import { HOVER_META, INPUT_KIND_META, POINTER_META, makeId } from "../state";
import { INPUT_MODALITY_PRESETS } from "../adaptivity-library";
import { validateInputModalities } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function InputModalityBlock({
  state,
  onChange,
}: {
  state: AdaptivityState;
  onChange: (patch: Partial<AdaptivityState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.inputModalities.length > 0);
  const issues = validateInputModalities(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.inputModalities.length >= 2 && !hasError;

  function loadAll() {
    onChange({
      inputModalities: INPUT_MODALITY_PRESETS.map((m) => ({ ...m, id: makeId("im") })),
    });
  }

  function addPreset(preset: (typeof INPUT_MODALITY_PRESETS)[number]) {
    onChange({
      inputModalities: [...state.inputModalities, { ...preset, id: makeId("im") }],
    });
  }

  function update(id: string, patch: Partial<InputModalityEntry>) {
    onChange({
      inputModalities: state.inputModalities.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    });
  }

  function remove(id: string) {
    onChange({
      inputModalities: state.inputModalities.filter((m) => m.id !== id),
    });
  }

  const existing = new Set(state.inputModalities.map((m) => m.input));
  const available = INPUT_MODALITY_PRESETS.filter((p) => !existing.has(p.input));

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          👆 Input modality
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.inputModalities.filter((m) => m.supported).length}/{state.inputModalities.length})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Media queries CSS4.</strong>{" "}
            <code>@media (hover)</code> + <code>(pointer)</code> pour détecter souris vs touch vs
            stylet. Target touch mini 24×24 (WCAG 2.5.8) ou 44×44 (Apple HIG).
          </div>

          {state.inputModalities.length === 0 && (
            <button
              onClick={loadAll}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {INPUT_MODALITY_PRESETS.length} modalités
            </button>
          )}

          {state.inputModalities.length > 0 && (
            <div className="space-y-2">
              {state.inputModalities.map((m) => {
                const meta = INPUT_KIND_META[m.input];
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg border space-y-2 ${
                      m.supported
                        ? "border-accent/40 bg-accent/5"
                        : "border-border bg-card opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={m.input}
                        onChange={(e) =>
                          update(m.id, { input: e.target.value as InputKind })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(INPUT_KIND_META) as InputKind[]).map((k) => (
                          <option key={k} value={k}>
                            {INPUT_KIND_META[k].emoji} {INPUT_KIND_META[k].label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={m.supported}
                          onChange={(e) =>
                            update(m.id, { supported: e.target.checked })
                          }
                          className="accent-accent"
                        />
                        Supporté
                      </label>
                      <select
                        value={m.hoverSupport}
                        onChange={(e) =>
                          update(m.id, { hoverSupport: e.target.value as HoverSupport })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(HOVER_META) as HoverSupport[]).map((h) => (
                          <option key={h} value={h}>
                            {HOVER_META[h].emoji} {HOVER_META[h].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={m.pointerPrecision}
                        onChange={(e) =>
                          update(m.id, {
                            pointerPrecision: e.target.value as PointerPrecision,
                          })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(POINTER_META) as PointerPrecision[]).map((p) => (
                          <option key={p} value={p}>
                            {POINTER_META[p].emoji} {POINTER_META[p].label}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted">Target :</span>
                        <input
                          type="number"
                          value={m.minTargetPx}
                          onChange={(e) =>
                            update(m.id, { minTargetPx: Number(e.target.value) })
                          }
                          className="w-16 h-7 px-2 text-xs rounded border border-border bg-card font-mono text-center"
                          min={16}
                        />
                        <span className="text-muted">px</span>
                      </div>
                      <button
                        onClick={() => remove(m.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.hint}</div>
                    <input
                      type="text"
                      value={m.cssHint}
                      onChange={(e) => update(m.id, { cssHint: e.target.value })}
                      placeholder="Media query / CSS hint"
                      className="w-full h-7 px-2 text-xs font-mono rounded border border-border bg-card"
                    />
                    <input
                      type="text"
                      value={m.notes}
                      onChange={(e) => update(m.id, { notes: e.target.value })}
                      placeholder="Notes"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {available.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {available.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {INPUT_KIND_META[p.input].emoji} {INPUT_KIND_META[p.input].label}
                </button>
              ))}
            </div>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
