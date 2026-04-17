"use client";

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
  const issues = validateJtbd(state);
  const hasError = issues.some((i) => i.severity === "error");
  const hasWarn = issues.some((i) => i.severity === "warn");
  const ok = !!state.jtbdCore.trim() && state.jtbdCore.trim().length >= 15 && !hasError;

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🎯 Job-to-be-Done
          <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded font-normal">
            MUST
          </span>
        </h2>
        <BlockStatus ok={ok} hasError={hasError} hasWarn={hasWarn} />
      </div>

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

      <IssueList issues={issues} />
    </div>
  );
}
