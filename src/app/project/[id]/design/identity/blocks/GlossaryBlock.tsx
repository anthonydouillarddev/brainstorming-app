"use client";

import { useState } from "react";
import type { IdentityState } from "../state";
import { validateGlossary } from "../validators";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function GlossaryBlock({
  state,
  onChange,
}: {
  state: IdentityState;
  onChange: (patch: Partial<IdentityState>) => void;
}) {
  const hasActivity = state.doWords.length > 0 || state.dontWords.length > 0;
  const [expanded, setExpanded] = useState(hasActivity);
  const issues = validateGlossary(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = state.doWords.length >= 3 && state.dontWords.length >= 3 && !hasError;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          📝 Glossaire DO / DON&apos;T
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
          <span className="text-muted text-sm font-normal">
            ({state.doWords.length} / {state.dontWords.length})
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && hasActivity && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          {state.doWords.slice(0, 4).join(", ")}
          {state.doWords.length > 4 ? "…" : ""}
          {state.dontWords.length > 0 && (
            <>
              {" "}
              · jamais : {state.dontWords.slice(0, 3).join(", ")}
              {state.dontWords.length > 3 ? "…" : ""}
            </>
          )}
        </div>
      )}

      {expanded && (
        <>
          <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
            <strong className="text-foreground">Règle d&apos;or Polaris</strong> : lis ta phrase à
            voix haute. Si tu ne la dirais pas à un humain, ça va dans le DON&apos;T. Notion se
            définit autant par ce qu&apos;il n&apos;est PAS (« pas Microsoft Office ») que par ce
            qu&apos;il est.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WordList
              title="✓ On dit"
              placeholder="Ajouter un mot (Enter)"
              titleColor="text-green-600 dark:text-green-400"
              borderColor="border-green-500/30"
              bgColor="bg-green-500/5"
              items={state.doWords}
              onChange={(doWords) => onChange({ doWords })}
            />
            <WordList
              title="✗ On ne dit jamais"
              placeholder="Ajouter un mot interdit (Enter)"
              titleColor="text-red-600 dark:text-red-400"
              borderColor="border-red-500/30"
              bgColor="bg-red-500/5"
              items={state.dontWords}
              onChange={(dontWords) => onChange({ dontWords })}
            />
          </div>

          <IssueList issues={issues} />
        </>
      )}
    </div>
  );
}

function WordList({
  title,
  placeholder,
  titleColor,
  borderColor,
  bgColor,
  items,
  onChange,
}: {
  title: string;
  placeholder: string;
  titleColor: string;
  borderColor: string;
  bgColor: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  function add(text: string) {
    const trimmed = text.trim();
    if (!trimmed || items.includes(trimmed)) return;
    onChange([...items, trimmed]);
  }
  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i));
  }
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-3 space-y-2`}>
      <div className={`text-sm font-semibold ${titleColor}`}>{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-card border border-border"
          >
            {item}
            <button
              onClick={() => remove(i)}
              className="text-muted hover:text-red-500 text-xs"
              aria-label="Retirer"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full h-8 px-3 text-xs rounded border border-dashed border-border bg-card"
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
