"use client";

import { useState } from "react";
import type {
  A11yState,
  CheckStatus,
  CognitiveAxis,
  CognitiveCheckEntry,
} from "../state";
import { CHECK_STATUS_META, COGNITIVE_AXIS_META, makeId } from "../state";
import { COGNITIVE_PRESETS } from "../a11y-library";
import { validateCognitive } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function CognitiveAccessibilityBlock({
  state,
  onChange,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.cognitiveChecks.length > 0);
  const issues = validateCognitive(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const passed = state.cognitiveChecks.filter((c) => c.status === "pass").length;
  const ok = passed >= 4 && !hasError;

  function loadAllPresets() {
    const next: CognitiveCheckEntry[] = COGNITIVE_PRESETS.map((p) => ({
      id: makeId("cog"),
      axis: p.axis,
      rule: p.rule,
      status: "unknown",
      note: "",
    }));
    onChange({ cognitiveChecks: next });
  }

  function addPreset(preset: (typeof COGNITIVE_PRESETS)[number]) {
    const next: CognitiveCheckEntry = {
      id: makeId("cog"),
      axis: preset.axis,
      rule: preset.rule,
      status: "unknown",
      note: "",
    };
    onChange({ cognitiveChecks: [...state.cognitiveChecks, next] });
  }

  function addCustom() {
    const next: CognitiveCheckEntry = {
      id: makeId("cog"),
      axis: "memory-load",
      rule: "",
      status: "unknown",
      note: "",
    };
    onChange({ cognitiveChecks: [...state.cognitiveChecks, next] });
  }

  function update(id: string, patch: Partial<CognitiveCheckEntry>) {
    onChange({
      cognitiveChecks: state.cognitiveChecks.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });
  }

  function remove(id: string) {
    onChange({
      cognitiveChecks: state.cognitiveChecks.filter((c) => c.id !== id),
    });
  }

  const existingRules = new Set(state.cognitiveChecks.map((c) => c.rule));
  const availablePresets = COGNITIVE_PRESETS.filter(
    (p) => !existingRules.has(p.rule)
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
          🧠 Cognitive accessibility
          <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({passed}/{state.cognitiveChecks.length} passés)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">WCAG 2.2 + COGA.</strong> Utilisateurs avec
            troubles cognitifs, TDAH, dyslexie, anxiété. Charge mémoire faible · langage simple ·
            pas de time limits · aide à l&apos;erreur · focus unique · cohérence.
          </div>

          {state.cognitiveChecks.length === 0 && (
            <button
              onClick={loadAllPresets}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {COGNITIVE_PRESETS.length} règles par défaut
            </button>
          )}

          {state.cognitiveChecks.length > 0 && (
            <div className="space-y-1.5">
              {state.cognitiveChecks.map((c) => {
                const ameta = COGNITIVE_AXIS_META[c.axis];
                const smeta = CHECK_STATUS_META[c.status];
                return (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-lg border ${smeta.color} space-y-1.5`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={c.axis}
                        onChange={(e) =>
                          update(c.id, { axis: e.target.value as CognitiveAxis })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(COGNITIVE_AXIS_META) as CognitiveAxis[]).map((a) => (
                          <option key={a} value={a}>
                            {COGNITIVE_AXIS_META[a].emoji} {COGNITIVE_AXIS_META[a].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={c.status}
                        onChange={(e) =>
                          update(c.id, { status: e.target.value as CheckStatus })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(CHECK_STATUS_META) as CheckStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {CHECK_STATUS_META[s].emoji} {CHECK_STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-muted italic flex-1">
                        {ameta.hint}
                      </span>
                      <button
                        onClick={() => remove(c.id)}
                        className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      value={c.rule}
                      onChange={(e) => update(c.id, { rule: e.target.value })}
                      placeholder="Règle cognitive"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                    />
                    <input
                      type="text"
                      value={c.note}
                      onChange={(e) => update(c.id, { note: e.target.value })}
                      placeholder="Note (exemple, plan d'action)"
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
                {availablePresets.slice(0, 10).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addPreset(p)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition text-left max-w-full truncate"
                    title={p.rule}
                  >
                    + {COGNITIVE_AXIS_META[p.axis].emoji} {p.rule.slice(0, 40)}
                    {p.rule.length > 40 ? "…" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Règle personnalisée
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
