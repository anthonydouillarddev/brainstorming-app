"use client";

import type { ObservabilityState, TestFramework } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const UNIT: { value: TestFramework; label: string; hint: string }[] = [
  { value: "vitest", label: "Vitest", hint: "🔥 5x plus rapide que Jest, ESM natif." },
  { value: "jest", label: "Jest", hint: "Legacy React/TS." },
  { value: "none", label: "Aucun", hint: "Pas de tests unitaires." },
];

const E2E: { value: TestFramework; label: string; hint: string }[] = [
  { value: "playwright", label: "Playwright", hint: "🔥 Standard 2026, cross-browser." },
  { value: "cypress", label: "Cypress", hint: "UI visuelle, legacy." },
  { value: "none", label: "Aucun", hint: "Pas d'e2e." },
];

export default function TestingBlock({ state, onChange }: { state: ObservabilityState; onChange: (p: Partial<ObservabilityState>) => void; }) {
  const filled = (state.unitFramework && state.unitFramework !== "none" ? 1 : 0) + (state.e2eFramework && state.e2eFramework !== "none" ? 1 : 0) + (state.coverageTarget.trim() ? 1 : 0) + (state.mutationTesting ? 1 : 0);
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🧪 Testing strategy</h3>
          <p className="text-xs text-muted mt-0.5">Unit (critical path) + e2e (auth/create/export). Coverage 60-70%.</p>
        </div>
        <BlockStatus filled={filled} total={4} />
      </div>
      <div>
        <div className="text-xs font-semibold mb-2">Unit testing</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {UNIT.map((u) => (
            <button key={u.value} type="button" onClick={() => onChange({ unitFramework: u.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.unitFramework === u.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{u.label}</div>
              <div className="text-[11px] text-muted">{u.hint}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold mb-2">E2E testing</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {E2E.map((e) => (
            <button key={e.value} type="button" onClick={() => onChange({ e2eFramework: e.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.e2eFramework === e.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{e.label}</div>
              <div className="text-[11px] text-muted">{e.hint}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Coverage cible (%)</span>
          <input type="number" min={0} max={100} value={state.coverageTarget} onChange={(e) => onChange({ coverageTarget: e.target.value })}
            placeholder="60" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.mutationTesting} onChange={(e) => onChange({ mutationTesting: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">Mutation testing</div><div className="text-[11px] text-muted">Stryker = qualité tests &gt; coverage obsession.</div></div>
        </label>
      </div>
    </section>
  );
}
