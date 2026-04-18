import type { ProjectType } from "@/lib/types";

export function getFrontendContextHint(type: ProjectType): string {
  const hints: Record<ProjectType, string> = {
    saas: "SaaS : Next.js 16 + Tailwind v4 + React 19 = combo dominant 2026. LCP < 1.8s, bundle < 60KB.",
    outil: "Outil CLI : pas de frontend. Ignorer ce chap.",
    appli: "Appli mobile : Expo/React Native + NativeWind. Pas Next.js.",
    logiciel: "Logiciel desktop : Tauri + SvelteKit ou Electron + Next.",
    business: "Business : Astro (zéro JS) + Tailwind pour landings statiques.",
  };
  return hints[type];
}
