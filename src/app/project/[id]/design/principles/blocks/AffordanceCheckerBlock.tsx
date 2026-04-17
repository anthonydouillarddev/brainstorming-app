"use client";

import { useState } from "react";
import type { AffordanceCheck, PrinciplesState } from "../state";
import { makeId } from "../state";
import { validateAffordances } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const COMPONENT_SUGGESTIONS = [
  "Bouton primary",
  "Bouton secondary",
  "Lien texte",
  "Input text",
  "Checkbox",
  "Toggle switch",
  "Card cliquable",
  "Icon button",
];

export default function AffordanceCheckerBlock({
  state,
  onChange,
}: {
  state: PrinciplesState;
  onChange: (patch: Partial<PrinciplesState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.affordances.length > 0);
  const issues = validateAffordances(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.affordances.length >= 3 && !hasWarn;

  function addCheck(component?: string) {
    const next: AffordanceCheck = {
      id: makeId("aff"),
      component: component ?? "",
      hover: false,
      focus: false,
      pressed: false,
      disabled: false,
      accessibleLabel: false,
    };
    onChange({ affordances: [...state.affordances, next] });
  }

  function update(id: string, patch: Partial<AffordanceCheck>) {
    onChange({
      affordances: state.affordances.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    });
  }

  function remove(id: string) {
    onChange({ affordances: state.affordances.filter((a) => a.id !== id) });
  }

  const existingComponents = new Set(
    state.affordances.map((a) => a.component.toLowerCase().trim())
  );
  const availableSuggestions = COMPONENT_SUGGESTIONS.filter(
    (c) => !existingComponents.has(c.toLowerCase().trim())
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
          👆 Affordances &amp; signifiers
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">({state.affordances.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Don Norman.</strong> Chaque composant interactif
            doit exposer : hover (la souris survole), focus (clavier/tab), pressed (click visuel),
            disabled (état désactivé), accessible label (lecteurs d&apos;écran). Sans ça, l&apos;user
            devine.
          </div>

          {state.affordances.length > 0 && (
            <div className="space-y-2">
              {state.affordances.map((a) => (
                <div
                  key={a.id}
                  className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={a.component}
                      onChange={(e) => update(a.id, { component: e.target.value })}
                      placeholder="Composant (ex: Bouton primary)"
                      className="h-8 px-2 text-sm rounded border border-border bg-card flex-1 font-medium"
                    />
                    <button
                      onClick={() => remove(a.id)}
                      className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    {(
                      [
                        ["hover", "Hover"],
                        ["focus", "Focus"],
                        ["pressed", "Pressed"],
                        ["disabled", "Disabled"],
                        ["accessibleLabel", "aria-label"],
                      ] as const
                    ).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={a[key]}
                          onChange={(e) => update(a.id, { [key]: e.target.checked })}
                        />
                        <span className={a[key] ? "text-green-600" : "text-muted"}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {availableSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Ajouts rapides :</div>
              <div className="flex flex-wrap gap-1">
                {availableSuggestions.map((c) => (
                  <button
                    key={c}
                    onClick={() => addCheck(c)}
                    className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                  >
                    + {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => addCheck()}
            className="w-full text-sm font-medium px-4 py-2 rounded-lg bg-card border border-dashed border-accent/50 hover:border-accent hover:bg-accent/5 transition"
          >
            + Composant personnalisé
          </button>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
