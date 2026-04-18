"use client";

import type { ApiStyle, BackendState } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const STYLES: { value: ApiStyle; label: string; hint: string }[] = [
  { value: "server-actions", label: "Server Actions (Next)", hint: "Défaut Next 16. Zéro boilerplate." },
  { value: "trpc", label: "tRPC", hint: "Type-safe TS end-to-end, monorepo." },
  { value: "rest", label: "REST (OpenAPI 3.1)", hint: "Multi-client, public API." },
  { value: "graphql", label: "GraphQL", hint: "UIs très variables, overkill solo." },
  { value: "grpc", label: "gRPC", hint: "Microservices internes, perf." },
  { value: "mixed", label: "Mixed", hint: "⚠️ Cauchemar de maintenance." },
];

export default function ApiStyleBlock({ state, onChange }: { state: BackendState; onChange: (p: Partial<BackendState>) => void; }) {
  const filled = (state.apiStyle ? 1 : 0) + (state.useServerValidation ? 1 : 0);

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🔌 API style</h3>
          <p className="text-xs text-muted mt-0.5">Comment ton frontend parle au backend. Pick ONE, pas de mix.</p>
        </div>
        <BlockStatus filled={filled} total={2} />
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {STYLES.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange({ apiStyle: s.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.apiStyle === s.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}
          >
            <div className="text-xs font-semibold mb-0.5">{s.label}</div>
            <div className="text-[11px] text-muted">{s.hint}</div>
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Versioning strategy</span>
        <input type="text" value={state.apiVersioning} onChange={(e) => onChange({ apiVersioning: e.target.value })} placeholder="Ex: /api/v1 (REST) ou pas (monolithe)" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>

      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.useServerValidation} onChange={(e) => onChange({ useServerValidation: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div>
          <div className="text-xs font-semibold">Validation server obligatoire (Zod/Valibot)</div>
          <div className="text-[11px] text-muted">Parser toutes les entrées API côté serveur — inputs malicieux sinon.</div>
        </div>
      </label>
    </section>
  );
}
