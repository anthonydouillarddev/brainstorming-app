"use client";

import type { HostingState } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const ENVS: { key: keyof HostingState; label: string; hint: string }[] = [
  { key: "hasDevEnv", label: "Dev", hint: "Local — localhost:3000" },
  { key: "hasPreviewEnv", label: "Preview", hint: "PR previews éphémères (Vercel auto)" },
  { key: "hasStagingEnv", label: "Staging", hint: "Tests avant prod, data réaliste" },
  { key: "hasProdEnv", label: "Production", hint: "User-facing, monitored" },
];

export default function EnvironmentsBlock({ state, onChange }: { state: HostingState; onChange: (p: Partial<HostingState>) => void; }) {
  const filled = ENVS.filter((e) => state[e.key]).length + (state.dbBranching ? 1 : 0);
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🌳 Environnements</h3>
          <p className="text-xs text-muted mt-0.5">Dev / Preview / Staging / Prod — chaque env = ses env vars.</p>
        </div>
        <BlockStatus filled={filled} total={5} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {ENVS.map((e) => (
          <label key={String(e.key)} className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
            <input
              type="checkbox"
              checked={Boolean(state[e.key])}
              onChange={(ev) => onChange({ [e.key]: ev.target.checked } as Partial<HostingState>)}
              className="h-4 w-4 rounded border-border mt-0.5"
            />
            <div>
              <div className="text-xs font-semibold">{e.label}</div>
              <div className="text-[11px] text-muted">{e.hint}</div>
            </div>
          </label>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.dbBranching} onChange={(e) => onChange({ dbBranching: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div>
          <div className="text-xs font-semibold">DB branching (Supabase / Neon)</div>
          <div className="text-[11px] text-muted">Chaque PR = branche DB isolée, migrations auto.</div>
        </div>
      </label>
    </section>
  );
}
