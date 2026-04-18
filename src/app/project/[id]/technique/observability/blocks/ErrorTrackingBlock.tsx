"use client";

import type { ErrorTracker, ObservabilityState } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const TRACKERS: { value: ErrorTracker; label: string; freeTier: string; hint: string }[] = [
  { value: "sentry", label: "Sentry", freeTier: "5k events/mo", hint: "🔥 Leader. Stack traces, replay, breadcrumbs." },
  { value: "posthog-errors", label: "PostHog Errors", freeTier: "100k errors/mo", hint: "🔥 All-in-one (errors + analytics + replay)." },
  { value: "highlight", label: "Highlight.io", freeTier: "10k sessions/mo", hint: "OSS, session replay focused." },
  { value: "axiom", label: "Axiom", freeTier: "500GB/mo logs", hint: "EU-hosted, GDPR-friendly." },
  { value: "none", label: "Aucun", freeTier: "—", hint: "⚠️ Bugs en silence." },
];

export default function ErrorTrackingBlock({ state, onChange }: { state: ObservabilityState; onChange: (p: Partial<ObservabilityState>) => void; }) {
  const filled = (state.errorTracker && state.errorTracker !== "none" ? 1 : 0) + (state.piiRedaction ? 1 : 0);
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🐞 Error tracking</h3>
          <p className="text-xs text-muted mt-0.5">Savoir quand ton app crash. PII redaction obligatoire.</p>
        </div>
        <BlockStatus filled={filled} total={2} />
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {TRACKERS.map((t) => (
          <button key={t.value} type="button" onClick={() => onChange({ errorTracker: t.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.errorTracker === t.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
            <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{t.label}</span><span className="text-[10px] text-muted">{t.freeTier}</span></div>
            <div className="text-[11px] text-muted">{t.hint}</div>
          </button>
        ))}
      </div>
      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.piiRedaction} onChange={(e) => onChange({ piiRedaction: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div><div className="text-xs font-semibold">PII / secrets redaction</div><div className="text-[11px] text-muted">Mask emails, tokens, passwords avant envoi au tracker.</div></div>
      </label>
    </section>
  );
}
