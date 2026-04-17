"use client";

import { useState } from "react";
import type { InfoNavState, TreeTestTask } from "../state";
import { makeTreeTaskId } from "../state";
import BlockStatus from "../components/BlockStatus";

export default function TreeTestBlock({
  state,
  onChange,
}: {
  state: InfoNavState;
  onChange: (patch: Partial<InfoNavState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.treeTests.length > 0);
  const ok = state.treeTests.length >= 3;
  const successCount = state.treeTests.filter((t) => t.success === true).length;
  const totalAnswered = state.treeTests.filter((t) => t.success !== undefined).length;
  const successRate = totalAnswered > 0 ? Math.round((successCount / totalAnswered) * 100) : null;

  function addTask() {
    const next: TreeTestTask = {
      id: makeTreeTaskId(),
      task: "",
      expectedScreenId: null,
    };
    onChange({ treeTests: [...state.treeTests, next] });
  }

  function updateTask(id: string, patch: Partial<TreeTestTask>) {
    onChange({
      treeTests: state.treeTests.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  }

  function removeTask(id: string) {
    onChange({ treeTests: state.treeTests.filter((t) => t.id !== id) });
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
          🧪 Tree test
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            NICE
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.treeTests.length} {successRate !== null && `· ${successRate}%`})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={false} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Tree test light.</strong> Écris 3-5 tâches
            utilisateur concrètes et indique où tu attends qu&apos;ils aillent. Présente le
            sitemap à 3-5 personnes et marque ✓/✗. <strong>Cible NN/g : ≥ 80%</strong> de
            réussite directe.
          </div>

          {successRate !== null && (
            <div
              className={`bg-card/60 border rounded-lg p-3 text-sm ${
                successRate >= 80
                  ? "border-green-500/40 text-green-600 dark:text-green-400"
                  : successRate >= 60
                  ? "border-amber-500/40 text-amber-600 dark:text-amber-400"
                  : "border-red-500/40 text-red-500"
              }`}
            >
              <strong>Taux de réussite : {successRate}%</strong>{" "}
              <span className="text-muted">
                ({successCount}/{totalAnswered} tâches validées)
              </span>
              {successRate < 80 && (
                <div className="text-xs mt-1">
                  En dessous de 80%, ton IA a des faiblesses. Vérifie les labels, réduis la
                  profondeur, ou renomme les écrans qui posent problème.
                </div>
              )}
            </div>
          )}

          {state.treeTests.length > 0 && (
            <div className="space-y-2">
              {state.treeTests.map((task, i) => {
                const expected = task.expectedScreenId
                  ? state.screens.find((s) => s.id === task.expectedScreenId)
                  : null;
                return (
                  <div
                    key={task.id}
                    className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs text-muted mt-1">#{i + 1}</span>
                      <input
                        type="text"
                        value={task.task}
                        onChange={(e) => updateTask(task.id, { task: e.target.value })}
                        placeholder="Tâche (ex: Trouve la page pour créer un projet)"
                        className="h-8 px-2 text-sm rounded border border-border bg-card flex-1"
                      />
                      <button
                        onClick={() => removeTask(task.id)}
                        className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                        aria-label="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <select
                        value={task.expectedScreenId ?? ""}
                        onChange={(e) =>
                          updateTask(task.id, { expectedScreenId: e.target.value || null })
                        }
                        className="h-8 px-2 text-xs rounded border border-border bg-card flex-1 min-w-[200px]"
                      >
                        <option value="">Écran attendu…</option>
                        {state.screens.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.emoji ?? "📄"} {s.title}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateTask(task.id, { success: true })}
                          className={`text-xs px-2 py-1 rounded border transition ${
                            task.success === true
                              ? "bg-green-500/20 border-green-500 text-green-600 dark:text-green-400"
                              : "border-border hover:bg-accent/10"
                          }`}
                        >
                          ✓ OK
                        </button>
                        <button
                          onClick={() => updateTask(task.id, { success: false })}
                          className={`text-xs px-2 py-1 rounded border transition ${
                            task.success === false
                              ? "bg-red-500/20 border-red-500 text-red-500"
                              : "border-border hover:bg-accent/10"
                          }`}
                        >
                          ✗ Raté
                        </button>
                      </div>
                    </div>
                    {expected && (
                      <div className="text-[10px] text-muted">
                        Chemin attendu : {expected.emoji ?? "📄"} {expected.title}
                      </div>
                    )}
                    <input
                      type="text"
                      value={task.note ?? ""}
                      onChange={(e) => updateTask(task.id, { note: e.target.value })}
                      placeholder="Note (optionnel) — ce que les users ont tenté"
                      className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={addTask}
            disabled={state.screens.length === 0}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 disabled:opacity-50 transition"
          >
            + Ajouter une tâche de test
          </button>
        </>
      )}
    </div>
  );
}
