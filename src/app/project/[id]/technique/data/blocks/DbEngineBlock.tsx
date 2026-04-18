"use client";

import type { DataState, DbEngine } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const ENGINES: { value: DbEngine; label: string; score: string; hint: string }[] = [
  { value: "postgres", label: "PostgreSQL", score: "🔥", hint: "Défaut 2026. RLS natif, pgvector, JSON." },
  { value: "mysql", label: "MySQL", score: "🔥", hint: "Solide, legacy friendly." },
  { value: "sqlite", label: "SQLite", score: "🔥", hint: "Embarqué, single-writer. Turso = edge." },
  { value: "mongodb", label: "MongoDB", score: "🪦", hint: "⚠️ Regret #1 pour data relationnelle." },
  { value: "dynamodb", label: "DynamoDB", score: "🌱", hint: "AWS, scale infinie, API key-value." },
  { value: "other", label: "Autre", score: "—", hint: "ClickHouse, DuckDB, CockroachDB, etc." },
];

export default function DbEngineBlock({ state, onChange }: { state: DataState; onChange: (p: Partial<DataState>) => void; }) {
  const filled = (state.dbEngine ? 1 : 0);
  return (
    <CollapsibleSection
      emoji="🗄️"
      title="Moteur de DB"
      description="Postgres = 80% des bonnes réponses 2026."
      filled={filled}
      total={1}
      storageKey="mindeck:technique:data:engine:open"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ENGINES.map((e) => (
          <button key={e.value} type="button" onClick={() => onChange({ dbEngine: e.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.dbEngine === e.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
            <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{e.label}</span><span className="text-[10px]">{e.score}</span></div>
            <div className="text-[11px] text-muted">{e.hint}</div>
          </button>
        ))}
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <input type="text" value={state.dbEngineNotes} onChange={(e) => onChange({ dbEngineNotes: e.target.value })}
          placeholder="Ex: Postgres 16, pgvector pour RAG futur"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </CollapsibleSection>
  );
}
