import type { CostsState } from "../state";

export function exportCostsMarkdown(state: CostsState, projectName: string): string {
  const l: string[] = [];
  l.push(`# 💰 Coûts & Compliance — ${projectName}`);
  l.push(`_Exporté le ${new Date().toLocaleDateString("fr-FR")}_`);
  l.push("");
  l.push("## Coûts mensuels @ N users");
  l.push("| Service | @1 | @100 | @1k | @10k | @100k |");
  l.push("|---|---:|---:|---:|---:|---:|");
  for (const c of state.costs) {
    if (!c.service.trim()) continue;
    l.push(`| ${c.service} | $${c.at1 || "—"} | $${c.at100 || "—"} | $${c.at1k || "—"} | $${c.at10k || "—"} | $${c.at100k || "—"} |`);
  }
  const totals = {
    at1: state.costs.reduce((s, c) => s + (Number(c.at1) || 0), 0),
    at100: state.costs.reduce((s, c) => s + (Number(c.at100) || 0), 0),
    at1k: state.costs.reduce((s, c) => s + (Number(c.at1k) || 0), 0),
    at10k: state.costs.reduce((s, c) => s + (Number(c.at10k) || 0), 0),
    at100k: state.costs.reduce((s, c) => s + (Number(c.at100k) || 0), 0),
  };
  l.push(`| **Total** | **$${totals.at1}** | **$${totals.at100}** | **$${totals.at1k}** | **$${totals.at10k}** | **$${totals.at100k}** |`);
  l.push("");

  l.push("## Unit economics");
  const arpu = Number(state.arpuUsd) || 0;
  const cac = Number(state.cacUsd) || 0;
  const lt = Number(state.lifetimeMonths) || 0;
  const ltv = arpu * lt;
  if (arpu) l.push(`- ARPU : $${arpu}/mo`);
  if (cac) l.push(`- CAC : $${cac}`);
  if (lt) l.push(`- Lifetime : ${lt} mois`);
  if (ltv) l.push(`- LTV : $${ltv.toFixed(0)}`);
  if (cac && ltv) l.push(`- LTV:CAC : ${(ltv / cac).toFixed(1)}x`);
  if (state.grossMarginPct) l.push(`- Gross margin : ${state.grossMarginPct}%`);
  if (state.pricingStrategy) l.push(`- Pricing : ${state.pricingStrategy}`);
  if (state.paymentProcessor) l.push(`- Processor : ${state.paymentProcessor}`);
  l.push("");

  l.push("## RGPD & Legal");
  l.push(`- Marché EU : ${state.marketIsEu ? "✅" : "❌"}`);
  l.push(`- Privacy Policy : ${state.privacyPolicyReady ? "✅" : "❌"}`);
  l.push(`- CGU/ToS : ${state.termsOfServiceReady ? "✅" : "❌"}`);
  l.push(`- Cookies banner : ${state.cookiesBannerReady ? "✅" : "❌"}`);
  l.push(`- Data export endpoint : ${state.dataExportEndpoint ? "✅" : "❌"}`);
  l.push(`- Data delete endpoint : ${state.dataDeleteEndpoint ? "✅" : "❌"}`);
  l.push(`- DPA signés : ${state.dpaSigned ? "✅" : "❌"}`);
  l.push(`- Data locality EU : ${state.dataLocalityEu ? "✅" : "❌"}`);
  if (state.notes) { l.push(""); l.push(`Notes : ${state.notes}`); }
  return l.join("\n");
}
