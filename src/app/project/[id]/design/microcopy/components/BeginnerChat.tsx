"use client";

import { useState } from "react";
import type { MicrocopyState } from "../state";
import { makeId } from "../state";
import {
  CTA_PRESETS,
  FORM_FIELD_PRESETS,
  GLOSSARY_PRESETS,
  INCLUSIVE_PRESETS,
  LENGTH_BUDGET_PRESETS,
  SYSTEM_MESSAGE_PRESETS,
  VOICE_TONE_PRESETS,
} from "../microcopy-library";

type Step =
  | "ctas"
  | "forms"
  | "system"
  | "glossary"
  | "voice"
  | "variants"
  | "budget"
  | "inclusive"
  | "done";

const STEPS: Step[] = [
  "ctas",
  "forms",
  "system",
  "glossary",
  "voice",
  "variants",
  "budget",
  "inclusive",
  "done",
];

export default function BeginnerChat({
  state,
  onChange,
  onSwitchMode,
}: {
  state: MicrocopyState;
  onChange: (patch: Partial<MicrocopyState>) => void;
  onSwitchMode: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(() => {
    if (state.ctas.length === 0) return 0;
    if (state.formFields.length === 0) return 1;
    if (state.systemMessages.length === 0) return 2;
    if (state.glossary.length === 0) return 3;
    if (state.voiceTones.length === 0) return 4;
    if (state.variantSets.length === 0) return 5;
    if (state.lengthBudgets.length === 0) return 6;
    if (state.inclusiveChecks.length === 0) return 7;
    return 8;
  });

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex(stepIndex + 1);
  }
  function prev() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  function seedCtas() {
    onChange({
      ctas: CTA_PRESETS.slice(0, 5).map((p) => ({ ...p, id: makeId("cta") })),
    });
  }
  function seedForms() {
    onChange({
      formFields: FORM_FIELD_PRESETS.slice(0, 3).map((p) => ({
        ...p,
        id: makeId("fld"),
      })),
    });
  }
  function seedSystem() {
    onChange({
      systemMessages: SYSTEM_MESSAGE_PRESETS.slice(0, 4).map((p) => ({
        ...p,
        id: makeId("sys"),
      })),
    });
  }
  function seedGlossary() {
    onChange({
      glossary: GLOSSARY_PRESETS.slice(0, 5).map((p) => ({
        ...p,
        id: makeId("glo"),
      })),
    });
  }

  function seedVoice() {
    onChange({
      voiceTones: VOICE_TONE_PRESETS.slice(0, 5).map((p) => ({
        ...p,
        id: makeId("voi"),
      })),
    });
  }

  function seedVariants() {
    onChange({
      variantSets: [
        {
          id: makeId("var"),
          placement: "cta-primary",
          context: "CTA submit formulaire login",
          baseline: "Se connecter",
          variants: [
            { text: "Connexion", rationale: "Plus direct" },
            { text: "Rejoindre", rationale: "Plus amical" },
          ],
          hypothesis: "Variante B (« Rejoindre ») améliore le CTR en onboarding",
          notes: "",
        },
        {
          id: makeId("var"),
          placement: "empty-headline",
          context: "Liste projets vide",
          baseline: "Crée ton premier projet",
          variants: [
            { text: "Prêt à démarrer ?", rationale: "Question engageante" },
          ],
          hypothesis: "Question > impératif pour activation",
          notes: "",
        },
      ],
    });
  }

  function seedBudget() {
    onChange({
      lengthBudgets: LENGTH_BUDGET_PRESETS.slice(0, 5).map((p) => ({
        ...p,
        id: makeId("bud"),
      })),
    });
  }

  function seedInclusive() {
    onChange({
      inclusiveChecks: INCLUSIVE_PRESETS.slice(0, 6).map((p) => ({
        id: makeId("inc"),
        axis: p.axis,
        rule: p.rule,
        status: "unknown" as const,
        note: "",
      })),
    });
  }

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

      {step === "ctas" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🎯 Étape 1 — CTA library</h2>
          <p className="text-sm text-muted leading-relaxed">
            Un CTA efficace = verbe d&apos;action + objet précis. Évite les « OK », « Valider »,
            « Continuer ». Mailchimp : <em>« Le bouton doit dire ce qui va se passer après le
            clic. »</em>
          </p>
          <button
            onClick={seedCtas}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 5 CTA types (login · inscription · annuler · supprimer · nouveau projet)
          </button>
          {state.ctas.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.ctas.length} CTA ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "forms" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📝 Étape 2 — Form microcopy</h2>
          <p className="text-sm text-muted leading-relaxed">
            Pour chaque champ : <strong>label</strong> (obligatoire, A11y),{" "}
            <strong>placeholder</strong> (illustratif, ≠ label),{" "}
            <strong>helper</strong> (pourquoi tu demandes),{" "}
            <strong>errors</strong> (required + invalid). Jamais le placeholder seul — il
            disparaît à la frappe.
          </p>
          <button
            onClick={seedForms}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 3 champs types (email · password · nom projet)
          </button>
          {state.formFields.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.formFields.length} champ(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "system" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">💬 Étape 3 — System messages</h2>
          <p className="text-sm text-muted leading-relaxed">
            Confirmations (surtout destructives), banners, tooltips, inline help. Règle Shopify :
            les dialogs destructifs doivent <strong>nommer l&apos;objet</strong> et avoir un CTA
            explicitement irréversible.
          </p>
          <button
            onClick={seedSystem}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 4 messages (destructif · publication · nouvelle version · quota)
          </button>
          {state.systemMessages.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.systemMessages.length} message(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "glossary" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📚 Étape 4 — Glossaire FR</h2>
          <p className="text-sm text-muted leading-relaxed">
            Ton dictionnaire do/don&apos;t. Objectif : <strong>cohérence</strong>. Même action,
            même mot. « Se connecter » ou « Connexion », pas les deux. Permet d&apos;onboarder
            rapidement un collab ou un LLM.
          </p>
          <button
            onClick={seedGlossary}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 5 entrées (Sign in · Login · Save · Sauver · Submit)
          </button>
          {state.glossary.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.glossary.length} entrée(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "voice" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🎭 Étape 5 — Voice &amp; Tone matrix</h2>
          <p className="text-sm text-muted leading-relaxed">
            Même marque, tons différents selon le contexte.{" "}
            <strong>Assertif</strong> en onboarding, <strong>calme</strong> en erreur,{" "}
            <strong>formel</strong> en billing. Avec exemples ✅ DO / 🚫 DON&apos;T.
          </p>
          <button
            onClick={seedVoice}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 5 contextes (onboarding · success · error · destructif · empty)
          </button>
          {state.voiceTones.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.voiceTones.length} contexte(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "variants" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🔀 Étape 6 — Copy variants (A/B)</h2>
          <p className="text-sm text-muted leading-relaxed">
            Pour chaque CTA / message-clé, une <strong>baseline</strong> + 1-3 alternatives avec
            rationale. Utile pour Optimizely, GrowthBook, ou juste trancher en équipe.
          </p>
          <button
            onClick={seedVariants}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 2 sets de variantes (CTA login + empty headline)
          </button>
          {state.variantSets.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.variantSets.length} set(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "budget" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">📏 Étape 7 — Length budgets</h2>
          <p className="text-sm text-muted leading-relaxed">
            Max caractères par placement (CTA 24, tooltip 80, toast 120…). Les autres blocks
            vérifient automatiquement vs ces budgets.
          </p>
          <button
            onClick={seedBudget}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 5 budgets (CTA, label, placeholder, helper, error)
          </button>
          {state.lengthBudgets.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.lengthBudgets.length} budget(s) ajouté(s).
            </div>
          )}
        </div>
      )}

      {step === "inclusive" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">🌈 Étape 8 — Inclusive language</h2>
          <p className="text-sm text-muted leading-relaxed">
            Checklist d&apos;inclusion : épicène, langage clair, évitement du jargon, niveau de
            lecture 3e. Un copy qui exclut = un user qui part.
          </p>
          <button
            onClick={seedInclusive}
            className="w-full text-sm font-medium px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition"
          >
            📦 Charger 6 règles de base
          </button>
          {state.inclusiveChecks.length > 0 && (
            <div className="text-xs text-green-600">
              ✓ {state.inclusiveChecks.length} règle(s) ajoutée(s).
            </div>
          )}
        </div>
      )}

      {step === "done" && (
        <div className="space-y-4 text-center py-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold">C&apos;est bouclé !</h2>
          <p className="text-sm text-muted max-w-lg mx-auto">
            Tu as les 8 familles de microcopy (MUST + SHOULD + NICE). Passe en mode Formulaire
            pour affiner, vérifier les checks d&apos;inclusion et utiliser les exports.
          </p>
          <button
            onClick={onSwitchMode}
            className="text-sm px-5 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-hover transition"
          >
            Passer en mode Formulaire
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className="text-sm px-4 py-2 rounded border border-border hover:bg-accent/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Précédent
        </button>
        <button
          onClick={next}
          disabled={stepIndex === STEPS.length - 1}
          className="text-sm px-4 py-2 rounded bg-accent text-white hover:bg-accent-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
