"use client";

import { useState } from "react";
import type { LengthBudgetRule, MicrocopyState, PlacementKind } from "../state";
import { PLACEMENT_META, makeId } from "../state";
import { LENGTH_BUDGET_PRESETS } from "../microcopy-library";
import { validateBudgets } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function LengthBudgetBlock({
  state,
  onChange,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.lengthBudgets.length > 0);
  const issues = validateBudgets(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.lengthBudgets.length >= 3 && !hasError;

  function loadAllDefaults() {
    const next = LENGTH_BUDGET_PRESETS.map((p) => ({ ...p, id: makeId("bud") }));
    onChange({ lengthBudgets: next });
  }

  function addPreset(preset: (typeof LENGTH_BUDGET_PRESETS)[number]) {
    const next: LengthBudgetRule = { id: makeId("bud"), ...preset };
    onChange({ lengthBudgets: [...state.lengthBudgets, next] });
  }

  function addCustom() {
    const next: LengthBudgetRule = {
      id: makeId("bud"),
      placement: "cta-primary",
      maxChars: 24,
      reason: "",
      exceptions: "",
    };
    onChange({ lengthBudgets: [...state.lengthBudgets, next] });
  }

  function update(id: string, patch: Partial<LengthBudgetRule>) {
    onChange({
      lengthBudgets: state.lengthBudgets.map((b) =>
        b.id === id ? { ...b, ...patch } : b
      ),
    });
  }

  function remove(id: string) {
    onChange({
      lengthBudgets: state.lengthBudgets.filter((b) => b.id !== id),
    });
  }

  const coveredPlacements = new Set(state.lengthBudgets.map((b) => b.placement));
  const uncoveredPresets = LENGTH_BUDGET_PRESETS.filter(
    (p) => !coveredPlacements.has(p.placement)
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
          📏 Length budget
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.lengthBudgets.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Nathan Curtis &amp; Luke Wroblewski.</strong> Des
            limites écrites = copy scannable + UI qui ne casse pas au mobile. Les autres blocks
            (CTA, Form, Variants) valident automatiquement contre ces budgets.
          </div>

          {state.lengthBudgets.length === 0 && (
            <button
              onClick={loadAllDefaults}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {LENGTH_BUDGET_PRESETS.length} budgets par défaut
            </button>
          )}

          {state.lengthBudgets.length > 0 && (
            <div className="space-y-1.5">
              {state.lengthBudgets.map((b) => {
                const pmeta = PLACEMENT_META[b.placement];
                const isHigher = b.maxChars > pmeta.defaultMax;
                const isLower = b.maxChars < pmeta.defaultMax;
                return (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg border border-border bg-card space-y-1.5"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={b.placement}
                        onChange={(e) =>
                          update(b.id, { placement: e.target.value as PlacementKind })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(PLACEMENT_META) as PlacementKind[]).map((p) => (
                          <option key={p} value={p}>
                            {PLACEMENT_META[p].emoji} {PLACEMENT_META[p].label}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1 text-xs">
                        <input
                          type="number"
                          value={b.maxChars}
                          onChange={(e) =>
                            update(b.id, { maxChars: Number(e.target.value) })
                          }
                          className="w-16 h-7 px-2 text-xs rounded border border-border bg-card font-mono text-center"
                          min={1}
                        />
                        <span className="text-muted">car.</span>
                      </div>
                      <span className="text-[10px] text-muted font-mono">
                        défaut : {pmeta.defaultMax}
                      </span>
                      {isHigher && (
                        <span className="text-[10px] text-amber-600">↑ plus large</span>
                      )}
                      {isLower && (
                        <span className="text-[10px] text-green-600">↓ plus strict</span>
                      )}
                      <button
                        onClick={() => remove(b.id)}
                        className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      value={b.reason}
                      onChange={(e) => update(b.id, { reason: e.target.value })}
                      placeholder="Raison (ex: Mobile 320px = 20 car. visibles)"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card"
                    />
                    <input
                      type="text"
                      value={b.exceptions}
                      onChange={(e) => update(b.id, { exceptions: e.target.value })}
                      placeholder="Exceptions (optionnel)"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {uncoveredPresets.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Placements non couverts :</div>
              <div className="flex flex-wrap gap-1">
                {uncoveredPresets.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addPreset(p)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {PLACEMENT_META[p.placement].emoji} {PLACEMENT_META[p.placement].label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Budget personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
