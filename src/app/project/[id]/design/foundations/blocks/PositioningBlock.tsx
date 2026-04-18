"use client";

import { useEffect, useState } from "react";
import { validatePositioning } from "../validators";
import type { FoundationsState } from "../state";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

interface DunfordStep {
  id: number;
  key: keyof FoundationsState;
  emoji: string;
  title: string;
  description: string;
  placeholder: string;
  isList: boolean;
}

const STEPS: DunfordStep[] = [
  {
    id: 1,
    key: "positioningAlternatives",
    emoji: "1️⃣",
    title: "Alternatives concurrentielles",
    description:
      "Que ferait ton user sans toi ? Inclure les non-solutions (Excel, rien, carnet papier).",
    placeholder: "Ex : Excel, Notion, un carnet, rien du tout",
    isList: true,
  },
  {
    id: 2,
    key: "positioningUniqueAttributes",
    emoji: "2️⃣",
    title: "Attributs uniques",
    description: "Qu'est-ce que tu fais mieux que ces alternatives ? Factuel, pas marketing.",
    placeholder: "Ex : génération OKLCH perceptuelle, live preview avec tokens projet",
    isList: true,
  },
  {
    id: 3,
    key: "positioningValue",
    emoji: "3️⃣",
    title: "Value themes",
    description:
      "Traduire les attributs en ce qui compte pour ta cible. Pas la feature, le bénéfice.",
    placeholder: "Ex : design system cohérent en 30 min, sans lib lourde, exportable partout",
    isList: true,
  },
  {
    id: 4,
    key: "positioningSegment",
    emoji: "4️⃣",
    title: "Best-fit customer",
    description:
      "Qui se soucie le plus de ces valeurs ? Pas &laquo; tout le monde &raquo; — le segment le plus sensible.",
    placeholder: "Ex : solo founders indie qui lancent leur SaaS Next.js",
    isList: false,
  },
  {
    id: 5,
    key: "positioningCategory",
    emoji: "5️⃣",
    title: "Market category",
    description: "Dans quelle case ranger ton produit pour cadrer l'attente utilisateur ?",
    placeholder: "Ex : Design system builder for indie SaaS founders",
    isList: false,
  },
];

function isStepFilled(state: FoundationsState, step: DunfordStep): boolean {
  const value = state[step.key];
  if (step.isList) return Array.isArray(value) && value.length > 0;
  return typeof value === "string" && value.trim().length > 0;
}

function generatePositioningStatement(state: FoundationsState): string {
  if (
    state.positioningCategory.trim() &&
    state.positioningSegment.trim() &&
    state.positioningValue.length > 0
  ) {
    return `Pour ${state.positioningSegment.trim()}, ${state.positioningCategory.trim()} qui apporte ${state.positioningValue
      .slice(0, 2)
      .join(" et ")}.`;
  }
  return "";
}

export default function PositioningBlock({
  state,
  onChange,
}: {
  state: FoundationsState;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [expanded, setExpanded] = useState(
    state.positioningAlternatives.length > 0 || !!state.positioningStatement
  );
  const issues = validatePositioning(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");

  const filledSteps = STEPS.filter((s) => isStepFilled(state, s)).length;
  const ok = filledSteps === 5 && !hasError;

  // Auto-génération du statement quand les étapes clés sont remplies
  const valueKey = state.positioningValue.join("|");
  useEffect(() => {
    const generated = generatePositioningStatement(state);
    if (generated && generated !== state.positioningStatement) {
      onChange({ positioningStatement: generated });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.positioningCategory, state.positioningSegment, valueKey]);

  function updateList(key: keyof FoundationsState, list: string[]) {
    onChange({ [key]: list } as Partial<FoundationsState>);
  }

  function updateString(key: keyof FoundationsState, value: string) {
    onChange({ [key]: value } as Partial<FoundationsState>);
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
          🎯 Positionnement Dunford
          <span className="text-[11px] px-2 py-0.5 bg-muted/20 text-muted rounded font-normal">
            SHOULD
          </span>
          <span className="text-muted text-sm font-normal">
            ({filledSteps}/5 étapes)
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">April Dunford</strong> : tu ne positionnes pas
            dans le vide. Tu positionnes <em>contre</em> quelque chose. Commence par lister ce que
            l&apos;user ferait sans toi, puis remonte vers la catégorie. Ordre imposé — chaque
            étape débloque la suivante.
          </div>

          <div className="space-y-2">
            {STEPS.map((step, index) => {
              const prevFilled = index === 0 || isStepFilled(state, STEPS[index - 1]);
              const filled = isStepFilled(state, step);
              const disabled = !prevFilled;
              return (
                <div
                  key={step.id}
                  className={`border rounded-xl p-4 space-y-2 transition ${
                    filled
                      ? "border-accent/50 bg-accent/5"
                      : disabled
                      ? "border-border bg-card/30 opacity-60"
                      : "border-border bg-card/60"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-xl" aria-hidden>
                      {step.emoji}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{step.title}</h3>
                        {filled && (
                          <span className="text-[10px] text-green-600 dark:text-green-400">
                            ✓ Complété
                          </span>
                        )}
                        {disabled && (
                          <span className="text-[10px] text-muted">
                            🔒 Remplis l&apos;étape {index}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted mt-0.5" dangerouslySetInnerHTML={{ __html: step.description }} />
                    </div>
                  </div>

                  {!disabled && (
                    <>
                      {step.isList ? (
                        <DunfordList
                          items={(state[step.key] as string[]) ?? []}
                          placeholder={step.placeholder}
                          onChange={(list) => updateList(step.key, list)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={(state[step.key] as string) ?? ""}
                          onChange={(e) => updateString(step.key, e.target.value)}
                          placeholder={step.placeholder}
                          className="w-full h-9 px-3 text-sm rounded border border-border bg-card"
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {state.positioningStatement.trim() && (
            <div className="bg-accent/10 border border-accent rounded-xl p-4 space-y-1">
              <div className="text-[10px] text-accent uppercase tracking-wider font-semibold">
                Positioning statement généré
              </div>
              <div className="text-sm font-medium">{state.positioningStatement}</div>
              <div className="text-[10px] text-muted">
                Tu peux éditer ce statement manuellement ci-dessous si besoin.
              </div>
              <textarea
                value={state.positioningStatement}
                onChange={(e) => onChange({ positioningStatement: e.target.value })}
                rows={2}
                className="w-full mt-2 px-3 py-2 text-sm rounded border border-border bg-card"
              />
            </div>
          )}

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}

function DunfordList({
  items,
  placeholder,
  onChange,
}: {
  items: string[];
  placeholder: string;
  onChange: (list: string[]) => void;
}) {
  function add(text: string) {
    const trimmed = text.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  function update(i: number, value: string) {
    onChange(items.map((item, idx) => (idx === i ? value : item)));
  }
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1">
          <input
            type="text"
            value={item}
            onChange={(e) => update(i, e.target.value)}
            className="h-8 px-2 text-sm rounded border border-border bg-card flex-1"
          />
          <button
            onClick={() => remove(i)}
            className="w-8 h-8 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
            aria-label="Retirer"
          >
            ×
          </button>
        </div>
      ))}
      <input
        type="text"
        placeholder={placeholder}
        className="h-8 px-2 text-sm rounded border border-dashed border-border bg-card w-full"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const input = e.target as HTMLInputElement;
            add(input.value);
            input.value = "";
          }
        }}
      />
    </div>
  );
}
