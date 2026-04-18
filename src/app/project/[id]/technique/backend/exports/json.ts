import type { BackendState } from "../state";

export function exportBackendJson(state: BackendState, projectName: string): string {
  return JSON.stringify(
    {
      project: projectName,
      exportedAt: new Date().toISOString(),
      version: state.version,
      pattern: { value: state.pattern, rationale: state.patternRationale },
      runtime: { name: state.runtime, version: state.runtimeVersion, framework: state.runtimeFramework },
      api: { style: state.apiStyle, versioning: state.apiVersioning, serverValidation: state.useServerValidation },
      jobs: { solution: state.jobs, notes: state.jobsNotes },
    },
    null,
    2
  );
}
