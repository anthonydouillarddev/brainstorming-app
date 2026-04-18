"use client";

import type { OS } from "@/lib/technique/tooling-presets";
import type { ToolingState } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const OS_OPTIONS: { value: OS; label: string; hint: string }[] = [
  { value: "macos", label: "macOS", hint: "Raycast, Warp, Xcode natif" },
  { value: "windows", label: "Windows", hint: "PowerToys Run, WSL Ubuntu" },
  { value: "wsl", label: "Windows + WSL", hint: "Dev Linux sur Windows (cas Anthony)" },
  { value: "linux", label: "Linux", hint: "KRunner, Ghostty" },
  { value: "universal", label: "Multi-OS", hint: "Cross-platform sans préférence" },
];

export default function OsBudgetBlock({ state, onChange }: { state: ToolingState; onChange: (p: Partial<ToolingState>) => void; }) {
  const filled = (state.os ? 1 : 0) + (state.annualBudgetUsd.trim() ? 1 : 0);
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">💻 OS & Budget</h3>
          <p className="text-xs text-muted mt-0.5">Ton setup perso détermine quels outils sont compatibles.</p>
        </div>
        <BlockStatus filled={filled} total={2} />
      </div>

      <div>
        <div className="text-xs font-semibold mb-2">OS principal</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {OS_OPTIONS.map((o) => (
            <button key={o.value} type="button" onClick={() => onChange({ os: o.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.os === o.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{o.label}</div>
              <div className="text-[11px] text-muted">{o.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Budget outils annuel (USD)</span>
        <input type="number" min={0} max={10000} value={state.annualBudgetUsd} onChange={(e) => onChange({ annualBudgetUsd: e.target.value })}
          placeholder="400" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes setup</span>
        <textarea value={state.notes} onChange={(e) => onChange({ notes: e.target.value })} rows={2}
          placeholder="Ex: Macbook M3 + écran externe 27'. Cursor + Claude Code + Obsidian + Warp."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </section>
  );
}
