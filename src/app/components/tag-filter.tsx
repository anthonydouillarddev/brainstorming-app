"use client";

import { useState } from "react";

export default function TagFilter({
  knownTags,
  activeTags,
  onChange,
  label = "Tags",
}: {
  knownTags: string[];
  activeTags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  if (knownTags.length === 0 && activeTags.length === 0) return null;

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
        <div className="mt-2 flex flex-wrap gap-1.5">
          {knownTags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggle(tag)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  active
                    ? "bg-accent/20 border-accent/50 text-accent font-semibold"
                    : "bg-background/60 border-border text-muted hover:text-foreground hover:border-muted"
                }`}
              >
                {active ? "✓ " : ""}
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
