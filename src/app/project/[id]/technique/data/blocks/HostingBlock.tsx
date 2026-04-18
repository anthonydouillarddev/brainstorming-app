"use client";

import type { DataState, DbHosting } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const HOSTINGS: { value: DbHosting; label: string; pricing: string; hint: string }[] = [
  { value: "supabase", label: "Supabase", pricing: "Free → $25/mo", hint: "🔥 Postgres + Auth + Storage + RLS. Défaut Mindeck." },
  { value: "neon", label: "Neon", pricing: "$5+/mo usage-based", hint: "🔥 Serverless Postgres + branching." },
  { value: "turso", label: "Turso", pricing: "Free → $29/mo", hint: "🌱 SQLite edge, latence <10ms." },
  { value: "planetscale", label: "PlanetScale Postgres", pricing: "$5+/mo", hint: "🌱 Postgres managed, always-on." },
  { value: "railway", label: "Railway", pricing: "$5-20/mo", hint: "Simple, peu de config." },
  { value: "fly", label: "Fly.io Postgres", pricing: "$15+/mo", hint: "Edge global, multi-region." },
  { value: "rds", label: "AWS RDS", pricing: "$10+/mo", hint: "Enterprise, ops à gérer." },
  { value: "self-host", label: "Self-host", pricing: "infra", hint: "VPS + Postgres. Pain mais full control." },
  { value: "other", label: "Autre", pricing: "—", hint: "" },
];

export default function HostingBlock({ state, onChange }: { state: DataState; onChange: (p: Partial<DataState>) => void; }) {
  const filled = state.dbHosting ? 1 : 0;
  return (
    <CollapsibleSection
      emoji="☁️"
      title="Hosting DB"
      description="Où vit ta base. Managed recommandé solo."
      filled={filled}
      total={1}
      storageKey="mindeck:technique:data:hosting:open"
    >
      <div className="grid sm:grid-cols-2 gap-2">
        {HOSTINGS.map((h) => (
          <button key={h.value} type="button" onClick={() => onChange({ dbHosting: h.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.dbHosting === h.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
            <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{h.label}</span><span className="text-[10px] text-muted">{h.pricing}</span></div>
            <div className="text-[11px] text-muted">{h.hint}</div>
          </button>
        ))}
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <input type="text" value={state.dbHostingNotes} onChange={(e) => onChange({ dbHostingNotes: e.target.value })}
          placeholder="Ex: Supabase Pro $25/mo — region EU Ireland"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </CollapsibleSection>
  );
}
