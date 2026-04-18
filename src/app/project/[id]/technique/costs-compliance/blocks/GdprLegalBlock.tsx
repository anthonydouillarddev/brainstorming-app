"use client";

import type { CostsState } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const GDPR_ITEMS: { key: keyof CostsState; label: string; hint: string }[] = [
  { key: "privacyPolicyReady", label: "Privacy Policy rédigée", hint: "Template CNIL disponible gratuit." },
  { key: "termsOfServiceReady", label: "CGU / ToS rédigées", hint: "Template Legalplace gratuit." },
  { key: "cookiesBannerReady", label: "Cookies banner (opt-in)", hint: "CNIL 2026 : 'Refuser' aussi visible que 'Accepter'." },
  { key: "dataExportEndpoint", label: "Export données user (Art. 20)", hint: "Endpoint JSON download." },
  { key: "dataDeleteEndpoint", label: "Suppression compte (Art. 17)", hint: "Soft-delete + hard-delete J+30." },
  { key: "dpaSigned", label: "DPA signés avec sous-traitants", hint: "Supabase, Stripe, Vercel = DPA auto-signé." },
  { key: "dataLocalityEu", label: "Data hébergée UE", hint: "Supabase Ireland, Neon EU. Évite Schrems II." },
];

export default function GdprLegalBlock({ state, onChange }: { state: CostsState; onChange: (p: Partial<CostsState>) => void; }) {
  const filled = GDPR_ITEMS.filter((g) => Boolean(state[g.key])).length;
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">⚖️ RGPD & Legal</h3>
          <p className="text-xs text-muted mt-0.5">Non-compliance = amende CNIL 4% CA. Minimum viable pour EU.</p>
        </div>
        <BlockStatus filled={filled} total={GDPR_ITEMS.length} />
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.marketIsEu} onChange={(e) => onChange({ marketIsEu: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div>
          <div className="text-xs font-semibold">Marché cible = Europe</div>
          <div className="text-[11px] text-muted">Active si tu as des users EU → RGPD obligatoire.</div>
        </div>
      </label>

      <div className="grid sm:grid-cols-2 gap-2">
        {GDPR_ITEMS.map((g) => (
          <label key={String(g.key)} className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
            <input
              type="checkbox"
              checked={Boolean(state[g.key])}
              onChange={(ev) => onChange({ [g.key]: ev.target.checked } as Partial<CostsState>)}
              className="h-4 w-4 rounded border-border mt-0.5"
            />
            <div>
              <div className="text-xs font-semibold">{g.label}</div>
              <div className="text-[11px] text-muted">{g.hint}</div>
            </div>
          </label>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes</span>
        <textarea value={state.notes} onChange={(e) => onChange({ notes: e.target.value })} rows={2}
          placeholder="Ex: Privacy Policy FR CNIL template + DPA Supabase EU Ireland. Cookies banner via Termly."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </section>
  );
}
