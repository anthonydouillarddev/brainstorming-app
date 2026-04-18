import type { DataState } from "../state";

export function exportDataJson(state: DataState, projectName: string): string {
  return JSON.stringify({
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    db: { engine: state.dbEngine, hosting: state.dbHosting, engineNotes: state.dbEngineNotes, hostingNotes: state.dbHostingNotes },
    orm: { choice: state.orm, useRls: state.useRls, cacheStrategy: state.cacheStrategy },
    ops: { migrationsTool: state.migrationsTool, backupFreq: state.backupFreq, pitrEnabled: state.pitrEnabled, restoreTested: state.restoreTested, backupNotes: state.backupNotes },
  }, null, 2);
}
