"use client";

import type { Framework, FrontendState } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const FRAMEWORKS: { value: Framework; label: string; score: string; hint: string }[] = [
  { value: "nextjs-app", label: "Next.js 16 (App Router)", score: "🔥 populaire", hint: "Défaut Mindeck. RSC + Server Actions." },
  { value: "nextjs-pages", label: "Next.js (Pages Router)", score: "🪦 legacy", hint: "Migre vers App Router." },
  { value: "sveltekit", label: "SvelteKit", score: "🔥 populaire", hint: "State of JS #2 satisfaction." },
  { value: "remix", label: "Remix / React Router v7", score: "🔥 populaire", hint: "Data mutations top-tier." },
  { value: "astro", label: "Astro", score: "🌱 émergent", hint: "Zéro JS par défaut, content sites." },
  { value: "vite-react", label: "Vite + React", score: "🔥 populaire", hint: "SPA pure, pas de SSR." },
  { value: "vanilla", label: "Vanilla JS/HTML", score: "🪦 legacy", hint: "+50% TTM. Éviter solo." },
  { value: "other", label: "Autre", score: "—", hint: "Vue, Solid, Qwik, etc." },
];

export default function FrameworkBlock({
  state,
  onChange,
}: {
  state: FrontendState;
  onChange: (patch: Partial<FrontendState>) => void;
}) {
  const filled = (state.framework ? 1 : 0) + (state.frameworkVersion.trim() ? 1 : 0);

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🧭 Framework</h3>
          <p className="text-xs text-muted mt-0.5">
            Le choix fondateur. Next.js 16 = combo dominant 2026 pour SaaS.
          </p>
        </div>
        <BlockStatus filled={filled} total={2} />
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {FRAMEWORKS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange({ framework: f.value })}
            className={`text-left rounded-xl border p-3 transition ${
              state.framework === f.value
                ? "bg-accent/10 border-accent"
                : "bg-background border-border hover:border-accent/50"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold">{f.label}</span>
              <span className="text-[10px] text-muted">{f.score}</span>
            </div>
            <div className="text-[11px] text-muted">{f.hint}</div>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Version</span>
          <input
            type="text"
            value={state.frameworkVersion}
            onChange={(e) => onChange({ frameworkVersion: e.target.value })}
            placeholder="16.0 / 2.8 / ..."
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Notes</span>
          <input
            type="text"
            value={state.frameworkNotes}
            onChange={(e) => onChange({ frameworkNotes: e.target.value })}
            placeholder="Ex: Turbopack activé, RSC par défaut"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </label>
      </div>
    </section>
  );
}
