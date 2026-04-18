import type { CostsState } from "../state";

export function exportCostsClaudeBrief(state: CostsState, projectName: string): string {
  const l: string[] = [];
  l.push(`# Brief Claude — Coûts & Compliance ${projectName}`);
  l.push("Tu es expert SaaS monétisation + RGPD. Aide-moi à :");
  l.push("");
  if (state.arpuUsd) l.push(`- ARPU : $${state.arpuUsd}`);
  if (state.cacUsd) l.push(`- CAC : $${state.cacUsd}`);
  if (state.pricingStrategy) l.push(`- Pricing : ${state.pricingStrategy}`);
  if (state.paymentProcessor) l.push(`- Processor : ${state.paymentProcessor}`);
  l.push(`- Marché EU : ${state.marketIsEu ? "oui" : "non"}`);
  l.push("");
  l.push("## Ce que je te demande");
  l.push("1. Valide mon modèle unit economics (LTV:CAC > 3 ?).");
  l.push("2. Génère Privacy Policy FR template CNIL-friendly (2 pages).");
  l.push("3. Génère CGU/ToS starter.");
  l.push("4. Endpoint `/api/user/delete` scaffold (soft + hard delete J+30).");
  l.push("5. Cookies banner component minimal (opt-in RGPD).");
  l.push("6. Liste des DPA à signer (Supabase, Stripe, Vercel…).");
  return l.join("\n");
}
