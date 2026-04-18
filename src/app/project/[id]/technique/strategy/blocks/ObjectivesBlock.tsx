"use client";

import type { StrategyState } from "../state";
import BlockStatus from "../components/BlockStatus";

const SCALES: { value: StrategyState["scaleHorizonUsers"]; label: string }[] = [
  { value: "100", label: "100 users" },
  { value: "1k", label: "1 000 users" },
  { value: "10k", label: "10 000 users" },
  { value: "100k", label: "100 000 users" },
  { value: "1m", label: "1M+ users" },
  { value: "unknown", label: "Inconnu" },
];

export default function ObjectivesBlock({
  state,
  onChange,
}: {
  state: StrategyState;
  onChange: (patch: Partial<StrategyState>) => void;
}) {
  const filled =
    (state.coreMetric.trim() ? 1 : 0) +
    (state.scaleHorizonUsers ? 1 : 0) +
    (state.nonNegotiables.trim() ? 1 : 0) +
    (state.acceptableTradeoffs.trim() ? 1 : 0);

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🎯 Objectifs métier</h3>
          <p className="text-xs text-muted mt-0.5">
            Relie la tech aux vraies métriques. &quot;Scalable&quot; n&apos;existe pas en abstrait.
          </p>
        </div>
        <BlockStatus filled={filled} total={4} />
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Métrique de succès *</span>
        <span className="block text-[11px] text-muted">
          Ex: ARR 50k · Rétention 40% (Sean Ellis PMF) · Latence &lt; 100ms
        </span>
        <input
          type="text"
          value={state.coreMetric}
          onChange={(e) => onChange({ coreMetric: e.target.value })}
          placeholder="Quelle métrique te dit 'j'ai gagné' ?"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Scale cible</span>
          <span className="block text-[11px] text-muted">100 vs 1M change tout.</span>
          <select
            value={state.scaleHorizonUsers}
            onChange={(e) =>
              onChange({
                scaleHorizonUsers: e.target.value as StrategyState["scaleHorizonUsers"],
              })
            }
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          >
            <option value="">— Choisir —</option>
            {SCALES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Horizon (mois)</span>
          <span className="block text-[11px] text-muted">Délai pour atteindre cette scale.</span>
          <input
            type="number"
            min={1}
            max={120}
            value={state.scaleHorizonMonths}
            onChange={(e) => onChange({ scaleHorizonMonths: e.target.value })}
            placeholder="12"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Non-négociables</span>
        <span className="block text-[11px] text-muted">
          Ex: GDPR-compliant, latency &lt; 100ms, données chiffrées.
        </span>
        <textarea
          value={state.nonNegotiables}
          onChange={(e) => onChange({ nonNegotiables: e.target.value })}
          rows={2}
          placeholder="Contraintes qui ne bougent pas…"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Trade-offs acceptés</span>
        <span className="block text-[11px] text-muted">
          Ex: UI basique pour 6 semaines gagnées · migrations DB bloquées 6 mois.
        </span>
        <textarea
          value={state.acceptableTradeoffs}
          onChange={(e) => onChange({ acceptableTradeoffs: e.target.value })}
          rows={2}
          placeholder="Ce sur quoi tu es prêt à faire des concessions…"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </section>
  );
}
