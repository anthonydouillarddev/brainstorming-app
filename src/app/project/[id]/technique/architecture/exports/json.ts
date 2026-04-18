import type { ArchitectureState } from "../state";

export function exportArchitectureJson(
  state: ArchitectureState,
  projectName: string
): string {
  const payload = {
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    pattern: {
      value: state.pattern,
      rationale: state.patternRationale,
      whenRevisit: state.whenRevisit,
    },
    layers: {
      frontend: state.frontendLayer,
      api: state.apiLayer,
      data: state.dataLayer,
      jobs: state.jobsLayer,
      cache: state.cacheLayer,
      integrations: state.integrations,
    },
    dataFlow: {
      happyPath: state.happyPath,
      errorPath: state.errorPath,
      concurrency: state.concurrency,
      stateManagement: state.stateManagement,
    },
    dataModel: {
      entities: state.entities.filter((e) => e.name.trim().length > 0),
      pkStrategy: state.pkStrategy,
      softDelete: state.softDelete,
      erDiagramUrl: state.erDiagramUrl,
    },
    security: {
      authMethod: state.authMethod,
      dataIsolation: state.dataIsolation,
      secretsMgmt: state.secretsMgmt,
      httpsEnforcement: state.httpsEnforcement,
    },
  };
  return JSON.stringify(payload, null, 2);
}
