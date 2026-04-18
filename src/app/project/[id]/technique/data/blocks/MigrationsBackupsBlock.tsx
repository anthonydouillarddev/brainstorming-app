"use client";

import type { BackupFreq, DataState, MigrationsTool } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const TOOLS: { value: MigrationsTool; label: string; hint: string }[] = [
  { value: "supabase-cli", label: "Supabase CLI", hint: "SQL migrations incrémentales. Défaut Mindeck." },
  { value: "prisma-migrate", label: "Prisma Migrate", hint: "Auto depuis schema.prisma." },
  { value: "drizzle-kit", label: "Drizzle Kit", hint: "CLI TS-first." },
  { value: "atlas", label: "Atlas", hint: "Declarative schema multi-DB." },
  { value: "knex", label: "Knex", hint: "Node.js classic." },
  { value: "flyway", label: "Flyway", hint: "Java, enterprise." },
  { value: "manual-sql", label: "SQL manuel", hint: "Pas de tool dédié." },
];

const FREQS: { value: BackupFreq; label: string; hint: string }[] = [
  { value: "hourly", label: "Horaire", hint: "RPO ~1h. Enterprise." },
  { value: "daily", label: "Quotidien", hint: "Défaut Supabase Pro (7j retention)." },
  { value: "weekly", label: "Hebdo", hint: "Minimum viable, RPO 7j." },
  { value: "none", label: "⚠️ Aucun", hint: "Catastrophique le jour J." },
];

export default function MigrationsBackupsBlock({ state, onChange }: { state: DataState; onChange: (p: Partial<DataState>) => void; }) {
  const filled = (state.migrationsTool ? 1 : 0) + (state.backupFreq && state.backupFreq !== "none" ? 1 : 0) + (state.pitrEnabled ? 1 : 0) + (state.restoreTested ? 1 : 0);
  return (
    <CollapsibleSection
      emoji="🔄"
      title="Migrations & Backups"
      description="Évolution schéma + récup en cas de crash. Non-négociable."
      filled={filled}
      total={4}
      storageKey="mindeck:technique:data:migrations:open"
    >
      <div>
        <div className="text-xs font-semibold mb-2">Tool migrations</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {TOOLS.map((t) => (
            <button key={t.value} type="button" onClick={() => onChange({ migrationsTool: t.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.migrationsTool === t.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{t.label}</div>
              <div className="text-[11px] text-muted">{t.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Fréquence backups</div>
        <div className="grid sm:grid-cols-4 gap-2">
          {FREQS.map((f) => (
            <button key={f.value} type="button" onClick={() => onChange({ backupFreq: f.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.backupFreq === f.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{f.label}</div>
              <div className="text-[11px] text-muted">{f.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.pitrEnabled} onChange={(e) => onChange({ pitrEnabled: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">PITR activée</div><div className="text-[11px] text-muted">Point-In-Time Recovery (Supabase Pro).</div></div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.restoreTested} onChange={(e) => onChange({ restoreTested: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">Restore testé</div><div className="text-[11px] text-muted">Test annuel = obligatoire.</div></div>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes backup</span>
        <textarea value={state.backupNotes} onChange={(e) => onChange({ backupNotes: e.target.value })} rows={2}
          placeholder="Ex: PITR 7j Supabase + pg_dump mensuel vers S3 encrypted"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </CollapsibleSection>
  );
}
