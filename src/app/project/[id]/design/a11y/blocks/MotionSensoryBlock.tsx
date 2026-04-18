"use client";

import { useState } from "react";
import type { A11yState, MotionAxis, MotionPreferenceEntry } from "../state";
import { MOTION_AXIS_META, makeId } from "../state";
import { MOTION_PRESETS } from "../a11y-library";
import { validateMotion } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function MotionSensoryBlock({
  state,
  onChange,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.motionPreferences.length > 0);
  const issues = validateMotion(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const respected = state.motionPreferences.filter((m) => m.respected).length;
  const ok = respected >= 3 && !hasError;

  function loadAllPresets() {
    const next: MotionPreferenceEntry[] = MOTION_PRESETS.map((p) => ({
      id: makeId("mot"),
      axis: p.axis,
      respected: false,
      implementation: p.implementation,
      notes: p.notes,
    }));
    onChange({ motionPreferences: next });
  }

  function addPreset(preset: (typeof MOTION_PRESETS)[number]) {
    const next: MotionPreferenceEntry = {
      id: makeId("mot"),
      axis: preset.axis,
      respected: false,
      implementation: preset.implementation,
      notes: preset.notes,
    };
    onChange({
      motionPreferences: [...state.motionPreferences, next],
    });
  }

  function update(id: string, patch: Partial<MotionPreferenceEntry>) {
    onChange({
      motionPreferences: state.motionPreferences.map((m) =>
        m.id === id ? { ...m, ...patch } : m
      ),
    });
  }

  function remove(id: string) {
    onChange({
      motionPreferences: state.motionPreferences.filter((m) => m.id !== id),
    });
  }

  const existingAxes = new Set(state.motionPreferences.map((m) => m.axis));
  const availablePresets = MOTION_PRESETS.filter((p) => !existingAxes.has(p.axis));

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎬 Motion &amp; Sensory
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({respected}/{state.motionPreferences.length} respectés)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">WCAG 2.3 + 2.2.</strong> Respecter les
            préférences OS : <code>prefers-reduced-motion</code>,{" "}
            <code>prefers-reduced-transparency</code>, <code>prefers-contrast</code>. Interdire
            les flashs dangereux (2.3.1) et l&apos;autoplay audio.
          </div>

          {state.motionPreferences.length === 0 && (
            <button
              onClick={loadAllPresets}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {MOTION_PRESETS.length} règles par défaut
            </button>
          )}

          {state.motionPreferences.length > 0 && (
            <div className="space-y-2">
              {state.motionPreferences.map((m) => {
                const meta = MOTION_AXIS_META[m.axis];
                return (
                  <div
                    key={m.id}
                    className={`p-3 rounded-lg border space-y-1.5 ${
                      m.respected
                        ? "bg-green-500/5 border-green-500/30"
                        : m.axis === "reduced-motion" || m.axis === "flash-safety"
                          ? "bg-red-500/5 border-red-500/30"
                          : "bg-amber-500/5 border-amber-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={m.axis}
                        onChange={(e) =>
                          update(m.id, { axis: e.target.value as MotionAxis })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(MOTION_AXIS_META) as MotionAxis[]).map((a) => (
                          <option key={a} value={a}>
                            {MOTION_AXIS_META[a].emoji} {MOTION_AXIS_META[a].label}
                          </option>
                        ))}
                      </select>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={m.respected}
                          onChange={(e) => update(m.id, { respected: e.target.checked })}
                          className="accent-accent"
                        />
                        Respecté
                      </label>
                      <code className="text-[10px] font-mono text-muted flex-1 truncate">
                        {meta.css}
                      </code>
                      <button
                        onClick={() => remove(m.id)}
                        className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">💡 {meta.hint}</div>
                    <textarea
                      value={m.implementation}
                      onChange={(e) =>
                        update(m.id, { implementation: e.target.value })
                      }
                      placeholder="Implémentation (CSS, JS, configuration)"
                      rows={2}
                      className="w-full px-2 py-1.5 text-[11px] font-mono rounded border border-border bg-card resize-y"
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

          {availablePresets.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Règles à ajouter :</div>
              <div className="flex flex-wrap gap-1">
                {availablePresets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addPreset(p)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {MOTION_AXIS_META[p.axis].emoji} {MOTION_AXIS_META[p.axis].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
