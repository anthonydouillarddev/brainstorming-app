"use client";

import type { AiState } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

export default function UseCasesBlock({ state, onChange }: { state: AiState; onChange: (p: Partial<AiState>) => void; }) {
  const enabled = state.useCases.filter((u) => u.enabled).length;

  function toggle(id: string) {
    onChange({
      useCases: state.useCases.map((u) => (u.id === id ? { ...u, enabled: !u.enabled } : u)),
    });
  }

  return (
    <CollapsibleSection
      emoji="🎯"
      title="Use cases IA"
      description="Quelles features IA dans ton produit ? Active celles qui t'intéressent."
      filled={enabled}
      total={state.useCases.length}
      storageKey="mindeck:technique:ai-automation:use-cases:open"
    >
      <div className="grid sm:grid-cols-2 gap-2">
        {state.useCases.map((u) => (
          <label key={u.id} className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
            <input type="checkbox" checked={u.enabled} onChange={() => toggle(u.id)} className="h-4 w-4 rounded border-border mt-0.5" />
            <div>
              <div className="text-xs font-semibold">{u.label}</div>
            </div>
          </label>
        ))}
      </div>

      <label className="flex items-start gap-3 cursor-pointer p-3 bg-background/60 border border-border rounded-xl">
        <input type="checkbox" checked={state.streamingUi} onChange={(e) => onChange({ streamingUi: e.target.checked })} className="h-4 w-4 rounded border-border mt-0.5" />
        <div><div className="text-xs font-semibold">Streaming UI (token-by-token)</div><div className="text-[11px] text-muted">Vercel AI SDK `streamText` — UX perçue immédiate.</div></div>
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Evals tool (optionnel)</span>
        <input type="text" value={state.evalsTool} onChange={(e) => onChange({ evalsTool: e.target.value })}
          placeholder="Braintrust / Promptfoo / LangSmith"
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" />
      </label>
    </CollapsibleSection>
  );
}
