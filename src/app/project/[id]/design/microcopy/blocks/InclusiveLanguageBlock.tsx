"use client";

import { useState } from "react";
import type {
  CheckStatus,
  InclusiveAxis,
  InclusiveCheckEntry,
  MicrocopyState,
} from "../state";
import { CHECK_STATUS_META, INCLUSIVE_AXIS_META, makeId } from "../state";
import { INCLUSIVE_PRESETS } from "../microcopy-library";
import { validateInclusive } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function InclusiveLanguageBlock({
  state,
  onChange,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.inclusiveChecks.length > 0);
  const issues = validateInclusive(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const passed = state.inclusiveChecks.filter((c) => c.status === "pass").length;
  const total = state.inclusiveChecks.length;
  const ok = passed >= 4 && !hasError;

  function loadAllPresets() {
    const next: InclusiveCheckEntry[] = INCLUSIVE_PRESETS.map((p) => ({
      id: makeId("inc"),
      axis: p.axis,
      rule: p.rule,
      status: "unknown",
      note: "",
    }));
    onChange({ inclusiveChecks: next });
  }

  function addPreset(preset: (typeof INCLUSIVE_PRESETS)[number]) {
    const next: InclusiveCheckEntry = {
      id: makeId("inc"),
      axis: preset.axis,
      rule: preset.rule,
      status: "unknown",
      note: "",
    };
    onChange({ inclusiveChecks: [...state.inclusiveChecks, next] });
  }

  function addCustom() {
    const next: InclusiveCheckEntry = {
      id: makeId("inc"),
      axis: "plain-language",
      rule: "",
      status: "unknown",
      note: "",
    };
    onChange({ inclusiveChecks: [...state.inclusiveChecks, next] });
  }

  function update(id: string, patch: Partial<InclusiveCheckEntry>) {
    onChange({
      inclusiveChecks: state.inclusiveChecks.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    });
  }

  function remove(id: string) {
    onChange({
      inclusiveChecks: state.inclusiveChecks.filter((c) => c.id !== id),
    });
  }

  const existingRules = new Set(state.inclusiveChecks.map((c) => c.rule));
  const availablePresets = INCLUSIVE_PRESETS.filter((p) => !existingRules.has(p.rule));

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🌈 Inclusive language
          <span className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-600 rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">
            ({passed}/{total} passés)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Checklist d&apos;inclusion.</strong> Chaque règle
            à valider sur l&apos;ensemble du copy. Statut <em>OK</em> · <em>à revoir</em> ·{" "}
            <em>échec</em> · <em>à vérifier</em>. Sources : GOV.UK Plain English, Microsoft Style
            Guide, INaLF.
          </div>

          {state.inclusiveChecks.length === 0 && (
            <button
              onClick={loadAllPresets}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {INCLUSIVE_PRESETS.length} règles par défaut
            </button>
          )}

          {state.inclusiveChecks.length > 0 && (
            <div className="space-y-1.5">
              {state.inclusiveChecks.map((c) => {
                const ameta = INCLUSIVE_AXIS_META[c.axis];
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
                          update(c.id, { axis: e.target.value as InclusiveAxis })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(INCLUSIVE_AXIS_META) as InclusiveAxis[]).map((a) => (
                          <option key={a} value={a}>
                            {INCLUSIVE_AXIS_META[a].emoji} {INCLUSIVE_AXIS_META[a].label}
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
                      <span className="text-[10px] text-muted italic flex-1">{ameta.hint}</span>
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
                      placeholder="Règle d'inclusion"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                    />
                    <input
                      type="text"
                      value={c.note}
                      onChange={(e) => update(c.id, { note: e.target.value })}
                      placeholder="Note (exemple trouvé, plan d'action)"
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
                {availablePresets.slice(0, 8).map((p, i) => (
                  <button
                    key={i}
                    onClick={() => addPreset(p)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition text-left max-w-full truncate"
                    title={p.rule}
                  >
                    + {INCLUSIVE_AXIS_META[p.axis].emoji} {p.rule.slice(0, 40)}
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
