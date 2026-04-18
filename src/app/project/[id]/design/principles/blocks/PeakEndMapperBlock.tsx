"use client";

import { useState } from "react";
import type { PeakEndStep, PrinciplesState, PeakEndEmotion } from "../state";
import { makeId } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function PeakEndMapperBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.peakEndSteps.length > 0);
  const hasEnd = state.peakEndSteps.some((s) => s.isEnd);
  const hasPeak = state.peakEndSteps.some((s) => s.isPeak);
  const ok = state.peakEndSteps.length >= 4 && hasPeak && hasEnd;

  function addStep() {
    const next: PeakEndStep = {
      id: makeId("pe"),
      name: "",
      emotion: 0,
      isPeak: false,
      isEnd: false,
    };
    onChange({ peakEndSteps: [...state.peakEndSteps, next] });
  }

  function update(id: string, patch: Partial<PeakEndStep>) {
    onChange({
      peakEndSteps: state.peakEndSteps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  }

  function remove(id: string) {
    onChange({ peakEndSteps: state.peakEndSteps.filter((s) => s.id !== id) });
  }

  function move(id: string, dir: -1 | 1) {
    const index = state.peakEndSteps.findIndex((s) => s.id === id);
    if (index === -1) return;
    const target = index + dir;
    if (target < 0 || target >= state.peakEndSteps.length) return;
    const copy = [...state.peakEndSteps];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange({ peakEndSteps: copy });
  }

  function markEnd(id: string) {
    onChange({
      peakEndSteps: state.peakEndSteps.map((s) => ({ ...s, isEnd: s.id === id })),
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
          🎢 Peak-End journey mapper
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.peakEndSteps.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Kahneman.</strong> On retient un parcours par son{" "}
            <strong>peak</strong> (pic émotionnel) et sa <strong>fin</strong>, pas par sa moyenne.
            Mappe tes 5-7 étapes clés, slide l&apos;émotion (-5 à +5), identifie le peak et
            soigne la fin.
          </div>

          {state.peakEndSteps.length > 0 && (
            <div className="space-y-2">
              {state.peakEndSteps.map((s, i) => (
                <div
                  key={s.id}
                  className={`border rounded-xl p-3 space-y-2 transition ${
                    s.isPeak
                      ? "border-amber-500/50 bg-amber-500/5"
                      : s.isEnd
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-border bg-card/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted w-6">#{i + 1}</span>
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(s.id, -1)}
                        disabled={i === 0}
                        className="w-4 h-4 text-[10px] text-muted hover:bg-accent/10 rounded disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => move(s.id, 1)}
                        disabled={i === state.peakEndSteps.length - 1}
                        className="w-4 h-4 text-[10px] text-muted hover:bg-accent/10 rounded disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => update(s.id, { name: e.target.value })}
                      placeholder="Étape (ex: Onboarding écran 2)"
                      className="h-8 px-2 text-sm rounded border border-border bg-card flex-1"
                    />
                    <button
                      onClick={() => update(s.id, { isPeak: !s.isPeak })}
                      className={`text-xs px-2 py-1 rounded transition ${
                        s.isPeak
                          ? "bg-amber-500 text-white"
                          : "border border-border text-muted hover:bg-accent/10"
                      }`}
                      title="Marquer comme peak émotionnel"
                    >
                      ⭐ peak
                    </button>
                    <button
                      onClick={() => markEnd(s.id)}
                      className={`text-xs px-2 py-1 rounded transition ${
                        s.isEnd
                          ? "bg-green-500 text-white"
                          : "border border-border text-muted hover:bg-accent/10"
                      }`}
                      title="Marquer comme fin du parcours"
                    >
                      🏁 end
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted w-16">Émotion :</span>
                    <input
                      type="range"
                      min={-5}
                      max={5}
                      value={s.emotion}
                      onChange={(e) =>
                        update(s.id, { emotion: Number(e.target.value) as PeakEndEmotion })
                      }
                      className="flex-1 accent-accent"
                    />
                    <span
                      className={`text-xs font-mono w-10 text-center ${
                        s.emotion > 0
                          ? "text-green-600"
                          : s.emotion < 0
                          ? "text-red-500"
                          : "text-muted"
                      }`}
                    >
                      {s.emotion > 0 ? "+" : ""}
                      {s.emotion}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addStep}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Ajouter une étape
          </button>

          {state.peakEndSteps.length > 0 && !hasPeak && (
            <div className="text-xs text-amber-500">
              ⚠️ Aucun peak marqué. Identifie l&apos;étape au plus haut niveau émotionnel.
            </div>
          )}
          {state.peakEndSteps.length > 0 && !hasEnd && (
            <div className="text-xs text-amber-500">
              ⚠️ Aucune fin marquée. Marque l&apos;étape finale — elle pèse autant que le peak
              dans la mémoire.
            </div>
          )}
        </>
      )}
    </div>
  );
}
