import type { ProjectType } from "@/lib/types";

export function getArchitectureContextHint(type: ProjectType): string {
  const hints: Record<ProjectType, string> = {
    saas: "SaaS solo : modular monolith (Next.js + Supabase) recommandé. Éviter microservices avant 500k€ ARR.",
    outil: "Outil CLI : pas de backend, persistance locale (JSON/TOML). Modular monolith si GUI.",
    appli: "Appli mobile : client RN + API dédiée (Node/Hono). Offline-first + sync engine.",
    logiciel: "Logiciel desktop : Tauri/Electron + SQLite local + optionnel backend cloud.",
    business: "Business no-code : pas d'archi custom. Airtable + Make/Zapier orchestrent.",
  };
  return hints[type];
}
