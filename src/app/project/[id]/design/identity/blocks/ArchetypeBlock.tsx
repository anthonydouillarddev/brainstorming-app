"use client";

import { useState } from "react";
import { ARCHETYPES, ARCHETYPE_DISCLAIMER, type ArchetypeKey } from "../archetypes";
import type { IdentityState } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function ArchetypeBlock({
  state,
  onChange,
}: {
  state: IdentityState;
  onChange: (patch: Partial<IdentityState>) => void;
}) {
  const [expanded, setExpanded] = useState(!state.archetypeKey);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const selected = state.archetypeKey
    ? ARCHETYPES.find((a) => a.key === state.archetypeKey)
    : null;
  const ok = !!selected;

  function pickArchetype(key: ArchetypeKey) {
    const archetype = ARCHETYPES.find((a) => a.key === key);
    if (!archetype) return;
    // Pré-remplit les sliders + glossaire uniquement si vierge
    const shouldPreFillSliders = Object.values(state.voiceSliders)
      .slice(0, 4)
      .every((v) => v === 50);
    const shouldPreFillGlossary = state.doWords.length === 0 && state.dontWords.length === 0;

    onChange({
      archetypeKey: key,
      voiceSliders: shouldPreFillSliders
        ? { ...state.voiceSliders, ...archetype.sliderDefaults }
        : state.voiceSliders,
      doWords: shouldPreFillGlossary ? archetype.doWords : state.doWords,
      dontWords: shouldPreFillGlossary ? archetype.dontWords : state.dontWords,
    });
    setExpanded(false);
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
          🎭 Archétype de marque
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {!expanded && selected && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3 flex items-center gap-2">
          <span className="text-lg">{selected.emoji}</span>
          <span>
            <strong className="text-foreground">{selected.name}</strong> — {selected.tagline}
          </span>
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed space-y-2">
            <p>
              <strong className="text-foreground">Si ton produit était une personne, ce serait qui ?</strong>{" "}
              Choisis l&apos;archétype qui te parle. Ça pré-remplit les sliders de voix et le
              glossaire — tu pourras toujours ajuster après.
            </p>
            <button
              onClick={() => setShowDisclaimer((v) => !v)}
              className="text-[11px] text-accent hover:underline"
            >
              {showDisclaimer ? "Cacher" : "⚠️ À savoir avant de choisir"}
            </button>
            {showDisclaimer && (
              <p className="bg-amber-500/10 border border-amber-500/30 rounded p-2 text-amber-700 dark:text-amber-400">
                {ARCHETYPE_DISCLAIMER}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ARCHETYPES.map((a) => {
              const isSelected = state.archetypeKey === a.key;
              return (
                <button
                  key={a.key}
                  onClick={() => pickArchetype(a.key)}
                  className={`text-left p-3 rounded-xl border-2 transition ${
                    isSelected
                      ? "border-accent bg-accent/10"
                      : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl" aria-hidden>
                      {a.emoji}
                    </span>
                    <span className="font-semibold text-sm">{a.name}</span>
                  </div>
                  <div className="text-[11px] text-muted mb-2">{a.tagline}</div>
                  <div className="text-[10px] text-muted/70 line-clamp-3">{a.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {a.examples.slice(0, 2).map((ex) => (
                      <span
                        key={ex}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-muted/20 text-muted"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="bg-accent/5 border border-accent/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{selected.emoji}</span>
                <div>
                  <div className="font-semibold">{selected.name}</div>
                  <div className="text-xs text-muted">{selected.tagline}</div>
                </div>
              </div>
              <p className="text-sm text-muted">{selected.description}</p>
              <div className="flex items-center gap-1 flex-wrap text-[11px]">
                <span className="text-muted">Références :</span>
                {selected.examples.map((ex) => (
                  <span
                    key={ex}
                    className="px-2 py-0.5 rounded-full bg-card border border-border"
                  >
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
