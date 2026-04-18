"use client";

import type { CostsState, PaymentProcessor, PricingStrategy } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const PROCESSORS: { value: PaymentProcessor; label: string; hint: string }[] = [
  { value: "stripe", label: "Stripe", hint: "🔥 Standard. 2.9% + 30¢. Tu gères TVA." },
  { value: "paddle", label: "Paddle", hint: "MoR 5%. Gère TVA EU + compliance." },
  { value: "lemonsqueezy", label: "LemonSqueezy", hint: "MoR 3.5%. Indie-friendly." },
  { value: "polar", label: "Polar.sh", hint: "MoR. Dev-first, moderne." },
  { value: "none", label: "Aucun", hint: "Gratuit / open-source." },
];

const STRATEGIES: { value: PricingStrategy; label: string; hint: string }[] = [
  { value: "freemium", label: "Freemium", hint: "Free tier + Pro. Low conversion (~2%)." },
  { value: "trial", label: "Trial 14-30 jours", hint: "Full access puis paywall. ~10% conversion." },
  { value: "tiered", label: "Tiered (Maker/Pro)", hint: "Plusieurs plans fixes." },
  { value: "usage-based", label: "Usage-based", hint: "$/event, metered billing." },
  { value: "one-time", label: "One-time purchase", hint: "Licence à vie / lifetime deal." },
];

export default function UnitEconomicsBlock({ state, onChange }: { state: CostsState; onChange: (p: Partial<CostsState>) => void; }) {
  const filled = (state.arpuUsd.trim() ? 1 : 0) + (state.cacUsd.trim() ? 1 : 0) + (state.lifetimeMonths.trim() ? 1 : 0) + (state.pricingStrategy ? 1 : 0) + (state.paymentProcessor ? 1 : 0);

  const arpu = Number(state.arpuUsd) || 0;
  const cac = Number(state.cacUsd) || 0;
  const lt = Number(state.lifetimeMonths) || 0;
  const ltv = arpu * lt;
  const ratio = cac > 0 ? (ltv / cac).toFixed(1) : "—";
  const payback = arpu > 0 && cac > 0 ? (cac / arpu).toFixed(1) : "—";

  return (
    <CollapsibleSection
      emoji="📈"
      title="Unit economics"
      description="ARPU × Lifetime = LTV. Cible LTV:CAC > 3x."
      filled={filled}
      total={5}
      storageKey="mindeck:technique:costs-compliance:unit:open"
    >

      <div className="grid sm:grid-cols-4 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">ARPU (USD/mo)</span>
          <input type="number" min={0} value={state.arpuUsd} onChange={(e) => onChange({ arpuUsd: e.target.value })}
            placeholder="10" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">CAC (USD)</span>
          <input type="number" min={0} value={state.cacUsd} onChange={(e) => onChange({ cacUsd: e.target.value })}
            placeholder="50" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Lifetime (mois)</span>
          <input type="number" min={0} value={state.lifetimeMonths} onChange={(e) => onChange({ lifetimeMonths: e.target.value })}
            placeholder="36" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Gross margin %</span>
          <input type="number" min={0} max={100} value={state.grossMarginPct} onChange={(e) => onChange({ grossMarginPct: e.target.value })}
            placeholder="70" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 text-xs bg-background/60 border border-border rounded-xl p-3">
        <div><span className="text-muted">LTV</span> : <span className="font-mono font-semibold">${ltv.toFixed(0)}</span></div>
        <div><span className="text-muted">LTV:CAC</span> : <span className={`font-mono font-semibold ${Number(ratio) >= 3 ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>{ratio}x</span></div>
        <div><span className="text-muted">Payback (mois)</span> : <span className="font-mono font-semibold">{payback}</span></div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Pricing strategy</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {STRATEGIES.map((s) => (
            <button key={s.value} type="button" onClick={() => onChange({ pricingStrategy: s.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.pricingStrategy === s.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-[11px] text-muted">{s.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">Payment processor</div>
        <div className="grid sm:grid-cols-3 gap-2">
          {PROCESSORS.map((p) => (
            <button key={p.value} type="button" onClick={() => onChange({ paymentProcessor: p.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.paymentProcessor === p.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{p.label}</div>
              <div className="text-[11px] text-muted">{p.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
}
