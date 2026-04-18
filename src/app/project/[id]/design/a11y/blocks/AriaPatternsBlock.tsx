"use client";

import { useState } from "react";
import type {
  A11yState,
  AriaLandmark,
  AriaPatternEntry,
  AriaWidgetPattern,
  LandmarkEntry,
  LiveRegionEntry,
  LiveRegionPoliteness,
} from "../state";
import {
  ARIA_WIDGET_META,
  LANDMARK_META,
  POLITENESS_META,
  makeId,
} from "../state";
import {
  ARIA_PATTERN_PRESETS,
  LANDMARK_DEFAULTS,
  LIVE_REGION_PRESETS,
} from "../a11y-library";
import { validateAriaPatterns, validateLandmarks, validateLiveRegions } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function AriaPatternsBlock({
  state,
  onChange,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
}) {
  const [expanded, setExpanded] = useState(
    state.landmarks.length > 0 ||
      state.liveRegions.length > 0 ||
      state.ariaPatterns.length > 0
  );
  const issues = [
    ...validateLandmarks(state),
    ...validateLiveRegions(state),
    ...validateAriaPatterns(state),
  ];
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.landmarks.length >= 3 && state.ariaPatterns.length >= 2 && !hasError;

  // Landmarks helpers
  function seedLandmarks() {
    onChange({
      landmarks: LANDMARK_DEFAULTS.map((l) => ({ ...l, id: makeId("lm"), present: true })),
    });
  }
  function updateLandmark(id: string, patch: Partial<LandmarkEntry>) {
    onChange({
      landmarks: state.landmarks.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  }
  function removeLandmark(id: string) {
    onChange({ landmarks: state.landmarks.filter((l) => l.id !== id) });
  }
  function addLandmark() {
    onChange({
      landmarks: [
        ...state.landmarks,
        { id: makeId("lm"), landmark: "region", present: false, label: "", notes: "" },
      ],
    });
  }

  // Live regions helpers
  function addLiveRegion() {
    onChange({
      liveRegions: [
        ...state.liveRegions,
        {
          id: makeId("lr"),
          context: "",
          politeness: "polite",
          atomic: true,
          notes: "",
        },
      ],
    });
  }
  function addLivePreset(preset: (typeof LIVE_REGION_PRESETS)[number]) {
    onChange({
      liveRegions: [...state.liveRegions, { ...preset, id: makeId("lr") }],
    });
  }
  function updateLive(id: string, patch: Partial<LiveRegionEntry>) {
    onChange({
      liveRegions: state.liveRegions.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }
  function removeLive(id: string) {
    onChange({ liveRegions: state.liveRegions.filter((r) => r.id !== id) });
  }

  // Aria pattern helpers
  function addPatternPreset(preset: (typeof ARIA_PATTERN_PRESETS)[number]) {
    onChange({
      ariaPatterns: [...state.ariaPatterns, { ...preset, id: makeId("aria") }],
    });
  }
  function addCustomPattern() {
    onChange({
      ariaPatterns: [
        ...state.ariaPatterns,
        {
          id: makeId("aria"),
          widget: "button",
          usage: "",
          keyboardInteractions: "",
          notes: "",
        },
      ],
    });
  }
  function updatePattern(id: string, patch: Partial<AriaPatternEntry>) {
    onChange({
      ariaPatterns: state.ariaPatterns.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  }
  function removePattern(id: string) {
    onChange({ ariaPatterns: state.ariaPatterns.filter((p) => p.id !== id) });
  }

  const usedLandmarks = new Set(state.landmarks.map((l) => l.landmark));
  const usedWidgets = new Set(state.ariaPatterns.map((p) => p.widget));

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🧭 Landmarks · Live regions · ARIA patterns
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.landmarks.length}L · {state.liveRegions.length}LR · {state.ariaPatterns.length}P)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">ARIA Authoring Practices Guide (W3C).</strong>{" "}
            Landmarks = structure · Live regions = dynamique · Patterns = composants custom.
            Implémenter correctement ces 3 = 80% de l&apos;a11y screen reader.
          </div>

          {/* ─── Landmarks ─── */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">🧭 Landmarks ({state.landmarks.length})</h3>
              {state.landmarks.length === 0 && (
                <button
                  onClick={seedLandmarks}
                  className="text-[11px] px-2 py-1 rounded border border-accent/30 text-accent hover:bg-accent/10 transition"
                >
                  📦 Charger les 4 landmarks de base
                </button>
              )}
            </div>
            {state.landmarks.map((l) => {
              const meta = LANDMARK_META[l.landmark];
              return (
                <div
                  key={l.id}
                  className="p-2 rounded-lg border border-border bg-card space-y-1.5"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={l.landmark}
                      onChange={(e) =>
                        updateLandmark(l.id, { landmark: e.target.value as AriaLandmark })
                      }
                      className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                    >
                      {(Object.keys(LANDMARK_META) as AriaLandmark[]).map((lm) => (
                        <option key={lm} value={lm}>
                          {LANDMARK_META[lm].label}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] font-mono text-muted">{meta.tag}</span>
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={l.present}
                        onChange={(e) => updateLandmark(l.id, { present: e.target.checked })}
                        className="accent-accent"
                      />
                      Présent
                    </label>
                    <input
                      type="text"
                      value={l.label}
                      onChange={(e) => updateLandmark(l.id, { label: e.target.value })}
                      placeholder="aria-label (si multiple)"
                      className="flex-1 min-w-[120px] h-6 px-2 text-xs rounded border border-border bg-card"
                    />
                    <button
                      onClick={() => removeLandmark(l.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-[10px] text-muted italic">💡 {meta.hint}</div>
                </div>
              );
            })}
            {state.landmarks.length > 0 && usedLandmarks.size < 8 && (
              <button
                onClick={addLandmark}
                className="w-full text-xs px-3 py-1.5 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
              >
                + Landmark supplémentaire
              </button>
            )}
          </section>

          {/* ─── Live regions ─── */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">
              📢 Live regions ({state.liveRegions.length})
            </h3>
            {state.liveRegions.map((r) => {
              const meta = POLITENESS_META[r.politeness];
              return (
                <div
                  key={r.id}
                  className="p-2 rounded-lg border border-border bg-card space-y-1.5"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={r.politeness}
                      onChange={(e) =>
                        updateLive(r.id, {
                          politeness: e.target.value as LiveRegionPoliteness,
                        })
                      }
                      className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                    >
                      {(Object.keys(POLITENESS_META) as LiveRegionPoliteness[]).map((p) => (
                        <option key={p} value={p}>
                          {POLITENESS_META[p].label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={r.context}
                      onChange={(e) => updateLive(r.id, { context: e.target.value })}
                      placeholder="Contexte (ex: Toasts, Erreurs)"
                      className="flex-1 min-w-[160px] h-7 px-2 text-xs rounded border border-border bg-card"
                    />
                    <label className="flex items-center gap-1 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={r.atomic}
                        onChange={(e) => updateLive(r.id, { atomic: e.target.checked })}
                        className="accent-accent"
                      />
                      atomic
                    </label>
                    <button
                      onClick={() => removeLive(r.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-[10px] text-muted italic">💡 {meta.hint}</div>
                </div>
              );
            })}
            <div className="flex flex-wrap gap-1">
              {LIVE_REGION_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addLivePreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {p.context}
                </button>
              ))}
              <button
                onClick={addLiveRegion}
                className="text-[11px] px-2 py-1 rounded border border-dashed border-accent/50 hover:bg-accent/5 transition"
              >
                + Custom
              </button>
            </div>
          </section>

          {/* ─── ARIA patterns ─── */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">
              🔧 Patterns ARIA ({state.ariaPatterns.length})
            </h3>
            {state.ariaPatterns.map((p) => {
              const meta = ARIA_WIDGET_META[p.widget];
              return (
                <div
                  key={p.id}
                  className="p-2.5 rounded-lg border border-border bg-card space-y-1.5"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={p.widget}
                      onChange={(e) =>
                        updatePattern(p.id, { widget: e.target.value as AriaWidgetPattern })
                      }
                      className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                    >
                      {(Object.keys(ARIA_WIDGET_META) as AriaWidgetPattern[]).map((w) => (
                        <option key={w} value={w}>
                          {ARIA_WIDGET_META[w].label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={p.usage}
                      onChange={(e) => updatePattern(p.id, { usage: e.target.value })}
                      placeholder="Usage (ex: Modal confirmation)"
                      className="flex-1 min-w-[160px] h-7 px-2 text-xs rounded border border-border bg-card"
                    />
                    <button
                      onClick={() => removePattern(p.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <input
                    type="text"
                    value={p.keyboardInteractions}
                    onChange={(e) =>
                      updatePattern(p.id, { keyboardInteractions: e.target.value })
                    }
                    placeholder={`Interactions clavier attendues (APG: ${meta.keys})`}
                    className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                  />
                  <input
                    type="text"
                    value={p.notes}
                    onChange={(e) => updatePattern(p.id, { notes: e.target.value })}
                    placeholder="Notes (roles, aria-* attendus)"
                    className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                  />
                </div>
              );
            })}
            <div className="flex flex-wrap gap-1">
              {ARIA_PATTERN_PRESETS.filter((p) => !usedWidgets.has(p.widget)).map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPatternPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {ARIA_WIDGET_META[p.widget].label}
                </button>
              ))}
              <button
                onClick={addCustomPattern}
                className="text-[11px] px-2 py-1 rounded border border-dashed border-accent/50 hover:bg-accent/5 transition"
              >
                + Custom
              </button>
            </div>
          </section>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
