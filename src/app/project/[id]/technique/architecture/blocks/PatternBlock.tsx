"use client";

import type { ArchPattern, ArchitectureState } from "../state";
import BlockStatus from "../components/BlockStatus";

const PATTERNS: { value: ArchPattern; label: string; emoji: string; hint: string }[] = [
  {
    value: "modular-monolith",
    label: "Modular Monolith",
    emoji: "🧱",
    hint: "1 app, modules isolés par dossiers. Défaut solo 2026.",
  },
  {
    value: "serverless",
    label: "Serverless (Functions)",
    emoji: "⚡",
    hint: "Vercel/AWS Lambda, scale-to-zero. Bon pour workloads sporadiques.",
  },
  {
    value: "edge",
    label: "Edge",
    emoji: "🌐",
    hint: "Cloudflare Workers / Vercel Edge. Latence ultra basse.",
  },
  {
    value: "microservices",
    label: "Microservices",
    emoji: "🔗",
    hint: "⚠️ Regret #1 des solopreneurs. Éviter avant 500k€ ARR.",
  },
  {
    value: "hybrid",
    label: "Hybride",
    emoji: "🎭",
    hint: "Mono + serverless functions sur certains workloads.",
  },
];

export default function PatternBlock({
  state,
  onChange,
}: {
  state: ArchitectureState;
  onChange: (patch: Partial<ArchitectureState>) => void;
}) {
  const filled =
    (state.pattern ? 1 : 0) +
    (state.patternRationale.trim().length >= 20 ? 1 : 0) +
    (state.whenRevisit.trim().length > 0 ? 1 : 0);

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🏗️ Pattern architectural</h3>
          <p className="text-xs text-muted mt-0.5">
            La décision fondatrice — détermine coût, vélocité, opérabilité.
          </p>
        </div>
        <BlockStatus filled={filled} total={3} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {PATTERNS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ pattern: p.value })}
            className={`text-left rounded-xl border p-3 transition ${
              state.pattern === p.value
                ? "bg-accent/10 border-accent"
                : "bg-background border-border hover:border-accent/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{p.emoji}</span>
              <span className="text-sm font-semibold">{p.label}</span>
            </div>
            <div className="text-[11px] text-muted leading-relaxed">{p.hint}</div>
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Rationale</span>
        <span className="block text-[11px] text-muted">
          Pourquoi ce pattern ? 2-3 phrases.
        </span>
        <textarea
          value={state.patternRationale}
          onChange={(e) => onChange({ patternRationale: e.target.value })}
          rows={2}
          placeholder="Ex: Équipe 1 person, vitesse critique, scalabilité via Supabase+Vercel..."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Quand revisiter ?</span>
        <span className="block text-[11px] text-muted">
          Signal de croissance qui déclenche une réévaluation.
        </span>
        <input
          type="text"
          value={state.whenRevisit}
          onChange={(e) => onChange({ whenRevisit: e.target.value })}
          placeholder="Ex: Si > 500k€ ARR ou 3 devs IRL"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </section>
  );
}
