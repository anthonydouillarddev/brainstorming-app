"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import {
  makePersonaId,
  makePrincipleId,
  type FoundationsState,
} from "../state";

interface ChatStep {
  key: string;
  question: string;
  hint: string;
  example?: string;
  getValue: (state: FoundationsState) => string;
  apply: (state: FoundationsState, value: string) => Partial<FoundationsState>;
  optional?: boolean;
}

const STEPS: ChatStep[] = [
  {
    key: "jtbd",
    question: "Si ton produit disparaissait demain, qu'est-ce que les gens ne pourraient plus faire ?",
    hint: "Décris le progrès que cherche ton user dans sa vie. Pas une feature — un vrai résultat qui compte pour lui.",
    example:
      "Facturer ses clients sans se tromper quand il travaille sur plusieurs projets en parallèle",
    getValue: (s) => s.jtbdCore,
    apply: (_s, value) => ({ jtbdCore: value }),
  },
  {
    key: "persona-name",
    question: "Dessine la personne qui va adorer ton produit. Comment elle s'appelle ?",
    hint: "Un prénom réel, pas un personnage de film. Tu vas y revenir souvent.",
    example: "Paul",
    getValue: (s) => {
      const p = s.personas.find((x) => x.id === s.primaryPersonaId) ?? s.personas[0];
      return p?.name ?? "";
    },
    apply: (s, value) => {
      const existing = s.personas[0];
      if (existing) {
        return {
          personas: [{ ...existing, name: value }, ...s.personas.slice(1)],
        };
      }
      const id = makePersonaId();
      return {
        personas: [
          {
            id,
            name: value,
            avatarEmoji: "🧑",
            ageRange: "",
            context: "",
            goals: [],
            frustrations: [],
            techLevel: "intermédiaire",
          },
        ],
        primaryPersonaId: id,
      };
    },
  },
  {
    key: "persona-context",
    question: "Quelle est sa journée type ? Où est-elle quand elle utilise ton app ?",
    hint: "Situation concrète, pas une description RH. Raconte.",
    example:
      "Freelance, bosse seule depuis sa cuisine, jongle entre 3 projets client en parallèle",
    getValue: (s) => {
      const p = s.personas.find((x) => x.id === s.primaryPersonaId) ?? s.personas[0];
      return p?.context ?? "";
    },
    apply: (s, value) => {
      const p = s.personas[0];
      if (!p) return {};
      return { personas: [{ ...p, context: value }, ...s.personas.slice(1)] };
    },
  },
  {
    key: "persona-goal",
    question: "Quel est LE truc qu'elle veut accomplir grâce à ton produit ?",
    hint: "Un seul goal, le plus important. Tu en ajouteras d'autres plus tard.",
    example: "Facturer ses clients rapidement sans rien oublier",
    getValue: (s) => {
      const p = s.personas.find((x) => x.id === s.primaryPersonaId) ?? s.personas[0];
      return p?.goals[0] ?? "";
    },
    apply: (s, value) => {
      const p = s.personas[0];
      if (!p) return {};
      const goals = value ? [value, ...p.goals.slice(1)] : p.goals;
      return { personas: [{ ...p, goals }, ...s.personas.slice(1)] };
    },
  },
  {
    key: "persona-frustration",
    question: "Et là, aujourd'hui, qu'est-ce qui lui fait le plus rager ?",
    hint: "Sa frustration #1 sans ton produit. Cette douleur = ton angle d'attaque.",
    example: "Devoir copier-coller entre Excel et son mail pendant 2h chaque fin de mois",
    getValue: (s) => {
      const p = s.personas.find((x) => x.id === s.primaryPersonaId) ?? s.personas[0];
      return p?.frustrations[0] ?? "";
    },
    apply: (s, value) => {
      const p = s.personas[0];
      if (!p) return {};
      const frustrations = value ? [value, ...p.frustrations.slice(1)] : p.frustrations;
      return {
        personas: [{ ...p, frustrations }, ...s.personas.slice(1)],
      };
    },
  },
  {
    key: "aha-event",
    question: "Après quoi elle se dit « ah OK, c'est ça le truc » ? Décris l'action précise.",
    hint: "Un verbe d'action + un résultat concret. Pas un ressenti.",
    example: "Créer son premier projet et ajouter sa 1ère tâche",
    getValue: (s) => s.ahaMomentEvent,
    apply: (_s, value) => ({ ahaMomentEvent: value }),
  },
  {
    key: "aha-threshold",
    question: "En combien de temps / en combien de fois elle doit l'avoir fait pour devenir fan ?",
    hint: "Mets un chiffre. C'est ton seuil d'activation. Facebook = 7 amis en 10 jours, Slack = 2000 messages équipe.",
    example: "en moins de 3 minutes",
    getValue: (s) => s.ahaMomentThreshold,
    apply: (_s, value) => ({ ahaMomentThreshold: value }),
  },
  {
    key: "principle-1",
    question: "Quand tu dois choisir entre 2 trucs, tu privilégies toujours quoi ?",
    hint: "Format A > B. « Vitesse > Personnalisation » (Linear). « Clarté > Richesse » (Stripe). Ça doit trancher.",
    example: "Clarté > Richesse",
    getValue: (s) => s.designPrinciples[0]?.principle ?? "",
    apply: (s, value) => {
      const existing = s.designPrinciples[0];
      const next = { id: existing?.id ?? makePrincipleId(), principle: value, rationale: existing?.rationale ?? "" };
      return { designPrinciples: [next, ...s.designPrinciples.slice(1)] };
    },
  },
  {
    key: "principle-2",
    question: "Un deuxième trade-off qui te représente ?",
    hint: "Toujours format A > B. Doit trancher un choix concret.",
    example: "Vitesse > Complétude",
    optional: true,
    getValue: (s) => s.designPrinciples[1]?.principle ?? "",
    apply: (s, value) => {
      if (!value.trim() && s.designPrinciples.length <= 1) return {};
      const existing = s.designPrinciples[1];
      if (!value.trim() && existing) {
        return { designPrinciples: s.designPrinciples.filter((_, i) => i !== 1) };
      }
      const next = { id: existing?.id ?? makePrincipleId(), principle: value, rationale: existing?.rationale ?? "" };
      const copy = [...s.designPrinciples];
      if (existing) copy[1] = next;
      else copy.push(next);
      return { designPrinciples: copy };
    },
  },
  {
    key: "principle-3",
    question: "Un troisième ? (3 principes = le sweet spot selon Airbnb / Stripe / IBM)",
    hint: "Dernier trade-off. Après ça, on arrête — au-delà de 5, plus personne ne les retient.",
    example: "Action > Configuration",
    optional: true,
    getValue: (s) => s.designPrinciples[2]?.principle ?? "",
    apply: (s, value) => {
      if (!value.trim() && s.designPrinciples.length <= 2) return {};
      const existing = s.designPrinciples[2];
      if (!value.trim() && existing) {
        return { designPrinciples: s.designPrinciples.filter((_, i) => i !== 2) };
      }
      const next = { id: existing?.id ?? makePrincipleId(), principle: value, rationale: existing?.rationale ?? "" };
      const copy = [...s.designPrinciples];
      if (existing) copy[2] = next;
      else copy.push(next);
      return { designPrinciples: copy };
    },
  },
];

export default function BeginnerChat({
  state,
  project,
  onChange,
}: {
  state: FoundationsState;
  project: Project;
  onChange: (patch: Partial<FoundationsState>) => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    // Commence à la 1ère étape non remplie
    return Math.max(0, STEPS.findIndex((s) => !s.getValue(state).trim()));
  });
  const [draft, setDraft] = useState("");

  const step = STEPS[stepIndex] ?? STEPS[STEPS.length - 1];
  const currentValue = step.getValue(state);
  const editValue = draft || currentValue;

  function submit() {
    const value = (draft || currentValue).trim();
    if (!value && !step.optional) return;
    onChange(step.apply(state, value));
    setDraft("");
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }

  function skip() {
    if (step.optional && stepIndex < STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
      setDraft("");
    }
  }

  function prev() {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setDraft("");
    }
  }

  function useExample() {
    if (step.example) setDraft(step.example);
  }

  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);
  const isDone = stepIndex === STEPS.length - 1 && !!currentValue.trim();

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 md:p-8 space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">
            Étape {stepIndex + 1} / {STEPS.length}
          </span>
          <span className="font-mono text-muted">{progress}%</span>
        </div>
        <div className="h-2 bg-card border border-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg md:text-xl font-bold leading-snug">{step.question}</h2>
        <p className="text-sm text-muted">{step.hint}</p>
      </div>

      <textarea
        key={step.key}
        value={editValue}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={step.example || "Réponds ici..."}
        rows={3}
        className="w-full px-4 py-3 text-base rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/30"
        autoFocus
      />

      {step.example && !editValue.trim() && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 text-xs">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              <span className="text-accent font-semibold">💡 Exemple : </span>
              <span className="text-muted italic">{step.example}</span>
            </div>
            <button
              onClick={useExample}
              className="text-[11px] px-2 py-1 rounded bg-accent text-white hover:bg-accent-hover transition whitespace-nowrap"
            >
              Adapter cet exemple
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 flex-wrap pt-2">
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← Retour
        </button>
        <div className="flex items-center gap-2">
          {step.optional && (
            <button
              onClick={skip}
              className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition"
            >
              Passer
            </button>
          )}
          <button
            onClick={submit}
            disabled={!editValue.trim() && !step.optional}
            className="text-sm px-5 py-2 rounded bg-accent text-white hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isDone ? "✓ Terminer" : "Suivant →"}
          </button>
        </div>
      </div>

      {isDone && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-sm">
          🎉 <strong>Félicitations !</strong> Tu as posé les fondations de{" "}
          <strong>{project.official_name || project.name}</strong>. Passe en mode{" "}
          <strong>Intermédiaire</strong> ou <strong>Expert</strong> pour enrichir (job stories,
          positionnement, anti-goals, etc.) et exporter ton brief.
        </div>
      )}
    </div>
  );
}
