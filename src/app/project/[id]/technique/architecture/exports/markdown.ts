import type { ArchitectureState } from "../state";

const PATTERN_LABEL: Record<string, string> = {
  "modular-monolith": "Modular Monolith",
  serverless: "Serverless",
  edge: "Edge",
  microservices: "Microservices",
  hybrid: "Hybrid",
};

const CONCURRENCY_LABEL: Record<string, string> = {
  optimistic: "Optimistic update",
  pessimistic: "Pessimistic lock",
  "event-sourced": "Event sourced",
  none: "Aucune",
};

const AUTH_LABEL: Record<string, string> = {
  "jwt-session": "JWT cookie session",
  oauth: "OAuth 2.1 + PKCE",
  "magic-link": "Magic link email",
  passkey: "Passkey WebAuthn",
  "api-key": "API key",
};

const ISOLATION_LABEL: Record<string, string> = {
  "rls-db": "RLS DB (Postgres policies)",
  "app-code": "Vérif code applicatif",
  both: "RLS + app code (défense en profondeur)",
};

const SECRETS_LABEL: Record<string, string> = {
  "env-vars": ".env.local",
  "vercel-secrets": "Vercel secrets",
  vault: "HashiCorp Vault",
  "secrets-manager": "Cloud Secrets Manager",
};

const HTTPS_LABEL: Record<string, string> = {
  always: "Always",
  "production-only": "Production only",
  optional: "Optional (⚠️)",
};

const PK_LABEL: Record<string, string> = {
  uuid: "UUID v4",
  serial: "Serial",
  nanoid: "nanoid",
  snowflake: "Snowflake",
};

export function exportArchitectureMarkdown(
  state: ArchitectureState,
  projectName: string
): string {
  const lines: string[] = [];
  lines.push(`# 🏛️ Architecture & Blueprint — ${projectName}`);
  lines.push("");
  lines.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  lines.push("");

  lines.push("## 🏗️ Pattern architectural");
  if (state.pattern) lines.push(`- **Pattern** : ${PATTERN_LABEL[state.pattern] ?? "—"}`);
  if (state.patternRationale) lines.push(`- **Rationale** : ${state.patternRationale}`);
  if (state.whenRevisit) lines.push(`- **When revisit** : ${state.whenRevisit}`);
  lines.push("");

  lines.push("## 📚 Couches techniques");
  if (state.frontendLayer) lines.push(`- **Frontend** : ${state.frontendLayer}`);
  if (state.apiLayer) lines.push(`- **API** : ${state.apiLayer}`);
  if (state.dataLayer) lines.push(`- **Data/Storage** : ${state.dataLayer}`);
  if (state.jobsLayer) lines.push(`- **Jobs** : ${state.jobsLayer}`);
  if (state.cacheLayer) lines.push(`- **Cache** : ${state.cacheLayer}`);
  if (state.integrations.length > 0) {
    lines.push("- **Intégrations** :");
    for (const i of state.integrations) {
      lines.push(`  - ${i.label}${i.url ? ` (${i.url})` : ""}`);
    }
  }
  lines.push("");

  lines.push("## 🔄 Flux de données");
  if (state.happyPath) {
    lines.push("**Happy path** :");
    lines.push("```");
    lines.push(state.happyPath);
    lines.push("```");
    lines.push("");
  }
  if (state.errorPath) {
    lines.push(`**Error path** : ${state.errorPath}`);
    lines.push("");
  }
  if (state.concurrency) lines.push(`- **Concurrency** : ${CONCURRENCY_LABEL[state.concurrency] ?? "—"}`);
  if (state.stateManagement) lines.push(`- **State management** : ${state.stateManagement}`);
  lines.push("");

  lines.push("## 🗂️ Modèle de données");
  const validEntities = state.entities.filter((e) => e.name.trim().length > 0);
  if (validEntities.length > 0) {
    lines.push("**Entités** :");
    for (const e of validEntities) {
      lines.push(`- \`${e.name}\`${e.description ? ` — ${e.description}` : ""}`);
    }
    lines.push("");
  }
  if (state.pkStrategy) lines.push(`- **PK strategy** : ${PK_LABEL[state.pkStrategy] ?? "—"}`);
  if (state.softDelete) lines.push(`- **Soft delete** : ${state.softDelete}`);
  if (state.erDiagramUrl) lines.push(`- **ER diagram** : ${state.erDiagramUrl}`);
  lines.push("");

  lines.push("## 🔒 Sécurité & Auth boundaries");
  if (state.authMethod) lines.push(`- **Auth method** : ${AUTH_LABEL[state.authMethod] ?? "—"}`);
  if (state.dataIsolation) lines.push(`- **Data isolation** : ${ISOLATION_LABEL[state.dataIsolation] ?? "—"}`);
  if (state.secretsMgmt) lines.push(`- **Secrets management** : ${SECRETS_LABEL[state.secretsMgmt] ?? "—"}`);
  if (state.httpsEnforcement) lines.push(`- **HTTPS enforcement** : ${HTTPS_LABEL[state.httpsEnforcement] ?? "—"}`);

  return lines.join("\n");
}
