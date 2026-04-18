"use client";

import type { DataState, OrmChoice } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const ORMS: { value: OrmChoice; label: string; bundleKb: string; hint: string }[] = [
  { value: "none", label: "Pas d'ORM", bundleKb: "0", hint: "🔥 Queries directes Supabase/pg. Simple, léger." },
  { value: "drizzle", label: "Drizzle", bundleKb: "7KB", hint: "🔥 Type-safe, edge-friendly." },
  { value: "prisma", label: "Prisma", bundleKb: "1.6MB", hint: "Lourd mais DX +++. Pas edge." },
  { value: "kysely", label: "Kysely", bundleKb: "15KB", hint: "Query builder TS pur." },
  { value: "typeorm", label: "TypeORM", bundleKb: "—", hint: "Legacy TS ORM." },
  { value: "sqlalchemy", label: "SQLAlchemy", bundleKb: "—", hint: "Python standard." },
  { value: "ecto", label: "Ecto", bundleKb: "—", hint: "Elixir/Phoenix." },
  { value: "other", label: "Autre", bundleKb: "—", hint: "" },
];

export default function OrmBlock({ state, onChange }: { state: DataState; onChange: (p: Partial<DataState>) => void; }) {
  const filled = (state.orm ? 1 : 0) + (state.useRls ? 1 : 0);
  return (
    <CollapsibleSection
      emoji="🔗"
      title="ORM / Query Builder"
      description="Mindeck = pas d'ORM (queries Supabase directes). Drizzle si besoin type-safety."
      filled={filled}
      total={2}
      storageKey="mindeck:technique:data:orm:open"
    >
      <div className="grid sm:grid-cols-2 gap-2">
        {ORMS.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange({ orm: o.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.orm === o.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
            <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{o.label}</span><span className="text-[10px] text-muted">{o.bundleKb}</span></div>
            <div className="text-[11px] text-muted">{o.hint}</div>
          </button>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.useRls} onChange={(e) => onChange({ useRls: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div>
          <div className="text-xs font-semibold">Row-Level Security activée (Postgres)</div>
          <div className="text-[11px] text-muted">
            Défense data par user au niveau DB. `auth.uid() = user_id` sur chaque table.
          </div>
        </div>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Stratégie de cache</span>
        <input type="text" value={state.cacheStrategy} onChange={(e) => onChange({ cacheStrategy: e.target.value })}
          placeholder="Ex: ISR Next + TanStack Query client + Redis Upstash pour queries chaudes"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </CollapsibleSection>
  );
}
