"use client";

import type { BackendState, JobsSolution } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const JOBS: { value: JobsSolution; label: string; freeTier: string; hint: string }[] = [
  { value: "none", label: "Aucun", freeTier: "—", hint: "Pas de tâches async." },
  { value: "vercel-cron", label: "Vercel Cron", freeTier: "∞ (inclus)", hint: "Basique, pas de retry." },
  { value: "inngest", label: "Inngest", freeTier: "50k runs/mois", hint: "🔥 Recommandé solo. TS-first, retries, step functions." },
  { value: "trigger-dev", label: "Trigger.dev", freeTier: "5k runs/mois", hint: "OSS, self-host OK. Jobs longs (4h+)." },
  { value: "bullmq", label: "BullMQ", freeTier: "—", hint: "Self-host Redis. Ops à gérer." },
  { value: "sidekiq", label: "Sidekiq", freeTier: "—", hint: "Ruby Rails standard." },
  { value: "temporal", label: "Temporal", freeTier: "—", hint: "Workflows complexes, multi-step." },
];

export default function JobsBlock({ state, onChange }: { state: BackendState; onChange: (p: Partial<BackendState>) => void; }) {
  const filled = state.jobs ? 1 : 0;

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">⏱️ Background jobs</h3>
          <p className="text-xs text-muted mt-0.5">Tâches async : emails, PDF, webhooks, cron. Inngest = défaut solo 2026.</p>
        </div>
        <BlockStatus filled={filled} total={1} />
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {JOBS.map((j) => (
          <button
            key={j.value}
            type="button"
            onClick={() => onChange({ jobs: j.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.jobs === j.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}
          >
            <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{j.label}</span><span className="text-[10px] text-muted">{j.freeTier}</span></div>
            <div className="text-[11px] text-muted">{j.hint}</div>
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <textarea value={state.jobsNotes} onChange={(e) => onChange({ jobsNotes: e.target.value })} rows={2} placeholder="Ex: Inngest pour onboarding + cron daily digest. Vercel Cron pour purge corbeille." className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </section>
  );
}
