"use client";

import { useMemo, useState } from "react";
import type { ProjectType } from "@/lib/types";
import type { ComponentSelection, DesignSystemState } from "../state";
import type { MvpPriority } from "../components-catalog";
import {
  CATEGORY_META,
  COMPONENTS_CATALOG,
  MVP_BY_TYPE,
} from "../components-catalog";
import BlockStatus from "../components/BlockStatus";

const PRIORITIES: MvpPriority[] = ["must", "should", "nice"];

const PRIORITY_META: Record<
  MvpPriority,
  { label: string; color: string; bg: string; border: string }
> = {
  must: {
    label: "MUST",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/40",
  },
  should: {
    label: "SHOULD",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/40",
  },
  nice: {
    label: "NICE",
    color: "text-muted",
    bg: "bg-muted/10",
    border: "border-muted/40",
  },
};

export default function ComponentChecklistBlock({
  state,
  projectType,
  onChange,
}: {
  state: DesignSystemState;
  projectType: ProjectType | null;
  onChange: (patch: Partial<DesignSystemState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.components.length > 0);
  const ok = state.components.length >= 8;

  const selectedMap = useMemo(
    () => new Map(state.components.map((c) => [c.slug, c])),
    [state.components]
  );

  const recommendedPriority = useMemo(() => {
    const map = new Map<string, MvpPriority>();
    if (!projectType) return map;
    const reco = MVP_BY_TYPE[projectType];
    reco.must.forEach((s) => map.set(s, "must"));
    reco.should.forEach((s) => map.set(s, "should"));
    reco.nice.forEach((s) => map.set(s, "nice"));
    return map;
  }, [projectType]);

  function toggle(slug: string, priority: MvpPriority) {
    const existing = selectedMap.get(slug);
    if (existing && existing.priority === priority) {
      onChange({ components: state.components.filter((c) => c.slug !== slug) });
    } else {
      const next: ComponentSelection = existing
        ? { ...existing, priority }
        : { slug, priority, notes: "" };
      const rest = state.components.filter((c) => c.slug !== slug);
      onChange({ components: [...rest, next] });
    }
  }

  function loadRecoForType() {
    if (!projectType) return;
    const reco = MVP_BY_TYPE[projectType];
    const next: ComponentSelection[] = [];
    reco.must.forEach((s) => next.push({ slug: s, priority: "must", notes: "" }));
    reco.should.forEach((s) => next.push({ slug: s, priority: "should", notes: "" }));
    onChange({ components: next });
  }

  const counts = {
    must: state.components.filter((c) => c.priority === "must").length,
    should: state.components.filter((c) => c.priority === "should").length,
    nice: state.components.filter((c) => c.priority === "nice").length,
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🧱 Catalogue composants
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({counts.must} must · {counts.should} should · {counts.nice} nice)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">{COMPONENTS_CATALOG.length} composants</strong>{" "}
            classés par priorité MVP. Clique sur MUST / SHOULD / NICE pour chaque composant.
            Suggestions automatiques selon le type de projet.
          </div>

          {state.components.length === 0 && projectType && (
            <button
              onClick={loadRecoForType}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger la recommandation pour un projet {projectType}
            </button>
          )}

          {(["atom", "molecule", "organism"] as const).map((category) => {
            const items = COMPONENTS_CATALOG.filter((c) => c.category === category);
            const meta = CATEGORY_META[category];
            return (
              <div key={category} className="space-y-2">
                <div className="text-xs font-semibold text-muted flex items-center gap-1">
                  <span>{meta.emoji}</span>
                  <span>
                    {meta.label} — {meta.description}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map((c) => {
                    const selection = selectedMap.get(c.slug);
                    const reco = recommendedPriority.get(c.slug);
                    return (
                      <div
                        key={c.slug}
                        className={`border rounded-xl p-2 transition ${
                          selection
                            ? PRIORITY_META[selection.priority].bg +
                              " " +
                              PRIORITY_META[selection.priority].border
                            : "border-border bg-card/60"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{c.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="font-semibold text-sm">{c.name}</span>
                              {reco && !selection && (
                                <span
                                  className={`text-[9px] px-1 py-0.5 rounded ${PRIORITY_META[reco].bg} ${PRIORITY_META[reco].color}`}
                                >
                                  reco {reco}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted truncate">{c.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5">
                          {PRIORITIES.map((p) => {
                            const isSelected = selection?.priority === p;
                            return (
                              <button
                                key={p}
                                onClick={() => toggle(c.slug, p)}
                                className={`flex-1 text-[10px] px-1 py-1 rounded border transition ${
                                  isSelected
                                    ? PRIORITY_META[p].bg +
                                      " " +
                                      PRIORITY_META[p].border +
                                      " font-bold"
                                    : "border-border text-muted hover:bg-accent/10"
                                }`}
                              >
                                {PRIORITY_META[p].label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
