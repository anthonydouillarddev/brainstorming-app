"use client";

import type { StrategyMode } from "../state";

export default function ModeToggle({
  mode,
  onChange,
}: {
  mode: StrategyMode;
  onChange: (m: StrategyMode) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Mode de saisie"
      className="inline-flex items-center gap-0.5 p-0.5 bg-card border border-border rounded-xl text-xs"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "beginner"}
        onClick={() => onChange("beginner")}
        className={`px-3 py-1.5 rounded-lg transition ${
          mode === "beginner"
            ? "bg-accent text-white shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        🎓 Débutant
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "intermediate"}
        onClick={() => onChange("intermediate")}
        className={`px-3 py-1.5 rounded-lg transition ${
          mode === "intermediate"
            ? "bg-accent text-white shadow-sm"
            : "text-muted hover:text-foreground"
        }`}
      >
        📋 Formulaire
      </button>
    </div>
  );
}
