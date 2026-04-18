// Estimateur de coûts live pour les services sélectionnés dans le chap 7 Services.
// Matrice de pricing 2026 basée sur les tarifs publics au moment de la recherche.
// À auditer annuellement (TECHNIQUE-DOUBLE-CHECK.md).

export type UserScale = "100" | "1k" | "10k" | "100k";

export interface ServicePricing {
  service: string; // nom service (doit matcher ce qui est stocké dans state.selections.selectedService)
  at100: number; // USD/mois à 100 users
  at1k: number;
  at10k: number;
  at100k: number;
  note?: string;
  hasFreeTier: boolean;
}

// Pricing conservateur 2026 (arrondi). Volumes = transactions typiques SaaS B2C.
export const PRICING_MATRIX: ServicePricing[] = [
  // Hosting
  { service: "Vercel", at100: 0, at1k: 20, at10k: 100, at100k: 500, hasFreeTier: true, note: "Hobby free, Pro $20/mo + usage" },
  { service: "Netlify", at100: 0, at1k: 19, at10k: 99, at100k: 500, hasFreeTier: true },
  { service: "Railway", at100: 5, at1k: 20, at10k: 100, at100k: 500, hasFreeTier: true },
  { service: "Render", at100: 7, at1k: 25, at10k: 120, at100k: 600, hasFreeTier: true },
  { service: "Fly.io", at100: 5, at1k: 25, at10k: 150, at100k: 800, hasFreeTier: true },
  { service: "Cloudflare Pages/Workers", at100: 0, at1k: 5, at10k: 50, at100k: 250, hasFreeTier: true, note: "Très généreux free tier" },
  // DB
  { service: "Supabase", at100: 0, at1k: 25, at10k: 100, at100k: 300, hasFreeTier: true },
  { service: "Neon", at100: 0, at1k: 19, at10k: 70, at100k: 400, hasFreeTier: true, note: "Usage-based serverless" },
  { service: "Turso", at100: 0, at1k: 10, at10k: 30, at100k: 150, hasFreeTier: true },
  { service: "PlanetScale Postgres", at100: 0, at1k: 39, at10k: 100, at100k: 500, hasFreeTier: true },
  // Payments (fees basées sur ARPU $10, conversion 5%)
  { service: "Stripe", at100: 3, at1k: 30, at10k: 300, at100k: 3000, hasFreeTier: false, note: "2.9% + 30¢ / transaction" },
  { service: "Paddle", at100: 5, at1k: 50, at10k: 500, at100k: 5000, hasFreeTier: false, note: "MoR 5% + $0.50" },
  { service: "LemonSqueezy", at100: 4, at1k: 40, at10k: 400, at100k: 4000, hasFreeTier: false, note: "MoR 3.5% + $0.50" },
  { service: "Polar.sh", at100: 4, at1k: 40, at10k: 400, at100k: 4000, hasFreeTier: false, note: "MoR 4% + $0.40" },
  // Email
  { service: "Resend", at100: 0, at1k: 5, at10k: 50, at100k: 500, hasFreeTier: true, note: "3k emails/mo free" },
  { service: "Postmark", at100: 10, at1k: 15, at10k: 75, at100k: 500, hasFreeTier: false },
  { service: "Loops", at100: 0, at1k: 10, at10k: 50, at100k: 300, hasFreeTier: true },
  // Observability
  { service: "Sentry", at100: 0, at1k: 29, at10k: 100, at100k: 400, hasFreeTier: true, note: "5k events/mo free" },
  { service: "PostHog", at100: 0, at1k: 0, at10k: 100, at100k: 450, hasFreeTier: true, note: "1M events/mo free" },
  { service: "PostHog Feature Flags", at100: 0, at1k: 0, at10k: 50, at100k: 200, hasFreeTier: true },
  { service: "Better Stack", at100: 0, at1k: 25, at10k: 50, at100k: 150, hasFreeTier: true },
  // AI / LLM (Claude Sonnet 4.6, assume 1 request/user/day avg 2k tokens avec caching 90%)
  { service: "Anthropic Claude Sonnet 4.6", at100: 2, at1k: 20, at10k: 200, at100k: 2000, hasFreeTier: false, note: "Avec prompt caching 90%" },
  { service: "Claude Sonnet 4.6", at100: 2, at1k: 20, at10k: 200, at100k: 2000, hasFreeTier: false },
  { service: "Claude Opus 4.7", at100: 5, at1k: 50, at10k: 500, at100k: 5000, hasFreeTier: false, note: "3x plus cher que Sonnet" },
  { service: "Claude Haiku 4.5", at100: 1, at1k: 5, at10k: 50, at100k: 500, hasFreeTier: false, note: "Le moins cher" },
  { service: "OpenAI GPT", at100: 3, at1k: 30, at10k: 300, at100k: 3000, hasFreeTier: false },
  { service: "Mistral", at100: 2, at1k: 15, at10k: 150, at100k: 1500, hasFreeTier: false, note: "EU-hosted" },
  { service: "Portkey", at100: 0, at1k: 19, at10k: 49, at100k: 199, hasFreeTier: true },
  { service: "OpenRouter", at100: 1, at1k: 10, at10k: 100, at100k: 1000, hasFreeTier: false, note: "Marge 5% sur API LLM" },
  // Dev tools (per-user/mo)
  { service: "Cursor 3", at100: 20, at1k: 20, at10k: 20, at100k: 20, hasFreeTier: true, note: "$20/mo flat solo" },
  { service: "Claude Code", at100: 10, at1k: 30, at10k: 50, at100k: 100, hasFreeTier: false, note: "Pay-per-use, estimation" },
  { service: "Windsurf", at100: 15, at1k: 15, at10k: 15, at100k: 15, hasFreeTier: true },
  { service: "GitHub Copilot", at100: 10, at1k: 10, at10k: 10, at100k: 10, hasFreeTier: false },
  // Support
  { service: "Crisp", at100: 0, at1k: 25, at10k: 95, at100k: 295, hasFreeTier: true },
  { service: "Plain", at100: 35, at1k: 35, at10k: 105, at100k: 350, hasFreeTier: false },
  { service: "Pylon", at100: 31, at1k: 31, at10k: 90, at100k: 300, hasFreeTier: false },
  // Compliance
  { service: "Vanta", at100: 400, at1k: 500, at10k: 800, at100k: 2000, hasFreeTier: false, note: "~$400-800/mo selon framework" },
  { service: "Drata", at100: 500, at1k: 700, at10k: 1000, at100k: 2500, hasFreeTier: false },
  // Domain (fixe)
  { service: "Cloudflare (domain)", at100: 1, at1k: 1, at10k: 1, at100k: 1, hasFreeTier: false, note: "~$10/an" },
  { service: "Namecheap (domain)", at100: 1, at1k: 1, at10k: 1, at100k: 1, hasFreeTier: false },
];

export interface CostBreakdown {
  service: string;
  cost: number;
  hasFreeTier: boolean;
  matched: boolean; // false si on n'a pas trouvé le pricing
}

export interface CostEstimate {
  scale: UserScale;
  total: number;
  breakdown: CostBreakdown[];
  unmatchedCount: number; // services sélectionnés sans pricing
}

// Cherche un service dans la matrice (match exact ou substring).
function findPricing(serviceName: string): ServicePricing | null {
  const normalized = serviceName.trim().toLowerCase();
  if (!normalized) return null;
  return (
    PRICING_MATRIX.find((p) => p.service.toLowerCase() === normalized) ??
    PRICING_MATRIX.find((p) => p.service.toLowerCase().includes(normalized) || normalized.includes(p.service.toLowerCase())) ??
    null
  );
}

export function estimateMonthlyCost(
  selectedServiceNames: string[],
  scale: UserScale
): CostEstimate {
  const scaleKey = scale === "100" ? "at100" : scale === "1k" ? "at1k" : scale === "10k" ? "at10k" : "at100k";
  const breakdown: CostBreakdown[] = [];
  let total = 0;
  let unmatchedCount = 0;

  for (const name of selectedServiceNames) {
    const pricing = findPricing(name);
    if (!pricing) {
      breakdown.push({ service: name, cost: 0, hasFreeTier: false, matched: false });
      unmatchedCount++;
      continue;
    }
    const cost = pricing[scaleKey];
    total += cost;
    breakdown.push({
      service: pricing.service,
      cost,
      hasFreeTier: pricing.hasFreeTier,
      matched: true,
    });
  }

  // Tri décroissant par coût
  breakdown.sort((a, b) => b.cost - a.cost);

  return { scale, total, breakdown, unmatchedCount };
}

export const SCALE_LABELS: Record<UserScale, string> = {
  "100": "100 users",
  "1k": "1 000 users",
  "10k": "10 000 users",
  "100k": "100 000 users",
};
