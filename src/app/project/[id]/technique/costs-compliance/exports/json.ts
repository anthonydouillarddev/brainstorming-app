import type { CostsState } from "../state";

export function exportCostsJson(state: CostsState, projectName: string): string {
  const arpu = Number(state.arpuUsd) || 0;
  const lt = Number(state.lifetimeMonths) || 0;
  const cac = Number(state.cacUsd) || 0;
  const ltv = arpu * lt;
  return JSON.stringify({
    project: projectName,
    exportedAt: new Date().toISOString(),
    version: state.version,
    costs: state.costs,
    unitEconomics: {
      arpu,
      cac,
      lifetimeMonths: lt,
      ltv,
      ltvCacRatio: cac > 0 ? ltv / cac : null,
      grossMarginPct: state.grossMarginPct ? Number(state.grossMarginPct) : null,
      pricingStrategy: state.pricingStrategy,
      paymentProcessor: state.paymentProcessor,
    },
    compliance: {
      marketIsEu: state.marketIsEu,
      privacyPolicyReady: state.privacyPolicyReady,
      termsOfServiceReady: state.termsOfServiceReady,
      cookiesBannerReady: state.cookiesBannerReady,
      dataExportEndpoint: state.dataExportEndpoint,
      dataDeleteEndpoint: state.dataDeleteEndpoint,
      dpaSigned: state.dpaSigned,
      dataLocalityEu: state.dataLocalityEu,
      notes: state.notes,
    },
  }, null, 2);
}
