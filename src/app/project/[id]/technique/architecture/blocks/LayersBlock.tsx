"use client";

import { makeIntegrationId, type ArchitectureState, type Integration } from "../state";
import BlockStatus from "../components/BlockStatus";

const LAYERS: {
  key: keyof Pick<ArchitectureState, "frontendLayer" | "apiLayer" | "dataLayer" | "jobsLayer" | "cacheLayer">;
  label: string;
  emoji: string;
  placeholder: string;
  hint: string;
}[] = [
  {
    key: "frontendLayer",
    label: "Frontend",
    emoji: "🎨",
    placeholder: "Next.js 16 + Tailwind v4 + React 19",
    hint: "Ce que voit l'user, stack + déploiement",
  },
  {
    key: "apiLayer",
    label: "API",
    emoji: "🔌",
    placeholder: "Server Actions Next 16 (pas de backend séparé)",
    hint: "Comment frontend ↔ backend communiquent",
  },
  {
    key: "dataLayer",
    label: "Data / Storage",
    emoji: "🗄️",
    placeholder: "Supabase Postgres (RLS) + Supabase Storage",
    hint: "DB principale + storage fichiers",
  },
  {
    key: "jobsLayer",
    label: "Background Jobs",
    emoji: "⏱️",
    placeholder: "Vercel Cron / Inngest / Trigger.dev",
    hint: "Tâches async (emails, PDF, webhooks)",
  },
  {
    key: "cacheLayer",
    label: "Cache",
    emoji: "⚡",
    placeholder: "Edge cache Vercel + ISR + localStorage",
    hint: "HTTP cache / Redis / edge / in-memory",
  },
];

export default function LayersBlock({
  state,
  onChange,
}: {
  state: ArchitectureState;
  onChange: (patch: Partial<ArchitectureState>) => void;
}) {
  const filled = LAYERS.filter((l) => state[l.key].trim().length > 0).length;

  function addIntegration() {
    const next: Integration = { id: makeIntegrationId(), label: "", url: "" };
    onChange({ integrations: [...state.integrations, next] });
  }

  function updateIntegration(id: string, patch: Partial<Integration>) {
    onChange({
      integrations: state.integrations.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    });
  }

  function removeIntegration(id: string) {
    onChange({ integrations: state.integrations.filter((i) => i.id !== id) });
  }

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">📚 Couches techniques</h3>
          <p className="text-xs text-muted mt-0.5">
            Qui écrit quoi, où les données circulent. Prévient les fuites d&apos;abstraction.
          </p>
        </div>
        <BlockStatus filled={filled} total={LAYERS.length} />
      </div>

      <div className="space-y-3">
        {LAYERS.map((l) => (
          <label key={l.key} className="block space-y-1.5">
            <span className="text-xs font-semibold flex items-center gap-2">
              <span>{l.emoji}</span>
              <span>{l.label}</span>
              <span className="text-[10px] text-muted font-normal">— {l.hint}</span>
            </span>
            <input
              type="text"
              value={state[l.key]}
              onChange={(e) => onChange({ [l.key]: e.target.value } as Partial<ArchitectureState>)}
              placeholder={l.placeholder}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </label>
        ))}
      </div>

      {/* Integrations */}
      <div className="pt-2 border-t border-border space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold">🔗 Intégrations services tiers</span>
          <button
            type="button"
            onClick={addIntegration}
            className="text-[11px] px-2 py-1 rounded-lg bg-card border border-border hover:border-accent hover:text-accent transition"
          >
            + Ajouter
          </button>
        </div>
        <p className="text-[11px] text-muted">
          Services tiers reliés (Stripe, Resend, Anthropic, Sentry…). Détail complet dans chap 7.
        </p>
        {state.integrations.length > 0 && (
          <div className="space-y-1.5">
            {state.integrations.map((i) => (
              <div key={i.id} className="flex items-center gap-2">
                <input
                  type="text"
                  value={i.label}
                  onChange={(e) => updateIntegration(i.id, { label: e.target.value })}
                  placeholder="Nom (ex: Stripe)"
                  className="w-1/3 bg-background border border-border rounded-lg px-2 py-1 text-xs"
                />
                <input
                  type="url"
                  value={i.url}
                  onChange={(e) => updateIntegration(i.id, { url: e.target.value })}
                  placeholder="https://…"
                  className="flex-1 bg-background border border-border rounded-lg px-2 py-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => removeIntegration(i.id)}
                  className="text-xs text-muted hover:text-red-500 px-1"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
