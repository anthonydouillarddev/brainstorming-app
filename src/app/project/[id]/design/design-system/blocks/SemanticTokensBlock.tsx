"use client";

import { useState } from "react";
import type { DesignSystemState, SemanticToken } from "../state";
import { SEMANTIC_PRESETS, makeId } from "../state";
import { validateSemanticTokens } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function SemanticTokensBlock({
  state,
  onChange,
}: {
  state: DesignSystemState;
  onChange: (patch: Partial<DesignSystemState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.semanticTokens.length > 0);
  const issues = validateSemanticTokens(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.semanticTokens.length >= 5 && !hasError;

  function loadAllPresets() {
    const next = SEMANTIC_PRESETS.map((p) => ({ ...p, id: makeId("tok") }));
    onChange({ semanticTokens: next });
  }

  function addPreset(preset: (typeof SEMANTIC_PRESETS)[number]) {
    const next: SemanticToken = { ...preset, id: makeId("tok") };
    onChange({ semanticTokens: [...state.semanticTokens, next] });
  }

  function addEmpty() {
    const next: SemanticToken = {
      id: makeId("tok"),
      name: "",
      primitiveHex: "#000000",
      description: "",
    };
    onChange({ semanticTokens: [...state.semanticTokens, next] });
  }

  function update(id: string, patch: Partial<SemanticToken>) {
    onChange({
      semanticTokens: state.semanticTokens.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }

  function remove(id: string) {
    onChange({ semanticTokens: state.semanticTokens.filter((t) => t.id !== id) });
  }

  const existingNames = new Set(state.semanticTokens.map((t) => t.name.toLowerCase()));
  const availablePresets = SEMANTIC_PRESETS.filter(
    (p) => !existingNames.has(p.name.toLowerCase())
  );

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎯 Semantic tokens
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.semanticTokens.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Nathan Curtis.</strong> <em>Primitives = options</em>,{" "}
            <em>Semantic = choix</em>. Au lieu de coder <code>#7C6A4F</code> partout, utilise{" "}
            <code>bg.primary</code> — tu peux changer la couleur primaire sans toucher à 50
            fichiers.
          </div>

          {state.semanticTokens.length === 0 && (
            <button
              onClick={loadAllPresets}
              className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
            >
              📦 Charger les {SEMANTIC_PRESETS.length} tokens semantic par défaut
            </button>
          )}

          {state.semanticTokens.length > 0 && (
            <div className="space-y-1">
              {state.semanticTokens.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-[auto_1fr_auto_1fr_auto] gap-2 items-center p-2 rounded border border-border bg-card"
                >
                  <input
                    type="color"
                    value={t.primitiveHex}
                    onChange={(e) => update(t.id, { primitiveHex: e.target.value })}
                    className="w-8 h-8 rounded border border-border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={t.name}
                    onChange={(e) => update(t.id, { name: e.target.value })}
                    placeholder="bg.primary"
                    className="h-8 px-2 text-xs rounded border border-border bg-card font-mono"
                  />
                  <input
                    type="text"
                    value={t.primitiveHex}
                    onChange={(e) => update(t.id, { primitiveHex: e.target.value })}
                    className="w-24 h-8 px-2 text-xs rounded border border-border bg-card font-mono text-center"
                  />
                  <input
                    type="text"
                    value={t.description}
                    onChange={(e) => update(t.id, { description: e.target.value })}
                    placeholder="Description"
                    className="h-8 px-2 text-xs rounded border border-border bg-card text-muted"
                  />
                  <button
                    onClick={() => remove(t.id)}
                    className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {availablePresets.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Ajouter depuis les presets :</div>
              <div className="flex flex-wrap gap-1">
                {availablePresets.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => addPreset(p)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition font-mono"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addEmpty}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Token personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
