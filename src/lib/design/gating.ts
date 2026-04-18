// Gating des chapitres Design selon le niveau d'expertise de l'user.
// Option 3 : le rôle (free/pro/vip) dicte l'expertise par défaut mais l'user peut override.
// Phase 1 (actuelle) : gating pédagogique (affichage) uniquement, pas de gating par plan.

import type { DesignChapterKey } from "@/app/project/[id]/design/chapters";
import type { ExperienceLevel, UserRole } from "@/lib/types";

// 6 chapitres essentiels pour un SaaS solo dev en mode Débutant.
// Les 6 autres (info-nav, principles, states, microcopy, adaptivity, validation)
// apparaissent à partir de Intermédiaire.
export const BEGINNER_CHAPTERS: readonly DesignChapterKey[] = [
  "foundations",
  "identity",
  "flows",
  "visual",
  "design-system",
  "a11y",
];

export const ALL_CHAPTERS: readonly DesignChapterKey[] = [
  "foundations",
  "identity",
  "info-nav",
  "flows",
  "principles",
  "visual",
  "design-system",
  "states",
  "microcopy",
  "a11y",
  "adaptivity",
  "validation",
];

// Chapitres à afficher selon le niveau d'expertise.
// Débutant = 6 essentiels · Intermédiaire/Expert = 12.
export function getActiveChapters(level: ExperienceLevel): readonly DesignChapterKey[] {
  return level === "beginner" ? BEGINNER_CHAPTERS : ALL_CHAPTERS;
}

export function isChapterActive(
  chapter: DesignChapterKey,
  level: ExperienceLevel
): boolean {
  return getActiveChapters(level).includes(chapter);
}

// Défaut expertise selon le rôle du user (option 3 — override possible).
// admin = Anthony → expert · free/demo = débutants · pro/vip = intermédiaires.
export const DEFAULT_EXPERIENCE_BY_ROLE: Record<UserRole, ExperienceLevel> = {
  admin: "expert",
  free: "beginner",
  demo: "beginner",
  pro: "intermediate",
  vip: "intermediate",
};

export const EXPERIENCE_LEVEL_META: Record<
  ExperienceLevel,
  { label: string; emoji: string; hint: string }
> = {
  beginner: {
    label: "Débutant",
    emoji: "🐣",
    hint: "6 chapitres essentiels · mode Débutant activé partout · tooltips explicatifs",
  },
  intermediate: {
    label: "Intermédiaire",
    emoji: "🧑‍💼",
    hint: "12 chapitres complets · mode Formulaire par défaut",
  },
  expert: {
    label: "Expert",
    emoji: "🚀",
    hint: "12 chapitres complets · vue dense · raccourcis prioritaires",
  },
};

export const EXPERIENCE_LEVELS: readonly ExperienceLevel[] = [
  "beginner",
  "intermediate",
  "expert",
];

export const EXPERIENCE_EVENT = "mindeck:experience-changed" as const;
export const EXPERIENCE_STORAGE_KEY = "mindeck_experience_level" as const;
