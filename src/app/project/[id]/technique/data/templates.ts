import type { ProjectType } from "@/lib/types";

export function getDataContextHint(type: ProjectType): string {
  const hints: Record<ProjectType, string> = {
    saas: "SaaS : Postgres + RLS = défense data par user. Supabase ou Neon recommandés.",
    outil: "Outil CLI : SQLite local, pas de serveur DB.",
    appli: "Appli offline-first : SQLite local + sync (Replicache, PowerSync).",
    logiciel: "Logiciel desktop : SQLite embarqué + optional cloud sync.",
    business: "Business no-code : Airtable/Notion = data + UI en une.",
  };
  return hints[type];
}
