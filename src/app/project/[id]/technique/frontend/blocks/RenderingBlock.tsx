"use client";

import type { FrontendState, RenderingStrategy } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const STRATEGIES: { value: RenderingStrategy; label: string; hint: string }[] = [
  { value: "ssr", label: "SSR", hint: "Server-Side Rendering — HTML au runtime" },
  { value: "ssg", label: "SSG", hint: "Static generation — build-time" },
  { value: "isr", label: "ISR", hint: "Incremental Static Regeneration" },
  { value: "csr", label: "CSR", hint: "Client-Side Rendering pure" },
  { value: "streaming", label: "Streaming", hint: "Chunked HTML + Suspense" },
  { value: "ppr", label: "PPR", hint: "Partial Pre-Rendering (Next 15+)" },
  { value: "hybrid", label: "Hybride", hint: "Mix selon routes" },
];

export default function RenderingBlock({
  state,
  onChange,
}: {
  state: FrontendState;
  onChange: (patch: Partial<FrontendState>) => void;
}) {
  const filled =
    (state.renderingStrategy ? 1 : 0) +
    (state.perfTargetLcpMs.trim() ? 1 : 0) +
    (state.perfTargetBundleKb.trim() ? 1 : 0);

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">⚡ Rendering strategy</h3>
          <p className="text-xs text-muted mt-0.5">
            Quelle perf cible ? Core Web Vitals Mindeck : LCP &lt; 1.8s · CLS &lt; 0.1.
          </p>
        </div>
        <BlockStatus filled={filled} total={3} />
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {STRATEGIES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ renderingStrategy: s.value })}
            className={`text-left rounded-xl border p-2.5 transition ${
              state.renderingStrategy === s.value
                ? "bg-accent/10 border-accent"
                : "bg-background border-border hover:border-accent/50"
            }`}
          >
            <div className="text-xs font-semibold mb-0.5">{s.label}</div>
            <div className="text-[11px] text-muted leading-relaxed">{s.hint}</div>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">LCP cible (ms)</span>
          <input
            type="number"
            min={100}
            max={10000}
            value={state.perfTargetLcpMs}
            onChange={(e) => onChange({ perfTargetLcpMs: e.target.value })}
            placeholder="1800"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Bundle JS cible (KB gzip)</span>
          <input
            type="number"
            min={1}
            max={1000}
            value={state.perfTargetBundleKb}
            onChange={(e) => onChange({ perfTargetBundleKb: e.target.value })}
            placeholder="60"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <textarea
          value={state.renderingNotes}
          onChange={(e) => onChange({ renderingNotes: e.target.value })}
          rows={2}
          placeholder="Ex: Server Components par défaut, 'use client' uniquement quand interactif"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </section>
  );
}
