import type { ProjectType } from "@/lib/types";
import type { StrategyState } from "./state";

// Templates de pré-remplissage selon le type de projet.
// N'applique qu'aux champs vides (ne pas écraser les saisies user).

export const TEMPLATE_HINTS: Record<ProjectType, Partial<StrategyState>> = {
  saas: {
    nonNegotiables: "GDPR-compliant · latency < 500ms · data exportable",
    acceptableTradeoffs: "UI basique pour ship rapidement · migration DB possible à M+6",
  },
  outil: {
    nonNegotiables: "CLI offline-first · export open formats",
    acceptableTradeoffs: "Pas de GUI · support plateforme limité (macOS/Linux)",
  },
  appli: {
    nonNegotiables: "Offline-first · sync conflict resolution · perf < 100ms",
    acceptableTradeoffs: "Feature parity iOS/Android décalée",
  },
  logiciel: {
    nonNegotiables: "Installeurs signés · auto-update · support Windows + macOS",
    acceptableTradeoffs: "Code signing cert payant · stack électronique lourde",
  },
  business: {
    nonNegotiables: "CGV FR · facturation légale · RGPD",
    acceptableTradeoffs: "No-code d'abord · migrer à du dev custom plus tard si traction",
  },
};

export function getStrategyContextHint(type: ProjectType): string {
  const hints: Record<ProjectType, string> = {
    saas: "SaaS : cible PME/solo/devs. TTM critique (< 3 mois) pour valider le marché. Stack Next+Supabase+Vercel recommandée.",
    outil: "Outil CLI / dev : cible power user. Privilégie la portabilité (npm/brew) et l'open source.",
    appli: "Appli mobile : cible B2C. Expo/React Native pour cross-platform. Offline-first obligatoire.",
    logiciel: "Logiciel desktop : cible pro (comptable, archi). Tauri/Electron. Code signing = budget.",
    business: "Business no-code : cible décideur. Zapier/Airtable first, dev custom après traction.",
  };
  return hints[type];
}
