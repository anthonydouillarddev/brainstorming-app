"use client";

import { useMemo, useState } from "react";
import type {
  A11yState,
  CheckStatus,
  WcagCheckEntry,
  WcagPrinciple,
} from "../state";
import { CHECK_STATUS_META, WCAG_PRINCIPLE_META, makeId } from "../state";
import { WCAG_CRITERIA, wcagPresetsToEntries } from "../a11y-library";
import { validateWcag } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

type PrincipleFilter = WcagPrinciple | "all";

export default function WcagChecklistBlock({
  state,
  onChange,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.wcagChecks.length > 0);
  const [principleFilter, setPrincipleFilter] = useState<PrincipleFilter>("all");
  const issues = validateWcag(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");

  const counts = useMemo(() => {
    const out = { pass: 0, fail: 0, partial: 0, unknown: 0, na: 0 };
    for (const c of state.wcagChecks) {
      if (c.status === "pass") out.pass++;
      else if (c.status === "fail") out.fail++;
      else if (c.status === "partial") out.partial++;
      else if (c.status === "not-applicable") out.na++;
      else out.unknown++;
    }
    return out;
  }, [state.wcagChecks]);
  const ok = counts.pass >= 15 && counts.fail === 0;

  function loadAllCriteria() {
    const entries = wcagPresetsToEntries(WCAG_CRITERIA).map((e) => ({
      ...e,
      id: makeId("wcag"),
    }));
    onChange({ wcagChecks: entries });
  }

  function update(id: string, patch: Partial<WcagCheckEntry>) {
    onChange({
      wcagChecks: state.wcagChecks.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function remove(id: string) {
    onChange({ wcagChecks: state.wcagChecks.filter((c) => c.id !== id) });
  }

  const filtered =
    principleFilter === "all"
      ? state.wcagChecks
      : state.wcagChecks.filter((c) => c.principle === principleFilter);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          ♿ WCAG 2.2 AA
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({counts.pass}/{state.wcagChecks.length} pass)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">WCAG 2.2 (W3C 2024).</strong> Standard mondial
            repris par RGAA (France) et European Accessibility Act. Cocher pass/fail/partial pour
            chaque critère. Level A = obligatoire, AA = recommandé.
          </div>

          {state.wcagChecks.length === 0 && (
            <button
              onClick={loadAllCriteria}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {WCAG_CRITERIA.length} critères WCAG 2.2 AA prioritaires
            </button>
          )}

          {state.wcagChecks.length > 0 && (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted">Filtre :</span>
                <button
                  onClick={() => setPrincipleFilter("all")}
                  className={`text-[11px] px-2 py-1 rounded border transition ${
                    principleFilter === "all"
                      ? "bg-accent text-white border-accent"
                      : "border-border hover:bg-accent/10"
                  }`}
                >
                  Tous ({state.wcagChecks.length})
                </button>
                {(Object.keys(WCAG_PRINCIPLE_META) as WcagPrinciple[]).map((p) => {
                  const meta = WCAG_PRINCIPLE_META[p];
                  const count = state.wcagChecks.filter((c) => c.principle === p).length;
                  return (
                    <button
                      key={p}
                      onClick={() => setPrincipleFilter(p)}
                      className={`text-[11px] px-2 py-1 rounded border transition flex items-center gap-1 ${
                        principleFilter === p
                          ? "bg-accent text-white border-accent"
                          : "border-border hover:bg-accent/10"
                      }`}
                    >
                      {meta.emoji} {meta.label} ({count})
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-muted">
                <span className="text-green-600">✓ {counts.pass}</span>
                <span className="text-red-600">✗ {counts.fail}</span>
                <span className="text-amber-600">◐ {counts.partial}</span>
                <span>◦ {counts.unknown}</span>
                {counts.na > 0 && <span>— {counts.na} N/A</span>}
              </div>

              <div className="space-y-1.5">
                {filtered.map((c) => {
                  const pmeta = WCAG_PRINCIPLE_META[c.principle];
                  const smeta = CHECK_STATUS_META[c.status];
                  return (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-lg border ${smeta.color} space-y-1.5`}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold min-w-[42px]">
                          {c.criterionId}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border bg-card">
                          {c.level}
                        </span>
                        <span className="text-[10px]" title={pmeta.hint}>
                          {pmeta.emoji}
                        </span>
                        <span className="text-xs font-medium flex-1 min-w-[120px]">
                          {c.title}
                        </span>
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
                        value={c.note}
                        onChange={(e) => update(c.id, { note: e.target.value })}
                        placeholder="Note (observation, owner, workaround)"
                        className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
