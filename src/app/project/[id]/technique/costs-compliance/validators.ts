import type { CostsState } from "./state";

export type Severity = "error" | "warn" | "info";
export interface Issue { severity: Severity; blockId: string; message: string; }

export function validateCosts(state: CostsState): Issue[] {
  const issues: Issue[] = [];
  if (state.marketIsEu) {
    if (!state.privacyPolicyReady) issues.push({ severity: "error", blockId: "gdpr", message: "Privacy Policy obligatoire (amende CNIL 4% CA)." });
    if (!state.cookiesBannerReady) issues.push({ severity: "error", blockId: "gdpr", message: "Cookies banner obligatoire — opt-in RGPD." });
    if (!state.dataDeleteEndpoint) issues.push({ severity: "warn", blockId: "gdpr", message: "Droit à l'oubli (Art. 17) — endpoint de suppression requis." });
    if (!state.dataLocalityEu) issues.push({ severity: "warn", blockId: "gdpr", message: "Data non-EU avec users EU = Schrems II issue." });
  }
  if (state.arpuUsd && state.cacUsd) {
    const arpu = Number(state.arpuUsd);
    const cac = Number(state.cacUsd);
    const lt = Number(state.lifetimeMonths) || 12;
    const ltv = arpu * lt;
    if (ltv / cac < 3) {
      issues.push({ severity: "warn", blockId: "unit", message: `LTV:CAC = ${(ltv / cac).toFixed(1)}x — cible >3x pour un SaaS viable.` });
    }
  }
  if (!state.paymentProcessor && state.arpuUsd) issues.push({ severity: "info", blockId: "unit", message: "Pricing défini mais pas de processor — Stripe ou Paddle (MoR EU)." });
  return issues;
}
