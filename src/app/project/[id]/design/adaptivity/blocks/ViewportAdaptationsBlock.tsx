"use client";

import { useState } from "react";
import type {
  AdaptivityState,
  ViewportAxis,
  ViewportRuleEntry,
} from "../state";
import { VIEWPORT_AXIS_META, makeId } from "../state";
import { VIEWPORT_PRESETS } from "../adaptivity-library";
import { validateViewport } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function ViewportAdaptationsBlock({
  state,
  onChange,
}: {
  state: AdaptivityState;
  onChange: (patch: Partial<AdaptivityState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.viewportRules.length > 0);
  const issues = validateViewport(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const respected = state.viewportRules.filter((v) => v.respected).length;
  const ok = respected >= 3 && !hasError;

  function loadAllPresets() {
    onChange({
      viewportRules: VIEWPORT_PRESETS.map((p) => ({
        ...p,
        id: makeId("vp"),
      })),
    });
  }

  function addPreset(preset: (typeof VIEWPORT_PRESETS)[number]) {
    onChange({
      viewportRules: [...state.viewportRules, { ...preset, id: makeId("vp") }],
    });
  }

  function update(id: string, patch: Partial<ViewportRuleEntry>) {
    onChange({
      viewportRules: state.viewportRules.map((v) =>
        v.id === id ? { ...v, ...patch } : v
      ),
    });
  }

  function remove(id: string) {
    onChange({
      viewportRules: state.viewportRules.filter((v) => v.id !== id),
    });
  }

  const existing = new Set(state.viewportRules.map((v) => v.axis));
  const available = VIEWPORT_PRESETS.filter((p) => !existing.has(p.axis));

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          📐 Viewport adaptations
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({respected}/{state.viewportRules.length} respectés)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">WCAG 1.4.4 + 1.4.10 + 1.3.4.</strong> Zoom 200% /
            reflow 400% / orientation / safe-areas iOS + Android / print. Ce qui casse dans la
            vraie vie mais qu&apos;on oublie.
          </div>

          {state.viewportRules.length === 0 && (
            <button
              onClick={loadAllPresets}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {VIEWPORT_PRESETS.length} règles viewport
            </button>
          )}

          {state.viewportRules.length > 0 && (
            <div className="space-y-2">
              {state.viewportRules.map((v) => {
                const meta = VIEWPORT_AXIS_META[v.axis];
                const isCritical = v.axis === "zoom-200" || v.axis === "zoom-400-reflow";
                return (
                  <div
                    key={v.id}
                    className={`p-3 rounded-lg border space-y-2 ${
                      v.respected
                        ? "border-green-500/30 bg-green-500/5"
                        : isCritical
                          ? "border-red-500/30 bg-red-500/5"
                          : "border-amber-500/30 bg-amber-500/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={v.axis}
                        onChange={(e) =>
                          update(v.id, { axis: e.target.value as ViewportAxis })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(VIEWPORT_AXIS_META) as ViewportAxis[]).map((a) => (
                          <option key={a} value={a}>
                            {VIEWPORT_AXIS_META[a].emoji} {VIEWPORT_AXIS_META[a].label}
                          </option>
                        ))}
                      </select>
                      {meta.wcag !== "—" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-card border border-border font-mono">
                          WCAG {meta.wcag}
                        </span>
                      )}
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={v.respected}
                          onChange={(e) => update(v.id, { respected: e.target.checked })}
                          className="accent-accent"
                        />
                        Respecté
                      </label>
                      <button
                        onClick={() => remove(v.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.hint}</div>
                    <textarea
                      value={v.implementation}
                      onChange={(e) =>
                        update(v.id, { implementation: e.target.value })
                      }
                      placeholder="Implémentation"
                      rows={2}
                      className="w-full px-2 py-1.5 text-[11px] font-mono rounded border border-border bg-card resize-y"
                    />
                    <input
                      type="text"
                      value={v.notes}
                      onChange={(e) => update(v.id, { notes: e.target.value })}
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
                  + {VIEWPORT_AXIS_META[p.axis].emoji}{" "}
                  {VIEWPORT_AXIS_META[p.axis].label}
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
