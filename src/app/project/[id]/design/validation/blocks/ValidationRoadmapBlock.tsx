"use client";

import { useMemo, useState } from "react";
import type {
  FindingSeverity,
  RoadmapBucket,
  RoadmapStatus,
  ValidationRoadmapItem,
  ValidationState,
} from "../state";
import {
  FINDING_SEVERITY_META,
  HEURISTIC_META,
  ROADMAP_BUCKET_META,
  makeId,
} from "../state";
import BlockStatus from "../components/BlockStatus";

const EFFORTS = ["S", "M", "L", "XL"];
const BUCKETS: RoadmapBucket[] = ["now", "sprint", "quarter", "backlog", "wontfix"];

function suggestBucket(severity: FindingSeverity): RoadmapBucket {
  switch (severity) {
    case "critical":
      return "now";
    case "serious":
      return "sprint";
    case "moderate":
      return "quarter";
    case "minor":
      return "backlog";
  }
}

export default function ValidationRoadmapBlock({
  state,
  onChange,
}: {
  state: ValidationState;
  onChange: (patch: Partial<ValidationState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.roadmap.length > 0);

  const grouped = useMemo(() => {
    const out: Record<RoadmapBucket, ValidationRoadmapItem[]> = {
      now: [],
      sprint: [],
      quarter: [],
      backlog: [],
      wontfix: [],
    };
    for (const r of state.roadmap) out[r.bucket].push(r);
    return out;
  }, [state.roadmap]);

  const done = state.roadmap.filter((r) => r.status === "done").length;
  const blocking = grouped.now.filter((r) => r.status !== "done").length;
  const ok =
    state.roadmap.length >= 3 &&
    done === state.roadmap.length - grouped.wontfix.length;

  function autoGenerate() {
    const generated: ValidationRoadmapItem[] = [];

    // Findings non corrigés
    for (const t of state.userTests) {
      for (const f of t.findings) {
        if (!f.fixed) {
          generated.push({
            id: makeId("rm"),
            title: f.description || `Finding ${t.title}`,
            source: `Test « ${t.title || "?"} »`,
            severity: f.severity,
            bucket: suggestBucket(f.severity),
            effort: "M",
            owner: "",
            status: "todo",
            notes: `${f.frequency}× participant(s)`,
          });
        }
      }
    }

    // Heuristiques non résolues
    for (const h of state.heuristicEvals) {
      if (
        !h.resolved &&
        (h.severity === "critical" ||
          h.severity === "serious" ||
          h.severity === "moderate")
      ) {
        generated.push({
          id: makeId("rm"),
          title: h.suggestion || `Résoudre: ${HEURISTIC_META[h.heuristic].label}`,
          source: `Heuristique: ${HEURISTIC_META[h.heuristic].label}`,
          severity: h.severity as FindingSeverity,
          bucket: suggestBucket(h.severity as FindingSeverity),
          effort: "M",
          owner: "",
          status: "todo",
          notes: h.evidence,
        });
      }
    }

    if (generated.length > 0) {
      onChange({ roadmap: [...state.roadmap, ...generated] });
    }
  }

  function addCustom() {
    const next: ValidationRoadmapItem = {
      id: makeId("rm"),
      title: "",
      source: "Custom",
      severity: "moderate",
      bucket: "sprint",
      effort: "M",
      owner: "",
      status: "todo",
      notes: "",
    };
    onChange({ roadmap: [...state.roadmap, next] });
  }

  function update(id: string, patch: Partial<ValidationRoadmapItem>) {
    onChange({
      roadmap: state.roadmap.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  }

  function remove(id: string) {
    onChange({ roadmap: state.roadmap.filter((r) => r.id !== id) });
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
          🗺️ Validation roadmap
          <span className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-600 rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">
            ({done}/{state.roadmap.length} done)
          </span>
        </button>
        <BlockStatus
          ok={ok}
          hasError={blocking > 0}
          hasWarn={
            blocking === 0 &&
            state.roadmap.length > 0 &&
            done < state.roadmap.length
          }
        />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Plan d&apos;action de validation.</strong> Auto-
            généré depuis les findings tests + heuristiques non résolues. Mapping auto sévérité →
            bucket (critical→now, serious→sprint, moderate→quarter).
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={autoGenerate}
              className="text-xs px-3 py-1.5 rounded bg-accent text-white hover:bg-accent-hover transition font-medium"
            >
              ✨ Générer depuis findings &amp; heuristiques
            </button>
            <button
              onClick={addCustom}
              className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent/10 transition"
            >
              + Item personnalisé
            </button>
          </div>

          {state.roadmap.length === 0 && (
            <div className="text-center text-xs text-muted py-4 italic">
              Aucun item. Remplis les findings et heuristiques puis clique « Générer ».
            </div>
          )}

          {state.roadmap.length > 0 &&
            BUCKETS.map((bucket) => {
              const items = grouped[bucket];
              if (items.length === 0) return null;
              const bmeta = ROADMAP_BUCKET_META[bucket];
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
                    const smeta = FINDING_SEVERITY_META[r.severity];
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
                                status: e.target.value as RoadmapStatus,
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
                              update(r.id, { severity: e.target.value as FindingSeverity })
                            }
                            className="h-7 px-2 text-xs rounded border border-border bg-card"
                          >
                            {(Object.keys(FINDING_SEVERITY_META) as FindingSeverity[]).map(
                              (s) => (
                                <option key={s} value={s}>
                                  {FINDING_SEVERITY_META[s].emoji} {FINDING_SEVERITY_META[s].label}
                                </option>
                              )
                            )}
                          </select>
                          <select
                            value={r.bucket}
                            onChange={(e) =>
                              update(r.id, { bucket: e.target.value as RoadmapBucket })
                            }
                            className="h-7 px-2 text-xs rounded border border-border bg-card"
                          >
                            {BUCKETS.map((b) => (
                              <option key={b} value={b}>
                                {ROADMAP_BUCKET_META[b].emoji}{" "}
                                {ROADMAP_BUCKET_META[b].label}
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
                            value={r.source}
                            onChange={(e) => update(r.id, { source: e.target.value })}
                            placeholder="Source"
                            className="h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                          />
                          <input
                            type="text"
                            value={r.owner}
                            onChange={(e) => update(r.id, { owner: e.target.value })}
                            placeholder="Owner"
                            className="h-6 px-2 text-[11px] rounded border border-border bg-card"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}
