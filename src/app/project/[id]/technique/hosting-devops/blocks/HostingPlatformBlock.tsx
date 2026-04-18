"use client";

import type { HostingPlatform, HostingState } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const PLATFORMS: { value: HostingPlatform; label: string; score: string; hint: string }[] = [
  { value: "vercel", label: "Vercel", score: "🔥", hint: "Défaut Mindeck. Next.js native, Fluid Compute 2025." },
  { value: "netlify", label: "Netlify", score: "🔥", hint: "Similar Vercel, edge-first." },
  { value: "cloudflare-pages", label: "Cloudflare Pages/Workers", score: "🌱", hint: "Edge-first, pricing compétitif." },
  { value: "railway", label: "Railway", score: "🔥", hint: "Heroku replacement, git-push deploy." },
  { value: "render", label: "Render", score: "🔥", hint: "Heroku-like, workers + cron inclus." },
  { value: "fly", label: "Fly.io", score: "🔥", hint: "Edge global, Docker-based." },
  { value: "aws-amplify", label: "AWS Amplify", score: "🔥", hint: "AWS integrated, plus complexe." },
  { value: "self-host-coolify", label: "Self-host (Coolify)", score: "🌱", hint: "VPS + open-source, ops à gérer." },
  { value: "other", label: "Autre", score: "—", hint: "" },
];

export default function HostingPlatformBlock({ state, onChange }: { state: HostingState; onChange: (p: Partial<HostingState>) => void; }) {
  const filled = (state.platform ? 1 : 0) + (state.httpsAuto ? 1 : 0) + (state.hstsEnabled ? 1 : 0) + (state.domainProvider.trim() ? 1 : 0);
  return (
    <CollapsibleSection
      emoji="🚀"
      title="Plateforme d'hébergement"
      description="Où vit ton app sur internet."
      filled={filled}
      total={4}
      storageKey="mindeck:technique:hosting-devops:platform:open"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {PLATFORMS.map((p) => (
          <button key={p.value} type="button" onClick={() => onChange({ platform: p.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.platform === p.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
            <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{p.label}</span><span className="text-[10px]">{p.score}</span></div>
            <div className="text-[11px] text-muted">{p.hint}</div>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Registrar domaine</span>
          <input type="text" value={state.domainProvider} onChange={(e) => onChange({ domainProvider: e.target.value })}
            placeholder="Cloudflare / Namecheap / Porkbun"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold">Notes plateforme</span>
          <input type="text" value={state.platformNotes} onChange={(e) => onChange({ platformNotes: e.target.value })}
            placeholder="Region, plan, edge vs serverless…"
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.httpsAuto} onChange={(e) => onChange({ httpsAuto: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">HTTPS auto (Let&apos;s Encrypt)</div><div className="text-[11px] text-muted">Certificat SSL auto-renouvelé.</div></div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.hstsEnabled} onChange={(e) => onChange({ hstsEnabled: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">HSTS activé</div><div className="text-[11px] text-muted">max-age 1 an + includeSubDomains.</div></div>
        </label>
      </div>
    </CollapsibleSection>
  );
}
