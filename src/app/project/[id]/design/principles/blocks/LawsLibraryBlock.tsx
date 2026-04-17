"use client";

import { useMemo, useState } from "react";
import type { PinnedLaw, PrinciplesState } from "../state";
import type { LawCategory } from "../laws-library";
import { LAW_CATEGORIES, UX_LAWS } from "../laws-library";
import BlockStatus from "../components/BlockStatus";

export default function LawsLibraryBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.pinnedLaws.length > 0);
  const [filter, setFilter] = useState<LawCategory | "all" | "pinned">("all");
  const ok = state.pinnedLaws.length >= 3;

  const pinnedSlugs = useMemo(
    () => new Set(state.pinnedLaws.map((p) => p.lawSlug)),
    [state.pinnedLaws]
  );

  const filtered = useMemo(() => {
    if (filter === "pinned") return UX_LAWS.filter((l) => pinnedSlugs.has(l.slug));
    if (filter === "all") return UX_LAWS;
    return UX_LAWS.filter((l) => l.category === filter);
  }, [filter, pinnedSlugs]);

  function togglePin(slug: string) {
    if (pinnedSlugs.has(slug)) {
      onChange({ pinnedLaws: state.pinnedLaws.filter((p) => p.lawSlug !== slug) });
    } else {
      const next: PinnedLaw = { lawSlug: slug, priority: "should", rationale: "" };
      onChange({ pinnedLaws: [...state.pinnedLaws, next] });
    }
  }

  function updatePin(slug: string, patch: Partial<PinnedLaw>) {
    onChange({
      pinnedLaws: state.pinnedLaws.map((p) =>
        p.lawSlug === slug ? { ...p, ...patch } : p
      ),
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
          📚 Laws of UX
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.pinnedLaws.length} épinglée{state.pinnedLaws.length > 1 ? "s" : ""})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">18 lois UX reliability=strong</strong> (Nielsen,
            Norman, Yablonski, Gestalt). Épingle 3-5 lois critiques pour ton projet. Elles
            serviront à générer ta Design Principles Card.
          </div>

          <div className="flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs px-2.5 py-1 rounded transition ${
                filter === "all"
                  ? "bg-accent text-white"
                  : "border border-border text-muted hover:bg-accent/10"
              }`}
            >
              Toutes ({UX_LAWS.length})
            </button>
            <button
              onClick={() => setFilter("pinned")}
              className={`text-xs px-2.5 py-1 rounded transition ${
                filter === "pinned"
                  ? "bg-accent text-white"
                  : "border border-border text-muted hover:bg-accent/10"
              }`}
            >
              📌 Épinglées ({state.pinnedLaws.length})
            </button>
            {Object.entries(LAW_CATEGORIES).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => setFilter(key as LawCategory)}
                className={`text-xs px-2.5 py-1 rounded transition ${
                  filter === key
                    ? "bg-accent text-white"
                    : "border border-border text-muted hover:bg-accent/10"
                }`}
              >
                {meta.emoji} {meta.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filtered.map((law) => {
              const pinned = state.pinnedLaws.find((p) => p.lawSlug === law.slug);
              const isPinned = !!pinned;
              return (
                <div
                  key={law.slug}
                  className={`border-2 rounded-xl p-3 space-y-2 transition ${
                    isPinned ? "border-accent bg-accent/5" : "border-border bg-card/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3
                          className="font-semibold text-sm"
                          dangerouslySetInnerHTML={{ __html: law.name }}
                        />
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted/20 text-muted">
                          {LAW_CATEGORIES[law.category].emoji}{" "}
                          {LAW_CATEGORIES[law.category].label}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mt-1">{law.summary}</p>
                    </div>
                    <button
                      onClick={() => togglePin(law.slug)}
                      className={`text-xs px-2 py-1 rounded transition shrink-0 ${
                        isPinned
                          ? "bg-accent text-white"
                          : "border border-border text-muted hover:bg-accent/10"
                      }`}
                      title={isPinned ? "Désépingler" : "Épingler"}
                    >
                      {isPinned ? "📌 Épinglée" : "+ Épingler"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-1 text-[10px]">
                    <div className="text-green-600 dark:text-green-400">
                      <strong>✓</strong> {law.exampleGood}
                    </div>
                    <div className="text-red-500">
                      <strong>✗</strong> {law.exampleBad}
                    </div>
                  </div>
                  <a
                    href={law.sourceUrl}
                    target="_blank"
                    rel="noopener"
                    className="text-[10px] text-muted hover:text-accent underline"
                  >
                    Source : {law.sourceLabel}
                  </a>
                  {isPinned && pinned && (
                    <div className="pt-2 border-t border-border space-y-1">
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-muted">Priorité :</label>
                        {(["must", "should", "nice"] as PinnedLaw["priority"][]).map((p) => (
                          <button
                            key={p}
                            onClick={() => updatePin(law.slug, { priority: p })}
                            className={`text-[10px] px-2 py-0.5 rounded transition ${
                              pinned.priority === p
                                ? "bg-accent text-white"
                                : "border border-border text-muted hover:bg-accent/10"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={pinned.rationale}
                        onChange={(e) =>
                          updatePin(law.slug, { rationale: e.target.value })
                        }
                        placeholder="Pourquoi cette loi pour ce projet ?"
                        className="w-full h-7 px-2 text-[11px] rounded border border-border bg-card text-muted"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
