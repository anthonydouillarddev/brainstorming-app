import type { FrontendState } from "../state";

export function exportFrontendJson(state: FrontendState, projectName: string): string {
  return JSON.stringify(
    {
      project: projectName,
      exportedAt: new Date().toISOString(),
      version: state.version,
      framework: {
        name: state.framework,
        version: state.frameworkVersion,
        notes: state.frameworkNotes,
      },
      rendering: {
        strategy: state.renderingStrategy,
        lcpTargetMs: state.perfTargetLcpMs ? Number(state.perfTargetLcpMs) : null,
        bundleTargetKb: state.perfTargetBundleKb ? Number(state.perfTargetBundleKb) : null,
        notes: state.renderingNotes,
      },
      styling: {
        approach: state.styling,
        useShadcn: state.useShadcn,
        extras: state.stylingExtras,
      },
      typescript: {
        strict: state.tsStrict,
        validation: state.validation,
        useTrpc: state.useTrpc,
        notes: state.validationNotes,
      },
    },
    null,
    2
  );
}
