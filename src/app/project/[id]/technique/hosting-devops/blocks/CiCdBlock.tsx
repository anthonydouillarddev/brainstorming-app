"use client";

import type { CiCdTool, HostingState } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const TOOLS: { value: CiCdTool; label: string; hint: string }[] = [
  { value: "github-actions", label: "GitHub Actions", hint: "🔥 Gratuit pour repos publics + 2000 min/mois privés." },
  { value: "vercel-ci", label: "Vercel CI (auto)", hint: "Intégré à Vercel, pas de config." },
  { value: "gitlab-ci", label: "GitLab CI", hint: "Pour repos GitLab." },
  { value: "circleci", label: "CircleCI", hint: "Legacy, moins populaire 2026." },
  { value: "none", label: "Aucun", hint: "⚠️ Push direct main = risqué." },
];

export default function CiCdBlock({ state, onChange }: { state: HostingState; onChange: (p: Partial<HostingState>) => void; }) {
  const filled = (state.ciCdTool ? 1 : 0) + (state.runsLint ? 1 : 0) + (state.runsTypeCheck ? 1 : 0) + (state.runsTests ? 1 : 0);
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🔄 CI/CD pipeline</h3>
          <p className="text-xs text-muted mt-0.5">Vérifier lint/types/tests avant merge/deploy. Non-négociable.</p>
        </div>
        <BlockStatus filled={filled} total={4} />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {TOOLS.map((t) => (
          <button key={t.value} type="button" onClick={() => onChange({ ciCdTool: t.value })}
            className={`text-left rounded-xl border p-2.5 transition ${state.ciCdTool === t.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
            <div className="text-xs font-semibold mb-0.5">{t.label}</div>
            <div className="text-[11px] text-muted">{t.hint}</div>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.runsLint} onChange={(e) => onChange({ runsLint: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">Lint</div><div className="text-[11px] text-muted">ESLint strict</div></div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.runsTypeCheck} onChange={(e) => onChange({ runsTypeCheck: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">Type check</div><div className="text-[11px] text-muted">tsc --noEmit</div></div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.runsTests} onChange={(e) => onChange({ runsTests: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">Tests</div><div className="text-[11px] text-muted">Vitest / Playwright</div></div>
        </label>
      </div>
    </section>
  );
}
