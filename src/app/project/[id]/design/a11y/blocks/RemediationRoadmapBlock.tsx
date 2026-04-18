"use client";

import { useMemo, useState } from "react";
import type {
  A11yState,
  RemediationBucket,
  RemediationEntry,
  Severity,
} from "../state";
import { REMEDIATION_BUCKET_META, SEVERITY_META, makeId } from "../state";
import BlockStatus from "../components/BlockStatus";

const BUCKETS: RemediationBucket[] = ["now", "week", "month", "quarter", "wontfix"];
const EFFORTS = ["S", "M", "L", "XL"];

function suggestBucket(severity: Severity): RemediationBucket {
  switch (severity) {
    case "critical":
      return "now";
    case "serious":
      return "week";
    case "moderate":
      return "month";
    case "minor":
      return "quarter";
  }
}

export default function RemediationRoadmapBlock({
  state,
  onChange,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.remediation.length > 0);

  const grouped = useMemo(() => {
    const out: Record<RemediationBucket, RemediationEntry[]> = {
      now: [],
      week: [],
      month: [],
      quarter: [],
      wontfix: [],
    };
    for (const r of state.remediation) out[r.bucket].push(r);
    return out;
  }, [state.remediation]);

  const totalDone = state.remediation.filter((r) => r.status === "done").length;
  const totalBlocking = grouped.now.filter((r) => r.status !== "done").length;
  const hasError = totalBlocking > 0;
  const ok =
    state.remediation.length >= 3 &&
    totalDone === state.remediation.length - grouped.wontfix.length;

  function autoGenerate() {
    const generated: RemediationEntry[] = [];

    // From WCAG fails
    for (const c of state.wcagChecks) {
      if (c.status === "fail") {
        generated.push({
          id: makeId("rem"),
          title: `Corriger ${c.title}`,
          reference: `WCAG ${c.criterionId} (Level ${c.level})`,
          severity: c.level === "A" ? "critical" : "serious",
          bucket: c.level === "A" ? "now" : "week",
          owner: "",
          effort: "M",
          status: "todo",
          notes: c.note || "",
        });
      }
    }

    // From open issues
    for (const i of state.issues) {
      if (i.status === "open" || i.status === "in-progress") {
        generated.push({
          id: makeId("rem"),
          title: i.description || `Issue ${i.component}`,
          reference: i.wcagRef ? `WCAG ${i.wcagRef}` : `Issue: ${i.component}`,
          severity: i.severity,
          bucket: suggestBucket(i.severity),
          owner: i.owner,
          effort: "M",
          status: "todo",
          notes: i.fixNotes,
        });
      }
    }

    // From AT fails
    for (const a of state.assistiveTech) {
      if (a.tested && a.status === "fail") {
        generated.push({
          id: makeId("rem"),
          title: `Fix compatibilité AT`,
          reference: `${a.at} + ${a.browser} ${a.version}`,
          severity: "serious",
          bucket: "week",
          owner: "",
          effort: "L",
          status: "todo",
          notes: a.notes,
        });
      }
    }

    // From motion prefs critiques
    for (const m of state.motionPreferences) {
      if (
        !m.respected &&
        (m.axis === "reduced-motion" || m.axis === "flash-safety")
      ) {
        generated.push({
          id: makeId("rem"),
          title: `Implémenter ${m.axis}`,
          reference: m.axis === "flash-safety" ? "WCAG 2.3.1" : "WCAG 2.3.3",
          severity: m.axis === "flash-safety" ? "critical" : "serious",
          bucket: m.axis === "flash-safety" ? "now" : "week",
          owner: "",
          effort: "S",
          status: "todo",
          notes: m.implementation,
        });
      }
    }

    if (generated.length > 0) {
      onChange({ remediation: [...state.remediation, ...generated] });
    }
  }

  function addCustom() {
    const next: RemediationEntry = {
      id: makeId("rem"),
      title: "",
      reference: "",
      severity: "moderate",
      bucket: "month",
      owner: "",
      effort: "M",
      status: "todo",
      notes: "",
    };
    onChange({ remediation: [...state.remediation, next] });
  }

  function update(id: string, patch: Partial<RemediationEntry>) {
    onChange({
      remediation: state.remediation.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    });
  }

  function remove(id: string) {
    onChange({
      remediation: state.remediation.filter((r) => r.id !== id),
    });
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🗺️ Remediation roadmap
          <span className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-600 rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">
            ({totalDone}/{state.remediation.length} done)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={totalBlocking === 0 && state.remediation.length > 0 && totalDone < state.remediation.length} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Plan d&apos;action a11y priorisé.</strong> Auto-
            généré depuis les WCAG fails, issues ouvertes, AT échoués, motion non respecté. Groupé
            par deadline (now · semaine · mois · trimestre).
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={autoGenerate}
              className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition font-medium"
            >
              ✨ Générer depuis les issues détectées
            </button>
            <button
              onClick={addCustom}
              className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
            >
              + Item personnalisé
            </button>
          </div>

          {state.remediation.length > 0 &&
            BUCKETS.map((bucket) => {
              const items = grouped[bucket];
              if (items.length === 0) return null;
              const bmeta = REMEDIATION_BUCKET_META[bucket];
              return (
                <div key={bucket} className="space-y-1.5">
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-xs font-semibold">
                      {bmeta.emoji} {bmeta.label}
                    </span>
                    <span className="text-[10px] text-muted italic">{bmeta.window}</span>
                    <span className="text-[10px] text-muted ml-auto font-mono">
                      {items.filter((i) => i.status === "done").length}/{items.length}
                    </span>
                  </div>
                  {items.map((r) => {
                    const smeta = SEVERITY_META[r.severity];
                    return (
                      <div
                        key={r.id}
                        className={`p-2 rounded-lg border ${bmeta.color} space-y-1.5 ${r.status === "done" ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <select
                            value={r.status}
                            onChange={(e) =>
                              update(r.id, {
                                status: e.target.value as RemediationEntry["status"],
                              })
                            }
                            className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                          >
                            <option value="todo">📋 À faire</option>
                            <option value="doing">🏃 En cours</option>
                            <option value="done">✅ Fait</option>
                          </select>
                          <select
                            value={r.severity}
                            onChange={(e) =>
                              update(r.id, { severity: e.target.value as Severity })
                            }
                            className="h-7 px-2 text-xs rounded border border-border bg-card"
                          >
                            {(Object.keys(SEVERITY_META) as Severity[]).map((s) => (
                              <option key={s} value={s}>
                                {SEVERITY_META[s].emoji} {SEVERITY_META[s].label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={r.bucket}
                            onChange={(e) =>
                              update(r.id, {
                                bucket: e.target.value as RemediationBucket,
                              })
                            }
                            className="h-7 px-2 text-xs rounded border border-border bg-card"
                          >
                            {BUCKETS.map((b) => (
                              <option key={b} value={b}>
                                {REMEDIATION_BUCKET_META[b].emoji}{" "}
                                {REMEDIATION_BUCKET_META[b].label}
                              </option>
                            ))}
                          </select>
                          <select
                            value={r.effort}
                            onChange={(e) => update(r.id, { effort: e.target.value })}
                            className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                          >
                            {EFFORTS.map((e) => (
                              <option key={e} value={e}>
                                {e}
                              </option>
                            ))}
                          </select>
                          <span
                            className={`text-[10px] font-mono ${smeta.color.split(" ")[2]}`}
                            title={smeta.label}
                          >
                            {smeta.emoji}
                          </span>
                          <button
                            onClick={() => remove(r.id)}
                            className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs ml-auto"
                            aria-label="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                        <input
                          type="text"
                          value={r.title}
                          onChange={(e) => update(r.id, { title: e.target.value })}
                          placeholder="Action"
                          className={`w-full h-7 px-2 text-xs rounded border border-border bg-card font-medium ${r.status === "done" ? "line-through" : ""}`}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={r.reference}
                            onChange={(e) => update(r.id, { reference: e.target.value })}
                            placeholder="Référence (WCAG 2.4.7, issue id)"
                            className="h-6 px-2 text-[11px] font-mono rounded border border-border bg-card text-muted"
                          />
                          <input
                            type="text"
                            value={r.owner}
                            onChange={(e) => update(r.id, { owner: e.target.value })}
                            placeholder="Owner"
                            className="h-6 px-2 text-[11px] rounded border border-border bg-card"
                          />
                        </div>
                        <input
                          type="text"
                          value={r.notes}
                          onChange={(e) => update(r.id, { notes: e.target.value })}
                          placeholder="Notes / plan"
                          className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}

          {state.remediation.length === 0 && (
            <div className="text-center text-xs text-muted py-4 italic">
              Aucun item. Clique sur « Générer depuis les issues détectées » pour démarrer, ou
              ajoute un item personnalisé.
            </div>
          )}
        </>
      )}
    </div>
  );
}
