"use client";

import type { AiState, WorkflowTool } from "../state";
import { WORKFLOW_TOOLS } from "@/lib/technique/workflow-automation";
import BlockStatus from "../../_shared/BlockStatus";

export default function WorkflowBlock({ state, onChange }: { state: AiState; onChange: (p: Partial<AiState>) => void; }) {
  const filled = state.workflowTool ? 1 : 0;
  return (
    <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-bold">🔄 Workflow automation</h3>
          <p className="text-xs text-muted mt-0.5">
            n8n/Zapier/Make — orchestre LLM + APIs tierces sans coder chaque glue.
          </p>
        </div>
        <BlockStatus filled={filled} total={1} />
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ workflowTool: "none" })}
          className={`text-left rounded-xl border p-2.5 transition ${state.workflowTool === "none" ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}
        >
          <div className="text-xs font-semibold mb-0.5">Aucun</div>
          <div className="text-[11px] text-muted">Pas d&apos;orchestration externe.</div>
        </button>
        {WORKFLOW_TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange({ workflowTool: t.id as WorkflowTool })}
            className={`text-left rounded-xl border p-2.5 transition ${state.workflowTool === t.id ? "bg-accent/10 border-accent" : "bg-background border-border hover:border-accent/50"}`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-semibold">{t.name}</span>
              <span className="text-[10px] text-muted">{t.selfHost ? "🏠 self-host OK" : "☁️ cloud"}</span>
            </div>
            <div className="text-[11px] text-muted">{t.bestFor}</div>
            <div className="text-[10px] text-muted mt-0.5">Free : {t.freeTier}</div>
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Recipes prévus</span>
        <textarea
          value={state.workflowNotes}
          onChange={(e) => onChange({ workflowNotes: e.target.value })}
          rows={3}
          placeholder="Ex: Signup → Resend + Loops + Slack + Claude brief onboarding. Cron daily digest."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-xs font-semibold">Notes générales</span>
        <textarea
          value={state.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          rows={2}
          placeholder="Ex: Claude Code + Cursor pour dev. Brainstorm coach en phase 2."
          className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
      </label>
    </section>
  );
}
