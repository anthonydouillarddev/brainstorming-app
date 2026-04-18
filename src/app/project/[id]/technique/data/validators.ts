import type { DataState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue { severity: Severity; blockId: string; message: string; }

export function validateData(state: DataState): Issue[] {
  const issues: Issue[] = [];
  if (!state.dbEngine) issues.push({ severity: "error", blockId: "engine", message: "DB engine obligatoire." });
  if (state.dbEngine === "mongodb") issues.push({ severity: "warn", blockId: "engine", message: "MongoDB pour relations = regret #1 Indie Hackers. Postgres si data relationnelle." });
  if (!state.dbHosting) issues.push({ severity: "warn", blockId: "hosting", message: "Hosting DB non défini — Supabase recommandé solo." });
  if (state.orm === "prisma") issues.push({ severity: "info", blockId: "orm", message: "Prisma edge deployment = bundle 1.6MB. Drizzle si edge functions." });
  if (!state.useRls && (state.dbEngine === "postgres" || state.dbHosting === "supabase")) {
    issues.push({ severity: "warn", blockId: "orm", message: "RLS désactivée avec Postgres/Supabase = faille sécu potentielle." });
  }
  if (!state.migrationsTool) issues.push({ severity: "warn", blockId: "migrations", message: "Migrations tool non défini." });
  if (state.backupFreq === "none") issues.push({ severity: "error", blockId: "backups", message: "Aucun backup = catastrophe le jour J. Minimum daily." });
  if (state.backupFreq && !state.restoreTested) issues.push({ severity: "warn", blockId: "backups", message: "Backup jamais testé — restore qui échoue le jour J." });
  return issues;
}
