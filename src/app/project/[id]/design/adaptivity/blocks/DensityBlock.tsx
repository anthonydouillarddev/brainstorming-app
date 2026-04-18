"use client";

import { useState } from "react";
import type { AdaptivityState, DensityKey, DensityRuleEntry } from "../state";
import { DENSITY_META, makeId } from "../state";
import { DENSITY_PRESETS } from "../adaptivity-library";
import { validateDensities } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function DensityBlock({
  state,
  onChange,
}: {
  state: AdaptivityState;
  onChange: (patch: Partial<AdaptivityState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.densities.length > 0);
  const issues = validateDensities(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.densities.length >= 2 && !hasError;

  function loadAll() {
    onChange({
      densities: DENSITY_PRESETS.map((d) => ({ ...d, id: makeId("den") })),
    });
  }

  function addPreset(preset: (typeof DENSITY_PRESETS)[number]) {
    onChange({
      densities: [...state.densities, { ...preset, id: makeId("den") }],
    });
  }

  function update(id: string, patch: Partial<DensityRuleEntry>) {
    onChange({
      densities: state.densities.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    });
  }

  function remove(id: string) {
    onChange({
      densities: state.densities.filter((d) => d.id !== id),
    });
  }

  const existing = new Set(state.densities.map((d) => d.density));
  const available = DENSITY_PRESETS.filter((p) => !existing.has(p.density));

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          📄 Densité d&apos;affichage
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.densities.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Material 3 + Mindeck user_preferences.</strong>{" "}
            <em>Compact</em> (power users), <em>Normal</em> (défaut 16px), <em>Confortable</em>{" "}
            (17-18px, a11y). Impact sur font, line-height, spacing, target size.
          </div>

          {state.densities.length === 0 && (
            <button
              onClick={loadAll}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les 3 densités (compact + normal + confortable)
            </button>
          )}

          {state.densities.length > 0 && (
            <div className="space-y-2">
              {state.densities.map((d) => {
                const meta = DENSITY_META[d.density];
                return (
                  <div
                    key={d.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={d.density}
                        onChange={(e) =>
                          update(d.id, { density: e.target.value as DensityKey })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(DENSITY_META) as DensityKey[]).map((k) => (
                          <option key={k} value={k}>
                            {DENSITY_META[k].emoji} {DENSITY_META[k].label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-muted italic flex-1">{meta.hint}</span>
                      <button
                        onClick={() => remove(d.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">Font base</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={d.baseFontPx}
                            onChange={(e) =>
                              update(d.id, { baseFontPx: Number(e.target.value) })
                            }
                            className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                            min={10}
                          />
                          <span className="text-muted text-[10px]">px</span>
                        </div>
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">Line-height</span>
                        <input
                          type="number"
                          value={d.lineHeight}
                          onChange={(e) =>
                            update(d.id, { lineHeight: Number(e.target.value) })
                          }
                          step={0.05}
                          className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={1}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">Spacing scale</span>
                        <input
                          type="number"
                          value={d.spacingScale}
                          onChange={(e) =>
                            update(d.id, { spacingScale: Number(e.target.value) })
                          }
                          step={0.125}
                          className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          min={0.5}
                        />
                      </label>
                      <label className="flex flex-col gap-0.5">
                        <span className="text-muted text-[10px]">Target min</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={d.targetMinPx}
                            onChange={(e) =>
                              update(d.id, { targetMinPx: Number(e.target.value) })
                            }
                            className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                            min={16}
                          />
                          <span className="text-muted text-[10px]">px</span>
                        </div>
                      </label>
                    </div>
                    {/* Live preview */}
                    <div
                      className="bg-card/60 border border-dashed border-border rounded-lg p-3 space-y-1"
                      style={{
                        fontSize: `${d.baseFontPx}px`,
                        lineHeight: d.lineHeight,
                      }}
                    >
                      <div className="font-medium">
                        {meta.emoji} Aperçu en {meta.label.toLowerCase()}
                      </div>
                      <div className="text-muted" style={{ fontSize: "0.85em" }}>
                        Texte secondaire · ratio {d.spacingScale}× · target {d.targetMinPx}px
                      </div>
                    </div>
                    <input
                      type="text"
                      value={d.notes}
                      onChange={(e) => update(d.id, { notes: e.target.value })}
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
                  + {DENSITY_META[p.density].emoji} {DENSITY_META[p.density].label}
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
