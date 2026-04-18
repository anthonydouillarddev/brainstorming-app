"use client";

import { useState } from "react";
import type { GlossaryEntry, GlossaryStatus, MicrocopyState } from "../state";
import { GLOSSARY_STATUS_META, makeId } from "../state";
import { GLOSSARY_PRESETS } from "../microcopy-library";
import { validateGlossary } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function GlossaryBlock({
  state,
  onChange,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.glossary.length > 0);
  const issues = validateGlossary(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.glossary.length >= 4 && !hasError;

  function addPreset(preset: (typeof GLOSSARY_PRESETS)[number]) {
    const next: GlossaryEntry = { id: makeId("glo"), ...preset };
    onChange({ glossary: [...state.glossary, next] });
  }

  function addCustom() {
    const next: GlossaryEntry = {
      id: makeId("glo"),
      term: "",
      userFacingFr: "",
      status: "do",
      alternative: "",
      context: "",
    };
    onChange({ glossary: [...state.glossary, next] });
  }

  function update(id: string, patch: Partial<GlossaryEntry>) {
    onChange({
      glossary: state.glossary.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    });
  }

  function remove(id: string) {
    onChange({ glossary: state.glossary.filter((g) => g.id !== id) });
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
          📚 Glossaire FR
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.glossary.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Cohérence &gt; originalité.</strong> Même action →
            même mot partout. Onboarde un collab (ou un LLM) avec ce glossaire. Marque « éviter »
            les anglicismes et faux-amis, propose toujours une alternative.
          </div>

          {state.glossary.length > 0 && (
            <div className="space-y-1.5">
              {state.glossary.map((g) => {
                const meta = GLOSSARY_STATUS_META[g.status];
                return (
                  <div
                    key={g.id}
                    className={`p-2.5 rounded-lg border ${meta.color} space-y-1.5`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={g.status}
                        onChange={(e) =>
                          update(g.id, { status: e.target.value as GlossaryStatus })
                        }
                        className="h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      >
                        {(Object.keys(GLOSSARY_STATUS_META) as GlossaryStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {GLOSSARY_STATUS_META[s].emoji} {GLOSSARY_STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={g.term}
                        onChange={(e) => update(g.id, { term: e.target.value })}
                        placeholder="Terme (ex: Sign in)"
                        className="w-32 h-7 px-2 text-xs rounded border border-border bg-card font-mono"
                      />
                      <span className="text-muted">→</span>
                      <input
                        type="text"
                        value={g.userFacingFr}
                        onChange={(e) => update(g.id, { userFacingFr: e.target.value })}
                        placeholder="Version FR UI (ex: Se connecter)"
                        className="flex-1 min-w-[160px] h-7 px-2 text-xs rounded border border-border bg-card font-medium"
                      />
                      <button
                        onClick={() => remove(g.id)}
                        className="w-6 h-6 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    {g.status === "dont" && (
                      <input
                        type="text"
                        value={g.alternative}
                        onChange={(e) => update(g.id, { alternative: e.target.value })}
                        placeholder="Alternative recommandée"
                        className="w-full h-7 px-2 text-xs rounded border border-green-500/30 bg-green-500/5"
                      />
                    )}
                    <input
                      type="text"
                      value={g.context}
                      onChange={(e) => update(g.id, { context: e.target.value })}
                      placeholder="Contexte (ex: Header, page login)"
                      className="w-full h-6 px-2 text-[11px] rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <div className="text-xs text-muted">Presets :</div>
            <div className="flex flex-wrap gap-1">
              {GLOSSARY_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => addPreset(p)}
                  className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                >
                  + {GLOSSARY_STATUS_META[p.status].emoji} {p.term}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={addCustom}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Entrée personnalisée
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
