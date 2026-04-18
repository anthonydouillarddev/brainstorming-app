"use client";

import { useState } from "react";
import type { A11yCheck, DesignSystemState } from "../state";
import { COMPONENTS_CATALOG } from "../components-catalog";
import { validateA11y } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function A11yCheckBlock({
  state,
  onChange,
}: {
  state: DesignSystemState;
  onChange: (patch: Partial<DesignSystemState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.a11yChecks.length > 0);
  const issues = validateA11y(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.a11yChecks.length > 0 && !hasError && !hasWarn;

  const availableComponents = state.components.filter(
    (c) => !state.a11yChecks.some((a) => a.componentSlug === c.slug)
  );

  function addCheck(componentSlug: string) {
    const next: A11yCheck = {
      componentSlug,
      focusVisible: false,
      keyboardNav: false,
      ariaLabel: false,
      contrastAA: false,
      notes: "",
    };
    onChange({ a11yChecks: [...state.a11yChecks, next] });
  }

  function update(componentSlug: string, patch: Partial<A11yCheck>) {
    onChange({
      a11yChecks: state.a11yChecks.map((a) =>
        a.componentSlug === componentSlug ? { ...a, ...patch } : a
      ),
    });
  }

  function remove(componentSlug: string) {
    onChange({
      a11yChecks: state.a11yChecks.filter((a) => a.componentSlug !== componentSlug),
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
          ♿ A11y checklist WCAG 2.2
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.a11yChecks.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">WCAG 2.2 AA</strong> — focus visible (2.4.7),
            navigation clavier (2.1.1), aria-label (4.1.2), contraste AA (1.4.3). Check chaque
            composant critique.
          </div>

          <div className="space-y-2">
            {state.a11yChecks.map((a) => {
              const def = COMPONENTS_CATALOG.find((c) => c.slug === a.componentSlug);
              return (
                <div
                  key={a.componentSlug}
                  className="bg-card/60 border border-border rounded-xl p-3 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{def?.emoji}</span>
                    <span className="font-semibold text-sm flex-1">{def?.name}</span>
                    <button
                      onClick={() => remove(a.componentSlug)}
                      className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                      aria-label="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs">
                    {(
                      [
                        ["focusVisible", "Focus visible", "WCAG 2.4.7"],
                        ["keyboardNav", "Keyboard nav", "WCAG 2.1.1"],
                        ["ariaLabel", "aria-label", "WCAG 4.1.2"],
                        ["contrastAA", "Contraste AA", "WCAG 1.4.3"],
                      ] as const
                    ).map(([key, label, wcag]) => (
                      <label
                        key={key}
                        className="flex items-center gap-1 cursor-pointer"
                        title={wcag}
                      >
                        <input
                          type="checkbox"
                          checked={a[key]}
                          onChange={(e) => update(a.componentSlug, { [key]: e.target.checked })}
                        />
                        <span className={a[key] ? "text-green-600" : "text-muted"}>
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={a.notes}
                    onChange={(e) => update(a.componentSlug, { notes: e.target.value })}
                    placeholder="Notes (ex: rôle ARIA = button, tab order...)"
                    className="w-full h-7 px-2 text-xs rounded border border-border bg-card text-muted"
                  />
                </div>
              );
            })}
          </div>

          {availableComponents.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Auditer un composant :</div>
              <div className="flex flex-wrap gap-1">
                {availableComponents.slice(0, 10).map((c) => {
                  const def = COMPONENTS_CATALOG.find((d) => d.slug === c.slug);
                  return (
                    <button
                      key={c.slug}
                      onClick={() => addCheck(c.slug)}
                      className="text-[11px] px-2 py-1 rounded border border-border hover:bg-accent/10 transition"
                    >
                      + {def?.emoji} {def?.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}
