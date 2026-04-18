"use client";

import { useState } from "react";
import type { EmptyStateEntry, FlowsState } from "../state";
import { makeEmptyStateId } from "../state";
import BlockStatus from "../components/BlockStatus";

const EXAMPLES = [
  {
    screen: "Liste projets vide",
    copy: "Rien ici pour l'instant. Crée ton premier projet en 30 secondes.",
    cta: "+ Nouveau projet",
  },
  {
    screen: "Inbox vide",
    copy: "Tranquille, rien à traiter. Bonne journée !",
    cta: "Voir l'archive",
  },
  {
    screen: "Search sans résultat",
    copy: "Aucun résultat pour « {query} ». Essaie avec d'autres mots-clés.",
    cta: "Voir les suggestions",
  },
];

export default function EmptyStateBlock({
  state,
  onChange,
}: {
  state: FlowsState;
  onChange: (patch: Partial<FlowsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.emptyStates.length > 0);
  const ok = state.emptyStates.length > 0;

  function addEmpty(seed?: Partial<EmptyStateEntry>) {
    const next: EmptyStateEntry = {
      id: makeEmptyStateId(),
      screen: seed?.screen ?? "",
      copy: seed?.copy ?? "",
      cta: seed?.cta ?? "",
    };
    onChange({ emptyStates: [...state.emptyStates, next] });
  }

  function update(id: string, patch: Partial<EmptyStateEntry>) {
    onChange({
      emptyStates: state.emptyStates.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    });
  }

  function remove(id: string) {
    onChange({ emptyStates: state.emptyStates.filter((e) => e.id !== id) });
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
          📭 Empty states
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.emptyStates.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Chaque écran vide doit enseigner.</strong>{" "}
            Linear/Superhuman : copy chaleureux + CTA clair qui amorce l&apos;action. Pas de
            « Aucun résultat » sec.
          </div>

          {state.emptyStates.length > 0 && (
            <div className="space-y-2">
              {state.emptyStates.map((e) => (
                <div
                  key={e.id}
                  className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={e.screen}
                      onChange={(ev) => update(e.id, { screen: ev.target.value })}
                      placeholder="Écran (ex: Liste projets vide)"
                      className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-semibold"
                    />
                    <button
                      onClick={() => remove(e.id)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    value={e.copy}
                    onChange={(ev) => update(e.id, { copy: ev.target.value })}
                    placeholder="Copy (chaleureux, pas sec)"
                    rows={2}
                    className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card"
                  />
                  <input
                    type="text"
                    value={e.cta}
                    onChange={(ev) => update(e.id, { cta: ev.target.value })}
                    placeholder="CTA (ex: + Nouveau projet)"
                    className="w-full h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Exemples cliquables :</div>
            <div className="flex flex-wrap gap-1">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => addEmpty(ex)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition text-left"
                >
                  + {ex.screen}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => addEmpty()}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Empty state personnalisé
          </button>
        </>
      )}
    </div>
  );
}
