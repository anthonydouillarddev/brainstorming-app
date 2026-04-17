"use client";

import { useState } from "react";
import type { IdentityState, EmotionalDirection } from "../state";
import BlockStatus from "../components/BlockStatus";

const EMOTIONS: { key: EmotionalDirection; emoji: string; label: string; hint: string }[] = [
  { key: "calm", emoji: "🌿", label: "Calme", hint: "apaisement, concentration" },
  { key: "energy", emoji: "⚡", label: "Énergie", hint: "motivation, action" },
  { key: "trust", emoji: "🤝", label: "Confiance", hint: "fiabilité, sérénité" },
  { key: "joy", emoji: "🎉", label: "Joie", hint: "plaisir, célébration" },
  { key: "focus", emoji: "🎯", label: "Focus", hint: "efficacité, clarté" },
];

const MOOD_SUGGESTIONS = [
  "matinal",
  "feutré",
  "nerveux",
  "fluide",
  "artisanal",
  "technique",
  "chaleureux",
  "clinique",
  "organique",
  "digital",
  "papier",
  "café",
  "minimal",
  "dense",
  "lumineux",
  "sombre",
];

export default function MoodKeywordsBlock({
  state,
  onChange,
}: {
  state: IdentityState;
  onChange: (patch: Partial<IdentityState>) => void;
}) {
  const hasAny = state.moodKeywords.length > 0 || !!state.emotionalDirection;
  const [expanded, setExpanded] = useState(hasAny);
  const ok = state.moodKeywords.length >= 3 && !!state.emotionalDirection;

  function add(word: string) {
    const trimmed = word.trim();
    if (!trimmed || state.moodKeywords.includes(trimmed) || state.moodKeywords.length >= 5)
      return;
    onChange({ moodKeywords: [...state.moodKeywords, trimmed] });
  }
  function remove(i: number) {
    onChange({ moodKeywords: state.moodKeywords.filter((_, idx) => idx !== i) });
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
          🌿 Mood &amp; émotion
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {!expanded && hasAny && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {state.emotionalDirection && (
            <>
              {EMOTIONS.find((e) => e.key === state.emotionalDirection)?.emoji}{" "}
              {EMOTIONS.find((e) => e.key === state.emotionalDirection)?.label} ·{" "}
            </>
          )}
          {state.moodKeywords.join(" · ")}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Direction émotionnelle + 3-5 mots de mood.</strong>{" "}
            Pas un mood board complet — un cadrage rapide utile pour briefer un designer ou
            générer des visuels.
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium">Direction émotionnelle principale</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {EMOTIONS.map((e) => (
                <button
                  key={e.key}
                  onClick={() => onChange({ emotionalDirection: e.key })}
                  className={`p-3 rounded-xl border-2 text-center transition ${
                    state.emotionalDirection === e.key
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{e.emoji}</div>
                  <div className="text-sm font-semibold">{e.label}</div>
                  <div className="text-[10px] text-muted">{e.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center justify-between">
              <span>Mots de mood (3-5)</span>
              <span className="font-mono text-[10px] text-muted">
                {state.moodKeywords.length}/5
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {state.moodKeywords.map((word, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent"
                >
                  {word}
                  <button
                    onClick={() => remove(i)}
                    className="text-accent hover:text-red-500"
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {state.moodKeywords.length < 5 && (
              <input
                type="text"
                placeholder="Ajouter un mot (Enter)"
                className="w-full h-9 px-3 text-sm rounded border border-dashed border-border bg-card"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const input = e.target as HTMLInputElement;
                    add(input.value);
                    input.value = "";
                  }
                }}
              />
            )}
            <div className="flex flex-wrap gap-1">
              {MOOD_SUGGESTIONS.filter((s) => !state.moodKeywords.includes(s))
                .slice(0, 10)
                .map((s) => (
                  <button
                    key={s}
                    onClick={() => add(s)}
                    className="text-[10px] px-2 py-0.5 rounded border border-border text-muted hover:bg-accent/10 hover:text-foreground transition"
                    disabled={state.moodKeywords.length >= 5}
                  >
                    + {s}
                  </button>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
