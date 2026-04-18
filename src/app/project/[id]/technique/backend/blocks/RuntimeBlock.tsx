"use client";

import type { BackendState, Runtime } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const RUNTIMES: { value: Runtime; label: string; score: string; hint: string }[] = [
  { value: "node", label: "Node.js 22+", score: "🔥", hint: "Default Vercel. Écosystème max." },
  { value: "bun", label: "Bun 1.2+", score: "🌱", hint: "3-4× plus rapide. API 98% compat Node." },
  { value: "deno", label: "Deno 2.x", score: "🌱", hint: "TS natif, permissions fines." },
  { value: "python", label: "Python 3.12+", score: "🔥", hint: "FastAPI / Django. Meilleur pour ML/AI." },
  { value: "go", label: "Go 1.22+", score: "🔥", hint: "Perf + typing simples. Binaires single-file." },
  { value: "rust", label: "Rust", score: "🌱", hint: "+50% TTM solo. Perf max." },
  { value: "ruby", label: "Ruby + Rails", score: "🔥", hint: "Boring solid SaaS." },
  { value: "php", label: "PHP + Laravel", score: "🔥", hint: "Hébergement trivial." },
  { value: "elixir", label: "Elixir + Phoenix", score: "🌱", hint: "Real-time à la pelle (LiveView)." },
];

export default function RuntimeBlock({ state, onChange }: { state: BackendState; onChange: (p: Partial<BackendState>) => void; }) {
  const filled = (state.runtime ? 1 : 0) + (state.runtimeFramework.trim() ? 1 : 0);

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">⚙️ Runtime & langage</h3>
          <p className="text-xs text-muted mt-0.5">Le langage que ton backend parle. Node reste le choix safe 2026.</p>
        </div>
        <BlockStatus filled={filled} total={2} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {RUNTIMES.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange({ runtime: r.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.runtime === r.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}
          >
            <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{r.label}</span><span className="text-[10px]">{r.score}</span></div>
            <div className="text-[11px] text-muted">{r.hint}</div>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Version</span>
          <input type="text" value={state.runtimeVersion} onChange={(e) => onChange({ runtimeVersion: e.target.value })} placeholder="22.1 / 1.2 / 3.12" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Framework backend</span>
          <input type="text" value={state.runtimeFramework} onChange={(e) => onChange({ runtimeFramework: e.target.value })} placeholder="Hono / Fastify / Next Server Actions / FastAPI" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
      </div>
    </section>
  );
}
