export type CostsMode = "beginner" | "intermediate";

export interface CostScaleRow {
  // Coût mensuel par service, à chaque palier de users
  service: string;
  at1: string; // @ 1 user
  at100: string;
  at1k: string;
  at10k: string;
  at100k: string;
}

export type PaymentProcessor = "stripe" | "paddle" | "lemonsqueezy" | "polar" | "none" | "";
export type PricingStrategy = "freemium" | "trial" | "tiered" | "usage-based" | "one-time" | "";

export interface CostsState {
  version: 1;
  // Bloc 1 — Coûts @ N users
  costs: CostScaleRow[];

  // Bloc 2 — Unit economics
  arpuUsd: string;
  cacUsd: string;
  lifetimeMonths: string;
  grossMarginPct: string;
  pricingStrategy: PricingStrategy;
  paymentProcessor: PaymentProcessor;

  // Bloc 3 — GDPR & Legal
  marketIsEu: boolean;
  privacyPolicyReady: boolean;
  termsOfServiceReady: boolean;
  cookiesBannerReady: boolean;
  dataExportEndpoint: boolean;
  dataDeleteEndpoint: boolean;
  dpaSigned: boolean;
  dataLocalityEu: boolean;
  notes: string;

  modeUsed: CostsMode;
  updatedAt: string;
}

export const COSTS_SECTION_KEY = "tech-costs-compliance";

export const DEFAULT_COST_ROWS: CostScaleRow[] = [
  { service: "Vercel", at1: "0", at100: "20", at1k: "50", at10k: "150", at100k: "500" },
  { service: "Supabase", at1: "0", at100: "25", at1k: "50", at10k: "100", at100k: "300" },
  { service: "Stripe fees (3%)", at1: "0", at100: "30", at1k: "300", at10k: "3000", at100k: "30000" },
  { service: "Resend", at1: "0", at100: "1", at1k: "5", at10k: "50", at100k: "500" },
  { service: "Anthropic Claude (cached)", at1: "0", at100: "2", at1k: "20", at10k: "200", at100k: "2000" },
  { service: "Domain", at1: "1", at100: "1", at1k: "1", at10k: "1", at100k: "1" },
];

export const DEFAULT_COSTS_STATE: CostsState = {
  version: 1,
  costs: DEFAULT_COST_ROWS,
  arpuUsd: "",
  cacUsd: "",
  lifetimeMonths: "",
  grossMarginPct: "",
  pricingStrategy: "",
  paymentProcessor: "",
  marketIsEu: true,
  privacyPolicyReady: false,
  termsOfServiceReady: false,
  cookiesBannerReady: false,
  dataExportEndpoint: false,
  dataDeleteEndpoint: false,
  dpaSigned: false,
  dataLocalityEu: false,
  notes: "",
  modeUsed: "intermediate",
  updatedAt: new Date().toISOString(),
};

export function mergeCostsState(partial: Partial<CostsState> | null | undefined): CostsState {
  if (!partial) return DEFAULT_COSTS_STATE;
  return {
    ...DEFAULT_COSTS_STATE,
    ...partial,
    costs: partial.costs && partial.costs.length > 0 ? partial.costs : DEFAULT_COST_ROWS,
  };
}

export function parseCostsState(content: string | undefined | null): CostsState {
  if (!content) return DEFAULT_COSTS_STATE;
  try { return mergeCostsState(JSON.parse(content)); } catch { return DEFAULT_COSTS_STATE; }
}

export function computeCostsCompleteness(state: CostsState): number {
  let score = 0;
  // Costs : au moins 3 services avec valeur @ 1k
  const filledCosts = state.costs.filter((c) => c.service.trim() && c.at1k.trim()).length;
  if (filledCosts >= 3) score += 20;

  // Unit economics : ARPU + CAC
  if (state.arpuUsd.trim()) score += 8;
  if (state.cacUsd.trim()) score += 8;
  if (state.lifetimeMonths.trim()) score += 4;
  if (state.grossMarginPct.trim()) score += 4;
  if (state.pricingStrategy) score += 6;
  if (state.paymentProcessor) score += 10;

  // GDPR & Legal (priorité si EU)
  const compliance = [state.privacyPolicyReady, state.termsOfServiceReady, state.cookiesBannerReady, state.dataExportEndpoint, state.dataDeleteEndpoint, state.dpaSigned, state.dataLocalityEu].filter(Boolean).length;
  score += compliance * 5;

  return Math.min(100, Math.round(score));
}
