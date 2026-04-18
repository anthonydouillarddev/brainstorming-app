import type { ArchitectureState } from "../state";

// Génère un diagramme Mermaid C4 Containers light-weight depuis le state.
// Rend un graph TB simple (Frontend → API → Data + Jobs + Integrations).

export function exportArchitectureMermaid(
  state: ArchitectureState,
  projectName: string
): string {
  const name = projectName.replace(/[^a-zA-Z0-9]/g, "_") || "App";
  const lines: string[] = [];
  lines.push("```mermaid");
  lines.push("graph TB");
  lines.push(`    User["👤 User"]`);

  const frontend = state.frontendLayer.trim() || "Frontend";
  const api = state.apiLayer.trim() || "API";
  const data = state.dataLayer.trim() || "Data";

  lines.push(`    Web["🌐 ${name}<br/>${escape(frontend)}"]`);
  lines.push(`    Api["🔌 ${escape(api)}"]`);
  lines.push(`    Db[("🗄️ ${escape(data)}")]`);

  lines.push(`    User -->|browse| Web`);
  lines.push(`    Web -->|requests| Api`);
  lines.push(`    Api -->|read/write| Db`);

  if (state.jobsLayer.trim()) {
    lines.push(`    Jobs["⏱️ ${escape(state.jobsLayer)}"]`);
    lines.push(`    Api -->|enqueue| Jobs`);
    lines.push(`    Jobs -->|read/write| Db`);
  }

  if (state.cacheLayer.trim()) {
    lines.push(`    Cache["⚡ ${escape(state.cacheLayer)}"]`);
    lines.push(`    Api <-->|cache| Cache`);
  }

  for (const i of state.integrations.filter((x) => x.label.trim())) {
    const id = i.label.replace(/[^a-zA-Z0-9]/g, "_");
    lines.push(`    Int_${id}["🔗 ${escape(i.label)}"]`);
    lines.push(`    Api -->|webhook/api| Int_${id}`);
  }

  lines.push("");
  lines.push("    classDef app fill:#4A90E2,color:#fff");
  lines.push("    classDef db fill:#3FBF7F,color:#fff");
  lines.push("    class Web,Api app");
  lines.push("    class Db db");
  lines.push("```");

  return lines.join("\n");
}

function escape(s: string): string {
  // Évite de casser la syntaxe Mermaid (guillemets + retours ligne)
  return s.replace(/"/g, "'").replace(/\n/g, " ").slice(0, 60);
}
