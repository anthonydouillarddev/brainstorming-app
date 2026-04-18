import type { BackendState } from "../state";

export function exportBackendClaudeBrief(state: BackendState, projectName: string): string {
  const lines: string[] = [];
  lines.push(`# Brief Claude — Scaffold Backend ${projectName}`);
  lines.push("Tu es un expert backend. Scaffold selon ces choix :");
  lines.push("");
  if (state.pattern) lines.push(`- Pattern : ${state.pattern}`);
  if (state.runtime) lines.push(`- Runtime : ${state.runtime}${state.runtimeVersion ? ` v${state.runtimeVersion}` : ""}`);
  if (state.runtimeFramework) lines.push(`- Framework : ${state.runtimeFramework}`);
  if (state.apiStyle) lines.push(`- API style : ${state.apiStyle}`);
  if (state.jobs) lines.push(`- Background jobs : ${state.jobs}`);
  lines.push(`- Validation server : ${state.useServerValidation ? "oui (Zod)" : "non"}`);
  lines.push("");
  lines.push("## Ce que je te demande");
  lines.push("1. Arbo de dossiers recommandée.");
  lines.push("2. Exemple d'endpoint (API route + validation Zod + appel DB).");
  lines.push("3. Exemple de background job (Inngest function ou cron).");
  lines.push("4. 3 pièges à éviter avec cette stack.");
  return lines.join("\n");
}
