"use client";

import { useState } from "react";

export default function TagFilter({
  knownTags,
  activeTags,
  onChange,
  label = "Tags",
  tagCounts = {},
}: {
  knownTags: string[];
  activeTags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
  tagCounts?: Record<string, number>;
}) {
  const [expanded, setExpanded] = useState(false);
  if (knownTags.length === 0 && activeTags.length === 0) return null;

  const totalTagged = Object.values(tagCounts).reduce((sum, n) => sum + n, 0);
  const sortedTags = [...knownTags].sort((a, b) => {
    const ca = tagCounts[a] ?? 0;
    const cb = tagCounts[b] ?? 0;
    if (ca !== cb) return cb - ca;
    return a.localeCompare(b, "fr");
  });

  function toggle(tag: string) {
    if (activeTags.includes(tag)) {
      onChange(activeTags.filter((t) => t !== tag));
    } else {
      onChange([...activeTags, tag]);
    }
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-colors ${
            activeTags.length > 0
              ? "bg-accent/15 border-accent/40 text-accent font-semibold"
              : "bg-card/60 border-border text-muted hover:text-foreground"
          }`}
        >
          <span>🏷️</span>
          <span>{label}</span>
          {activeTags.length > 0 && (
            <span className="text-[10px] px-1.5 rounded-full bg-accent text-white font-bold">
              {activeTags.length}
            </span>
          )}
          <span className="text-[9px] opacity-70">{expanded ? "▾" : "▸"}</span>
        </button>
        {activeTags.length > 0 && !expanded && (
          <div className="flex flex-wrap gap-1">
            {activeTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {activeTags.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[10px] text-muted hover:text-red-400 underline underline-offset-2 transition-colors"
          >
            Tout effacer
          </button>
        )}
      </div>
      {expanded && knownTags.length > 0 && (
        <div className="mt-2">
          {totalTagged === 0 && (
            <p className="text-[10px] text-muted italic mb-1.5">
              Aucun item taggé pour l&apos;instant — ajoute des tags depuis
              le panneau d&apos;édition d&apos;une tâche ou idée.
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {sortedTags.map((tag) => {
              const active = activeTags.includes(tag);
              const count = tagCounts[tag] ?? 0;
              const unused = count === 0;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? "bg-accent/20 border-accent/50 text-accent font-semibold"
                      : unused
                        ? "bg-background/40 border-border/60 text-muted/60 hover:text-muted hover:border-muted"
                        : "bg-background/60 border-border text-muted hover:text-foreground hover:border-muted"
                  }`}
                  title={
                    count === 0
                      ? "Aucun item avec ce tag"
                      : `${count} item${count > 1 ? "s" : ""}`
                  }
                >
                  <span>
                    {active ? "✓ " : ""}
                    {tag}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 rounded-full ${
                      active
                        ? "bg-accent text-white"
                        : unused
                          ? "bg-background/60 text-muted/60"
                          : "bg-background/80 text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
