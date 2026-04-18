import type { ArchitectureState } from "../state";

export function exportArchitectureClaudeBrief(
  state: ArchitectureState,
  projectName: string
): string {
  const lines: string[] = [];
  lines.push(`# Brief Claude — Architecture ${projectName}`);
  lines.push("");
  lines.push("Tu es un architecte logiciel senior. Voici le blueprint cadré.");
  lines.push("Aide-moi à (1) valider, (2) identifier les angles morts, (3) proposer le scaffold initial.");
  lines.push("");

  lines.push("## Pattern");
  if (state.pattern) lines.push(`- Pattern : ${state.pattern}`);
  if (state.patternRationale) lines.push(`- Rationale : ${state.patternRationale}`);
  lines.push("");

  lines.push("## Couches");
  if (state.frontendLayer) lines.push(`- Frontend : ${state.frontendLayer}`);
  if (state.apiLayer) lines.push(`- API : ${state.apiLayer}`);
  if (state.dataLayer) lines.push(`- Data : ${state.dataLayer}`);
  if (state.jobsLayer) lines.push(`- Jobs : ${state.jobsLayer}`);
  if (state.cacheLayer) lines.push(`- Cache : ${state.cacheLayer}`);
  lines.push("");

  if (state.happyPath) {
    lines.push("## Happy path");
    lines.push(state.happyPath);
    lines.push("");
  }

  const validEntities = state.entities.filter((e) => e.name.trim().length > 0);
  if (validEntities.length > 0) {
    lines.push("## Entités principales");
    for (const e of validEntities) {
      lines.push(`- ${e.name}${e.description ? ` — ${e.description}` : ""}`);
    }
    lines.push("");
  }

  lines.push("## Sécurité");
  if (state.authMethod) lines.push(`- Auth : ${state.authMethod}`);
  if (state.dataIsolation) lines.push(`- Isolation : ${state.dataIsolation}`);
  if (state.secretsMgmt) lines.push(`- Secrets : ${state.secretsMgmt}`);
  if (state.httpsEnforcement) lines.push(`- HTTPS : ${state.httpsEnforcement}`);
  lines.push("");

  lines.push("## Ce que je te demande");
  lines.push("1. Valide ou challenge le pattern architectural vs les couches.");
  lines.push("2. Génère un diagramme Mermaid C4 Containers complet avec tous les flux.");
  lines.push("3. Liste les bounded contexts DDD suggérés pour ce projet.");
  lines.push("4. Propose un scaffold initial (arbo de dossiers + fichiers clés).");
  lines.push("5. Identifie 3 pièges archi avec cette stack et comment les éviter.");

  return lines.join("\n");
}
