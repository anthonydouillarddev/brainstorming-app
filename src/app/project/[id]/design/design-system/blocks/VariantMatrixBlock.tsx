"use client";

import { useState } from "react";
import type { ComponentVariant, DesignSystemState } from "../state";
import { makeId } from "../state";
import { COMPONENTS_CATALOG } from "../components-catalog";
import { validateVariants } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

const COMMON_VARIANTS = ["primary", "secondary", "ghost", "danger", "outline", "link"];
const COMMON_SIZES = ["xs", "sm", "md", "lg", "xl"];
const COMMON_STATES = ["default", "hover", "active", "focus", "disabled", "loading"];

export default function VariantMatrixBlock({
  state,
  onChange,
}: {
  state: DesignSystemState;
  onChange: (patch: Partial<DesignSystemState>) => void;
}) {
  const [expanded, setExpanded] = useState(state.variants.length > 0);
  const issues = validateVariants(state);
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.variants.length > 0 && !hasWarn;

  const availableComponents = state.components.filter(
    (c) => !state.variants.some((v) => v.componentSlug === c.slug)
  );

  function addVariant(componentSlug: string) {
    const next: ComponentVariant = {
      id: makeId("var"),
      componentSlug,
      variants: ["primary"],
      sizes: ["md"],
      states: ["default", "hover", "disabled"],
    };
    onChange({ variants: [...state.variants, next] });
  }

  function update(id: string, patch: Partial<ComponentVariant>) {
    onChange({
      variants: state.variants.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    });
  }

  function remove(id: string) {
    onChange({ variants: state.variants.filter((v) => v.id !== id) });
  }

  function toggleInList(id: string, field: "variants" | "sizes" | "states", value: string) {
    const variant = state.variants.find((v) => v.id === id);
    if (!variant) return;
    const current = variant[field];
    const next = current.includes(value)
      ? current.filter((x) => x !== value)
      : [...current, value];
    update(id, { [field]: next } as Partial<ComponentVariant>);
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
          🎭 Variants matrix
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">({state.variants.length})</span>
        </button>
        <BlockStatus ok={ok} hasError={false} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Nathan Curtis — variant explosion.</strong>{" "}
            Grille `variants × sizes × states`. Au-delà de 6 variants ou 60 combinaisons, le
            composant fait trop de choses — découpe-le.
          </div>

          {state.variants.map((v) => {
            const comp = COMPONENTS_CATALOG.find((c) => c.slug === v.componentSlug);
            const combinations = v.variants.length * v.sizes.length * v.states.length;
            return (
              <div
                key={v.id}
                className="bg-card/60 border border-border rounded-xl p-3 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{comp?.emoji}</span>
                    <span className="font-semibold text-sm">{comp?.name}</span>
                    <span className="text-[10px] text-muted">
                      {v.variants.length} × {v.sizes.length} × {v.states.length} ={" "}
                      <strong>{combinations} combinaisons</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => remove(v.id)}
                    className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
                    aria-label="Supprimer"
                  >
                    ×
                  </button>
                </div>
                {(
                  [
                    ["variants", "Variants", COMMON_VARIANTS],
                    ["sizes", "Sizes", COMMON_SIZES],
                    ["states", "States", COMMON_STATES],
                  ] as const
                ).map(([field, label, options]) => (
                  <div key={field} className="space-y-1">
                    <div className="text-[10px] font-semibold text-muted uppercase">{label}</div>
                    <div className="flex flex-wrap gap-1">
                      {options.map((opt) => {
                        const checked = v[field].includes(opt);
                        return (
                          <button
                            key={opt}
                            onClick={() => toggleInList(v.id, field, opt)}
                            className={`text-[11px] px-2 py-1 rounded border transition ${
                              checked
                                ? "bg-accent text-white border-accent"
                                : "border-border text-muted hover:bg-accent/10"
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}

          {availableComponents.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted">Ajouter une matrix pour :</div>
              <div className="flex flex-wrap gap-1">
                {availableComponents.slice(0, 8).map((c) => {
                  const def = COMPONENTS_CATALOG.find((d) => d.slug === c.slug);
                  return (
                    <button
                      key={c.slug}
                      onClick={() => addVariant(c.slug)}
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
