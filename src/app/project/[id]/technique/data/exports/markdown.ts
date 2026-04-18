import type { DataState } from "../state";

export function exportDataMarkdown(state: DataState, projectName: string): string {
  const l: string[] = [];
  l.push(`# 🗄️ Data & Database — ${projectName}`);
  l.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  l.push("");
  l.push("## DB");
  if (state.dbEngine) l.push(`- Engine : ${state.dbEngine}`);
  if (state.dbHosting) l.push(`- Hosting : ${state.dbHosting}`);
  if (state.dbEngineNotes) l.push(`- Notes engine : ${state.dbEngineNotes}`);
  if (state.dbHostingNotes) l.push(`- Notes hosting : ${state.dbHostingNotes}`);
  l.push("");
  l.push("## ORM & cache");
  if (state.orm) l.push(`- ORM : ${state.orm}`);
  l.push(`- RLS : ${state.useRls ? "✅" : "❌"}`);
  if (state.cacheStrategy) l.push(`- Cache : ${state.cacheStrategy}`);
  l.push("");
  l.push("## Migrations & Backups");
  if (state.migrationsTool) l.push(`- Migrations : ${state.migrationsTool}`);
  if (state.backupFreq) l.push(`- Backup : ${state.backupFreq}`);
  l.push(`- PITR : ${state.pitrEnabled ? "✅" : "❌"}`);
  l.push(`- Restore testé : ${state.restoreTested ? "✅" : "❌"}`);
  if (state.backupNotes) l.push(`- Notes : ${state.backupNotes}`);
  return l.join("\n");
}
