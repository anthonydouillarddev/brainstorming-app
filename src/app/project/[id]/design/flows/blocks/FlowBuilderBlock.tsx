"use client";

import { useState } from "react";
import type { FlowBranch, FlowsState } from "../state";
import { makeBranchId } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function FlowBuilderBlock({
  state,
  onChange,
}: {
  state: FlowsState;
  onChange: (patch: Partial<FlowsState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.branches.length > 0);
  const ok = state.branches.length > 0;

  function addBranch() {
    if (state.steps.length < 2) return;
    const next: FlowBranch = {
      id: makeBranchId(),
      fromStepId: state.steps[0].id,
      condition: "",
      toStepId: state.steps[1].id,
    };
    onChange({ branches: [...state.branches, next] });
  }

  function updateBranch(id: string, patch: Partial<FlowBranch>) {
    onChange({
      branches: state.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });
  }

  function removeBranch(id: string) {
    onChange({ branches: state.branches.filter((b) => b.id !== id) });
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
          🔀 Branches &amp; edge cases
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.branches.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Edge cases &gt; happy path.</strong> Les users
            rencontrent des embranchements : email déjà pris, connexion perdue, paiement refusé.
            Mappe-les ici pour prévoir les recovery flows.
          </div>

          {state.steps.length < 2 ? (
            <div className="text-xs text-muted italic text-center py-4">
              Ajoute au moins 2 étapes dans le bloc précédent pour créer des branches.
            </div>
          ) : (
            <div className="space-y-2">
              {state.branches.map((b) => (
                <div
                  key={b.id}
                  className="grid grid-cols-[1fr_1.2fr_1fr_auto] gap-2 items-center p-2 rounded border border-border bg-card"
                >
                  <select
                    value={b.fromStepId}
                    onChange={(e) => updateBranch(b.id, { fromStepId: e.target.value })}
                    className="h-8 px-2 text-xs rounded border border-border bg-card"
                  >
                    {state.steps.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label || "(sans nom)"}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={b.condition}
                    onChange={(e) => updateBranch(b.id, { condition: e.target.value })}
                    placeholder="si... (ex : email déjà pris)"
                    className="h-8 px-2 text-xs rounded border border-border bg-card"
                  />
                  <select
                    value={b.toStepId ?? ""}
                    onChange={(e) =>
                      updateBranch(b.id, { toStepId: e.target.value || null })
                    }
                    className="h-8 px-2 text-xs rounded border border-border bg-card"
                  >
                    <option value="">→ Fin / recovery</option>
                    {state.steps.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label || "(sans nom)"}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeBranch(b.id)}
                    className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={addBranch}
                className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
              >
                + Ajouter une branche
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
