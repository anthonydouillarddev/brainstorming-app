"use client";

import { useState } from "react";
import type { StrategyState } from "../state";

// 10 questions zéro-jargon qui remplissent progressivement le state.
// Chaque question = 1 champ à remplir. UX : chat simple avec bulles + input.

interface ChatStep {
  id: string;
  question: string;
  hint?: string;
  type: "text" | "choice";
  choices?: { value: string; label: string }[];
  apply: (answer: string, state: StrategyState) => Partial<StrategyState>;
}

const STEPS: ChatStep[] = [
  {
    id: "q1-ttm",
    question: "Combien de temps tu peux investir avant d'avoir tes premiers clients ?",
    hint: "< 3 mois = apprendre vite, pas de tech complexe. 6+ mois = tu peux explorer.",
    type: "choice",
    choices: [
      { value: "critical", label: "< 3 mois (critique)" },
      { value: "important", label: "3-6 mois (important)" },
      { value: "normal", label: "6-12 mois (normal)" },
      { value: "flex", label: "Flexible, pas pressé" },
    ],
    apply: (v) => ({ ttm: v as StrategyState["ttm"] }),
  },
  {
    id: "q2-team",
    question: "Vous êtes combien à coder dessus ?",
    type: "choice",
    choices: [
      { value: "solo", label: "Solo (juste moi)" },
      { value: "2-3", label: "2-3 devs" },
      { value: "4-10", label: "4-10 devs" },
      { value: "10+", label: "10+ devs" },
    ],
    apply: (v) => ({ teamSize: v as StrategyState["teamSize"] }),
  },
  {
    id: "q3-budget",
    question: "Quel budget mensuel max pour les outils (serveur, DB, emails…) ?",
    hint: "Sans utilisateurs = gratuit. À 10K users, pense 200-500€/mois.",
    type: "choice",
    choices: [
      { value: "free", label: "Gratuit uniquement" },
      { value: "lt50", label: "< 50€/mois" },
      { value: "lt200", label: "< 200€/mois" },
      { value: "lt1000", label: "< 1000€/mois" },
      { value: "unlimited", label: "Illimité" },
    ],
    apply: (v) => ({ budget: v as StrategyState["budget"] }),
  },
  {
    id: "q4-ops",
    question: "Tu peux gérer de l'infra (serveurs, backups, scaling) toi-même ?",
    hint: "Solo + pas de DevOps dispo = platform-as-service obligatoire.",
    type: "choice",
    choices: [
      { value: "zero", label: "Zéro — platform-as-service obligatoire" },
      { value: "minimal", label: "Minimal — managed services OK" },
      { value: "acceptable", label: "Acceptable — self-service ops" },
      { value: "high", label: "Je gère complexe" },
    ],
    apply: (v) => ({ operationalBurden: v as StrategyState["operationalBurden"] }),
  },
  {
    id: "q5-lockin",
    question: "Si tu dois changer de DB ou d'hébergeur dans 2 ans, c'est un problème ?",
    hint: "Supabase = Postgres (portable). Firebase = propriétaire (risqué à grosse échelle).",
    type: "choice",
    choices: [
      { value: "critical", label: "Critique d'éviter le lock-in" },
      { value: "acceptable", label: "Acceptable avec raison" },
      { value: "none", label: "Pas une préoccupation" },
    ],
    apply: (v) => ({ lockInTolerance: v as StrategyState["lockInTolerance"] }),
  },
  {
    id: "q6-metric",
    question: "Quelle métrique te dit 'j'ai gagné' ?",
    hint: "Ex: ARR 50k · Rétention 40% · 10k users · Latence < 100ms",
    type: "text",
    apply: (v) => ({ coreMetric: v }),
  },
  {
    id: "q7-scale",
    question: "Combien d'utilisateurs d'ici 12 mois ?",
    type: "choice",
    choices: [
      { value: "100", label: "100 users" },
      { value: "1k", label: "1 000 users" },
      { value: "10k", label: "10 000 users" },
      { value: "100k", label: "100 000 users" },
      { value: "1m", label: "1M+ users" },
      { value: "unknown", label: "Je ne sais pas encore" },
    ],
    apply: (v) => ({ scaleHorizonUsers: v as StrategyState["scaleHorizonUsers"] }),
  },
  {
    id: "q8-nonneg",
    question: "Il y a des contraintes non-négociables (GDPR, perf, sécu) ?",
    hint: "Ex: données chiffrées · latence < 100ms · GDPR-compliant",
    type: "text",
    apply: (v) => ({ nonNegotiables: v }),
  },
  {
    id: "q9-rationale",
    question: "Si tu devais choisir ta stack en 3 phrases, c'est quoi et pourquoi ?",
    hint: "Rationale clé à documenter pour pas te poser la question en M+6.",
    type: "text",
    apply: (v) => ({ keyRationale: v }),
  },
  {
    id: "q10-alternatives",
    question: "Quelle(s) stack(s) tu as écartée(s) et pourquoi ?",
    hint: "Ex: Pas Django car +4 semaines learning curve.",
    type: "text",
    apply: (v) => ({ alternativesDismissed: v }),
  },
];

export default function BeginnerChat({
  state,
  onApply,
}: {
  state: StrategyState;
  onApply: (patch: Partial<StrategyState>) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState("");

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  function submit(answer: string) {
    if (!answer.trim()) return;
    onApply(step.apply(answer, state));
    setDraft("");
    if (!isLast) setStepIndex((i) => i + 1);
  }

  return (
    <div className="bg-card/60 border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted">
          Question {stepIndex + 1} / {STEPS.length}
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 w-5 rounded-full ${
                i < stepIndex ? "bg-accent" : i === stepIndex ? "bg-accent/60" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4">
        <div className="text-sm font-semibold mb-1.5">{step.question}</div>
        {step.hint && <div className="text-xs text-muted leading-relaxed">{step.hint}</div>}
      </div>

      {step.type === "choice" && step.choices ? (
        <div className="grid gap-2">
          {step.choices.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => submit(c.value)}
              className="text-left px-4 py-2.5 rounded-xl border border-border bg-card hover:border-accent hover:bg-accent/5 transition text-sm"
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(draft);
            }}
            placeholder="Ta réponse…"
            rows={2}
            className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <button
            type="button"
            onClick={() => submit(draft)}
            disabled={!draft.trim()}
            className="px-4 py-2 bg-accent text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-hover transition"
          >
            Envoyer
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={stepIndex === 0}
          className="text-xs text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1))}
          disabled={isLast}
          className="text-xs text-muted hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Passer →
        </button>
      </div>
    </div>
  );
}
