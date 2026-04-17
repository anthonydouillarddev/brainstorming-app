"use client";

import { useState } from "react";
import { validateJtbd } from "../validators";
import type { FoundationsState } from "../state";
import BlockStatus from "../components/BlockStatus";
import IssueList from "../components/IssueList";

export default function JtbdBlock({
  state,
  onChange,
}: {
  state: FoundationsState;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const issues = validateJtbd(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = !!state.jtbdCore.trim() && state.jtbdCore.trim().length >= 15 && !hasError;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xl font-bold flex items-center gap-2 hover:text-accent transition text-left"
          aria-expanded={expanded}
        >
          <span aria-hidden>{expanded ? "▼" : "▶"}</span>
          🎯 Job-to-be-Done
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </button>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

      {!expanded && state.jtbdCore.trim() && (
        <div className="text-xs text-muted italic border-l-2 border-border pl-3">
          « {state.jtbdCore.trim()} »
        </div>
      )}

      {expanded && (
      <>
      <div className="bg-card/40 border border-border rounded-lg p-3 text-xs text-muted leading-relaxed">
        <strong className="text-foreground">Qu&apos;est-ce que c&apos;est ?</strong> Un JTBD n&apos;est
        pas une fonctionnalité. C&apos;est un <em>progrès</em> que ton user cherche dans sa vie.
        Format Ulwick : <em>« Aider [qui] à [job] quand [situation] »</em>. Solution-free (pas de
        « bouton », « dashboard », « interface »).
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 text-xs">
          <div className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
            ✓ Exemple
          </div>
          <div className="text-muted italic">
            Aider un freelance à facturer ses clients sans se tromper quand il travaille sur
            plusieurs projets en parallèle.
          </div>
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-xs">
          <div className="font-semibold text-red-500 mb-1">✗ Anti-exemple</div>
          <div className="text-muted italic">
            Avoir un super CRM avec dashboard et intégration Stripe. (C&apos;est une solution, pas
            un job.)
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium">Ton JTBD principal</label>
        <textarea
          value={state.jtbdCore}
          onChange={(e) => onChange({ jtbdCore: e.target.value })}
          rows={3}
          placeholder="Aider [qui] à [job] quand [situation]"
          className="w-full px-3 py-2 text-sm rounded border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      <details className="bg-card/40 border border-border rounded-lg p-3 text-xs">
        <summary className="cursor-pointer font-medium text-foreground">
          🎭 Jobs émotionnels &amp; sociaux (optionnel)
        </summary>
        <div className="mt-3 space-y-3">
          <p className="text-muted leading-relaxed">
            Ulwick distingue 3 types de jobs. Le job fonctionnel (ci-dessus) est obligatoire. Les
            jobs <em>émotionnels</em> (ce qu&apos;il ressent) et <em>sociaux</em> (comment il veut
            être perçu) enrichissent ton positionnement.
          </p>
          <JtbdListField
            label="Jobs émotionnels (ressentis recherchés)"
            items={state.jtbdEmotional}
            placeholder="Ex : se sentir maître de son business"
            onChange={(jtbdEmotional) => onChange({ jtbdEmotional })}
          />
          <JtbdListField
            label="Jobs sociaux (comment être perçu)"
            items={state.jtbdSocial}
            placeholder="Ex : paraître pro auprès de ses clients"
            onChange={(jtbdSocial) => onChange({ jtbdSocial })}
          />
        </div>
      </details>

      <IssueList issues={issues} />
      </>
      )}
    </div>
  );
}

function JtbdListField({
  label,
  items,
  placeholder,
  onChange,
}: {
  label: string;
  items: string[];
  placeholder: string;
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
  function update(i: number, value: string) {
    onChange(items.map((item, idx) => (idx === i ? value : item)));
  }
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted">{label}</label>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className="h-8 px-2 text-xs rounded border border-border bg-card flex-1"
            />
            <button
              onClick={() => remove(i)}
              className="w-7 h-7 rounded text-muted hover:text-red-500 hover:bg-red-500/10 text-xs"
              aria-label="Retirer"
            >
              ×
            </button>
          </div>
        ))}
        <input
          type="text"
          placeholder={placeholder}
          className="h-8 px-2 text-xs rounded border border-dashed border-border bg-card w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const input = e.target as HTMLInputElement;
              add(input.value);
              input.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
