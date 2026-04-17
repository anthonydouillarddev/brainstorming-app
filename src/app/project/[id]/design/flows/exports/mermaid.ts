import type { FlowsState } from "../state";

// Génère un diagramme Mermaid flowchart à partir des étapes + branches.
// Format : flowchart TD (top-down). Aha moment = node stylé.
export function exportFlowsMermaid(state: FlowsState): string {
  if (state.steps.length === 0) {
    return "flowchart TD\n  Empty[Aucune étape définie]";
  }

  const lines: string[] = [];
  lines.push("```mermaid");
  lines.push("flowchart TD");

  const nodeId = (id: string) => id.replace(/[^a-zA-Z0-9]/g, "_");

  // Nodes
  for (const s of state.steps) {
    const label = (s.label || "(sans nom)").replace(/"/g, "'");
    const emoji = s.isAhaMoment ? "⭐ " : "";
    const shape = s.isAhaMoment ? `{{"${emoji}${label}"}}` : `["${label}"]`;
    lines.push(`  ${nodeId(s.id)}${shape}`);
  }

  // Linear edges (step i → step i+1)
  for (let i = 0; i < state.steps.length - 1; i++) {
    lines.push(`  ${nodeId(state.steps[i].id)} --> ${nodeId(state.steps[i + 1].id)}`);
  }

  // Branches
  for (const b of state.branches) {
    const from = nodeId(b.fromStepId);
    const to = b.toStepId ? nodeId(b.toStepId) : `END_${nodeId(b.id)}`;
    if (!b.toStepId) {
      lines.push(`  ${to}((Fin))`);
    }
    const condition = (b.condition || "?").replace(/"/g, "'");
    lines.push(`  ${from} -.->|${condition}| ${to}`);
  }

  // Style aha moment
  const ahaStep = state.steps.find((s) => s.isAhaMoment);
  if (ahaStep) {
    lines.push(`  style ${nodeId(ahaStep.id)} fill:#fbbf24,stroke:#d97706,color:#000`);
  }

  lines.push("```");
  return lines.join("\n");
}
