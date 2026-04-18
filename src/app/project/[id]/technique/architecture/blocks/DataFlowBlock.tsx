"use client";

import type { ArchitectureState, Concurrency } from "../state";
import BlockStatus from "../components/BlockStatus";

const CONCURRENCY: { value: Concurrency; label: string; hint: string }[] = [
  { value: "optimistic", label: "Optimistic update", hint: "UI update immédiat, rollback si erreur. UX rapide." },
  { value: "pessimistic", label: "Pessimistic lock", hint: "Attendre confirmation serveur avant update UI." },
  { value: "event-sourced", label: "Event sourced", hint: "Append-only events, state reconstruit. Audit trail natif." },
  { value: "none", label: "Aucune (statique)", hint: "Pas d'action user concurrente." },
];

export default function DataFlowBlock({
  state,
  onChange,
}: {
  state: ArchitectureState;
  onChange: (patch: Partial<ArchitectureState>) => void;
}) {
  const filled =
    (state.happyPath.trim().length >= 20 ? 1 : 0) +
    (state.errorPath.trim().length > 0 ? 1 : 0) +
    (state.concurrency ? 1 : 0) +
    (state.stateManagement.trim().length > 0 ? 1 : 0);

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🔄 Flux de données</h3>
          <p className="text-xs text-muted mt-0.5">
            Happy path + error handling + concurrency. Prévient race conditions et failles auth.
          </p>
        </div>
        <BlockStatus filled={filled} total={4} />
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Happy path d&apos;une action clé</span>
        <span className="block text-[11px] text-muted">
          Décris le parcours nominal user → frontend → API → DB → UI update.
        </span>
        <textarea
          value={state.happyPath}
          onChange={(e) => onChange({ happyPath: e.target.value })}
          rows={4}
          placeholder="Ex: 1. User clique 'Créer tâche' &#10;2. Client optimistic : state local update immédiat &#10;3. API Next → Supabase INSERT (RLS user_id) &#10;4. Succès: merge réponse (id server) &#10;5. localStorage sync"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Error path</span>
        <span className="block text-[11px] text-muted">
          Que se passe-t-il si API timeout, DB fail, auth expirée ?
        </span>
        <textarea
          value={state.errorPath}
          onChange={(e) => onChange({ errorPath: e.target.value })}
          rows={3}
          placeholder="Ex: timeout >5s → retry auto 2x → toast user-friendly. Auth expired → redirect transparent. DB constraint → message spécifique."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      <div>
        <div className="text-xs font-semibold mb-2">Concurrency</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {CONCURRENCY.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onChange({ concurrency: c.value })}
              className={`text-left rounded-xl border p-2.5 transition ${
                state.concurrency === c.value
                  ? "bg-accent/10 border-accent"
                  : "bg-background border-border hover:border-accent/50"
              }`}
            >
              <div className="text-xs font-semibold mb-0.5">{c.label}</div>
              <div className="text-[11px] text-muted leading-relaxed">{c.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">State management</span>
        <span className="block text-[11px] text-muted">
          Où vit l&apos;état côté client ? localStorage, Zustand, Jotai, aucun…
        </span>
        <input
          type="text"
          value={state.stateManagement}
          onChange={(e) => onChange({ stateManagement: e.target.value })}
          placeholder="Ex: localStorage (prefs UI) + Supabase (source vérité) + useState local"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </section>
  );
}
