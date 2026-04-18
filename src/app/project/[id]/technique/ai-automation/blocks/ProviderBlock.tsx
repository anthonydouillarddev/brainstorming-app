"use client";

import type { AiState, AiSdk, LlmProvider } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

const PROVIDERS: { value: LlmProvider; label: string; hint: string }[] = [
  { value: "anthropic", label: "Anthropic Claude", hint: "🔥 Sonnet 4.6 défaut 2026. Prompt caching 90%." },
  { value: "openai", label: "OpenAI GPT", hint: "GPT-5/4o. Vision multimodal, plus cher." },
  { value: "mistral", label: "Mistral", hint: "EU-hosted, GDPR-friendly." },
  { value: "gemini", label: "Google Gemini", hint: "Contexte 1M+, multi-modal." },
  { value: "openrouter", label: "OpenRouter", hint: "Multi-provider router, arbitrage pricing." },
  { value: "none", label: "Pas d'IA", hint: "App sans feature LLM." },
];

const SDKS: { value: AiSdk; label: string; hint: string }[] = [
  { value: "vercel-ai-sdk", label: "Vercel AI SDK v6", hint: "🔥 Leader 2026. Streaming, 25+ providers." },
  { value: "langchain", label: "LangChain", hint: "Over-engineered pour cas simples." },
  { value: "mastra", label: "Mastra", hint: "🌱 Multi-agent, MCP native." },
  { value: "direct-sdk", label: "SDK direct (Anthropic/OpenAI)", hint: "Full control, zéro abstraction." },
  { value: "none", label: "Aucun", hint: "" },
];

export default function ProviderBlock({ state, onChange }: { state: AiState; onChange: (p: Partial<AiState>) => void; }) {
  const filled = (state.provider ? 1 : 0) + (state.primaryModel.trim() ? 1 : 0) + (state.sdk ? 1 : 0) + (state.monthlyBudgetUsd.trim() ? 1 : 0);
  return (
    <CollapsibleSection
      emoji="🧠"
      title="LLM provider & SDK"
      description="Claude Sonnet 4.6 + Vercel AI SDK = combo 2026."
      filled={filled}
      total={4}
      storageKey="mindeck:technique:ai-automation:provider:open"
    >
      <div>
        <div className="text-xs font-semibold mb-2">Provider</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {PROVIDERS.map((p) => (
            <button key={p.value} type="button" onClick={() => onChange({ provider: p.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.provider === p.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{p.label}</div>
              <div className="text-[11px] text-muted">{p.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Modèle principal</span>
        <input type="text" value={state.primaryModel} onChange={(e) => onChange({ primaryModel: e.target.value })}
          placeholder="claude-sonnet-4-6 / gpt-4o / mistral-large-2"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>

      <div>
        <div className="text-xs font-semibold mb-2">SDK / Framework</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {SDKS.map((s) => (
            <button key={s.value} type="button" onClick={() => onChange({ sdk: s.value })}
              className={`text-left rounded-xl border p-2.5 transition ${state.sdk === s.value ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}>
              <div className="text-xs font-semibold mb-0.5">{s.label}</div>
              <div className="text-[11px] text-muted">{s.hint}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.promptCaching} onChange={(e) => onChange({ promptCaching: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">Prompt caching activé</div><div className="text-[11px] text-muted">90% savings Anthropic — obligatoire.</div></div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
          <input type="checkbox" checked={state.piiRedactionLlm} onChange={(e) => onChange({ piiRedactionLlm: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
          <div><div className="text-xs font-semibold">PII redaction avant LLM</div><div className="text-[11px] text-muted">Emails, SSN, tokens retirés avant envoi.</div></div>
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Budget mensuel USD</span>
        <input type="number" min={0} max={100000} value={state.monthlyBudgetUsd} onChange={(e) => onChange({ monthlyBudgetUsd: e.target.value })}
          placeholder="50" className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </CollapsibleSection>
  );
}
