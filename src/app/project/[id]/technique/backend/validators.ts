import type { BackendState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue { severity: Severity; blockId: string; message: string; }

export function validateBackend(state: BackendState): Issue[] {
  const issues: Issue[] = [];

  if (!state.pattern) {
    issues.push({ severity: "error", blockId: "pattern", message: "Pattern backend obligatoire." });
  }
  if (state.pattern === "api-only") {
    issues.push({
      severity: "info",
      blockId: "pattern",
      message: "API-only server : 95% des SaaS solo n'en ont pas besoin. BaaS/BFF suffisent.",
    });
  }

  if (!state.runtime) {
    issues.push({ severity: "warn", blockId: "runtime", message: "Runtime non défini." });
  }
  if (state.runtime === "rust") {
    issues.push({
      severity: "info",
      blockId: "runtime",
      message: "Rust solo = +50% TTM. Sûr ? Node/Bun/Python couvrent 99% des cas.",
    });
  }

  if (!state.apiStyle) {
    issues.push({
      severity: "warn",
      blockId: "api",
      message: "API style non défini — Server Actions recommandé pour SaaS Next.js.",
    });
  }
  if (state.apiStyle === "mixed") {
    issues.push({
      severity: "warn",
      blockId: "api",
      message: "Mixer REST + GraphQL + tRPC = cauchemar maintenance. Pick ONE.",
    });
  }
  if (!state.useServerValidation) {
    issues.push({
      severity: "error",
      blockId: "api",
      message: "Validation server désactivée — inputs malicieux accessibles à la DB.",
    });
  }

  if (!state.jobs) {
    issues.push({
      severity: "info",
      blockId: "jobs",
      message: "Background jobs non configurés — Vercel Cron suffit pour MVP simple.",
    });
  }
  if (state.jobs === "bullmq") {
    issues.push({
      severity: "warn",
      blockId: "jobs",
      message: "BullMQ self-host = Redis à gérer. Inngest (50k free) plus simple solo.",
    });
  }

  return issues;
}
