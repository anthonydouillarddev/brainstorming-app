"use client";

import { useMemo, useState } from "react";
import type { A11yIssueEntry, A11yState, Severity } from "../state";
import { SEVERITY_META, makeId } from "../state";
import { validateIssues } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

type StatusFilter = A11yIssueEntry["status"] | "all";

const STATUS_META: Record<
  A11yIssueEntry["status"],
  { label: string; color: string }
> = {
  open: {
    label: "Ouvert",
    color: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
  },
  "in-progress": {
    label: "En cours",
    color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
  },
  fixed: {
    label: "Corrigé",
    color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
  },
  wontfix: {
    label: "Won't fix",
    color: "bg-muted/10 border-border text-muted",
  },
};

export default function IssueLogBlock({
  state,
  onChange,
}: {
  state: A11yState;
  onChange: (patch: Partial<A11yState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.issues.length > 0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const issues = validateIssues(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");

  const counts = useMemo(() => {
    return {
      total: state.issues.length,
      open: state.issues.filter((i) => i.status === "open").length,
      inProgress: state.issues.filter((i) => i.status === "in-progress").length,
      fixed: state.issues.filter((i) => i.status === "fixed").length,
      critical: state.issues.filter((i) => i.severity === "critical").length,
    };
  }, [state.issues]);
  const ok = counts.total > 0 && counts.open === 0 && !hasError;

  function addIssue() {
    const next: A11yIssueEntry = {
      id: makeId("iss"),
      wcagRef: "",
      description: "",
      severity: "moderate",
      component: "",
      status: "open",
      owner: "",
      foundAt: new Date().toISOString().slice(0, 10),
      fixNotes: "",
    };
    onChange({ issues: [...state.issues, next] });
  }

  function update(id: string, patch: Partial<A11yIssueEntry>) {
    onChange({
      issues: state.issues.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    });
  }

  function remove(id: string) {
    onChange({ issues: state.issues.filter((i) => i.id !== id) });
  }

  const filtered =
    statusFilter === "all"
      ? state.issues
      : state.issues.filter((i) => i.status === statusFilter);

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          📋 Issue log
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({counts.open} ouverte(s) · {counts.fixed} corrigée(s))
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Tracking des issues.</strong> Issues trouvées via
            audit manuel, axe-core, Lighthouse, ou tests utilisateurs. Référence WCAG +
            composant + sévérité + owner pour un suivi propre.
          </div>

          {state.issues.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted">Filtre :</span>
              <button
                onClick={() => setStatusFilter("all")}
                className={`text-[11px] px-2 py-1 rounded border transition ${
                  statusFilter === "all"
                    ? "bg-accent text-white border-accent"
                    : "border-border hover:bg-accent/10"
                }`}
              >
                Tout ({counts.total})
              </button>
              {(Object.keys(STATUS_META) as Array<A11yIssueEntry["status"]>).map((s) => {
                const count = state.issues.filter((i) => i.status === s).length;
                return (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`text-[11px] px-2 py-1 rounded border transition ${
                      statusFilter === s
                        ? "bg-accent text-white border-accent"
                        : "border-border hover:bg-accent/10"
                    }`}
                  >
                    {STATUS_META[s].label} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="space-y-2">
              {filtered.map((i) => {
                const smeta = SEVERITY_META[i.severity];
                const stmeta = STATUS_META[i.status];
                return (
                  <div
                    key={i.id}
                    className={`p-3 rounded-lg border ${stmeta.color} space-y-2`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={i.wcagRef}
                        onChange={(e) => update(i.id, { wcagRef: e.target.value })}
                        placeholder="WCAG"
                        className="w-16 h-7 px-2 text-[11px] font-mono rounded border border-border bg-card"
                      />
                      <select
                        value={i.severity}
                        onChange={(e) =>
                          update(i.id, { severity: e.target.value as Severity })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(SEVERITY_META) as Severity[]).map((s) => (
                          <option key={s} value={s}>
                            {SEVERITY_META[s].emoji} {SEVERITY_META[s].label}
                          </option>
                        ))}
                      </select>
                      <select
                        value={i.status}
                        onChange={(e) =>
                          update(i.id, {
                            status: e.target.value as A11yIssueEntry["status"],
                          })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      >
                        {(Object.keys(STATUS_META) as Array<A11yIssueEntry["status"]>).map(
                          (s) => (
                            <option key={s} value={s}>
                              {STATUS_META[s].label}
                            </option>
                          )
                        )}
                      </select>
                      <input
                        type="text"
                        value={i.component}
                        onChange={(e) => update(i.id, { component: e.target.value })}
                        placeholder="Composant"
                        className="flex-1 min-w-[120px] h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(i.id)}
                        className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <textarea
                      value={i.description}
                      onChange={(e) => update(i.id, { description: e.target.value })}
                      placeholder="Description de l'issue"
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card resize-y"
                    />
                    <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-center">
                      <input
                        type="date"
                        value={i.foundAt}
                        onChange={(e) => update(i.id, { foundAt: e.target.value })}
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                      />
                      <input
                        type="text"
                        value={i.owner}
                        onChange={(e) => update(i.id, { owner: e.target.value })}
                        placeholder="Owner"
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                      <span className={`text-[10px] font-mono ${smeta.color.split(" ")[2]}`}>
                        {smeta.emoji} {smeta.label}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={i.fixNotes}
                      onChange={(e) => update(i.id, { fixNotes: e.target.value })}
                      placeholder="Fix notes / plan d'action"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={addIssue}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Nouvelle issue
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
