"use client";

import type { MetricsTool, ObservabilityState } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const METRICS: { value: MetricsTool; label: string; freeTier: string; hint: string }[] = [
  { value: "posthog", label: "PostHog", freeTier: "1M events/mo", hint: "🔥 All-in-one (analytics + replay + flags)." },
  { value: "mixpanel", label: "Mixpanel", freeTier: "100k events/mo", hint: "Leader legacy, cher à scale." },
  { value: "amplitude", label: "Amplitude", freeTier: "50k events/mo", hint: "Enterprise, cohort analysis." },
  { value: "custom", label: "Table Supabase", freeTier: "gratuit", hint: "Events dans ta DB, simple." },
  { value: "none", label: "Aucun", freeTier: "—", hint: "Pas de tracking produit." },
];

export default function MetricsBlock({ state, onChange }: { state: ObservabilityState; onChange: (p: Partial<ObservabilityState>) => void; }) {
  const filled = (state.metricsTool && state.metricsTool !== "none" ? 1 : 0) + (state.sessionReplay ? 1 : 0) + (state.sloAvailability.trim() ? 1 : 0) + (state.doraTracking ? 1 : 0);
  return (
    <CollapsibleSection
      emoji="📊"
      title="Metrics produit & SLO"
      description="DAU/MAU + retention + fiabilité mesurable (Google SRE)."
      filled={filled}
      total={4}
      storageKey="mindeck:technique:observability:metrics:open"
    >
      <div className="grid sm:grid-cols-2 gap-2">
        {METRICS.map((m) => (
          <button key={m.value} type="button" onClick={() => onChange({ metricsTool: m.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.metricsTool === m.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
            <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{m.label}</span><span className="text-[10px] text-muted">{m.freeTier}</span></div>
            <div className="text-[11px] text-muted">{m.hint}</div>
          </button>
        ))}
      </div>
      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.sessionReplay} onChange={(e) => onChange({ sessionReplay: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div><div className="text-xs font-semibold">Session replay</div><div className="text-[11px] text-muted">PostHog / FullStory — debug UX issues.</div></div>
      </label>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">SLO availability (%)</span>
          <input type="number" min={90} max={100} step={0.01} value={state.sloAvailability} onChange={(e) => onChange({ sloAvailability: e.target.value })}
            placeholder="99.5" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">SLO latency P95 (ms)</span>
          <input type="number" min={50} max={10000} value={state.sloLatencyP95Ms} onChange={(e) => onChange({ sloLatencyP95Ms: e.target.value })}
            placeholder="500" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
      </div>
      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.doraTracking} onChange={(e) => onChange({ doraTracking: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div><div className="text-xs font-semibold">DORA metrics tracking</div><div className="text-[11px] text-muted">Deployment Frequency, Lead Time, CFR, MTTR.</div></div>
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <textarea value={state.notes} onChange={(e) => onChange({ notes: e.target.value })} rows={2}
          placeholder="Ex: PostHog events 'project_created', 'design_completed'. SLO recalculé mensuel."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </CollapsibleSection>
  );
}
