"use client";

import type { HostingState, RollbackStrategy } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const STRATEGIES: { value: RollbackStrategy; label: string; hint: string }[] = [
  { value: "instant-vercel", label: "Vercel 1-click", hint: "🔥 Promote previous deployment, 30s." },
  { value: "git-revert", label: "Git revert + redeploy", hint: "Standard, 2-5 min." },
  { value: "feature-flag", label: "Feature flag off", hint: "Désactive feature sans redeploy." },
  { value: "blue-green", label: "Blue-green", hint: "Switch traffic instantané." },
  { value: "manual", label: "Manuel", hint: "⚠️ Risqué sous stress." },
];

export default function DeploymentBlock({ state, onChange }: { state: HostingState; onChange: (p: Partial<HostingState>) => void; }) {
  const filled = (state.rollback ? 1 : 0) + (state.featureFlags ? 1 : 0) + (state.progressiveDelivery ? 1 : 0);
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🚦 Stratégie de déploiement</h3>
          <p className="text-xs text-muted mt-0.5">Rollback + feature flags + progressive delivery.</p>
        </div>
        <BlockStatus filled={filled} total={3} />
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Stratégie rollback</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {STRATEGIES.map((s) => (
            <button key={s.value} type="button" onClick={() => onChange({ rollback: s.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.rollback === s.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-[11px] text-muted">{s.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.featureFlags} onChange={(e) => onChange({ featureFlags: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div className="flex-1">
          <div className="text-xs font-semibold">Feature flags</div>
          <div className="text-[11px] text-muted mb-2">PostHog, Statsig, GrowthBook, Vercel Flags.</div>
          {state.featureFlags && (
            <input type="text" value={state.featureFlagsProvider} onChange={(e) => onChange({ featureFlagsProvider: e.target.value })}
              placeholder="Provider : PostHog / Statsig / …"
              className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent" />
          )}
        </div>
      </label>

      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.progressiveDelivery} onChange={(e) => onChange({ progressiveDelivery: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div>
          <div className="text-xs font-semibold">Progressive delivery (canary)</div>
          <div className="text-[11px] text-muted">Rollout 1% → 10% → 50% → 100% avec monitoring.</div>
        </div>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <textarea value={state.notes} onChange={(e) => onChange({ notes: e.target.value })} rows={2}
          placeholder="Ex: Vercel auto-deploy main + PR previews. Rollback 1-click dashboard."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </section>
  );
}
