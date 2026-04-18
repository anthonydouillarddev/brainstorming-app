"use client";

import { useState } from "react";
import type { ArchitectureState } from "../state";

interface ChatStep {
  id: string;
  question: string;
  hint?: string;
  type: "text" | "choice";
  choices?: { value: string; label: string }[];
  apply: (answer: string) => Partial<ArchitectureState>;
}

const STEPS: ChatStep[] = [
  {
    id: "q1-pattern",
    question: "Quelle archi tu veux dessiner en premier ?",
    hint: "Solo + SaaS 2026 = modular monolith. Microservices = regret #1.",
    type: "choice",
    choices: [
      { value: "modular-monolith", label: "Modular Monolith (défaut solo)" },
      { value: "serverless", label: "Serverless (functions)" },
      { value: "edge", label: "Edge (Cloudflare Workers / Vercel Edge)" },
      { value: "microservices", label: "Microservices (overkill solo)" },
      { value: "hybrid", label: "Hybride" },
    ],
    apply: (v) => ({ pattern: v as ArchitectureState["pattern"] }),
  },
  {
    id: "q2-data-where",
    question: "Où vivent tes données au repos ?",
    hint: "Ex: Postgres Supabase, MongoDB, SQLite local + S3 pour fichiers",
    type: "text",
    apply: (v) => ({ dataLayer: v }),
  },
  {
    id: "q3-frontend",
    question: "Quelle stack pour l'UI que voit l'utilisateur ?",
    hint: "Ex: Next.js 16 + Tailwind v4 + React 19",
    type: "text",
    apply: (v) => ({ frontendLayer: v }),
  },
  {
    id: "q4-api",
    question: "Comment le frontend parle au backend ?",
    hint: "Ex: Server Actions Next / tRPC / REST / Supabase client direct",
    type: "text",
    apply: (v) => ({ apiLayer: v }),
  },
  {
    id: "q5-happy-path",
    question: "Raconte le parcours 'happy path' d'une action clé.",
    hint: "Ex: User clique 'Créer tâche' → UI optimistic → API → DB insert → merge réponse",
    type: "text",
    apply: (v) => ({ happyPath: v }),
  },
  {
    id: "q6-jobs",
    question: "Tu as des tâches async (envoi email, PDF, webhooks) ?",
    hint: "Si oui : Vercel Cron simple / Inngest / Trigger.dev. Sinon laisse vide.",
    type: "text",
    apply: (v) => ({ jobsLayer: v }),
  },
  {
    id: "q7-auth",
    question: "Comment tes users se connectent ?",
    type: "choice",
    choices: [
      { value: "jwt-session", label: "JWT en cookie (Supabase SSR default)" },
      { value: "oauth", label: "OAuth (Google/GitHub/...)" },
      { value: "magic-link", label: "Magic link email" },
      { value: "passkey", label: "Passkey WebAuthn (2026)" },
      { value: "api-key", label: "API key (outil)" },
    ],
    apply: (v) => ({ authMethod: v as ArchitectureState["authMethod"] }),
  },
  {
    id: "q8-isolation",
    question: "Comment tu isoles les données entre users ?",
    hint: "RLS DB = Row-Level Security Postgres (Supabase). Le plus robuste.",
    type: "choice",
    choices: [
      { value: "rls-db", label: "RLS DB (Postgres policies)" },
      { value: "app-code", label: "Vérif en code applicatif" },
      { value: "both", label: "Les deux (défense en profondeur)" },
    ],
    apply: (v) => ({ dataIsolation: v as ArchitectureState["dataIsolation"] }),
  },
];

export default function BeginnerChat({
  onApply,
}: {
  state: ArchitectureState;
  onApply: (patch: Partial<ArchitectureState>) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState("");

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  function submit(answer: string) {
    if (!answer.trim()) return;
    onApply(step.apply(answer));
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
