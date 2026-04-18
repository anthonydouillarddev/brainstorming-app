"use client";

import { useState } from "react";
import type { EmptyKind, EmptyStateEntry, StatesState } from "../state";
import { EMPTY_KIND_META, makeId } from "../state";
import { EMPTY_PRESETS } from "../states-library";
import { validateEmpty } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function EmptyStatesBlock({
  state,
  onChange,
}: {
  state: StatesState;
  onChange: (patch: Partial<StatesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.emptyStates.length > 0);
  const issues = validateEmpty(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.emptyStates.length >= 2 && !hasError;

  function addPreset(preset: (typeof EMPTY_PRESETS)[number]) {
    const next: EmptyStateEntry = {
      id: makeId("emp"),
      ...preset,
      notes: "",
    };
    onChange({ emptyStates: [...state.emptyStates, next] });
  }

  function addCustom() {
    const next: EmptyStateEntry = {
      id: makeId("emp"),
      kind: "first-use",
      context: "",
      headline: "",
      body: "",
      primaryCta: "",
      secondaryCta: "",
      illustration: "",
      notes: "",
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
          🌱 Empty states
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.emptyStates.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Shopify Polaris.</strong> Un empty state = titre +
            corps + CTA. Le first-use éduque, le no-results aide à rebondir, le cleared célèbre.
          </div>

          {state.emptyStates.length > 0 && (
            <div className="space-y-2">
              {state.emptyStates.map((e) => {
                const meta = EMPTY_KIND_META[e.kind];
                return (
                  <div
                    key={e.id}
                    className="p-3 rounded-lg border border-border bg-card space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <select
                        value={e.kind}
                        onChange={(ev) => update(e.id, { kind: ev.target.value as EmptyKind })}
                        className="h-8 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(EMPTY_KIND_META) as EmptyKind[]).map((k) => (
                          <option key={k} value={k}>
                            {EMPTY_KIND_META[k].emoji} {EMPTY_KIND_META[k].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={e.context}
                        onChange={(ev) => update(e.id, { context: ev.target.value })}
                        placeholder="Contexte (ex: Liste projets vide)"
                        className="flex-1 h-8 px-2 text-sm rounded border border-border bg-card"
                      />
                      <button
                        onClick={() => remove(e.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[10px] text-muted italic">{meta.purpose}</div>
                    <input
                      type="text"
                      value={e.headline}
                      onChange={(ev) => update(e.id, { headline: ev.target.value })}
                      placeholder="Titre (ex: Crée ton premier projet)"
                      className="w-full h-8 px-2 text-sm rounded border border-border bg-card font-medium"
                    />
                    <textarea
                      value={e.body}
                      onChange={(ev) => update(e.id, { body: ev.target.value })}
                      placeholder="Corps du message (1-2 phrases)"
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-card resize-y"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={e.primaryCta}
                        onChange={(ev) => update(e.id, { primaryCta: ev.target.value })}
                        placeholder="CTA principal"
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                      <input
                        type="text"
                        value={e.secondaryCta}
                        onChange={(ev) => update(e.id, { secondaryCta: ev.target.value })}
                        placeholder="CTA secondaire (optionnel)"
                        className="h-7 px-2 text-xs rounded border border-border bg-card"
                      />
                    </div>
                    <input
                      type="text"
                      value={e.illustration}
                      onChange={(ev) => update(e.id, { illustration: ev.target.value })}
                      placeholder="Illustration (ex: 🌱 plante, icône SVG, emoji)"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card"
                    />
                    {(e.headline || e.body || e.primaryCta) && (
                      <div className="bg-card/60 border border-dashed border-border rounded-lg p-4 text-center space-y-2">
                        {e.illustration && <div className="text-3xl">{e.illustration.split(" ")[0]}</div>}
                        {e.headline && <div className="font-semibold text-sm">{e.headline}</div>}
                        {e.body && <div className="text-xs text-muted">{e.body}</div>}
                        {(e.primaryCta || e.secondaryCta) && (
                          <div className="flex items-center justify-center gap-2 pt-1">
                            {e.primaryCta && (
                              <span className="text-[11px] px-3 py-1 rounded bg-accent text-white">
                                {e.primaryCta}
                              </span>
                            )}
                            {e.secondaryCta && (
                              <span className="text-[11px] px-3 py-1 rounded border border-border">
                                {e.secondaryCta}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Presets :</div>
            <div className="flex flex-wrap gap-1">
              {EMPTY_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {EMPTY_KIND_META[p.kind].emoji} {p.context}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Empty state personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
