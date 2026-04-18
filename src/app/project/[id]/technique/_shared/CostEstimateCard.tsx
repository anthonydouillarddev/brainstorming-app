"use client";

import { useMemo, useState } from "react";
import {
  estimateMonthlyCost,
  SCALE_LABELS,
  type UserScale,
} from "@/lib/technique/cost-estimator";

// Widget qui affiche un estimé de coût mensuel total basé sur les services sélectionnés.
// Utilisé dans le chap 7 Services (au-dessus du catalogue) et chap 11 Coûts.

export default function CostEstimateCard({
  selectedServiceNames,
  title = "💸 Coût mensuel estimé",
  hint = "Basé sur les services marqués 'Utilisé' dans le catalogue",
}: {
  selectedServiceNames: string[];
  title?: string;
  hint?: string;
}) {
  const [scale, setScale] = useState<UserScale>("1k");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const estimate = useMemo(
    () => estimateMonthlyCost(selectedServiceNames, scale),
    [selectedServiceNames, scale]
  );

  const scales: UserScale[] = ["100", "1k", "10k", "100k"];

  if (selectedServiceNames.length === 0) return null;

  return (
    <section className="bg-accent/5 border border-accent/30 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">{title}</h3>
          <p className="text-xs text-muted mt-0.5">{hint}</p>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-card border border-border rounded-xl text-[11px]">
          {scales.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScale(s)}
              className={`px-2.5 py-1 rounded-lg transition ${
                scale === s
                  ? "bg-accent text-white shadow-sm font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {SCALE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tabular-nums">${estimate.total}</span>
          <span className="text-sm text-muted">/mois @ {SCALE_LABELS[scale]}</span>
        </div>
        <div className="text-[11px] text-muted">
          {estimate.breakdown.filter((b) => b.matched).length} services tarifés
          {estimate.unmatchedCount > 0 && (
            <span className="ml-2 text-amber-600 dark:text-amber-400">
              · {estimate.unmatchedCount} sans pricing
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowBreakdown((v) => !v)}
        aria-expanded={showBreakdown}
        className="text-[11px] text-muted hover:text-accent transition flex items-center gap-1"
      >
        <span>{showBreakdown ? "▾" : "▸"}</span>
        <span>Détail par service</span>
      </button>

      {showBreakdown && estimate.breakdown.length > 0 && (
        <div className="space-y-1 text-xs">
          {estimate.breakdown.map((b, i) => (
            <div
              key={`${b.service}-${i}`}
              className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg ${
                !b.matched ? "bg-amber-500/10" : i % 2 === 0 ? "bg-background/40" : ""
              }`}
            >
              <span className="flex items-center gap-1.5">
                {!b.matched && (
                  <span
                    className="text-amber-600 dark:text-amber-400"
                    title="Pricing non trouvé dans la matrice"
                  >
                    ⚠
                  </span>
                )}
                {b.hasFreeTier && b.cost === 0 && (
                  <span className="text-green-600 dark:text-green-400" title="Free tier">
                    🆓
                  </span>
                )}
                <span>{b.service}</span>
              </span>
              <span className="font-mono tabular-nums text-muted">
                {b.matched ? `$${b.cost}` : "?"}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted italic">
        Estimations conservatrices 2026. Hypothèses : ARPU $10, conversion 5%, 1 requête LLM/user/jour
        avec prompt caching 90%. Tarifs à auditer annuellement.
      </p>
    </section>
  );
}
