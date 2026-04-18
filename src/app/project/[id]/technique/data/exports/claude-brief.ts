import type { DataState } from "../state";

export function exportDataClaudeBrief(state: DataState, projectName: string): string {
  const l: string[] = [];
  l.push(`# Brief Claude — Setup DB ${projectName}`);
  l.push("Tu es un expert data. Génère le setup DB selon ces choix :");
  l.push("");
  if (state.dbEngine) l.push(`- Engine : ${state.dbEngine}`);
  if (state.dbHosting) l.push(`- Hosting : ${state.dbHosting}`);
  if (state.orm) l.push(`- ORM : ${state.orm}`);
  l.push(`- RLS : ${state.useRls ? "oui" : "non"}`);
  if (state.migrationsTool) l.push(`- Migrations : ${state.migrationsTool}`);
  if (state.backupFreq) l.push(`- Backup : ${state.backupFreq}, PITR ${state.pitrEnabled ? "oui" : "non"}`);
  l.push("");
  l.push("## Ce que je te demande");
  l.push("1. Schéma SQL starter pour un SaaS (users, projects, sections avec RLS).");
  l.push("2. Exemples de policies RLS (auth.uid() = user_id).");
  l.push("3. Commandes migrations + rollback.");
  l.push("4. Stratégie backup testable (+ pg_dump script).");
  l.push("5. 3 pièges classiques DB (RLS oubliée, N+1, sur-indexation).");
  return l.join("\n");
}
