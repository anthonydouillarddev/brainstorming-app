export type DataMode = "beginner" | "intermediate";

export type DbEngine = "postgres" | "mysql" | "sqlite" | "mongodb" | "dynamodb" | "other" | "";
export type DbHosting = "supabase" | "neon" | "turso" | "planetscale" | "railway" | "fly" | "rds" | "self-host" | "other" | "";
export type OrmChoice = "none" | "drizzle" | "prisma" | "kysely" | "typeorm" | "sqlalchemy" | "ecto" | "other" | "";
export type MigrationsTool = "supabase-cli" | "prisma-migrate" | "drizzle-kit" | "atlas" | "knex" | "flyway" | "manual-sql" | "";
export type BackupFreq = "hourly" | "daily" | "weekly" | "none" | "";

export interface DataState {
  version: 1;
  dbEngine: DbEngine;
  dbEngineNotes: string;
  dbHosting: DbHosting;
  dbHostingNotes: string;
  orm: OrmChoice;
  useRls: boolean;
  cacheStrategy: string;
  migrationsTool: MigrationsTool;
  backupFreq: BackupFreq;
  pitrEnabled: boolean;
  restoreTested: boolean;
  backupNotes: string;
  modeUsed: DataMode;
  updatedAt: string;
}

export const DATA_SECTION_KEY = "tech-data";

export const DEFAULT_DATA_STATE: DataState = {
  version: 1,
  dbEngine: "",
  dbEngineNotes: "",
  dbHosting: "",
  dbHostingNotes: "",
  orm: "",
  useRls: false,
  cacheStrategy: "",
  migrationsTool: "",
  backupFreq: "",
  pitrEnabled: false,
  restoreTested: false,
  backupNotes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeDataState(partial: Partial<DataState> | null | undefined): DataState {
  if (!partial) return DEFAULT_DATA_STATE;
  return { ...DEFAULT_DATA_STATE, ...partial };
}

export function parseDataState(content: string | undefined | null): DataState {
  if (!content) return DEFAULT_DATA_STATE;
  try { return mergeDataState(JSON.parse(content)); } catch { return DEFAULT_DATA_STATE; }
}

export function computeDataCompleteness(state: DataState): number {
  let score = 0;
  if (state.dbEngine) score += 20;
  if (state.dbHosting) score += 20;
  if (state.orm) score += 15;
  if (state.useRls) score += 10;
  if (state.migrationsTool) score += 15;
  if (state.backupFreq && state.backupFreq !== "none") score += 10;
  if (state.pitrEnabled) score += 5;
  if (state.restoreTested) score += 5;
  return Math.min(100, Math.round(score));
}
