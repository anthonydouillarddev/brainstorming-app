"use client";

import type { InfoNavMode } from "../state";

const MODES: { key: InfoNavMode; label: string; emoji: string; hint: string }[] = [
  {
    key: "beginner",
    label: "Débutant",
    emoji: "🐣",
    hint: "Chat guidé · les pièces de ton app en 5 questions",
  },
  {
    key: "intermediate",
    label: "Formulaire",
    emoji: "🧑‍💼",
    hint: "Builder structuré · sitemap + nav + exports · défaut",
  },
];

export default function ModeToggle({
  mode,
  onChange,
}: {
  mode: InfoNavMode;
  onChange: (mode: InfoNavMode) => void;
}) {
  return (
    <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-card">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={`text-xs px-2.5 py-1 rounded transition flex items-center gap-1 ${
            mode === m.key
              ? "bg-accent text-white"
              : "text-muted hover:bg-accent/10 hover:text-foreground"
          }`}
          title={m.hint}
        >
          <span aria-hidden>{m.emoji}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}
