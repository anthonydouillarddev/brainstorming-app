"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Decision } from "@/lib/types";
import type { StrategyState } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const STACK_FIELDS: {
  key: keyof Pick<
    StrategyState,
    | "stackFrontend"
    | "stackBackend"
    | "stackDatabase"
    | "stackAuth"
    | "stackHosting"
    | "stackPayments"
    | "stackEmail"
    | "stackAi"
    | "stackMonitoring"
  >;
  label: string;
  placeholder: string;
}[] = [
  { key: "stackFrontend", label: "Frontend", placeholder: "Next.js 16 + Tailwind v4" },
  { key: "stackBackend", label: "Backend", placeholder: "Server Actions + Supabase" },
  { key: "stackDatabase", label: "Database", placeholder: "Postgres (Supabase) + RLS" },
  { key: "stackAuth", label: "Auth", placeholder: "Supabase Auth" },
  { key: "stackHosting", label: "Hosting", placeholder: "Vercel" },
  { key: "stackPayments", label: "Paiements", placeholder: "Stripe / Paddle MoR" },
  { key: "stackEmail", label: "Email", placeholder: "Resend" },
  { key: "stackAi", label: "IA", placeholder: "Anthropic Claude Sonnet 4.6" },
  { key: "stackMonitoring", label: "Monitoring", placeholder: "Sentry + PostHog" },
];

export default function DecisionBlock({
  projectId,
  state,
  onChange,
}: {
  projectId: string;
  state: StrategyState;
  onChange: (patch: Partial<StrategyState>) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [adrs, setAdrs] = useState<Decision[]>([]);
  const [pushing, setPushing] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  const stackCount = STACK_FIELDS.filter((f) => state[f.key].trim().length > 0).length;
  const filled =
    (state.decisionContext.trim() ? 1 : 0) +
    (stackCount >= 3 ? 1 : 0) +
    (state.keyRationale.trim().length >= 20 ? 1 : 0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase
        .from("decisions")
        .select("*")
        .eq("project_id", projectId)
        .order("decided_at", { ascending: false })
        .limit(20);
      if (!cancelled && data) setAdrs(data);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, supabase]);

  function applyAdr(adrId: string) {
    const adr = adrs.find((a) => a.id === adrId);
    if (!adr) {
      onChange({ linkedAdrId: null });
      return;
    }
    onChange({
      linkedAdrId: adr.id,
      decisionContext: adr.context ?? "",
      optionsEvaluated: adr.options ?? "",
      keyRationale: adr.rationale ?? "",
    });
  }

  async function archiveAsAdr() {
    if (pushing) return; // Guard re-entrance (double-click rapide)
    const title = `Stratégie technique — ${new Date().toLocaleDateString("fr-FR")}`;
    const stackSummary = STACK_FIELDS.filter((f) => state[f.key].trim().length > 0)
      .map((f) => `${f.label}: ${state[f.key]}`)
      .join("\n");

    setPushing(true);
    setPushMsg(null);
    const { data, error } = await supabase
      .from("decisions")
      .insert({
        project_id: projectId,
        title,
        context: state.decisionContext,
        options: state.optionsEvaluated,
        decision: stackSummary,
        rationale: state.keyRationale,
        decided_at: new Date().toISOString(),
      })
      .select()
      .single();

    setPushing(false);
    if (error || !data) {
      setPushMsg("❌ Erreur : " + (error?.message ?? "inconnue"));
      return;
    }
    setAdrs((prev) => [data, ...prev]);
    onChange({ linkedAdrId: data.id });
    setPushMsg("✅ ADR créée dans l'onglet Décisions");
  }

  return (
    <CollapsibleSection
      emoji="🧭"
      title="Décision (ADR léger)"
      description="Documente le pourquoi maintenant. Tu peux lier à une ADR existante ou en créer une."
      filled={filled}
      total={3}
      storageKey="mindeck:technique:strategy:decision:open"
    >
      {/* ADR picker */}
      {adrs.length > 0 && (
        <div className="bg-background/60 border border-border rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted shrink-0">📎 Lier à une ADR existante :</span>
          <select
            value={state.linkedAdrId ?? ""}
            onChange={(e) => applyAdr(e.target.value)}
            className="flex-1 min-w-[200px] bg-background border border-border rounded-lg px-2 py-1 text-xs"
          >
            <option value="">— Aucune (saisie libre) —</option>
            {adrs.map((adr) => (
              <option key={adr.id} value={adr.id}>
                {adr.title}
              </option>
            ))}
          </select>
          {state.linkedAdrId && (
            <span className="text-[10px] text-muted">
              Champs ci-dessous pré-remplis depuis l&apos;ADR.
            </span>
          )}
        </div>
      )}

      {/* Context */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Contexte</span>
        <span className="block text-[11px] text-muted">
          2-3 phrases : quelle était la question centrale ?
        </span>
        <textarea
          value={state.decisionContext}
          onChange={(e) => onChange({ decisionContext: e.target.value })}
          rows={2}
          placeholder="Ex: Solopreneur avec 3 mois validés, besoin MVP-to-PMF, maîtrise Next.js/TS..."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      {/* Options evaluated */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Options évaluées</span>
        <span className="block text-[11px] text-muted">
          Liste des stacks que tu as comparées avant de trancher.
        </span>
        <textarea
          value={state.optionsEvaluated}
          onChange={(e) => onChange({ optionsEvaluated: e.target.value })}
          rows={2}
          placeholder="Ex: Next+Supabase vs Django+PG vs SvelteKit+Firebase"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      {/* Stack choisie — 9 champs */}
      <div>
        <div className="text-xs font-semibold mb-2">Stack choisie ({stackCount}/9)</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {STACK_FIELDS.map((f) => (
            <label key={f.key} className="block text-[11px]">
              <span className="text-muted block mb-0.5">{f.label}</span>
              <input
                type="text"
                value={state[f.key]}
                onChange={(e) =>
                  onChange({ [f.key]: e.target.value } as Partial<StrategyState>)
                }
                placeholder={f.placeholder}
                className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Rationale */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Rationale *</span>
        <span className="block text-[11px] text-muted">
          Pourquoi ce choix en 2-3 phrases — te sauve des &quot;pourquoi pas X ?&quot; en M+6.
        </span>
        <textarea
          value={state.keyRationale}
          onChange={(e) => onChange({ keyRationale: e.target.value })}
          rows={3}
          placeholder="Ex: DX max (déjà capable) + TTM min (3 semaines) + cost scaling linéaire..."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      {/* Alternatives dismissed */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Alternatives écartées</span>
        <span className="block text-[11px] text-muted">Pourquoi PAS le second choix ?</span>
        <textarea
          value={state.alternativesDismissed}
          onChange={(e) => onChange({ alternativesDismissed: e.target.value })}
          rows={2}
          placeholder="Ex: Pas Django car +4 semaines learning curve + ops burden solo..."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      {/* Archive as ADR */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-border">
        <div className="text-[11px] text-muted">
          Une ADR = une décision archivée long-terme dans l&apos;onglet Décisions.
        </div>
        <div className="flex items-center gap-2">
          {pushMsg && <span className="text-xs">{pushMsg}</span>}
          <button
            type="button"
            onClick={archiveAsAdr}
            disabled={pushing || !state.keyRationale.trim()}
            className="text-xs px-3 py-1.5 rounded-xl bg-accent text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-hover transition"
          >
            {pushing ? "Création…" : "📌 Archiver comme ADR"}
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
}
