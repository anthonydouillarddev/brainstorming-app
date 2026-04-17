"use client";

import type { IdentityMode } from "../state";

const MODES: { key: IdentityMode; label: string; emoji: string; hint: string }[] = [
  {
    key: "beginner",
    label: "Débutant",
    emoji: "🐣",
    hint: "Chat guidé · choisis un archétype + 3 questions",
  },
  {
    key: "intermediate",
    label: "Formulaire",
    emoji: "🧑‍💼",
    hint: "Formulaire structuré · blocs collapsibles · défaut",
  },
];

export default function ModeToggle({
  mode,
  onChange,
}: {
  mode: IdentityMode;
  onChange: (mode: IdentityMode) => void;
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
