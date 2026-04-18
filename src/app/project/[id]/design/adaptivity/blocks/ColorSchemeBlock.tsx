"use client";

import { useState } from "react";
import type { AdaptivityState, ColorSchemeEntry, ColorSchemeKey } from "../state";
import { COLOR_SCHEME_META, makeId } from "../state";
import { COLOR_SCHEME_PRESETS } from "../adaptivity-library";
import { validateColorSchemes } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function ColorSchemeBlock({
  state,
  onChange,
}: {
  state: AdaptivityState;
  onChange: (patch: Partial<AdaptivityState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.colorSchemes.length > 0);
  const issues = validateColorSchemes(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.colorSchemes.length >= 2 && !hasError;

  function loadDefault() {
    onChange({
      colorSchemes: COLOR_SCHEME_PRESETS.slice(0, 3).map((c) => ({
        ...c,
        id: makeId("cs"),
      })),
    });
  }

  function addPreset(preset: (typeof COLOR_SCHEME_PRESETS)[number]) {
    onChange({
      colorSchemes: [...state.colorSchemes, { ...preset, id: makeId("cs") }],
    });
  }

  function update(id: string, patch: Partial<ColorSchemeEntry>) {
    onChange({
      colorSchemes: state.colorSchemes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function remove(id: string) {
    onChange({
      colorSchemes: state.colorSchemes.filter((c) => c.id !== id),
    });
  }

  const existingSchemes = new Set(state.colorSchemes.map((c) => c.scheme));
  const availablePresets = COLOR_SCHEME_PRESETS.filter(
    (p) => !existingSchemes.has(p.scheme)
  );

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🌓 Color scheme (Dark mode)
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.colorSchemes.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">CSS-Tricks + Material 3.</strong> Light + Dark +
            System = combo recommandé. Chaque token couleur du chap. 6 Visuel doit avoir sa
            variante dans chaque scheme actif.
          </div>

          {state.colorSchemes.length === 0 && (
            <button
              onClick={loadDefault}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger Light + Dark + System
            </button>
          )}

          {state.colorSchemes.length > 0 && (
            <div className="space-y-2">
              {state.colorSchemes.map((c) => {
                const meta = COLOR_SCHEME_META[c.scheme];
                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-lg border space-y-2 ${
                      c.enabled
                        ? "border-accent/40 bg-accent/5"
                        : "border-border bg-card opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={c.scheme}
                        onChange={(e) =>
                          update(c.id, { scheme: e.target.value as ColorSchemeKey })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(COLOR_SCHEME_META) as ColorSchemeKey[]).map((s) => (
                          <option key={s} value={s}>
                            {COLOR_SCHEME_META[s].emoji} {COLOR_SCHEME_META[s].label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.enabled}
                          onChange={(e) => update(c.id, { enabled: e.target.checked })}
                          className="accent-accent"
                        />
                        Activé
                      </label>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={c.manualOverride}
                          onChange={(e) =>
                            update(c.id, { manualOverride: e.target.checked })
                          }
                          className="accent-accent"
                        />
                        Forçable user
                      </label>
                      <div className="flex items-center gap-1 text-xs ml-auto">
                        <span className="text-muted">Tokens mappés :</span>
                        <input
                          type="number"
                          value={c.tokensMapped}
                          onChange={(e) =>
                            update(c.id, { tokensMapped: Number(e.target.value) })
                          }
                          className="w-16 h-7 px-2 text-xs rounded border border-border bg-card font-mono text-center"
                          min={0}
                        />
                      </div>
                      <button
                        onClick={() => remove(c.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.hint}</div>
                    <input
                      type="text"
                      value={c.mediaQuery}
                      onChange={(e) => update(c.id, { mediaQuery: e.target.value })}
                      placeholder="Media query / JS detection"
                      className="w-full h-7 px-2 text-xs font-mono rounded border border-border bg-card"
                    />
                    <input
                      type="text"
                      value={c.notes}
                      onChange={(e) => update(c.id, { notes: e.target.value })}
                      placeholder="Notes"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {availablePresets.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {availablePresets.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {COLOR_SCHEME_META[p.scheme].emoji} {COLOR_SCHEME_META[p.scheme].label}
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
