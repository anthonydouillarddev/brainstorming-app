"use client";

import type { StrategyState } from "../state";
import BlockStatus from "../components/BlockStatus";

const BUDGETS: { value: StrategyState["budget"]; label: string }[] = [
  { value: "free", label: "Gratuit uniquement" },
  { value: "lt50", label: "< 50€/mois" },
  { value: "lt200", label: "< 200€/mois" },
  { value: "lt1000", label: "< 1000€/mois" },
  { value: "unlimited", label: "Illimité" },
];

const TTMS: { value: StrategyState["ttm"]; label: string }[] = [
  { value: "critical", label: "Critique (< 3 mois)" },
  { value: "important", label: "Important (3-6 mois)" },
  { value: "normal", label: "Normal (6-12 mois)" },
  { value: "flex", label: "Flexible" },
];

const TEAMS: { value: StrategyState["teamSize"]; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "2-3", label: "2-3 devs" },
  { value: "4-10", label: "4-10 devs" },
  { value: "10+", label: "10+ devs" },
];

const OPS: { value: StrategyState["operationalBurden"]; label: string }[] = [
  { value: "zero", label: "Zéro (platform-as-service)" },
  { value: "minimal", label: "Minimal (managed)" },
  { value: "acceptable", label: "Self-service ops" },
  { value: "high", label: "Complexe OK" },
];

const LOCKINS: { value: StrategyState["lockInTolerance"]; label: string }[] = [
  { value: "critical", label: "Critique d'éviter" },
  { value: "acceptable", label: "Acceptable avec raison" },
  { value: "none", label: "Pas une préoccupation" },
];

export default function ConstraintsBlock({
  state,
  onChange,
}: {
  state: StrategyState;
  onChange: (patch: Partial<StrategyState>) => void;
}) {
  const filled = [
    state.budget,
    state.ttm,
    state.teamSize,
    state.operationalBurden,
    state.lockInTolerance,
  ].filter((v) => v !== "").length;

  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">📌 Contraintes du projet</h3>
          <p className="text-xs text-muted mt-0.5">
            Nomme les vraies limites avant de choisir une techno. Ça évite les choix tech-driven.
          </p>
        </div>
        <BlockStatus filled={filled} total={5} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FieldChoice
          label="Budget mensuel outils"
          hint="Sans users = 0€. À 10K users ≈ 200-500€."
          value={state.budget}
          options={BUDGETS}
          onChange={(v) => onChange({ budget: v })}
        />
        <FieldChoice
          label="Time-to-market"
          hint="< 3 mois → oublie Rails. 6+ mois → tu peux explorer."
          value={state.ttm}
          options={TTMS}
          onChange={(v) => onChange({ ttm: v })}
        />
        <FieldChoice
          label="Taille équipe"
          hint="Solo = technos que tu maîtrises. À 3 = apprentissage partagé."
          value={state.teamSize}
          options={TEAMS}
          onChange={(v) => onChange({ teamSize: v })}
        />
        <FieldChoice
          label="Capacité ops & maintenance"
          hint="Pas de DevOps dispo → platform-as-service obligatoire."
          value={state.operationalBurden}
          options={OPS}
          onChange={(v) => onChange({ operationalBurden: v })}
        />
        <FieldChoice
          label="Vendor lock-in tolerance"
          hint="Supabase = Postgres (portable). Firebase = propriétaire."
          value={state.lockInTolerance}
          options={LOCKINS}
          onChange={(v) => onChange({ lockInTolerance: v })}
        />
      </div>
    </section>
  );
}

function FieldChoice<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: T | "";
  options: { value: T; label: string }[];
  onChange: (v: T | "") => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-foreground">{label}</span>
      {hint && <span className="block text-[11px] text-muted leading-relaxed">{hint}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "")}
        className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
      >
        <option value="">— Choisir —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
