"use client";

import { COMMON_TOOLS, TOOLS_BY_PROJECT_TYPE, type ToolCategory } from "@/lib/technique/tooling-presets";
import type { ProjectType as SvcProjectType } from "@/lib/technique/services-catalog";
import type { ToolingState, ToolSelection } from "../state";
import CollapsibleSection from "../../_shared/CollapsibleSection";

export default function ToolsBlock({
  state,
  onChange,
  projectType,
}: {
  state: ToolingState;
  onChange: (p: Partial<ToolingState>) => void;
  projectType: SvcProjectType;
}) {
  const categories: ToolCategory[] = [...COMMON_TOOLS, ...TOOLS_BY_PROJECT_TYPE[projectType]];
  const enabled = state.selections.filter((s) => s.enabled && s.selectedTool.trim()).length;

  function findSelection(categoryId: string): ToolSelection | undefined {
    return state.selections.find((s) => s.categoryId === categoryId);
  }

  function updateSelection(categoryId: string, patch: Partial<ToolSelection>) {
    const existing = findSelection(categoryId);
    let next: ToolSelection[];
    if (existing) {
      next = state.selections.map((s) => (s.categoryId === categoryId ? { ...s, ...patch } : s));
    } else {
      next = [...state.selections, { categoryId, selectedTool: "", enabled: false, notes: "", ...patch }];
    }
    onChange({ selections: next });
  }

  return (
    <CollapsibleSection
      emoji="🛠️"
      title="Outils"
      description={`${categories.length} catégories (${COMMON_TOOLS.length} communes + ${TOOLS_BY_PROJECT_TYPE[projectType].length} spécifiques au type ${projectType}).`}
      filled={enabled}
      total={categories.length}
      storageKey="mindeck:technique:tooling:tools:open"
    >
      <div>
        <div className="space-y-2">
          {categories.map((c) => {
            const sel = findSelection(c.id);
            const options = [c.recommended, ...c.alternatives];
            return (
              <div key={c.id} className="bg-background/60 border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">{c.label}</div>
                    <div className="text-[11px] text-muted">{c.hint}</div>
                  </div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={sel?.enabled ?? false}
                      onChange={(e) => updateSelection(c.id, { enabled: e.target.checked })}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span>Utilisé</span>
                  </label>
                </div>

                {(sel?.enabled ?? false) && (
                  <>
                    <div className="flex flex-wrap gap-1">
                      {options.map((o) => (
                        <button
                          key={o.name}
                          type="button"
                          onClick={() => updateSelection(c.id, { selectedTool: o.name })}
                          className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                            sel?.selectedTool === o.name
                              ? "bg-accent/15 border-accent text-accent"
                              : "bg-card border-border text-muted hover:text-foreground"
                          }`}
                          title={o.note ?? `${o.price} · ${o.os.join("/")}`}
                        >
                          {o.name} <span className="text-muted">({o.price})</span>
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={sel?.notes ?? ""}
                      onChange={(e) => updateSelection(c.id, { notes: e.target.value })}
                      placeholder="Notes (compte, shortcuts, plugins…)"
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CollapsibleSection>
  );
}
