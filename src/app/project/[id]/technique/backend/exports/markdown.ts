import type { BackendState } from "../state";

export function exportBackendMarkdown(state: BackendState, projectName: string): string {
  const lines: string[] = [];
  lines.push(`# ⚙️ Backend — ${projectName}`);
  lines.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  lines.push("");

  lines.push("## Pattern");
  if (state.pattern) lines.push(`- Pattern : ${state.pattern}`);
  if (state.patternRationale) lines.push(`- Rationale : ${state.patternRationale}`);
  lines.push("");

  lines.push("## Runtime");
  if (state.runtime) lines.push(`- Runtime : ${state.runtime}${state.runtimeVersion ? ` v${state.runtimeVersion}` : ""}`);
  if (state.runtimeFramework) lines.push(`- Framework : ${state.runtimeFramework}`);
  lines.push("");

  lines.push("## API style");
  if (state.apiStyle) lines.push(`- Style : ${state.apiStyle}`);
  if (state.apiVersioning) lines.push(`- Versioning : ${state.apiVersioning}`);
  lines.push(`- Validation server : ${state.useServerValidation ? "✅" : "❌"}`);
  lines.push("");

  lines.push("## Background jobs");
  if (state.jobs) lines.push(`- Solution : ${state.jobs}`);
  if (state.jobsNotes) lines.push(`- Notes : ${state.jobsNotes}`);

  return lines.join("\n");
}
