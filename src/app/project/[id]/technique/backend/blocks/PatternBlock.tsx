"use client";

import type { BackendPattern, BackendState } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const PATTERNS: { value: BackendPattern; label: string; emoji: string; hint: string }[] = [
  { value: "baas", label: "BaaS pur", emoji: "☁️", hint: "Supabase/Firebase direct — zéro backend à toi. Défaut solo." },
  { value: "bff", label: "BFF (Backend for Frontend)", emoji: "🧩", hint: "Next.js Server Actions, tRPC. Pas de service séparé." },
  { value: "api-only", label: "API-only server", emoji: "🖥️", hint: "Node/Hono/Fastify dédié. Multi-client." },
  { value: "serverless-functions", label: "Serverless Functions", emoji: "⚡", hint: "Vercel Functions / AWS Lambda isolées." },
  { value: "hybrid", label: "Hybride", emoji: "🎭", hint: "BFF + quelques functions pour jobs lourds." },
];

export default function PatternBlock({ state, onChange }: { state: BackendState; onChange: (p: Partial<BackendState>) => void; }) {
  const filled = (state.pattern ? 1 : 0) + (state.patternRationale.trim().length >= 20 ? 1 : 0);

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🏗️ Pattern backend</h3>
          <p className="text-xs text-muted mt-0.5">Détermine si tu as un backend séparé ou pas. 95% des SaaS solo = BaaS ou BFF.</p>
        </div>
        <BlockStatus filled={filled} total={2} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {PATTERNS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange({ pattern: p.value })}
            className={`text-left rounded-xl border p-3 transition ${state.pattern === p.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}
          >
            <div className="flex items-center gap-2 mb-1"><span className="text-lg">{p.emoji}</span><span className="text-sm font-semibold">{p.label}</span></div>
            <div className="text-[11px] text-muted leading-relaxed">{p.hint}</div>
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Rationale</span>
        <textarea
          value={state.patternRationale}
          onChange={(e) => onChange({ patternRationale: e.target.value })}
          rows={2}
          placeholder="Ex: Solo, zéro ops à gérer, Supabase suffit jusqu'à 10k MRR..."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </section>
  );
}
