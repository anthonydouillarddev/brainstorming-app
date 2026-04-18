"use client";

import type { LoggerLib, ObservabilityState, UptimeTool } from "../state";
import BlockStatus from "../../_shared/BlockStatus";

const UPTIMES: { value: UptimeTool; label: string; freeTier: string; hint: string }[] = [
  { value: "better-stack", label: "Better Stack", freeTier: "10 monitors", hint: "🔥 Recommandé solo. Alertes ∞." },
  { value: "checkly", label: "Checkly", freeTier: "10k runs/mo", hint: "Synthetic monitoring avancé." },
  { value: "uptime-robot", label: "UptimeRobot", freeTier: "50 monitors", hint: "Classique, simple." },
  { value: "none", label: "Aucun", freeTier: "—", hint: "⚠️ Crash silencieux." },
];

const LOGGERS: { value: LoggerLib; label: string; hint: string }[] = [
  { value: "pino", label: "Pino", hint: "🔥 5x plus rapide que Winston. JSON natif." },
  { value: "winston", label: "Winston", hint: "Legacy Node, flexible." },
  { value: "console", label: "console.log", hint: "Dev uniquement." },
  { value: "bunyan", label: "Bunyan", hint: "Legacy JSON logger." },
];

export default function UptimeLogsBlock({ state, onChange }: { state: ObservabilityState; onChange: (p: Partial<ObservabilityState>) => void; }) {
  const filled = (state.uptimeTool && state.uptimeTool !== "none" ? 1 : 0) + (state.uptimeCheckIntervalMin.trim() ? 1 : 0) + (state.loggerLib ? 1 : 0);
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">⏱️ Uptime & logs</h3>
          <p className="text-xs text-muted mt-0.5">Monitor endpoint /health + structured logging JSON.</p>
        </div>
        <BlockStatus filled={filled} total={3} />
      </div>
      <div>
        <div className="text-xs font-semibold mb-2">Uptime monitoring</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {UPTIMES.map((u) => (
            <button key={u.value} type="button" onClick={() => onChange({ uptimeTool: u.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.uptimeTool === u.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="flex items-center justify-between mb-0.5"><span className="text-xs font-semibold">{u.label}</span><span className="text-[10px] text-muted">{u.freeTier}</span></div>
              <div className="text-[11px] text-muted">{u.hint}</div>
            </button>
          ))}
        </div>
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Intervalle check (minutes)</span>
        <input type="number" min={1} max={60} value={state.uptimeCheckIntervalMin} onChange={(e) => onChange({ uptimeCheckIntervalMin: e.target.value })}
          placeholder="3" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
      <div>
        <div className="text-xs font-semibold mb-2">Structured logging</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {LOGGERS.map((l) => (
            <button key={l.value} type="button" onClick={() => onChange({ loggerLib: l.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.loggerLib === l.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{l.label}</div>
              <div className="text-[11px] text-muted">{l.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
