// Gating des chapitres Technique selon le niveau d'expertise de l'user.
// Réutilise le type ExperienceLevel et le même pattern que src/lib/design/gating.ts.

import type { TechniqueChapterKey } from "@/app/project/[id]/technique/chapters";
import type { ExperienceLevel } from "@/lib/types";

// 6 chapitres essentiels pour un SaaS solo dev en mode Débutant (décision 2026-04-18).
// Les 6 autres (architecture, services, observability, ai-automation, costs-compliance, tooling)
// apparaissent à partir de Intermédiaire.
export const BEGINNER_CHAPTERS: readonly TechniqueChapterKey[] = [
  "strategy",
  "frontend",
  "backend",
  "data",
  "auth-security",
  "hosting-devops",
];

export const ALL_CHAPTERS: readonly TechniqueChapterKey[] = [
  "strategy",
  "architecture",
  "frontend",
  "backend",
  "data",
  "auth-security",
  "services",
  "hosting-devops",
  "observability",
  "ai-automation",
  "costs-compliance",
  "tooling",
];

// Chapitres à afficher selon le niveau d'expertise.
// Débutant = 6 essentiels · Intermédiaire/Expert = 12.
export function getActiveChapters(level: ExperienceLevel): readonly TechniqueChapterKey[] {
  return level === "beginner" ? BEGINNER_CHAPTERS : ALL_CHAPTERS;
}

export function isChapterActive(
  chapter: TechniqueChapterKey,
  level: ExperienceLevel
): boolean {
  return getActiveChapters(level).includes(chapter);
}
