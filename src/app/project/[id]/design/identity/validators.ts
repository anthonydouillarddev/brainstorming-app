import type { ProjectType } from "@/lib/types";
import type { IdentityState } from "./state";

export type Severity = "ok" | "warn" | "error";

export interface IdentityIssue {
  id: string;
  severity: Severity;
  message: string;
  block: "archetype" | "voice" | "glossary" | "promise" | "tone" | "references";
}

const BUZZWORDS = [
  "leader",
  "innovant",
  "révolutionnaire",
  "solution",
  "unique",
  "disruptif",
  "synergie",
  "leverage",
  "game-changer",
  "premium",
];

export function validateGlossary(state: IdentityState): IdentityIssue[] {
  const out: IdentityIssue[] = [];
  const doSet = new Set(state.doWords.map((w) => w.toLowerCase().trim()));
  const overlap = state.dontWords.filter((w) => doSet.has(w.toLowerCase().trim()));
  for (const word of overlap) {
    out.push({
      id: `glossary-conflict-${word}`,
      severity: "error",
      block: "glossary",
      message: `« ${word} » est à la fois dans « On dit » ET « On ne dit jamais ». Choisis un camp.`,
    });
  }
  if (state.doWords.length > 0 && state.dontWords.length === 0) {
    out.push({
      id: "glossary-missing-donts",
      severity: "warn",
      block: "glossary",
      message: "Liste aussi ce que ta marque ne dit JAMAIS — ça te protège autant que tes « DO ».",
    });
  }
  return out;
}

export function validatePromise(state: IdentityState): IdentityIssue[] {
  const out: IdentityIssue[] = [];
  const promise = state.brandPromise.trim();
  if (!promise) return out;

  if (promise.split(/\s+/).length > 15) {
    out.push({
      id: "promise-too-long",
      severity: "warn",
      block: "promise",
      message: "Ta promise fait plus de 15 mots. Une promise forte tient en une phrase courte (Neumeier).",
    });
  }
  const lower = promise.toLowerCase();
  const foundBuzz = BUZZWORDS.filter((b) => lower.includes(b));
  for (const b of foundBuzz) {
    out.push({
      id: `promise-buzzword-${b}`,
      severity: "warn",
      block: "promise",
      message: `« ${b} » est un buzzword flou. Précise ou remplace (Frontify).`,
    });
  }
  return out;
}

export function validateToneMatrix(state: IdentityState): IdentityIssue[] {
  const out: IdentityIssue[] = [];
  const filled = state.toneMatrix.filter((r) => r.tone.trim() || r.exampleDo.trim()).length;
  if (filled > 0 && filled < 3) {
    out.push({
      id: "tone-incomplete",
      severity: "warn",
      block: "tone",
      message: "La tone matrix est vraiment utile à partir de 3 contextes (onboarding + erreur + succès minimum).",
    });
  }
  return out;
}

export function validateReferences(state: IdentityState): IdentityIssue[] {
  const out: IdentityIssue[] = [];
  const refNames = new Set(state.references.map((r) => r.name.toLowerCase().trim()).filter(Boolean));
  const conflicts = state.antiReferences.filter((r) =>
    refNames.has(r.name.toLowerCase().trim())
  );
  for (const c of conflicts) {
    out.push({
      id: `refs-conflict-${c.id}`,
      severity: "error",
      block: "references",
      message: `« ${c.name} » est à la fois dans tes références ET tes anti-références.`,
    });
  }
  return out;
}

export function validateSlidersExtremes(state: IdentityState): IdentityIssue[] {
  const out: IdentityIssue[] = [];
  const values = Object.values(state.voiceSliders);
  const allExtreme = values.every((v) => v === 0 || v === 100);
  const atLeastOneExtreme = values.some((v) => v === 0 || v === 100);
  const severalExtremes = values.filter((v) => v <= 5 || v >= 95).length >= 4;
  if (allExtreme || severalExtremes) {
    out.push({
      id: "voice-all-extreme",
      severity: "warn",
      block: "voice",
      message: "La plupart de tes sliders sont aux extrêmes. Un ton 100% neutre ou 100% caricatural n'existe pas — nuance.",
    });
  } else if (atLeastOneExtreme && state.archetypeKey) {
    // ok, acceptable
  }
  return out;
}

export function validateArchetypeVsType(
  state: IdentityState,
  projectType: ProjectType | null
): IdentityIssue[] {
  const out: IdentityIssue[] = [];
  if (!state.archetypeKey) return out;
  const seriousFunny = state.voiceSliders.seriousFunny;
  if (
    projectType === "logiciel" &&
    seriousFunny > 75
  ) {
    out.push({
      id: "type-mismatch-logiciel-funny",
      severity: "warn",
      block: "voice",
      message:
        "Logiciel métier + ton très humoristique = souvent contre-productif. Un logiciel de compta qui fait des blagues inspire peu confiance.",
    });
  }
  if (projectType === "business" && state.voiceSliders.respectfulIrreverent > 80) {
    out.push({
      id: "type-mismatch-business-irreverent",
      severity: "warn",
      block: "voice",
      message:
        "Business B2B + ton très irrévérencieux = risque de perdre des prospects traditionnels. À doser.",
    });
  }
  return out;
}

export function validateIdentity(
  state: IdentityState,
  projectType: ProjectType | null
): IdentityIssue[] {
  return [
    ...validateGlossary(state),
    ...validatePromise(state),
    ...validateToneMatrix(state),
    ...validateReferences(state),
    ...validateSlidersExtremes(state),
    ...validateArchetypeVsType(state, projectType),
  ];
}
