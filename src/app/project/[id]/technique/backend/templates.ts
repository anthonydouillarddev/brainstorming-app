import type { ProjectType } from "@/lib/types";

export function getBackendContextHint(type: ProjectType): string {
  const hints: Record<ProjectType, string> = {
    saas: "SaaS solo : BaaS pur (Supabase) ou BFF (Server Actions Next). Pas de backend Node séparé pour 95% des cas.",
    outil: "Outil CLI : pas de backend, runtime local uniquement.",
    appli: "Appli mobile : API dédiée (Hono/Fastify/NestJS) + base séparée.",
    logiciel: "Logiciel desktop : main process Electron ou Rust Tauri = ton backend local.",
    business: "Business no-code : pas de backend custom. Zapier/Make orchestre les APIs tierces.",
  };
  return hints[type];
}
